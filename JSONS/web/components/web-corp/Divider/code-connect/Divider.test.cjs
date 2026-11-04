const fs = require('node:fs'),
    path = require('node:path'),
    vm = require('node:vm');
const assert = require('node:assert/strict'),
    { test } = require('node:test'),
    ts = require('typescript');
const { createHash } = require('node:crypto');
const { checkSnippets } = require('./check-source-api.cjs');
const root = path.resolve(__dirname, '..');
const context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json')));
const source = fs.readFileSync(path.join(__dirname, 'Divider.figma.ts'), 'utf8');
const sourceRoot = process.env.ARUI_SOURCE_ROOT,
    sdkModules = process.env.ARUI_SDK_NODE_MODULES;
const hash = (text) => createHash('sha256').update(text).digest('hex');
const snippets = [];
function render(preset = 'default') {
    const figma = {
        selectedInstance: {
            getEnum(name, values) {
                assert.equal(name, 'Presets');
                return values[preset];
            },
        },
        code(strings, ...values) {
            const sections = [];
            strings.forEach((code, i) => {
                if (code) sections.push({ type: 'CODE', code });
                if (values[i] !== undefined && values[i] !== '')
                    sections.push({ type: 'CODE', code: String(values[i]) });
            });
            return { type: 'SECTIONS', sections, language: 'tsx' };
        },
    };
    const exports = {};
    vm.runInNewContext(
        ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
        }).outputText,
        {
            exports,
            require(name) {
                assert.equal(name, 'figma');
                return figma;
            },
        },
    );
    return exports.default;
}
function code(result) {
    return result.example.sections
        .map((p) => {
            assert.equal(p.type, 'CODE');
            return p.code;
        })
        .join('');
}
function collect(result) {
    const text = code(result);
    snippets.push({ imports: result.imports, code: text });
    return text;
}

