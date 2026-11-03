const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const { root, context, files, render, code } = require('./template-fixture.cjs');
const { checkSnippets } = require('./check-source-api.cjs');
const snippets = [];
const sourceRoot = process.env.ARUI_SOURCE_ROOT;
const sdkModules = process.env.ARUI_SDK_NODE_MODULES;

function nativeValues(variant) {
    return Object.fromEntries(variant.name.split(', ').map((pair) => pair.split('=')));
}

test('strict template types, unique public roots and exact config', () => {
    const filenames = Object.values(files).map((p) => path.join(root, p));
    const figmaTypes = path.resolve(path.dirname(require.resolve('@figma/code-connect')), '../../figma-types.d.ts');
    const program = ts.createProgram([...filenames, figmaTypes], { noEmit: true, strict: true,
        skipLibCheck: true, esModuleInterop: true, target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Node10, types: [] });
    const errors = ts.getPreEmitDiagnostics(program);
    assert.equal(errors.length, 0, errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n'));
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'figma.config.json'))).codeConnect.include, Object.values(files));
    assert.notEqual(render('desktop').id, render('mobile').id);
});

for (const platform of ['desktop', 'mobile']) {
    test(`${platform}: all native variants use exact text paths and public leaf import`, () => {
        const variants = context.variants[platform === 'desktop' ? 0 : 1].variants;
        assert.equal(variants.length, platform === 'desktop' ? 16 : 4);
        for (const variant of variants) {
            const values = nativeValues(variant);
            const result = render(platform, { root: values });
            const output = code(result.example.sections);
            assert.ok(result.imports[0].includes(`arui-private/promo-main-block/${platform}`));
            assert.match(output, /title=\{"Title"\}/);
            assert.match(output, /subtitle=\{"Subtitle"\}/);
            assert.ok(output.includes(`appearance="${values.Appearance.toLowerCase()}"`));
            assert.ok(output.includes(`withBackground={${values.Background === 'True'}}`));
            if (platform === 'mobile') assert.doesNotMatch(output, /\b(?:view|compact|blurEffect)=/);
            else assert.ok(output.includes(`view="${values.View.toLowerCase()}"`));
            assert.equal(result.metadata.nestable, false);
            assert.match(output, /imageProps: NonNullable<Props\['imageProps'\]> & \{ src: string; alt: string \}/);
            assert.doesNotMatch(output, /https?:|\.png|\.jpg|console\.log|onClick:\s*\(\)\s*=>/);
            snippets.push({ imports: result.imports, code: output });
        }
    });

    test(`${platform}: optional properties remain explicit across every native variant`, () => {
        const flags = ['Bottom', 'ButtonGroup', 'Holding', 'Status', ...(platform === 'desktop' ? ['BlurEffect'] : [])];
        let checked = 0;
        for (const variant of context.variants[platform === 'desktop' ? 0 : 1].variants) {
            for (let mask = 0; mask < 2 ** flags.length; mask++) {
                const values = { ...nativeValues(variant), ...Object.fromEntries(flags.map((name, i) => [name, Boolean(mask & (1 << i))])) };
                const result = render(platform, { root: values });
                const output = code(result.example.sections);
                for (const [flag, prop] of [['Bottom', 'customAddon={'], ['ButtonGroup', 'primaryButtonProps={'],
                    ['Holding', 'corporateFilterCompanySelectProps={'], ['Status', 'statuses={']]) {
                    assert.equal(output.includes(prop), values[flag], prop);
                }
                if (!values.Bottom) assert.ok(!result.calls.some((c) => c.method === 'getSlot'));
                checked++;
            }
        }
        assert.equal(checked, platform === 'desktop' ? 512 : 64);
        const full = render(platform, { root: { Bottom: true, Holding: true, Status: true } });
        snippets.push({ imports: full.imports, code: code(full.example.sections) });
    });

    test(`${platform}: title, subtitle and CTA text are escaped independently`, () => {
        const text = '" <>& }\nЮникод \\';
        const result = render(platform, { title: text, subtitle: 'Другое', primaryLabel: text });
        const output = code(result.example.sections);
        assert.ok(output.includes(`title={${JSON.stringify(text)}}`));
        assert.ok(output.includes('subtitle={"Другое"}'));
        assert.ok(output.includes(`label: ${JSON.stringify(text)}`));
        snippets.push({ imports: result.imports, code: output });
    });

    test(`${platform}: unsupported states and missing content refuse output`, () => {
        for (const name of ['Appearance', 'Background', ...(platform === 'desktop' ? ['View', 'Compact'] : [])]) {
            assert.throws(() => render(platform, { root: { [name]: 'Unknown' } }), /Неизвестный/);
        }
        assert.throws(() => render(platform, { root: { Status: 'False' } }), /BOOLEAN/);
        for (const name of ['Title', 'Subtitle']) assert.throws(() => render(platform, { missingText: name }), /Title\/Subtitle/);
        for (const name of ['ImageView', 'ButtonGroup']) assert.throws(() => render(platform, { missingInstance: name }), /Не найден/);
        assert.throws(() => render(platform, { root: { Bottom: true }, slot: undefined }), /Bottom slot/);
        assert.throws(() => render(platform, { root: { Bottom: true }, slot: [{ type: 'ERROR', message: 'broken child' }] }), /broken child/);
    });

    test(`${platform}: unsupported CTA props and secondary-only are explicit failures`, () => {
        for (const name of ['Hint', 'LeftAddon', 'RightAddon']) assert.throws(() => render(platform, { button: { [name]: true } }), /публичный API/);
        assert.throws(() => render(platform, { button: { Label: false } }), /публичный API/);
        for (const name of ['SingleIcon', 'DisabledState']) assert.throws(() => render(platform, { button: { [name]: 'True' } }), /публичный API/);
        for (const [name, value] of [['View', 'Secondary'], ['Shape', 'Rounded'], ['Size', '72']]) {
            assert.throws(() => render(platform, { button: { [name]: value } }), /View\/Shape\/Size/);
        }
        assert.throws(() => render(platform, { group: { PrimaryButton: 'False', SecondaryButton: 'True' } }), /Secondary-only/);
        const both = render(platform, { group: { PrimaryButton: 'True', SecondaryButton: 'True' } });
        assert.match(code(both.example.sections), /onClick: onPrimaryAction/);
        assert.match(code(both.example.sections), /onClick: onSecondaryAction/);
        snippets.push({ imports: both.imports, code: code(both.example.sections) });
    });
}

