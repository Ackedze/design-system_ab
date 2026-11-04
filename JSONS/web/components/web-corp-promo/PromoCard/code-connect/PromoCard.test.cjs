const fs = require('node:fs'),
    path = require('node:path'),
    assert = require('node:assert/strict'),
    ts = require('typescript'),
    vm = require('node:vm');
const { test } = require('node:test');
const { root, context, render, code } = require('./template-fixture.cjs'),
    { checkSnippets } = require('./check-source-api.cjs');
const sourceRoot = process.env.ARUI_SOURCE_ROOT,
    sdkModules = process.env.ARUI_SDK_NODE_MODULES,
    snippets = [];
function collect(r) {
    const s = { imports: r.imports, code: code(r.example.sections) };
    snippets.push(s);
    return s.code;
}
test('two strict parserless templates share one body', () => {
    const files = context.files.map((f) => path.join(root, f)),
        types = path.resolve(
            path.dirname(require.resolve('@figma/code-connect')),
            '../../figma-types.d.ts',
        );
    const p = ts.createProgram([...files, types], {
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        types: [],
    });
    const errors = ts.getPreEmitDiagnostics(p);
    assert.equal(
        errors.length,
        0,
        errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n'),
    );
    const normalize = (s) =>
        s
            .split('\n')
            .slice(3)
            .join('\n')
            .replace(/const isDesktop = (true|false);/, 'PLATFORM;')
            .replace(/id: "corp-promo-card-[^"]+",/, 'ID,');
    assert.equal(
        normalize(fs.readFileSync(files[0], 'utf8')),
        normalize(fs.readFileSync(files[1], 'utf8')),
    );
});
for (const platform of ['desktop', 'mobile']) {
    const i = platform === 'desktop' ? 0 : 1;
    test(
        platform + ': all 18 native variants map image presence/crop/size and public export',
        () => {
            assert.equal(context.roots[i].fixtures.length, 18);
            for (let v = 0; v < 18; v++) {
                const r = render(platform, {}, v),
                    out = collect(r),
                    p = context.roots[i].fixtures[v].properties;
                assert.ok(r.imports[0].includes(i ? 'PromoCardMobile' : 'PromoCardDesktop'));
                assert.ok(out.includes('size="' + p.Size.toLowerCase() + '"'));
                assert.equal(out.includes('image={image}'), p.Image !== 'None (Figma only)');
                if (p.Image !== 'None (Figma only)')
                    assert.ok(out.includes('imageCrop={' + (p.ImageCrop === 'True') + '}'));
                assert.doesNotMatch(
                    out,
                    /\bplatform=|\bsrc=|\bimageProps=|\bheight=|\[object Object\]/,
                );
            }
        },
    );
    test(platform + ': content flags, all CTA presets and real binding requirements', () => {
        for (let g = 0; g < 4; g++)
            for (const bottom of [undefined, 0, 1]) {
                const r = render(platform, { buttons: g, bottom }),
                    out = collect(r);
                assert.equal(r.metadata.props.buttonData.actions.length, g < 2 ? 1 : 2);
                assert.equal(out.includes('buttonsDirection="column"'), g === 3);
                assert.equal(out.includes('bottomAddon={bottomAddon}'), bottom !== undefined);
                assert.match(out, /onClick: NonNullable/);
                assert.equal(out.includes('view: "accent"'), !!i && g !== 1);
                assert.doesNotMatch(out, /onClick:\s*\(\)\s*=>/);
            }
    });
    test(platform + ': escaping, disabled/addons and title override warning', () => {
        const out = collect(
            render(platform, {
                title: 'A "<&>\n',
                subtitle: 'B "\\',
                buttons: 2,
                action: {
                    '✎ Label': 'C "<&>\n',
                    DisabledState: 'True',
                    LeftAddon: true,
                    RightAddon: true,
                },
                content: { Title: i ? 'Primary' : 'Secondary', Centred: 'True' },
            }),
        );
        assert.ok(out.includes(JSON.stringify('A "<&>\n')));
        assert.match(out, /disabled: true/);
        assert.match(out, /leftAddons: NonNullable/);
        assert.match(out, /rightAddons: NonNullable/);
        assert.match(out, /TITLE_VIEW_SOURCE_GAP/);
        assert.match(out, /centred=\{true\}/);
        const noSub = collect(render(platform, { content: { Subtitle: false } }));
        assert.doesNotMatch(noSub, /\bsubtitle=/);
    });
    test(platform + ': invalid enums/booleans/styles and CTA recipes refuse', () => {
        for (const key of ['Size', 'Image', 'ImageCrop'])
            assert.throws(() => render(platform, { root: { [key]: 'unknown' } }), /Неизвестный/);
        assert.throws(() => render(platform, { root: { Offset: 'False' } }), /BOOLEAN/);
        for (const changes of [
            { style: { BackgroundColor: 'modal-bg' } },
            { style: { Type: 'unknown' } },
            { buttons: 0, action: { Hint: true } },
            { buttons: 0, action: { Label: false } },
            { buttons: 0, action: { SingleIcon: 'True' } },
            { buttons: 0, action: { Shape: 'Rounded' } },
        ])
            assert.throws(() => render(platform, changes));
    });
}
test(
    'source clamps offset/crop and overrides titleView; ReactNode and action propagation remain real',
    { skip: !sourceRoot && 'set ARUI_SOURCE_ROOT' },
    () => {
        const React = {
            forwardRef: (fn) => fn,
            useRef: () => ({ current: null }),
            createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
            Fragment: 'fragment',
        };
        function load(file, imports) {
            const js = ts.transpileModule(
                    fs.readFileSync(path.join(sourceRoot, 'src/promo-card', file), 'utf8'),
                    {
                        compilerOptions: {
                            target: ts.ScriptTarget.ES2020,
                            module: ts.ModuleKind.CommonJS,
                            jsx: ts.JsxEmit.React,
                            esModuleInterop: true,
                        },
                    },
                ).outputText,
                exports = {};
            vm.runInNewContext(js, {
                exports,
                require(name) {
                    if (name === 'react') return React;
                    if (name === 'classnames') return (...args) => args;
                    if (name.endsWith('.css'))
                        return { __esModule: true, default: new Proxy({}, { get: (_, k) => k }) };
                    assert.ok(name in imports, name);
                    return imports[name];
                },
            });
            return exports;
        }
        for (const platform of ['desktop', 'mobile']) {
            const name = platform === 'desktop' ? 'PromoCardDesktop' : 'PromoCardMobile',
                fn = load('promo-card-' + platform + '.tsx', {
                    './components/promo-card-base': { PromoCardBase: 'base' },
                })[name];
            assert.equal(
                fn({ titleView: platform === 'desktop' ? 'secondary' : 'primary' }, null).props
                    .titleView,
                platform === 'desktop' ? 'primary' : 'secondary',
            );
        }
        const { PromoCardBase } = load('components/promo-card-base/promo-card-base.tsx', {
                '../../../background-plate': { BackgroundPlate: 'plate' },
                '../../../hooks': { useMergedRef: () => null },
                '../../../utils/use-scale': { useScale: () => ({}) },
                '../promo-card-content': { PromoCardContent: 'content' },
            }),
            image = { type: 'real image' },
            onClick = () => {};
        const tree = PromoCardBase(
            {
                image,
                imageOrientation: 'bottom',
                imageOffset: true,
                imageCrop: true,
                imageAlign: 'bottomRight',
                clickable: false,
                onClick,
                backgroundPlateProps: {
                    children: undefined,
                    promo: true,
                    backgroundColor: 'base-bg-alt',
                },
            },
            null,
        );
        const mods = tree.props.className[1];
        assert.equal(mods.promoCardImageOffset, false);
        assert.equal(mods.promoCardImageCrop, false);
        assert.equal(tree.props.onKeyDown, onClick);
        assert.equal(tree.props.role, 'button');
        assert.equal(tree.children[0].props.promo, true);
        assert.equal(tree.children[0].props.backgroundColor, 'base-bg-alt');
        assert.ok(tree.children[0].children.length);
    },
);
test(
    'all emitted examples and actual published imports match frozen public source API',
    { skip: (!sourceRoot || !sdkModules) && 'set source and SDK modules' },
    () => {
        assert.deepEqual(checkSnippets(snippets, { sourceRoot, sdkModules }), []);
        for (const prop of ['imageProps={{}}', 'platform="mobile"', 'size="huge"'])
            assert.ok(
                checkSnippets(
                    [
                        {
                            imports: [
                                "import { PromoCardDesktop } from 'arui-private/promo-card';",
                            ],
                            code: `const bad=<PromoCardDesktop ${prop}/>;`,
                        },
                    ],
                    { sourceRoot, sdkModules },
                ).length,
            );
        const p = path.join(__dirname, 'publication/2026-11-04.snippets.json');
        if (fs.existsSync(p)) {
            const rows = JSON.parse(fs.readFileSync(p)).readbacks;
            assert.equal(rows.length, 36);
            assert.ok(rows.every((r) => r.hasTemplate && r.snippet.trim()));
            assert.deepEqual(
                checkSnippets(
                    rows.map((r) => ({ imports: r.snippetImports, code: r.snippet })),
                    { sourceRoot, sdkModules },
                ),
                [],
            );
        }
    },
);
