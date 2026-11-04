const fs = require('node:fs'),
    path = require('node:path'),
    assert = require('node:assert/strict'),
    ts = require('typescript'),
    vm = require('node:vm');
const { test } = require('node:test');
const { root, context, render, code, example, inputs } = require('./template-fixture.cjs'),
    { checkSnippets } = require('./check-source-api.cjs');
const sourceRoot = process.env.ARUI_SOURCE_ROOT,
    sdkModules = process.env.ARUI_SDK_NODE_MODULES,
    snippets = [];
function collect(r) {
    snippets.push({ imports: r.imports, code: code(r.example.sections) });
    return snippets.at(-1).code;
}
test('two strict templates use actual ordinary-function props and one decoder body', () => {
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
        errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'),
    );
    const normalize = (s) =>
        s
            .split('\n')
            .slice(3)
            .join('\n')
            .replace(/const isDesktop = (true|false);/, 'PLATFORM;')
            .replace(/const members = .*;/, 'MEMBERS;')
            .replace(/id: "corp-promo-table-view-[^"]+",/, 'ID,');
    assert.equal(
        normalize(fs.readFileSync(files[0], 'utf8')),
        normalize(fs.readFileSync(files[1], 'utf8')),
    );
});
for (const platform of ['desktop', 'mobile']) {
    test(
        platform + ': all four root states preserve rectangular data and source style warnings',
        () => {
            for (let i = 0; i < 4; i++) {
                const r = render(platform, {}, i),
                    out = collect(r),
                    props = example(r)(inputs(r));
                assert.equal(props.headerCells.length, 4);
                assert.equal(props.rows.length, 3);
                assert.ok(props.rows.every((r) => r.cells.length === 3));
                assert.equal(props.firstCells.length, 3);
                assert.equal(props.lastCells.length, 3);
                assert.equal(props.rows[0].cells[0].props.title, 'Title');
                assert.equal(props.lastCells[0].props.primaryButtonProps.label, 'Label');
                const native = context.roots[platform === 'desktop' ? 0 : 1].fixtures[i].properties;
                assert.equal(props.orientation, native.Axis.toLowerCase());
                assert.equal(
                    out.includes('TABLE_STYLE_SOURCE_GAP'),
                    native['Style preset'] === (platform === 'desktop' ? 'Gray' : 'White'),
                );
                assert.doesNotMatch(
                    out,
                    /\[object Object\]|onClick:\s*\(\)\s*=>|\bmobile=|\bstylePreset=|\bamount=|\bcurrency=/,
                );
            }
        },
    );
    test(
        platform + ': all body/first presets and supported last variants keep real native data',
        () => {
            for (let body = 0; body < 4; body++)
                for (let first = 0; first < 3; first++)
                    for (const last of [0, 2, 3]) {
                        const r = render(platform, {
                                rows: {
                                    0: {
                                        firstPreset: first,
                                        lastPreset: last,
                                        cells: { 0: { preset: body } },
                                    },
                                },
                            }),
                            out = collect(r),
                            props = example(r)(inputs(r));
                        assert.equal(
                            props.rows[0].cells[0].type,
                            ['text-content', 'status-badge', 'status', 'slot'][body],
                        );
                        assert.equal(
                            props.firstCells[0].type,
                            first === 2 ? 'slot' : 'text-content',
                        );
                        assert.equal(
                            props.firstCells[0].boldTitle,
                            first === 2 ? undefined : first === 0,
                        );
                        assert.equal(props.lastCells[0].direction, last === 3 ? 'column' : 'row');
                        if (body === 1)
                            assert.equal(props.rows[0].cells[0].props.view, 'positive-checkmark');
                        if (body === 2) {
                            assert.equal(props.rows[0].cells[0].props.children, 'Label');
                            assert.equal(props.rows[0].cells[0].props.color, 'green');
                        }
                        if (body === 3)
                            assert.equal(props.rows[0].cells[0].content.real, 'ReactNode');
                        assert.doesNotMatch(out, /Custom/);
                    }
        },
    );
    test(platform + ': row-local order, visibility, sparse lastCells, escaping and addons', () => {
        const r = render(platform, {
                rows: {
                    0: {
                        cells: {
                            0: {
                                title: '1 000 ₽ "<&>\n',
                                subtitle: 'месяц',
                                props: { TitleAddon: true, SubtitleAddon: true },
                            },
                        },
                    },
                    1: { lastHidden: true },
                    2: { hidden: true },
                },
            }),
            out = collect(r),
            props = example(r)(inputs(r));
        assert.equal(props.rows.length, 2);
        assert.equal(props.rows[0].cells[0].props.title, '1 000 ₽ "<&>\n');
        assert.equal(props.rows[1].cells[0].props.title, 'Title');
        assert.equal(props.rows[0].cells[0].props.rightTitleAddon.real, 'ReactNode');
        assert.equal(1 in props.lastCells, false);
        assert.ok(out.includes(JSON.stringify('1 000 ₽ "<&>\n')));
    });
    test(platform + ': secondary-only and unsupported CTA flags fail without dummy primary', () => {
        assert.throws(
            () => render(platform, { rows: { 0: { lastPreset: 1 } } }),
            /LAST_SECONDARY_ONLY_UNSUPPORTED/,
        );
        for (const action of [
            { DisabledState: 'True' },
            { Size: '56' },
            { Hint: true },
            { LeftAddon: true },
        ])
            assert.throws(() => render(platform, { rows: { 0: { action } } }), /LastCell API/);
    });
}
test('typed Subtitle visibility remains distinct from ambiguous manual Title overrides', () => {
    for (const platform of ['desktop', 'mobile']) {
        const r = render(platform, {
            rows: { 0: { cells: { 0: { props: { Subtitle: false, SubtitleAddon: true } } } } },
        });
        collect(r);
        const props = example(r)(inputs(r));
        assert.equal(props.rows[0].cells[0].props.subtitle, undefined);
        assert.equal(props.rows[0].cells[0].props.rightSubtitleAddon, undefined);
        assert.throws(
            () => render(platform, { rows: { 0: { cells: { 0: { hideTitle: true } } } } }),
            /TEXT_ROLE_CARDINALITY/,
        );
    }
});
test('global header correspondence, cardinality, identity, enum and ID guards are effective', () => {
    assert.throws(
        () => render('mobile', { rows: { 1: { headerText: 'Different' } } }, 1),
        /HEADER_CORRESPONDENCE/,
    );
    assert.throws(
        () => render('desktop', { rows: { 0: { cells: { 0: { hidden: true } } } } }),
        /HEADER_CARDINALITY/,
    );
    assert.throws(
        () => render('desktop', { rows: { 0: { cells: { 0: { foreign: true } } } } }),
        /Чужая cell/,
    );
    assert.throws(() => render('desktop', { root: { Axis: 'unknown' } }), /Неизвестный/);
    const r = render('desktop'),
        args = inputs(r);
    args.ids.rows[1].id = args.ids.rows[0].id;
    assert.throws(() => example(r)(args), /unique/);
    args.ids.rows[1].id = 'new';
    args.ids.headers[0] = ' ';
    assert.throws(() => example(r)(args), /nonempty/);
});
test('all decoded Status/Badge values match public discriminated unions', () => {
    for (const Type of ['Approved', 'Attention', 'Error / Risk', 'Action', 'Processing', 'Neutral'])
        for (const Style of ['Contrast', 'Muted'])
            collect(
                render('desktop', {
                    rows: { 0: { cells: { 0: { preset: 2, status: { Type, Style } } } } },
                }),
            );
    for (const View of [
        'PositiveCheckmark',
        'NegativeCross',
        'NegativeAlert',
        'NegativeBlock',
        'AttentionAlert',
        'NeutralInformation',
        'NeutralOperation',
        'NeutralCross',
    ])
        collect(
            render('mobile', { rows: { 0: { cells: { 0: { preset: 1, badge: { View } } } } } }),
        );
});
test(
    'actual layout/render helpers use header offsets, sparse optional cells, discriminators and real callbacks',
    { skip: !sourceRoot && 'set ARUI_SOURCE_ROOT' },
    () => {
        const React = {
            createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
        };
        function load(file, imports) {
            const js = ts.transpileModule(
                    fs.readFileSync(path.join(sourceRoot, 'src/promo-table-view', file), 'utf8'),
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
                    if (name.endsWith('.css')) return {};
                    assert.ok(name in imports, name);
                    return imports[name];
                },
            });
            return exports;
        }
        const { renderCellContent } = load('utils/render-cell-content.tsx', {
            '@alfalab/core-components/status': { Status: 'status' },
            '@alfalab/core-components/status-badge': { StatusBadge: 'badge' },
            '../components/text-content': { TextContent: 'text' },
        });
        const real = { node: 'real' };
        assert.equal(renderCellContent({ type: 'slot', content: real }), real);
        assert.equal(
            renderCellContent({ type: 'status', props: { color: 'green' } }).type,
            'status',
        );
        assert.equal(
            renderCellContent({ type: 'status-badge', props: { view: 'positive-checkmark' } }).type,
            'badge',
        );
        const utils = { renderCellContent: (c) => c, renderFirstCellContent: (c) => c },
            surface = { BackgroundPlateView: { Primary: 'primary' } };
        const { VerticalLayout } = load('components/vertical-layout/vertical-layout.tsx', {
            '../../../background-plate': surface,
            '../../utils': utils,
            '../text-content': { TextContent: 'text' },
        });
        const r = render('mobile', {}, 1),
            props = example(r)(inputs(r));
        const tree = VerticalLayout({
            ...props,
            BackgroundPlate: 'plate',
            Button: 'button',
            backgroundPlateColor: 'base-bg',
            mobile: true,
        });
        assert.equal(tree.children[0].length, 3);
        assert.throws(() =>
            VerticalLayout({
                ...props,
                headerCells: [],
                BackgroundPlate: 'plate',
                Button: 'button',
                backgroundPlateColor: 'base-bg',
                mobile: true,
            }),
        );
    },
);
test(
    'all emitted examples and actual returned imports pass frozen source API; invented props/types fail',
    { skip: (!sourceRoot || !sdkModules) && 'set source and SDK modules' },
    () => {
        assert.deepEqual(checkSnippets(snippets, { sourceRoot, sdkModules }), []);
        for (const prop of [
            'stylePreset="Gray"',
            'mobile={true}',
            'amount={100}',
            'rows={[{id:"r",cells:[{id:"c",type:"status-badge",props:{view:"made-up"}}]}]}',
        ])
            assert.ok(
                checkSnippets(
                    [
                        {
                            imports: [
                                "import { PromoTableViewDesktop } from 'arui-private/promo-table-view';",
                            ],
                            code: `const bad=<PromoTableViewDesktop headerCells={[]} ${prop.startsWith('rows=') ? '' : 'rows={[]}'} ${prop}/>;`,
                        },
                    ],
                    { sourceRoot, sdkModules },
                ).length,
                prop,
            );
        const file = path.join(__dirname, 'publication/2026-11-04.snippets.json');
        if (fs.existsSync(file)) {
            const rows = JSON.parse(fs.readFileSync(file)).readbacks;
            assert.equal(rows.length, 8);
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
