const fs = require('node:fs'),
    path = require('node:path'),
    assert = require('node:assert/strict');
const { test } = require('node:test'),
    ts = require('typescript'),
    { createHash } = require('node:crypto');
const {
    kind,
    context,
    source,
    filename,
    render,
    code,
    example,
    find,
    setProperty,
    runtimeSource,
} = require('./template-fixture.cjs');
const { checkSnippets } = require('./check-source-api.cjs');
const sourceRoot = process.env.ARUI_SOURCE_ROOT,
    sdkModules = process.env.ARUI_SDK_NODE_MODULES;
const snippets = [];
function collect(result) {
    const out = code(result);
    snippets.push({ imports: result.imports, code: out });
    return out;
}
function inputs(extra = {}) {
    return {
        anchor: { type: 'REAL_TARGET' },
        visible: true,
        dataTestId: 'application-onboarding',
        onClose() {},
        onButtonClick() {},
        onClickNext() {},
        onClickPrev() {},
        onClickPips() {},
        ...extra,
    };
}
const node = (root, name) => find(root, (n) => n.name === name);

test(kind + ': exact canonical template, scoped discovery and typed public import', () => {
    assert.equal(context.root.variants.length, 12);
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../figma.config.json')));
    assert.deepEqual(config.codeConnect.include, context.files);
    assert.ok(context.files[0].includes('[[]D]'));
    assert.deepEqual(
        new Set(context.officialProperties['Tail Direction'].variantOptions),
        new Set(['←', '→', '↑', '↓']),
    );
    assert.deepEqual(
        new Set(context.officialProperties['Tail Position'].variantOptions),
        new Set(['Start', 'Center', 'End']),
    );
    const types = path.resolve(
        path.dirname(require.resolve('@figma/code-connect')),
        '../../figma-types.d.ts',
    );
    const p = ts.createProgram([filename, types], {
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
    assert.doesNotMatch(source, /figma\.connect|getSlot|getInstanceSwap|OnboardingTooltipNew/);
    assert.ok(render().imports[0].includes(context.sourceImport));
});
test(
    kind +
        ': all 12 positions preserve current texts, real anchor/visibility and callback bindings',
    () => {
        const seen = new Set(),
            directions = { '←': 'right', '→': 'left', '↑': 'bottom', '↓': 'top' },
            align = { Start: '-start', Center: '', End: '-end' };
        for (let i = 0; i < 12; i++) {
            const v = context.root.variants[i],
                r = render(i),
                out = collect(r),
                props = inputs();
            const result = example(r, props),
                expected =
                    directions[v.properties['Tail Direction']] +
                    align[v.properties['Tail Position']];
            seen.add(result.props.position);
            assert.equal(result.props.position, expected);
            assert.equal(result.props.children, props.anchor);
            assert.equal(result.props.visible, props.visible);
            assert.equal(result.props.onClose, props.onClose);
            assert.doesNotMatch(
                out,
                /tailDirection=|tailPosition=|platform=|\[object Object\]|onClose=\{\(\)/,
            );
            if (kind === 'hint') {
                assert.equal(result.props.tooltipContent, 'Tooltip text.');
                assert.equal(result.props.buttonText, 'Label');
                assert.equal(result.props.onButtonClick, props.onButtonClick);
                assert.equal(result.props.dataTestId, props.dataTestId);
            } else {
                assert.equal(result.props.title, 'Title 18-24');
                assert.equal(result.props.subhead, 'Subhead');
                assert.equal(result.props.description, 'Subtitle');
                assert.equal(result.props.totalSlides, 4);
                assert.equal(result.props.currentSlide, 0);
                assert.equal(result.props.nextButtonText, 'Label');
                assert.equal(result.props.prevButtonText, 'Label');
                assert.equal(result.props.onClickNext, props.onClickNext);
                assert.equal(result.props.onClickPrev, props.onClickPrev);
                assert.equal(result.props.onClickPips, props.onClickPips);
                assert.match(out, /PREVIOUS_BUTTON_SOURCE_GAP/);
            }
        }
        assert.equal(seen.size, 12);
    },
);
test(
    kind +
        ': text escaping, optional visibility and supported nested controls retain their own scope',
    () => {
        const value = '"Текст" <>& }\nследующая строка';
        const escaped = render(0, (tree) => {
            node(tree, 'Title').text = value;
        });
        const result = example(escaped, inputs());
        collect(escaped);
        assert.equal(result.props[kind === 'hint' ? 'tooltipContent' : 'title'], value);
        if (kind === 'hint') {
            const hidden = render(0, (tree) => {
                node(tree, '[D] Button').visible = false;
            });
            const out = collect(hidden);
            assert.doesNotMatch(out, /onButtonClick|buttonText=/);
            assert.throws(() => example(render(), inputs({ dataTestId: ' ' })), /dataTestId/);
        } else {
            for (const subhead of [false, true])
                for (const subtitle of [false, true]) {
                    const r = render(0, (tree) => {
                        const body = node(tree, 'Text content');
                        setProperty(body, 'Subhead', subhead);
                        setProperty(body, 'Subtitle', subtitle);
                        node(body, 'Subhead').visible = subhead;
                        node(body, 'Subtitle').visible = subtitle;
                    });
                    const props = example(r, inputs()).props;
                    collect(r);
                    assert.equal(props.subhead !== undefined, subhead);
                    assert.equal(props.description !== undefined, subtitle);
                }
            for (let selected = 0; selected < 4; selected++) {
                const r = render(0, (tree) => {
                    const footer = node(tree, 'Onboarding footer');
                    const pips = [];
                    find(footer, (n) => {
                        if (['31961:32956', '31961:32957'].includes(n.symbolId)) pips.push(n);
                        return false;
                    });
                    pips.forEach((pip, i) =>
                        setProperty(pip, 'Selected', i === selected ? 'True' : 'False'),
                    );
                });
                collect(r);
                assert.equal(example(r, inputs()).props.currentSlide, selected);
                assert.equal(r.metadata.props.warnings.length, selected === 0 ? 1 : 0);
            }
            const single = render(0, (tree) => {
                for (const name of ['2', '3', '4']) node(tree, name).visible = false;
            });
            collect(single);
            assert.equal(example(single, inputs()).props.totalSlides, 1);
            assert.ok(single.metadata.props.warnings.some((w) => w.includes('PIPS_SOURCE_GAP')));
            const addon = { type: 'REAL_ICON' };
            const r = render(0, (tree) => {
                const primary = find(
                    tree,
                    (n) =>
                        n.type === 'INSTANCE' &&
                        n.properties?.View?.value === 'Primary' &&
                        n.name === '[D] Button',
                );
                setProperty(primary, 'RightAddon', true);
            });
            collect(r);
            assert.equal(
                example(r, inputs({ nextButtonRightAddon: addon })).props.nextButtonRightAddon,
                addon,
            );
        }
    },
);
test(
    kind +
        ': unknown enums, tail drift, missing controls and unsupported button states fail explicitly',
    () => {
        assert.throws(
            () =>
                render(0, (_, v) => {
                    v.properties['Tail Direction'] = 'Auto';
                }),
            /Неизвестный/,
        );
        assert.throws(
            () =>
                render(0, (_, v) => {
                    v.properties['Tail Position'] = 'Unknown';
                }),
            /Неизвестный/,
        );
        assert.throws(
            () =>
                render(0, (tree) => {
                    const tail = find(
                        tree,
                        (n) => n.type === 'INSTANCE' && n.properties?.Direction,
                    );
                    setProperty(tail, 'Direction', '↓');
                }),
            /Tail/,
        );
        assert.throws(
            () =>
                render(0, (tree) => {
                    node(tree, kind === 'hint' ? 'Cross' : 'Close').visible = false;
                }),
            /Cross|Close/,
        );
        assert.throws(
            () =>
                render(0, (tree) => {
                    setProperty(node(tree, '[D] Button'), 'DisabledState', 'True');
                }),
            /API/,
        );
        assert.throws(
            () =>
                render(0, (tree) => {
                    setProperty(node(tree, '[D] Button'), '✎ Label', '');
                }),
            /Пустой/,
        );
        if (kind === 'tooltip') {
            assert.throws(
                () =>
                    render(0, (tree) => {
                        node(tree, 'Text content').symbolId = 'foreign';
                    }),
                /Чужая/,
            );
            assert.throws(
                () =>
                    render(0, (tree) => {
                        setProperty(node(tree, '1'), 'Selected', 'False');
                    }),
                /selected pip/,
            );
            assert.throws(
                () =>
                    render(0, (tree) => {
                        node(tree, 'Subhead').visible = false;
                    }),
                /Subhead/,
            );
        }
    },
);
test(
    kind +
        ': real source routes close/navigation callbacks and preserves zero-based pagination behavior',
    () => {
        const events = [],
            event = { type: 'click' },
            anchor = { type: 'REAL_TARGET' };
        if (kind === 'hint') {
            const r = runtimeSource('onboarding-hint/onboarding-hint.tsx', {
                children: anchor,
                visible: true,
                position: 'right-end',
                buttonText: 'Далее',
                tooltipContent: 'Текст',
                dataTestId: 'hint',
                onClose: (e) => events.push(['close', e]),
                onButtonClick: (e) => events.push(['next', e]),
            });
            assert.equal(r.node.type, 'TooltipDesktop');
            assert.equal(r.node.props.open, true);
            assert.equal(r.node.props.position, 'right-end');
            assert.equal(r.node.props.children, anchor);
            const [close, content, button] = r.node.props.content.props.children;
            assert.equal(content, 'Текст');
            assert.equal(button.props.children, 'Далее');
            close.props.onClick(event);
            button.props.onClick(event);
            assert.deepEqual(events, [
                ['close', event],
                ['next', event],
            ]);
            assert.deepEqual(r.stateWrites, [false, false]);
            assert.equal(r.node.props['dataTestId'], 'hint-tooltip');
        } else {
            for (const currentSlide of [0, 3]) {
                const r = runtimeSource('onboarding-tooltip/onboarding-tooltip.tsx', {
                    children: anchor,
                    visible: true,
                    position: 'left-start',
                    totalSlides: 4,
                    currentSlide,
                    title: 'Title',
                    onClose: (...a) => events.push(['close', ...a]),
                    onClickNext: (e) => events.push(['next', e]),
                    onClickPrev: (e) => events.push(['prev', e]),
                    onClickPips: (i) => events.push(['pip', i]),
                });
                assert.equal(r.node.type, 'TooltipDesktop');
                assert.equal(r.node.props.position, 'left-start');
                assert.equal(r.node.props.open, true);
                assert.equal(r.node.props.children.type, 'Highlighter');
                assert.equal(r.node.props.children.props.children, anchor);
                assert.equal(r.scrollCalls[0].enable, true);
                const [close, body] = r.node.props.content.props.children;
                const [item, footer] = body.props.children;
                assert.equal(item.props.title, 'Title');
                assert.equal(footer.props.currentSlide, currentSlide);
                assert.equal(footer.props.totalSlides, 4);
                events.length = 0;
                footer.props.onNextClick(event);
                assert.equal(events[0][0], 'next');
                assert.equal(
                    events.some((e) => e[0] === 'close'),
                    currentSlide === 3,
                );
                events.length = 0;
                close.props.onClick(event);
                assert.deepEqual(events, [['close', event, 'cross']]);
                events.length = 0;
                footer.props.onClick(2);
                assert.deepEqual(events, [['pip', 2]]);
                const visibleFooter = runtimeSource('onboarding-footer/onboarding-footer.tsx', {
                    totalSlides: 4,
                    currentSlide,
                    prevButtonContent: 'Назад',
                    nextButtonContent: 'Далее',
                }).node;
                assert.equal(
                    Boolean(visibleFooter.props.children[1].props.children[0]),
                    currentSlide > 0,
                );
            }
        }
    },
);
test(
    kind +
        ': all 13 real native previews exactly match fixtures and pass the explicit source API check',
    () => {
        assert.equal(
            context.nativePreview.templateSha256,
            createHash('sha256').update(source).digest('hex'),
        );
        const rows = context.nativePreview.results;
        assert.equal(rows.length, 13);
        assert.ok(rows.every((r) => r.success && r.snippet.trim()));
        for (let i = 0; i < 12; i++) {
            const r = render(i);
            assert.equal(
                rows.find((p) => p.nodeId === context.root.variants[i].id).snippet,
                collect(r),
            );
        }
        assert.ok(
            rows.some(
                (r) =>
                    r.nodeId !== context.root.id &&
                    r.snippet === rows.find((r) => r.nodeId === context.root.id).snippet,
            ),
        );
        assert.deepEqual(
            checkSnippets(
                rows.map((r) => ({ imports: render().imports, code: r.snippet })),
                { sourceRoot, sdkModules },
            ),
            [],
        );
    },
);
test(
    kind +
        ': generated and published snippets include all imports; invented props/default-vs-named exports fail',
    () => {
        assert.ok(sourceRoot && sdkModules);
        assert.deepEqual(checkSnippets(snippets, { sourceRoot, sdkModules }), []);
        const component = kind === 'hint' ? 'OnboardingHint' : 'OnboardingTooltip';
        for (const prop of ['tailDirection="left"', 'tailPosition="Start"', 'platform="mobile"'])
            assert.ok(
                checkSnippets(
                    [
                        {
                            imports: render().imports,
                            code: `declare const anchor: import('react').ReactElement;const bad=<${component} visible={true} ${prop}>{anchor}</${component}>;`,
                        },
                    ],
                    { sourceRoot, sdkModules },
                ).length > 0,
            );
        if (kind === 'hint')
            assert.ok(
                checkSnippets(
                    [
                        {
                            imports: [
                                "import { OnboardingHint } from 'arui-private/onboarding-hint';",
                            ],
                            code: 'const bad=OnboardingHint;',
                        },
                    ],
                    { sourceRoot, sdkModules },
                ).length > 0,
            );
        const published = path.join(__dirname, 'publication/2026-11-05.snippets.json');
        if (fs.existsSync(published)) {
            const rows = JSON.parse(fs.readFileSync(published)).readbacks;
            assert.equal(rows.length, 12);
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