test('one typed universal template, exact Figma identity and exhaustive real preset values', () => {
    assert.equal(context.platform, 'universal');
    assert.deepEqual(context.platforms, ['desktop', 'mobile-web']);
    assert.equal(context.root.key, 'b831bd9a4f890b5928fd0fedc3cc3750c7459403');
    assert.deepEqual(context.officialProperties.Presets.variantOptions, ['default', 'light']);
    assert.deepEqual(
        JSON.parse(fs.readFileSync(path.join(root, 'figma.config.json'))).codeConnect.include,
        ['code-connect/Divider.figma.ts'],
    );
    assert.doesNotMatch(
        source,
        /figma\.connect|DividerDesktop|DividerMobile|getSlot|getInstanceSwap/,
    );
    const types = path.resolve(
        path.dirname(require.resolve('@figma/code-connect')),
        '../../figma-types.d.ts',
    );
    const p = ts.createProgram([path.join(__dirname, 'Divider.figma.ts'), types], {
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        types: [],
    });
    assert.deepEqual(
        ts
            .getPreEmitDiagnostics(p)
            .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
        [],
    );
    for (const preset of ['Light', 'unknown', '', null])
        assert.throws(() => render(preset), /Неизвестный Divider Presets/);
});
test('default uses the public component directly; light requires a real nonempty class and the provided CSS recipe', () => {
    const base = render(),
        light = render('light');
    assert.equal(collect(base), '<Divider />');
    assert.equal(base.metadata.nestable, true);
    assert.deepEqual(Array.from(base.imports), ["import { Divider } from 'arui-private/divider';"]);
    const out = collect(light);
    assert.equal(light.metadata.nestable, false);
    assert.match(out, /className=\{lightClassName\}/);
    assert.match(out, /--divider-color: var\(--color-light-neutral-translucent-200\)/);
    assert.doesNotMatch(out, /presets?=|view=|color=|mobile=|width=|style=/);
    const recipe = fs.readFileSync(path.join(__dirname, 'Divider.example.css'), 'utf8');
    assert.match(
        recipe,
        /\.dividerLight\s*\{\s*--divider-color: var\(--color-light-neutral-translucent-200\);\s*\}/,
    );
    const exports = {},
        Divider = () => null;
    vm.runInNewContext(
        ts.transpileModule(out + '\nexports.example = Example;', {
            compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
        }).outputText,
        {
            exports,
            Divider,
            require(name) {
                assert.equal(name, 'react/jsx-runtime');
                return require(path.join(sdkModules, name));
            },
        },
    );
    for (const lightClassName of ['', '  '])
        assert.throws(() => exports.example({ lightClassName }), /реальный CSS-класс/);
    const result = exports.example({ lightClassName: 'appDividerLight' });
    assert.equal(result.type, Divider);
    assert.equal(result.props.className, 'appDividerLight');
});
test('native fill RGBA matches both declared light-context palette tokens through the actual CSS import chain', () => {
    const css = fs.readFileSync(path.join(sourceRoot, 'src/divider/divider.module.css'), 'utf8');
    assert.match(css, /@import '@alfalab\/core-components\/vars\/bundle\/corp.css'/);
    assert.match(css, /--divider-color: var\(--color-light-neutral-translucent-300\)/);
    const coreBundle = fs.readFileSync(
        path.join(sdkModules, '@alfalab/core-components/vars/bundle/corp.css'),
        'utf8',
    );
    const varsBundle = fs.readFileSync(
        path.join(sdkModules, '@alfalab/core-components-vars/bundle/corp.css'),
        'utf8',
    );
    const colors = fs.readFileSync(
        path.join(sdkModules, '@alfalab/core-components-vars/colors-bluetint.css'),
        'utf8',
    );
    assert.match(coreBundle, /@alfalab\/core-components-vars\/bundle\/corp.css/);
    assert.match(varsBundle, /\.\.\/colors-bluetint.css/);
    for (const variant of context.root.variants) {
        const preset = variant.properties.Presets,
            palette = context.palettes[preset];
        const paint = variant.tree.children[0].fills[0];
        const expected = colors
            .match(new RegExp(palette.cssToken + ':\\s*rgba\\(([^)]+)\\)'))[1]
            .split(',')
            .map(Number);
        assert.deepEqual(palette.rgba, expected);
        const actual = [
            paint.color.r * 255,
            paint.color.g * 255,
            paint.color.b * 255,
            paint.opacity,
        ];
        actual.forEach((n, i) => assert.ok(Math.abs(n - expected[i]) < 0.00001));
        assert.equal(variant.tree.height, 1);
        assert.equal(variant.tree.children[0].type, 'RECTANGLE');
        assert.equal(render(preset).metadata.props.colorToken, palette.cssToken);
    }
});
test('real source renders semantic hr and forwards className/dataTestId without new props or fixed width', () => {
    const exports = {},
        filename = path.join(sourceRoot, 'src/divider/divider.tsx');
    vm.runInNewContext(
        ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                jsx: ts.JsxEmit.ReactJSX,
                esModuleInterop: true,
            },
        }).outputText,
        {
            exports,
            require(name) {
                if (['react', 'react/jsx-runtime', 'classnames'].includes(name))
                    return require(path.join(sdkModules, name));
                if (name === './divider.module.css') return { divider: 'divider' };
                throw Error(name);
            },
        },
    );
    const result = exports.Divider({ className: 'appDividerLight', dataTestId: 'separator' });
    assert.equal(result.type, 'hr');
    assert.equal(result.props.className, 'divider appDividerLight');
    assert.equal(result.props['data-test-id'], 'separator');
    assert.deepEqual(Object.keys(result.props).sort(), ['className', 'data-test-id']);
    const css = fs.readFileSync(path.join(sourceRoot, 'src/divider/divider.module.css'), 'utf8');
    assert.match(css, /border: none/);
    assert.match(css, /border-bottom: 1px solid var\(--divider-color\)/);
    assert.match(css, /margin: var\(--gap-0\)/);
    assert.doesNotMatch(css, /width:|@media/);
});
test('all three real native previews exactly match the fixture and compile with every import', () => {
    assert.equal(context.nativePreview.templateSha256, hash(source));
    const rows = context.nativePreview.results;
    assert.equal(rows.length, 3);
    assert.ok(rows.every((r) => r.success && r.snippet.trim()));
    for (const variant of context.root.variants) {
        const result = render(variant.properties.Presets);
        assert.equal(rows.find((r) => r.nodeId === variant.id).snippet, collect(result));
    }
    assert.equal(rows.find((r) => r.nodeId === context.root.id).snippet, code(render()));
    assert.deepEqual(
        checkSnippets(
            rows.map((r) => ({
                imports: render(r.nodeId === '142493:164122' ? 'light' : 'default').imports,
                code: r.snippet,
            })),
            { sourceRoot, sdkModules },
        ),
        [],
    );
});
test('generated and published snippets compile against actual source; invented props and platform exports fail', () => {
    assert.ok(sourceRoot && sdkModules);
    assert.deepEqual(checkSnippets(snippets, { sourceRoot, sdkModules }), []);
    for (const prop of [
        'preset="light"',
        'presets="light"',
        'view="light"',
        'color="grey"',
        'mobile',
        'role="none"',
    ])
        assert.ok(
            checkSnippets(
                [
                    {
                        imports: ["import { Divider } from 'arui-private/divider';"],
                        code: 'const bad=<Divider ' + prop + '/>;',
                    },
                ],
                { sourceRoot, sdkModules },
            ).length > 0,
            prop,
        );
    assert.ok(
        checkSnippets(
            [
                {
                    imports: ["import { DividerDesktop } from 'arui-private/divider';"],
                    code: 'const bad=<DividerDesktop/>;',
                },
            ],
            { sourceRoot, sdkModules },
        ).length > 0,
    );
    const published = path.join(__dirname, 'publication/2026-11-04.snippets.json');
    if (fs.existsSync(published)) {
        const rows = JSON.parse(fs.readFileSync(published)).readbacks;
        assert.equal(rows.length, 2);
        assert.ok(rows.every((r) => r.hasTemplate && r.snippet.trim()));
        assert.deepEqual(
            checkSnippets(
                rows.map((r) => ({ imports: r.snippetImports, code: r.snippet })),
                { sourceRoot, sdkModules },
            ),
            [],
        );
    }
});
