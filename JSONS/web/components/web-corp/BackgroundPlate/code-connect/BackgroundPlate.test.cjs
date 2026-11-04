const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const { root, context, render, code } = require('./template-fixture.cjs');
const { checkSnippets } = require('./check-source-api.cjs');
const sourceRoot = process.env.ARUI_SOURCE_ROOT;
const sdkModules = process.env.ARUI_SDK_NODE_MODULES;
const snippets = [];
function collect(r) { const s = { imports: r.imports, code: code(r.example.sections) }; snippets.push(s); return s.code; }

test('six scoped parserless files strictly typecheck and share identical logic', () => {
    const filenames = context.files.map((f) => path.join(root, f.path));
    const figmaTypes = path.resolve(path.dirname(require.resolve('@figma/code-connect')), '../../figma-types.d.ts');
    const program = ts.createProgram([...filenames, figmaTypes], { noEmit: true, strict: true, skipLibCheck: true, esModuleInterop: true,
        target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Node10, types: [] });
    const errors = ts.getPreEmitDiagnostics(program);
    assert.equal(errors.length, 0, errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
    const bodies = filenames.map((f) => fs.readFileSync(f, 'utf8').split('\n').slice(13).join('\n'));
    for (const b of bodies) assert.equal(b, bodies[0]);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'figma.config.json'))).codeConnect.include, context.files.map((f) => f.path));
});

