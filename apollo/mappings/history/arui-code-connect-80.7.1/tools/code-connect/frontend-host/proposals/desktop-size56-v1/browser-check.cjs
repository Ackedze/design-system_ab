const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const root = __dirname, host = path.resolve(root, '../..'), artifacts = path.join(root, 'artifacts');
const dist = path.join(artifacts, 'dist');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? files(filename) : [filename];
});
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const server = http.createServer((request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname;
    const file = path.resolve(dist, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(dist + path.sep) || !fs.existsSync(file)) {response.writeHead(404).end(); return;}
    const mime = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css'}[path.extname(file)] || 'application/octet-stream';
    response.writeHead(200, {'Content-Type': mime}); fs.createReadStream(file).pipe(response);
});
const receipt = {status: 'running', scope: 'desktop-size56-v1 proposed API recipe; not normative parity or Apollo v4 execution',
    observations: [], commandProofs: [], tests: [], pageErrors: [], consoleMessages: [], failedRequests: []};
async function commandProof(page, scenario) {
    receipt.commandProofs.push({scenario, probe: await page.evaluate(() => window.recipeProbe)});
}
async function snapshot(page, name) {
    const data = await page.evaluate(() => {
        const bounds = element => {
            if (!element) return null;
            const rect = element.getBoundingClientRect(), css = getComputedStyle(element);
            return {width: rect.width, height: rect.height, x: rect.x, y: rect.y, visibility: css.visibility,
                flexDirection: css.flexDirection, padding: [css.paddingTop, css.paddingRight, css.paddingBottom, css.paddingLeft],
                background: css.backgroundColor, marginLeft: css.marginLeft, fontFamily: css.fontFamily};
        };
        const group = document.querySelector('[data-test-id="proposal-group"]');
        return {probe: window.recipeProbe,
            allocation: {bounds: bounds(document.querySelector('[data-test-id="proposal-allocation"]')),
                inert: document.querySelector('[data-test-id="proposal-allocation"]').inert},
            body: bounds(document.querySelector('[data-test-id="proposal-body-flow"]')),
            corporateContent: bounds(document.querySelector('[data-test-id="proposal-content"]')),
            buttons: [...group.querySelectorAll('button')].map(b => ({id: b.getAttribute('data-test-id'), label: b.textContent,
                disabled: b.disabled, className: b.className, bounds: bounds(b)})),
            options: [...document.querySelectorAll('[role="option"]')].map(o => ({label: o.textContent, disabled: o.getAttribute('aria-disabled')}))};
    });
    receipt.observations.push({scenario: name, ...data}); return data;
}
async function settled(page, expected) {
    await page.waitForFunction(status => window.recipeProbe.observation?.status === status, expected);
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.recipeProbe.observation.status), expected);
}
async function choose(page, id, expected) {
    await page.locator('[data-test-id="case"]').selectOption(id); await settled(page, expected);
}
async function count(page) {return page.evaluate(() => window.recipeProbe.events.length);}
async function pointer(page, locator) {
    const b = await locator.boundingBox(); assert.ok(b); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForTimeout(100);
}
async function openMenu(page) {
    await page.locator('[data-test-id="proposal-group"] #button-group-picker-container button').click();
    await page.locator('[role="option"]').first().waitFor();
}
(async () => {
    fs.mkdirSync(artifacts, {recursive: true});
    await new Promise((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
    const browser = await chromium.launch({executablePath: chromePath, headless: true});
    const context = await browser.newContext({viewport: {width: 1600, height: 1100}, deviceScaleFactor: 1});
    const page = await context.newPage();
    page.on('pageerror', e => receipt.pageErrors.push(e.message));
    page.on('console', m => {if (['error', 'warning'].includes(m.type())) receipt.consoleMessages.push({type: m.type(), message: m.text()});});
    page.on('requestfailed', r => receipt.failedRequests.push({url: r.url(), error: r.failure()?.errorText}));
    receipt.browser = {version: browser.version(), executablePath: chromePath, executableSha256: hash(chromePath),
        viewport: {width: 1600, height: 1100}, deviceScaleFactor: 1};
    receipt.node = {version: process.version, executable: process.execPath, executableSha256: hash(process.execPath)};
    receipt.checkerSha256 = hash(__filename);
    receipt.recipeInputPins = ['src/recipe.tsx', 'src/application.ts', 'src/probe.tsx', 'src/probe.css', 'index.html', 'tsconfig.json', 'vite.config.mjs']
        .map(file => ({path: file, sha256: hash(path.join(root, file))}));
    receipt.bundlePins = files(dist).sort().map(file => ({path: path.relative(root, file), sha256: hash(file)}));
    receipt.environmentReceipt = {path: '../../artifacts/environment-pins.json', sha256: hash(path.join(host, 'artifacts/environment-pins.json'))};
    receipt.sourceBuildReceipt = {path: '../../artifacts/subpath-build.json', sha256: hash(path.join(host, 'artifacts/subpath-build.json'))};
    try {
        await page.goto('http://127.0.0.1:' + server.address().port, {waitUntil: 'networkidle'});
        await settled(page, 'pass');
        let s = await snapshot(page, 'baseline-short-enough');
        assert.deepEqual(s.probe.observation.visibleIds, ['send', 'cancel']);
        assert.equal(s.probe.observation.pickerPresent, false); assert.equal(s.allocation.inert, false);
        assert.ok(s.buttons.every(b => b.bounds.height === 56));
        assert.match(s.buttons[0].className, /__primary_/); assert.match(s.buttons[1].className, /__secondary_/);
        await page.locator('[data-test-id="visible-recipe-send"]').click();
        await page.locator('[data-test-id="visible-recipe-cancel"]').click();
        assert.deepEqual(await page.evaluate(() => window.recipeProbe.events.map(e => [e.actionId,e.source,e.targetTag])), [['send','button','BUTTON'],['cancel','button','BUTTON']]);
        await commandProof(page, 'baseline-native-buttons');
        receipt.tests.push('baseline two visible actions, 56 px, primary first, native button events');
        const cdp = await context.newCDPSession(page); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
        const {root: doc} = await cdp.send('DOM.getDocument');
        const {nodeId} = await cdp.send('DOM.querySelector', {nodeId: doc.nodeId, selector: '[data-test-id="visible-recipe-send"]'});
        receipt.buttonFonts = (await cdp.send('CSS.getPlatformFontsForNode', {nodeId})).fonts; await cdp.detach();
        await page.screenshot({path: path.join(artifacts, 'baseline-short.png'), fullPage: true});

        await choose(page, 'baseline-long-disabled', 'pass');
        s = await snapshot(page, 'baseline-long-disabled-enough');
        assert.deepEqual(s.probe.observation.visibleIds, ['sign','edit']);
        assert.ok(s.probe.observation.requiredInlineSize <= s.probe.observation.allocatedInlineSize);
        const disabled = page.locator('[data-test-id="visible-recipe-edit"]'); assert.equal(await disabled.isDisabled(), true);
        await pointer(page, disabled); assert.equal(await count(page), 0);
        await page.locator('[data-test-id="visible-recipe-sign"]').click(); assert.equal(await count(page), 1);
        await commandProof(page, 'baseline-native-disabled-suppressed');
        receipt.tests.push('long distinct labels, disabled native pointer suppressed, enabled command executed');

        await choose(page, 'baseline-long-narrow', 'blocked');
        s = await snapshot(page, 'baseline-long-insufficient');
        assert.ok(s.probe.observation.reasons.includes('INSUFFICIENT_INLINE_SIZE')); assert.equal(s.allocation.inert, true);
        assert.ok(s.probe.observation.requiredInlineSize > s.probe.observation.allocatedInlineSize);
        await pointer(page, page.locator('[data-test-id="proposal-allocation"]')); assert.equal(await count(page), 0);
        await commandProof(page, 'baseline-insufficient-width-no-command');
        await page.screenshot({path: path.join(artifacts, 'baseline-blocked.png'), fullPage: true});
        await page.locator('[data-test-id="width"]').fill('1100'); await settled(page, 'pass');
        await page.locator('[data-test-id="visible-recipe-sign"]').click(); assert.equal(await count(page), 1);
        await page.locator('[data-test-id="width"]').fill('220'); await settled(page, 'blocked');
        await pointer(page, page.locator('[data-test-id="proposal-allocation"]')); assert.equal(await count(page), 1);
        await snapshot(page, 'baseline-resize-wide-to-narrow');
        receipt.tests.push('insufficient width blocks; dynamic widening recovers; shrinking blocks again');

        await choose(page, 'routing-four', 'pass');
        s = await snapshot(page, 'routing-four-enough-for-primary-picker');
        assert.deepEqual(s.probe.observation.visibleIds, ['start']);
        assert.deepEqual(s.probe.observation.hiddenIds, ['approve','defer','cancel']);
        await page.locator('[data-test-id="visible-recipe-start"]').click();
        await openMenu(page); s = await snapshot(page, 'routing-original-menu');
        assert.deepEqual(s.options.map(o => o.label), ['Подтвердить','Отложить','Отмена']);
        assert.equal(s.options[1].disabled, 'true');
        const before = await count(page); await pointer(page, page.locator('[role="option"]').nth(1)); assert.equal(await count(page), before);
        await page.locator('[role="option"]').nth(0).click();
        assert.deepEqual(await page.evaluate(() => window.recipeProbe.events.map(e => [e.actionId,e.source])), [['start','button'],['approve','picker']]);
        await openMenu(page); await page.locator('[role="option"]').nth(0).click();
        assert.equal(await count(page), 3);
        await openMenu(page); await page.locator('[role="option"]').nth(2).click();
        assert.equal(await page.evaluate(() => window.recipeProbe.events.at(-1).actionId), 'cancel');
        await commandProof(page, 'routing-original-order-repeated-selection-disabled');
        receipt.tests.push('mapper original order, disabled option suppressed, exact keyed commands, repeated selection once');

        await page.locator('[data-test-id="rename"]').check();
        await page.locator('[data-test-id="reorder"]').check(); await settled(page, 'pass');
        await openMenu(page); s = await snapshot(page, 'routing-renamed-reordered-menu');
        assert.deepEqual(s.options.map(o => o.label), ['Действие','Действие','Действие']);
        assert.deepEqual(s.probe.observation.originalOrder, ['start','cancel','defer','approve']);
        await page.screenshot({path: path.join(artifacts, 'routing-identical-labels.png'), fullPage: true});
        await page.locator('[role="option"]').nth(0).click();
        assert.equal(await page.evaluate(() => window.recipeProbe.events.at(-1).actionId), 'cancel');
        await openMenu(page); const n = await count(page); await pointer(page, page.locator('[role="option"]').nth(1)); assert.equal(await count(page), n);
        await page.locator('[role="option"]').nth(2).click();
        assert.equal(await page.evaluate(() => window.recipeProbe.events.at(-1).actionId), 'approve');
        assert.ok(await page.evaluate(() => window.recipeProbe.events.filter(e => e.source === 'picker').every(e => !('targetTag' in e) || e.targetTag === undefined)));
        await commandProof(page, 'routing-identical-labels-reordered-stable-ids');
        receipt.tests.push('renamed equal labels and reversed secondary order preserve IDs; picker has no fabricated DOM event');

        await choose(page, 'routing-two', 'pass'); await openMenu(page);
        s = await snapshot(page, 'routing-two-long-secondary-menu');
        assert.equal(s.options.length, 1); await page.locator('[role="option"]').click();
        assert.deepEqual(await page.evaluate(() => window.recipeProbe.events.map(e => [e.actionId,e.source])), [['edit','picker']]);
        await commandProof(page, 'routing-two-long-secondary');

        await openMenu(page);
        await page.locator('[data-test-id="width"]').fill('64'); await settled(page, 'blocked');
        s = await snapshot(page, 'routing-primary-hidden-64');
        assert.ok(s.probe.observation.reasons.includes('PRIMARY_HIDDEN')); assert.equal(s.allocation.inert, true);
        const eventsBeforeNarrow = await count(page);
        const option = page.locator('[role="option"]').first();
        const present = await option.count();
        receipt.staleMenu = {presentAfterResize: Boolean(present), eventsBefore: eventsBeforeNarrow};
        if (present) {
            await pointer(page, option);
            receipt.staleMenu.routing = await page.evaluate(() => window.recipeProbe.routing.at(-1));
        }
        receipt.staleMenu.eventsAfter = await count(page);
        assert.equal(receipt.staleMenu.eventsAfter, eventsBeforeNarrow);
        await page.screenshot({path: path.join(artifacts, 'routing-primary-blocked.png'), fullPage: true});
        receipt.tests.push('primary-hidden profile blocks commands, including any surviving stale option');
        assert.deepEqual(receipt.pageErrors, []); assert.deepEqual(receipt.failedRequests, []);
        assert.deepEqual(receipt.consoleMessages, []);
        receipt.status = 'public-api-browser-checks-pass-proposed-for-review';
    } catch (error) {
        receipt.status = 'failed'; receipt.failure = {name: error.name, message: error.message}; process.exitCode = 1;
        try {await snapshot(page, 'failure'); await page.screenshot({path: path.join(artifacts, 'failure.png'), fullPage: true});} catch {}
    } finally {
        fs.writeFileSync(path.join(artifacts, 'browser-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
        await context.close(); await browser.close();
    }
    console.log(JSON.stringify({status:receipt.status, tests:receipt.tests, browser:receipt.browser, failure:receipt.failure,
        pageErrors:receipt.pageErrors,consoleMessages:receipt.consoleMessages,staleMenu:receipt.staleMenu}));
})().catch(error => {console.error(error); process.exitCode = 1;}).finally(() => server.close());