test('Bottom slot preserves resolved imports and order, and types multiple opaque regions', () => {
    const result = render('desktop', { root: { Bottom: true }, slot: [
        { type: 'CODE', code: '<p>До</p>' },
        { type: 'SLOT', propertyName: 'first' },
        { type: 'INSTANCE', guid: 'known', symbolId: 'known', nestedImports: ['import type { ReactNode } from \'react\';'], resultSections: [
            { type: 'CODE', code: '<section>' }, { type: 'SLOT', propertyName: 'second' }, { type: 'CODE', code: '</section>' },
        ] },
        { type: 'CODE', code: '<p>После</p>' },
    ] });
    const output = code(result.example.sections);
    assert.match(output, /customAddon: ReactNode\[\]/);
    assert.match(output, /<p>До<\/p>\{customAddon\[0\]\}<section>\{customAddon\[1\]\}<\/section><p>После<\/p>/);
    assert.doesNotMatch(output, /\[object Object\]/);
    snippets.push({ imports: result.imports, code: output });
});

test('source-only secondary action crashes the real internal implementation', { skip: !sourceRoot && 'set ARUI_SOURCE_ROOT' }, () => {
    const source = fs.readFileSync(path.join(sourceRoot, 'src/promo-main-block/components/buttons-group/promo-main-block-buttons-group.tsx'), 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
    const exports = {};
    vm.runInNewContext(js, { exports, require(name) {
        if (name === 'react') return require(path.join(sdkModules, 'react'));
        if (name === 'classnames') return () => '';
        if (name === '@alfalab/core-components/button') return { Button: () => null };
        if (name.endsWith('.css')) return {};
        throw new Error(name);
    } });
    assert.throws(() => exports.PromoMainBlockButtonsGroup({ secondaryButtonProps: { label: 'Secondary', onClick() {} } }), /loading/);
    assert.doesNotThrow(() => exports.PromoMainBlockButtonsGroup({ primaryButtonProps: { label: 'Primary', onClick() {} }, secondaryButtonProps: { label: 'Secondary', onClick() {} } }));
});

test('generated examples match actual source prop types; invented props and invalid callbacks fail', {
    skip: (!sourceRoot || !sdkModules) && 'set ARUI_SOURCE_ROOT and ARUI_SDK_NODE_MODULES',
}, () => {
    const options = { sourceRoot, sdkModules };
    assert.deepEqual(checkSnippets(snippets, options), []);
    for (const prop of ['Background', 'mobile', 'platform', 'bottom', 'children']) {
        const diagnostics = checkSnippets([{ imports: ["import { PromoMainBlockDesktop } from 'arui-private/promo-main-block/desktop';"], code: `const invalid = <PromoMainBlockDesktop ${prop}="invalid" />;` }], options);
        assert.ok(diagnostics.some((d) => d.message.includes(`Property '${prop}' does not exist`)), prop);
    }
    const diagnostics = checkSnippets([{ imports: ["import { PromoMainBlockDesktop } from 'arui-private/promo-main-block/desktop';"], code: 'const invalid = <PromoMainBlockDesktop primaryButtonProps={{ label: "CTA", onClick: "navigate" }} />;' }], options);
    assert.ok(diagnostics.some((d) => d.message.includes('not assignable')));
});