test('all 18 native root variants preserve platform, family, level and content identity', () => {
    let count = 0;
    for (const [i, file] of context.files.entries()) {
        const family = context.families.find((f) => f.id === file.nodeId);
        for (let j = 0; j < family.variants.length; j++) {
            const v = family.variants[j], r = render(i, {}, j), output = collect(r);
            const level = file.slot || v.properties.Position === 'Level 1 (outer)' ? 'outer' : 'inner';
            assert.ok(output.includes(`level="${level}"`)); assert.ok(output.includes(`promo={${file.promo}}`));
            assert.ok(r.imports[0].includes(`/background-plate/${file.desktop ? 'desktop' : 'mobile'}`));
            assert.equal(r.metadata.props.family, file.slot ? 'slot' : file.promo ? 'promo' : 'regular');
            assert.equal(r.calls.some((c) => c.method === 'getSlot'), file.slot);
            if (file.slot) { assert.equal(family.definitions['Slot#136328:0'].type, 'SLOT'); assert.equal(r.calls.find((c) => c.method === 'getSlot').name, 'Slot'); }
            assert.equal(output.includes('{null}'), file.slot); assert.equal(output.includes("children: Props['children']"), !file.slot);
            assert.doesNotMatch(output, /\[object Object\]|\.png|https?:|backgroundColor="modal-/);
            if (file.slot) assert.match(output, /layoutProps: \{ paddings\?: Props\['paddings'\]; style: Pick/);
            count++;
        }
    }
    assert.equal(count, 18);
});

test('all 128 native Style variants: 70 admitted; 58 modal values refuse', () => {
    let pass = 0, refused = 0;
    for (const [i, file] of context.files.entries()) {
        if (file.slot) continue;
        const prefix = `${file.desktop ? '[D]' : '[M]'}${file.promo ? '[Promo]' : ''}`;
        for (const s of context.families.filter((f) => f.name.startsWith(prefix + ' Style Level'))) {
            const family = context.families.find((f) => f.id === file.nodeId);
            const index = family.variants.findIndex((v) => v.properties.Position === (s.name.endsWith('1') ? 'Level 1 (outer)' : 'Level 2 (inner)'));
            for (const v of s.variants) {
                if (v.properties.BackgroundColor.startsWith('modal-')) { assert.throws(() => render(i, { style: v.properties }, index), /BackgroundColor/); refused++; }
                else {
                    const output = collect(render(i, { style: v.properties }, index));
                    assert.ok(output.includes('view={BackgroundPlateView.' + v.properties.Type + '}'));
                    assert.ok(output.includes(`showSkeleton={${v.properties.Skeleton === 'True'}}`));
                    if (v.properties.Skeleton === 'True') assert.ok(output.includes(`borderRadius: ${file.desktop && !file.promo ? (s.name.endsWith('1') ? 16 : 12) : (s.name.endsWith('1') ? 24 : 16)}`));
                    assert.equal(output.includes('coloredViewValue={coloredViewValue}'), v.properties.Type === 'Colored'); pass++;
                }
            }
        }
    }
    assert.equal(pass, 70); assert.equal(refused, 58);
});

for (const [i, file] of context.files.entries()) {
    if (!file.slot) continue;
    test(`${file.name}: native Slot retains known nested sections and types opaque children separately`, () => {
        const known = { type: 'INSTANCE', guid: 'known', symbolId: 'known', resultSections: [{ type: 'CODE', code: '<span>Known</span>' }] };
        const opaque = { type: 'SLOT', propertyName: 'unknown' };
        const r = render(i, { slot: [known, opaque, opaque] }); const output = collect(r);
        assert.match(output, /ReactNode\[\]/); assert.match(output, /children\[0\]/); assert.match(output, /children\[1\]/); assert.match(output, /<span>Known<\/span>/);
        assert.ok(r.example.sections.some((s) => s.type === 'INSTANCE' && s.guid === 'known'));
        collect(render(i, { slot: [{ type: 'CODE', code: '<span>{"\\\" <>&"}</span>' }] }));
        assert.throws(() => render(i, { slot: undefined }), /обязательный/);
        assert.throws(() => render(i, { slot: [{ type: 'ERROR', message: 'native failure' }] }), /native failure/);
        const single = collect(render(i, { slot: [{ type: 'INSTANCE', guid: 'opaque', symbolId: 'opaque' }] }));
        assert.match(single, /children: ReactNode/); assert.doesNotMatch(single, /ReactNode\[\]/);
    });
}

test('unsupported flags, wrong style selection and missing children refuse instead of falling back', () => {
    for (const [i, f] of context.files.entries()) {
        if (!f.slot) {
            assert.throws(() => render(i, { root: { Position: 'Unknown' } }), /Position/);
            assert.throws(() => render(i, { missing: true }), /Не найден/);
            for (const [key, value] of [['Type', 'Dropzone'], ['Skeleton', 'Unknown'], ['BackgroundColor', 'raw-color']]) assert.throws(() => render(i, { style: { [key]: value } }), /Неизвестный/);
        } else assert.throws(() => render(i, { root: { Type: 'Dropzone' } }), /Type/);
    }
});

test('all fixture examples and saved native snippets match actual source API; negative props fail', {
    skip: (!sourceRoot || !sdkModules) && 'set ARUI_SOURCE_ROOT and ARUI_SDK_NODE_MODULES',
}, () => {
    assert.deepEqual(checkSnippets(snippets, { sourceRoot, sdkModules }), []);
    const previews = JSON.parse(fs.readFileSync(path.join(__dirname, 'publication/2026-11-04.preview-results.json'))).results;
    assert.equal(previews.length, 146); assert.equal(previews.filter((r) => r.success).length, 88);
    for (const r of previews.filter((r) => !r.success)) assert.match(r.error, /BackgroundColor/);
    const native = previews.filter((r) => r.success).map((r) => {
        assert.ok(r.snippet.trim());
        const desktop = r.snippet.includes('typeof BackgroundPlateDesktop');
        return { code: r.snippet, imports: [`import { ${desktop ? 'BackgroundPlateDesktop' : 'BackgroundPlateMobile'} } from 'arui-private/background-plate/${desktop ? 'desktop' : 'mobile'}';`, "import { BackgroundPlateView } from 'arui-private/background-plate';", "import type { ComponentProps, ReactNode } from 'react';"] };
    });
    assert.deepEqual(checkSnippets(native, { sourceRoot, sdkModules }), []);
    const published = path.join(__dirname, 'publication/2026-11-04.snippets.json');
    if (fs.existsSync(published)) {
        const rows = JSON.parse(fs.readFileSync(published)).readbacks;
        assert.equal(rows.length, 24);
        for (const r of rows) { assert.equal(r.hasTemplate, true); assert.ok(r.snippet.trim()); }
        assert.deepEqual(checkSnippets(rows.map((r) => ({ imports: r.snippetImports, code: r.snippet })), { sourceRoot, sdkModules }), []);
    }
    const imports = ["import { BackgroundPlateDesktop } from 'arui-private/background-plate/desktop';"];
    for (const props of ['backgroundColor="modal-bg"', 'paddings={28}', 'mobile={true}', 'appearance="dark"', 'view="Primary"']) {
        assert.ok(checkSnippets([{ imports, code: `const bad = <BackgroundPlateDesktop ${props}>{null}</BackgroundPlateDesktop>;` }], { sourceRoot, sdkModules }).length > 0, props);
    }
    assert.ok(checkSnippets([{ imports, code: 'const bad = <BackgroundPlateDesktop />;' }], { sourceRoot, sdkModules }).length > 0);
});
