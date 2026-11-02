const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const {hash} = require('../registry/source-inventory.cjs');
const artifacts = path.join(__dirname, 'artifacts');
const distribution = path.join(__dirname, 'dist');
const chromePath = process.env.APOLLO_PILOT_BROWSER_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(chromePath)) throw new Error('REAL_BROWSER_UNAVAILABLE: provide APOLLO_PILOT_BROWSER_PATH');
const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const filename = path.resolve(distribution, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(distribution + path.sep) || !fs.existsSync(filename)) {response.writeHead(404).end(); return;}
    const mime = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml'}[path.extname(filename)] || 'application/octet-stream';
    response.writeHead(200, {'Content-Type': mime});
    fs.createReadStream(filename).pipe(response);
});
const settle = page => page.waitForTimeout(250);
async function metrics(page) {
    return page.evaluate(() => {
        const box = element => {
            if (!element) return null;
            const rect = element.getBoundingClientRect(), css = getComputedStyle(element);
            return {x: rect.x, y: rect.y, width: rect.width, height: rect.height, display: css.display,
                flexDirection: css.flexDirection, padding: [css.paddingTop, css.paddingRight, css.paddingBottom, css.paddingLeft],
                visibility: css.visibility, background: css.backgroundColor, fontFamily: css.fontFamily};
        };
        const group = id => {
            const element = document.querySelector('[data-test-id="' + id + '"]');
            return {box: box(element), buttons: Array.from(element?.querySelectorAll('button') || []).map(button => ({
                label: button.textContent, testId: button.getAttribute('data-test-id'), disabled: button.disabled, className: button.className,
                box: box(button), wrapper: box(button.closest('[class*="ElementWrapper"]')),
            }))};
        };
        const raw = document.querySelector('[data-test-id="raw-pilot"] .corporate-content');
        return {viewport: {width: window.innerWidth, height: window.innerHeight}, devicePixelRatio: window.devicePixelRatio,
            raw: {content: box(raw), group: box(raw?.firstElementChild), buttons: Array.from(raw?.querySelectorAll('button') || []).map(b => ({label: b.textContent, testId: b.getAttribute('data-test-id'), box: box(b)}))},
            content: box(document.querySelector('[data-test-id="hosted-content"]')), hosted: group('hosted-group'),
            disabled: group('disabled-group'), overflow: group('overflow-group'), events: window.pilotEvents,
            fontFaces: Array.from(document.fonts).map(f => ({family: f.family, status: f.status}))};
    });
}
(async () => {
    fs.mkdirSync(artifacts, {recursive: true});
    await new Promise((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
    const origin = 'http://127.0.0.1:' + server.address().port;
    const browser = await chromium.launch({executablePath: chromePath, headless: true});
    const context = await browser.newContext({viewport: {width: 1600, height: 1400}, deviceScaleFactor: 1});
    const page = await context.newPage();
    const consoleMessages = [], pageErrors = [], failedRequests = [], observations = [];
    page.on('console', message => {if (['error', 'warning'].includes(message.type())) consoleMessages.push({type: message.type(), text: message.text()});});
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => failedRequests.push({url: request.url(), failure: request.failure()?.errorText}));
    const receipt = {status: 'running', browser: {name: 'Chrome', executablePath: chromePath, executableSha256: hash(fs.readFileSync(chromePath)), version: browser.version()},
        sourceBuildReceipt: 'artifacts/subpath-build.json', sourceBuildReceiptSha256: hash(fs.readFileSync(path.join(artifacts, 'subpath-build.json'))), origin,
        observations, consoleMessages, pageErrors, failedRequests, supportedProfile: 'real code API with explicit native host width; not full contract parity'};
    try {
        await page.goto(origin, {waitUntil: 'networkidle'});
        await page.locator('[data-test-id="hosted-group"]').waitFor();
        await settle(page);
        observations.push({scenario: 'desktop-1600-initial', metrics: await metrics(page)});
        assert.deepEqual(pageErrors, [], 'unexpected page exception');
        const initialButtons = observations[0].metrics.hosted.buttons;
        assert.equal(initialButtons.length, 2);
        assert.match(initialButtons[0].className, /__primary_/);
        assert.match(initialButtons[1].className, /__secondary_/);
        assert.ok(initialButtons.every(button => button.box.visibility === 'visible' && button.box.height === 56));
        const cdp = await context.newCDPSession(page);
        await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
        const {root} = await cdp.send('DOM.getDocument');
        const {nodeId} = await cdp.send('DOM.querySelector', {nodeId: root.nodeId, selector: '[data-test-id="visible-host-send"]'});
        receipt.actualButtonFonts = (await cdp.send('CSS.getPlatformFontsForNode', {nodeId})).fonts;
        await cdp.detach();
        await page.locator('[data-test-id="visible-host-send"]').click();
        await page.locator('[data-test-id="visible-host-cancel"]').click();
        assert.deepEqual(await page.evaluate(() => window.pilotEvents.map(e => e.action)), ['send', 'cancel']);
        const disabled = page.locator('[data-test-id="visible-disabled-send"]');
        assert.equal(await disabled.isDisabled(), true);
        const disabledBox = await disabled.boundingBox();
        await page.mouse.click(disabledBox.x + disabledBox.width / 2, disabledBox.y + disabledBox.height / 2);
        assert.deepEqual(await page.evaluate(() => window.pilotEvents.map(e => e.action)), ['send', 'cancel']);
        await page.locator('[data-test-id="visible-enabled-cancel"]').click();
        assert.deepEqual(await page.evaluate(() => window.pilotEvents.map(e => e.action)), ['send', 'cancel', 'cancel']);
        observations.push({scenario: 'callbacks-disabled', metrics: await metrics(page)});
        await page.screenshot({path: path.join(artifacts, 'desktop-1600.png'), fullPage: true});
        for (const width of [1024, 768]) {
            await page.setViewportSize({width, height: 1400}); await settle(page);
            observations.push({scenario: 'desktop-' + width, metrics: await metrics(page)});
        }
        await page.setViewportSize({width: 1600, height: 1400});
        for (const width of [700, 320, 220, 120]) {
            await page.locator('[data-test-id="probe-width"]').fill(String(width)); await settle(page);
            observations.push({scenario: 'group-width-' + width, metrics: await metrics(page)});
        }
        await page.screenshot({path: path.join(artifacts, 'overflow-120.png'), fullPage: true});
        await page.locator('[data-test-id="probe-width"]').fill('220'); await settle(page);
        const group = page.locator('[data-test-id="overflow-group"]');
        await group.locator('#button-group-picker-container button').click();
        await settle(page);
        receipt.overflowMenu = await page.evaluate(() => Array.from(document.querySelectorAll('[role="option"]')).map(option => ({text: option.textContent, disabled: option.getAttribute('aria-disabled')})));
        observations.push({scenario: 'overflow-menu-220', metrics: await metrics(page)});
        await page.screenshot({path: path.join(artifacts, 'overflow-220-menu.png'), fullPage: true});
        const before = await page.evaluate(() => window.pilotEvents.length);
        const option = page.getByRole('option').filter({hasText: 'Второе'});
        await option.click(); await settle(page);
        receipt.defaultOverflowCallback = {eventsBefore: before, eventsAfter: await page.evaluate(() => window.pilotEvents.length), selectedLabel: 'Второе', actionRouted: (await page.evaluate(() => window.pilotEvents.length)) > before};
        receipt.finalEvents = await page.evaluate(() => window.pilotEvents);
        receipt.status = 'browser-checks-pass-with-observed-gaps';
    } catch (error) {
        receipt.status = 'browser-check-failed'; receipt.failure = {name: error.name, message: error.message};
        try {observations.push({scenario: 'failure-observation', metrics: await metrics(page)}); await page.screenshot({path: path.join(artifacts, 'failure.png'), fullPage: true});} catch {}
        process.exitCode = 1;
    } finally {
        fs.writeFileSync(path.join(artifacts, 'browser-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
        await context.close(); await browser.close();
    }
    console.log(JSON.stringify({status: receipt.status, browser: receipt.browser.version, scenarios: observations.map(o => o.scenario), failure: receipt.failure, pageErrors, consoleMessageCount: consoleMessages.length, defaultOverflowCallback: receipt.defaultOverflowCallback}));
})().catch(error => {console.error(error.message); process.exitCode = 1;}).finally(() => server.close());
