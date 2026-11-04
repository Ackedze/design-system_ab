const fs = require('node:fs'),
    path = require('node:path'),
    vm = require('node:vm');
const assert = require('node:assert/strict'),
    { test } = require('node:test'),
    ts = require('typescript');
const { checkSnippets } = require('./check-source-api.cjs');
const root = path.resolve(__dirname, '..');
const context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json')));
const sourceRoot = process.env.ARUI_SOURCE_ROOT,
    sdkModules = process.env.ARUI_SDK_NODE_MODULES;
const source = fs.readFileSync(path.join(__dirname, 'Section.figma.ts'), 'utf8');
const snippets = [];
function render({
    Position = 'false',
    tablet = 'false',
    content = [{ type: 'SLOT', propertyName: 'Content' }],
    isle = [{ type: 'SLOT', propertyName: 'Isle' }],
} = {}) {
    const figma = {
        selectedInstance: {
            getEnum(name, values) {
                assert.ok(['Position', '👽 TabletIsle'].includes(name));
                return values[name === 'Position' ? Position : tablet];
            },
            getSlot(name) {
                assert.ok(['Content', 'Isle'].includes(name));
                return name === 'Content' ? content : isle;
            },
        },
        code(strings, ...values) {
            const sections = [];
            strings.forEach((code, i) => {
                if (code) sections.push({ type: 'CODE', code });
                const value = values[i];
                if (Array.isArray(value)) sections.push(...value);
                else if (value?.sections) sections.push(...value.sections);
                else if (value !== undefined && value !== '')
                    sections.push({ type: 'CODE', code: String(value) });
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
function code(parts) {
    return parts
        .map((p) => {
            if (p.type === 'CODE') return p.code;
            assert.equal(p.type, 'INSTANCE', 'No unresolved/error/slot sections may leak');
            return code(p.resultSections);
        })
        .join('');
}
function collect(r) {
    const result = code(r.example.sections);
    snippets.push({ imports: r.imports, code: result });
    return result;
}

test('one canonical responsive template, exact identity, two native SLOT properties and public default import', () => {
    assert.deepEqual(
        JSON.parse(fs.readFileSync(path.join(root, 'figma.config.json'))).codeConnect.include,
        context.files,
    );
    assert.equal(context.root.key, '2bbced82d96c1347fea71a3922cd11cf4c25ad6a');
    assert.equal(context.root.variants.length, 4);
    for (const [name, key] of [
        ['Content', 'Content#137848:18'],
        ['Isle', 'Isle#137848:17'],
    ]) {
        assert.equal(context.officialProperties[key].type, 'SLOT');
        assert.equal(context.officialProperties[key].name, name);
        for (const variant of context.root.variants)
            assert.equal(variant.tree.children.find((c) => c.name === name).type, 'SLOT');
    }
    assert.equal(context.mobileFigmaIdentity, null);
    assert.match(source, /node-id=137848-49081/);
    assert.doesNotMatch(
        source,
        /figma\.connect|getInstanceSwap|SectionDesktop|SectionMobile|hasCodeConnect/,
    );
    const types = path.resolve(
        path.dirname(require.resolve('@figma/code-connect')),
        '../../figma-types.d.ts',
    );
    const p = ts.createProgram([path.join(__dirname, 'Section.figma.ts'), types], {
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
    assert.equal(render().imports[0], "import Section from 'arui-private/section';");
});
test('all four variants emit correct desktop/tablet/mobile order and keep TabletIsle as Figma state', () => {
    for (const variant of context.root.variants) {
        const Position = variant.properties.Position,
            tablet = variant.properties['👽 TabletIsle'];
        const r = render({ Position, tablet }),
            out = collect(r),
            order = Position === 'true' ? 2 : 1;
        assert.match(out, new RegExp(`desktop: 2, tablet: ${order}, mobile: ${order}`));
        assert.equal(r.metadata.props.tabletIsle, tablet === 'true');
        assert.equal(r.metadata.nestable, false);
        assert.match(out, /children: NonNullable<Props\['children'\]>/);
        assert.match(out, /sidebar: NonNullable<Props\['sidebar'\]>/);
        assert.doesNotMatch(
            out,
            /Position=|TabletIsle=|sidebarFirst=|platform=|\[object Object\]|SwapMe/,
        );
    }
});
test('intentional empty slots remain empty; empty Isle creates no phantom sidebar', () => {
    for (const isle of [[], [{ type: 'CODE', code: ' \n ' }]]) {
        const r = render({ content: [], isle }),
            out = collect(r);
        assert.equal(r.metadata.nestable, true);
        assert.doesNotMatch(out, /sidebar=|function Example|ComponentProps/);
        assert.match(out, /><\/Section>/);
    }
    const r = render({
        content: [{ type: 'CODE', code: '<p>Текст</p>' }],
        isle: [{ type: 'CODE', code: '<aside>Условия</aside>' }],
    });
    assert.equal(r.metadata.nestable, true);
    assert.ok(collect(r).includes('sidebar={<><aside>Условия</aside></>}'));
});
test('resolved children and nested imports preserve both slot boundaries and order', () => {
    const nested = {
        type: 'INSTANCE',
        guid: 'known',
        nestedImports: ["import { Label } from 'verified-library';"],
        resultSections: [{ type: 'CODE', code: '<span>Left</span>' }],
    };
    const r = render({
        content: [
            { type: 'CODE', code: '<p>Before</p>' },
            nested,
            { type: 'SLOT', propertyName: 'Nested' },
        ],
        isle: [
            { type: 'CODE', code: '<p>Aside</p>' },
            { type: 'INSTANCE', guid: 'unknown' },
        ],
    });
    const out = code(r.example.sections);
    assert.match(out, /<p>Before<\/p><span>Left<\/span>\{children\}/);
    assert.match(out, /<p>Aside<\/p>\{sidebar\}/);
    assert.equal(
        r.example.sections.find((p) => p.type === 'INSTANCE').nestedImports[0],
        nested.nestedImports[0],
    );
    assert.deepEqual(JSON.parse(JSON.stringify(r.metadata.props.contextCount)), {
        children: 1,
        sidebar: 1,
    });
});
test('multiple opaque sections use independent app inputs without dropping siblings or unresolved placeholders', () => {
    const opaque = [
        { type: 'INSTANCE', guid: 'unknown' },
        { type: 'CODE', code: '{/* SwapMe — no Code Connect template found */}' },
    ];
    const out = collect(render({ content: opaque, isle: opaque }));
    assert.match(out, /children: NonNullable<Props\['children'\]>\[\]/);
    assert.match(out, /sidebar: NonNullable<Props\['sidebar'\]>\[\]/);
    assert.match(out, /\{children\[0\]\}\{children\[1\]\}/);
    assert.match(out, /\{sidebar\[0\]\}\{sidebar\[1\]\}/);
    assert.doesNotMatch(out, /SwapMe|no Code Connect template/);
    const text = '"Кавычки" <>& }';
    const escaped = collect(
        render({ content: [{ type: 'CODE', code: `{${JSON.stringify(text)}}` }], isle: [] }),
    );
    assert.ok(escaped.includes(JSON.stringify(text)));
});
test('unknown variant values, missing slots and nested errors fail explicitly', () => {
    assert.throws(() => render({ Position: 'False' }), /Неизвестный/);
    assert.throws(() => render({ tablet: 'Unknown' }), /Неизвестный/);
    // undefined uses the fixture default; null represents a missing native slot.
    assert.throws(() => render({ content: null }), /обязательный Section SLOT Content/);
    assert.throws(() => render({ isle: null }), /обязательный Section SLOT Isle/);
    assert.throws(
        () => render({ content: [{ type: 'ERROR', message: 'broken Content' }] }),
        /broken Content/,
    );
    assert.throws(
        () =>
            render({
                isle: [
                    {
                        type: 'INSTANCE',
                        resultSections: [{ type: 'ERROR', message: 'broken nested Isle' }],
                    },
                ],
            }),
        /broken nested Isle/,
    );
});
test('real Section source preserves content/sidebar and responsive order; CSS has 768/1280 boundaries', () => {
    assert.ok(sourceRoot && sdkModules, 'source and dependencies required');
    const React = require(path.join(sdkModules, 'react'));
    const filename = path.join(sourceRoot, 'src/section/section.tsx');
    const exports = {};
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
                if (name === 'react') return React;
                if (name === 'react/jsx-runtime') return require(path.join(sdkModules, name));
                if (name === 'classnames') return require(path.join(sdkModules, name));
                if (name === '../cn') return { withTheme: () => (component) => component };
                if (name === './section.module.css')
                    return new Proxy(
                        {},
                        { get: (_, name) => (name === '__esModule' ? false : String(name)) },
                    );
                throw Error(name);
            },
        },
    );
    for (const order of [1, 2]) {
        const result = new exports.Section({
            children: 'MAIN',
            sidebar: 'ASIDE',
            sidebarOrder: { desktop: 2, tablet: order, mobile: order },
        }).render();
        const [content, sidebar] = result.props.children;
        assert.equal(content.props.children, 'MAIN');
        assert.equal(sidebar.props.children, 'ASIDE');
        for (const [name, expected] of [
            ['desktop', 2],
            ['tablet', order],
            ['mobile', order],
        ]) {
            assert.equal(sidebar.props.style['--sidebar-order-' + name], expected);
            assert.equal(content.props.style['--content-order-' + name], expected === 1 ? 2 : 1);
        }
    }
    assert.equal(new exports.Section({ children: 'MAIN' }).render().props.children[1], undefined);
    const css = fs.readFileSync(path.join(sourceRoot, 'src/section/section.module.css'), 'utf8');
    const media = fs.readFileSync(
        path.join(sourceRoot, 'src/lib/mq/custom-media-queries.css'),
        'utf8',
    );
    assert.match(css, /grid-template-columns: 1fr/);
    assert.match(css, /grid-column: span 8/);
    assert.match(css, /grid-column: span 4/);
    assert.match(css, /@media \(--tablet-m\)/);
    assert.match(css, /@media \(--desktop-m\)/);
    assert.match(media, /--tablet-m \(min-width: 768px\)/);
    assert.match(media, /--desktop-m \(min-width: 1280px\)/);
});
test('five real native previews match the template; set identity remains ambiguous where snippets coincide', () => {
    const hash = require('node:crypto').createHash('sha256').update(source).digest('hex');
    assert.equal(context.nativePreview.templateSha256, hash);
    const rows = context.nativePreview.results;
    assert.equal(rows.length, 5);
    assert.ok(rows.every((r) => r.success && r.snippet.trim()));
    for (const variant of context.root.variants) {
        const result = render({
            Position: variant.properties.Position,
            tablet: variant.properties['👽 TabletIsle'],
        });
        assert.equal(rows.find((r) => r.nodeId === variant.id).snippet, collect(result));
    }
    const set = rows.find((r) => r.nodeId === context.root.id);
    const matches = rows.filter((r) => r.nodeId !== context.root.id && r.snippet === set.snippet);
    assert.equal(matches.length, 2, 'Position-only code cannot distinguish both TabletIsle states');
    assert.deepEqual(
        checkSnippets(
            rows.map((r) => ({ imports: render().imports, code: r.snippet })),
            { sourceRoot, sdkModules },
        ),
        [],
    );
});
test('all generated and published snippets compile against actual source; invented props/exports fail', () => {
    assert.ok(sourceRoot && sdkModules, 'source and dependencies required');
    assert.deepEqual(checkSnippets(snippets, { sourceRoot, sdkModules }), []);
    for (const code of [
        'const bad=<Section Position="true"/>;',
        'const bad=<Section TabletIsle/>;',
        'const bad=<Section mobile/>;',
        'const bad=<Section sidebarOrder={{ mobile: 3 }}/>;',
    ])
        assert.ok(
            checkSnippets([{ imports: ["import Section from 'arui-private/section';"], code }], {
                sourceRoot,
                sdkModules,
            }).length > 0,
            code,
        );
    assert.ok(
        checkSnippets(
            [
                {
                    imports: ["import { SectionDesktop } from 'arui-private/section';"],
                    code: 'const bad=<SectionDesktop/>;',
                },
            ],
            { sourceRoot, sdkModules },
        ).length > 0,
    );
    const published = path.join(__dirname, 'publication/2026-11-04.snippets.json');
    if (fs.existsSync(published)) {
        const rows = JSON.parse(fs.readFileSync(published)).readbacks;
        assert.equal(rows.length, 4);
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
module.exports = { render, code };
