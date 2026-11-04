const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict'),
  { test } = require('node:test'),
  ts = require('typescript'),
  { createHash } = require('node:crypto');
const {
  root,
  context,
  render,
  code,
  example,
  inputs,
  find,
  setProperty,
  sourceRuntime,
} = require('./template-fixture.cjs');
const { checkSnippets } = require('./check-source-api.cjs');
const sourceRoot = process.env.ARUI_SOURCE_ROOT,
  sdkModules = process.env.ARUI_SDK_NODE_MODULES,
  snippets = [];
const node = (tree, name) => find(tree, (n) => n.name === name),
  norm = (v) => JSON.parse(JSON.stringify(v));
function collect(r) {
  const out = code(r);
  assert.ok(!out.includes('[object Object]'));
  snippets.push({ imports: r.imports, code: out });
  return out;
}
test('two strict canonical templates use the real public responsive export and matching decoder bodies', () => {
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(root, 'figma.config.json')))
      .codeConnect.include,
    context.files
  );
  const files = context.files.map((f) => path.join(root, f)),
    types = path.resolve(
      path.dirname(require.resolve('@figma/code-connect')),
      '../../figma-types.d.ts'
    );
  const program = ts.createProgram([...files, types], {
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
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    []
  );
  const clean = (s) =>
    s
      .split('\n')
      .slice(3)
      .join('\n')
      .replace(/const isMobile = (true|false);/, 'PLATFORM')
      .replace(/id: 'corp-tabs-view-[^']+'/, 'ID');
  assert.equal(
    clean(fs.readFileSync(files[0], 'utf8')),
    clean(fs.readFileSync(files[1], 'utf8'))
  );
  for (const p of ['desktop', 'mobile'])
    assert.deepEqual(Array.from(render(p).imports), [
      "import { TabsView } from 'arui-private/tabs-view';",
      "import type { ComponentProps } from 'react';",
    ]);
});
test('Desktop/Mobile decode visible navigation, selected indexes, IDs and ownership without fabricated groups', () => {
  for (const platform of ['desktop', 'mobile']) {
    const r = render(platform),
      params = inputs(r),
      out = collect(r),
      props = example(r, params).props;
    assert.equal(props.tabs.length, 3);
    assert.equal(props.activePrimaryTab, params.ids.primary[0]);
    assert.deepEqual(norm(props.tabs.map((t) => t.mainTabProps.title)), [
      'TabPrimary 1',
      'TabPrimary 2',
      'TabPrimary 3',
    ]);
    assert.deepEqual(
      norm(props.tabs[0].secondaryTabProps.map((t) => t.title)),
      ['TabSecondary 1', 'TabSecondary 2', 'TabSecondary 3', 'TabSecondary 4']
    );
    assert.equal(props.tabs[0].activeSecondaryTabId, params.ids.secondary[0]);
    assert.equal(props.tabs[1].secondaryTabProps, undefined);
    assert.equal(props.onMainTabChange, params.onMainTabChange);
    assert.equal(props.onSecondaryTabChange, params.onSecondaryTabChange);
    assert.equal(props.additionalMainTabsWrapperProps.showSkeleton, false);
    assert.equal(
      r.metadata.props.platform,
      platform === 'mobile' ? 'mobile-web' : 'desktop'
    );
    assert.doesNotMatch(
      out,
      /\bmobile=|\bsize=|\bview=|\bSkeleton=|102669:|57470:/
    );
    const extra = {
      secondaryTabProps: [
        { id: 'business-B-child', title: 'Реальные данные B' },
      ],
      activeSecondaryTabId: 'business-B-child',
    };
    const enriched = example(r, {
      ...params,
      secondaryByPrimary: { [params.ids.primary[1]]: extra },
    }).props;
    assert.equal(enriched.tabs[1].secondaryTabProps, extra.secondaryTabProps);
    assert.equal(enriched.tabs[0].secondaryTabProps.length, 4);
  }
});
test('Skeleton requires real data; root secondary flags control both snapshot and skeleton without dummy tabs', () => {
  for (const platform of ['desktop', 'mobile']) {
    const r = render(platform, 1),
      params = inputs(r),
      props = example(r, params).props;
    collect(r);
    assert.equal(props.tabs, params.tabs);
    assert.equal(props.additionalMainTabsWrapperProps.showSkeleton, true);
    assert.equal(props.additionalSecondaryTabsWrapperProps.showSkeleton, true);
    assert.throws(() => example(r, { ...params, tabs: [] }), /реальные tabs/);
    assert.throws(
      () => example(r, { ...params, activePrimaryTab: 'missing' }),
      /activePrimaryTab/
    );
    assert.throws(
      () =>
        example(r, {
          ...params,
          tabs: params.tabs.map((t) => ({ mainTabProps: t.mainTabProps })),
        }),
      /secondary/
    );
    for (const index of [0, 1]) {
      const hidden = render(platform, index, (tree) => {
        setProperty(
          tree,
          platform === 'desktop' ? 'TabsSecondary' : 'Secondary',
          false
        );
        if (index === 0)
          node(
            tree,
            platform === 'desktop' ? '[D] TabsSecondary' : '[M] TabsSecondary'
          ).visible = false;
        else
          for (const c of tree.children ?? [])
            if (c.name.includes('Secondary')) c.visible = false;
      });
      collect(hidden);
      const result = example(hidden, inputs(hidden)).props;
      assert.ok(result.tabs.every((t) => !t.secondaryTabProps));
      assert.equal(result.onSecondaryTabChange, undefined);
    }
  }
});
test('text, primary addons and selected/disabled states map to public typed data', () => {
  for (const platform of ['desktop', 'mobile']) {
    const text = '"Текст" <>& }\nпродолжение';
    const r = render(platform, 0, (tree) => {
      const main = node(tree, 'TabsPrimary');
      setProperty(node(main, 'TabPrimary'), '✎ Label', text);
      setProperty(node(main, 'TabPrimary'), 'Addon', true);
      setProperty(node(main, 'TabPrimary'), 'DisabledState', 'True');
      const tag = find(
        tree,
        (n) =>
          n.type === 'INSTANCE' &&
          n.name === (platform === 'desktop' ? '[D] Tag' : '[M] Tag')
      );
      setProperty(tag, 'RightAddon', true);
    });
    const params = inputs(r),
      props = example(r, params).props;
    collect(r);
    assert.equal(props.tabs[0].mainTabProps.title, text);
    assert.equal(props.tabs[0].mainTabProps.disabled, true);
    assert.equal(
      props.tabs[0].mainTabProps.rightAddons,
      params.addons['primary-0']
    );
    assert.equal(
      props.tabs[0].secondaryTabProps[0].rightAddons,
      params.addons['secondary-0']
    );
    const selected = render(platform, 0, (tree) => {
      const tabs = [];
      find(node(tree, 'TabsPrimary'), (n) => {
        if (n.name === 'TabPrimary') tabs.push(n);
        return false;
      });
      tabs.forEach((n, i) =>
        setProperty(n, 'ActiveState', i === 1 ? 'True' : 'False')
      );
    });
    collect(selected);
    const chosen = example(selected, inputs(selected)).props;
    assert.equal(chosen.activePrimaryTab, 'main-B');
    assert.equal(chosen.tabs[0].secondaryTabProps, undefined);
    assert.equal(chosen.tabs[1].secondaryTabProps.length, 4);
  }
});
test('unknown/missing states, unsupported secondary controls and invalid business IDs fail before rendering', () => {
  assert.throws(
    () =>
      render('desktop', 0, (tree) => setProperty(tree, 'Skeleton', 'Unknown')),
    /Неизвестный/
  );
  assert.throws(
    () =>
      render('desktop', 0, (tree) => {
        node(tree, 'TabsPrimary').visible = false;
      }),
    /TabsPrimary/
  );
  assert.throws(
    () =>
      render('desktop', 0, (tree) => {
        setProperty(node(tree, 'TabPrimary'), 'ActiveState', 'False');
      }),
    /выбранная primary/
  );
  assert.throws(
    () =>
      render('desktop', 0, (tree) => {
        setProperty(node(tree, '[D] Tag'), 'LeftAddon', true);
      }),
    /TabsProps/
  );
  assert.throws(
    () =>
      render('mobile', 0, (tree) => {
        node(tree, '[M] TabsSecondary').symbolId = 'foreign';
      }),
    /Secondary family/
  );
  const r = render(),
    p = inputs(r);
  assert.throws(
    () =>
      example(r, { ...p, ids: { ...p.ids, primary: ['same', 'same', 'C'] } }),
    /ID вкладок/
  );
  assert.throws(() => example(r, { ...p, dataTestId: ' ' }), /dataTestId/);
  assert.throws(
    () => example(r, { ...p, secondaryByPrimary: { foreign: {} } }),
    /другой известной/
  );
  assert.throws(
    () =>
      example(r, {
        ...p,
        secondaryByPrimary: {
          'main-B': {
            secondaryTabProps: [
              { id: 'x', title: 'X' },
              { id: 'x', title: 'Duplicate' },
            ],
          },
        },
      }),
    /Некорректные/
  );
  const skeleton = render('mobile', 1),
    sp = inputs(skeleton);
  sp.tabs[0].mainTabProps.id = 0;
  assert.throws(() => example(skeleton, sp), /устойчивыми/);
});
test('actual source selects responsive leaf and preserves callbacks, nested state and initial-only selection', () => {
  for (const desktop of [true, false])
    assert.equal(
      sourceRuntime('tabs-view/tabs-view.tsx', { desktop }).render({ tabs: [] })
        .type,
      desktop ? 'TabsViewDesktop' : 'TabsViewMobile'
    );
  const hook = fs.readFileSync(
    path.join(sourceRoot, 'src/utils/use-corp-is-desktop.ts'),
    'utf8'
  );
  assert.match(hook, /useIsDesktop\(768,/);
  const r = render(),
    params = inputs(r),
    extra = {
      secondaryTabProps: [
        { id: 'B-1', title: 'B1' },
        { id: 'B-2', title: 'B2' },
      ],
      activeSecondaryTabId: 'B-1',
    };
  const props = example(r, {
      ...params,
      secondaryByPrimary: { 'main-B': extra },
    }).props,
    events = [],
    runtime = sourceRuntime('tabs-view/tabs-view-base.tsx');
  const app = {
    ...props,
    TabsComponent: 'CoreTabs',
    onMainTabChange: (e, p) => events.push(['main', p.selectedId]),
    onSecondaryTabChange: (e, p) => events.push(['secondary', p.selectedId]),
  };
  let tree = runtime.render(app);
  assert.equal(tree.props.children[0].props.selectedId, 'main-A');
  tree = runtime.render({ ...app, activePrimaryTab: 'main-B' });
  assert.equal(
    tree.props.children[0].props.selectedId,
    'main-A',
    'changed prop is not synchronized by source'
  );
  tree.props.children[0].props.onChange({}, { selectedId: 'main-B' });
  tree = runtime.render(app);
  assert.equal(tree.props.children[0].props.selectedId, 'main-B');
  const second = tree.props.children[1].props.children[1];
  assert.equal(second.props.view, 'secondary');
  assert.equal(second.props.tagView, 'filled');
  assert.equal(second.props.size, 'xs');
  assert.equal(second.props.selectedId, 'B-1');
  second.props.onChange({}, { selectedId: 'B-2' });
  tree = runtime.render(app);
  assert.equal(
    tree.props.children[1].props.children[1].props.selectedId,
    'B-2'
  );
  assert.deepEqual(events, [
    ['main', 'main-B'],
    ['secondary', 'B-2'],
  ]);
  assert.equal(tree.props.children[0].props.scrollable, true);
});
test('six actual native previews exactly match current template output and pass source API types', () => {
  assert.ok(context.nativePreview);
  assert.equal(context.nativePreview.results.length, 6);
  for (let i = 0; i < 2; i++) {
    const platform = i ? 'mobile' : 'desktop',
      file = path.join(root, context.files[i]);
    assert.equal(
      createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
      context.nativePreview.templateHashes[i]
    );
    for (let j = 0; j < 2; j++) {
      const r = render(platform, j),
        native = context.nativePreview.results.find(
          (n) => n.nodeId === context.roots[i].variants[j].id
        );
      assert.ok(native.success);
      assert.equal(native.snippet, collect(r));
    }
    assert.equal(
      context.nativePreview.results.find(
        (n) => n.nodeId === context.roots[i].id
      ).snippet,
      code(render(platform))
    );
  }
});
test('all emitted and published snippets typecheck; private exports and invented top-level props are rejected', () => {
  assert.deepEqual(checkSnippets(snippets, { sourceRoot, sdkModules }), []);
  for (const prop of ['mobile', 'skeleton', 'size="m"', 'view="primary"'])
    assert.ok(
      checkSnippets(
        [
          {
            imports: render().imports,
            code: 'const bad=<TabsView tabs={[]} ' + prop + '/>;',
          },
        ],
        { sourceRoot, sdkModules }
      ).length > 0
    );
  assert.ok(
    checkSnippets(
      [
        {
          imports: ["import {TabsViewDesktop} from 'arui-private/tabs-view';"],
          code: 'const bad=TabsViewDesktop;',
        },
      ],
      { sourceRoot, sdkModules }
    ).length > 0
  );
  const file = path.join(__dirname, 'publication/2026-11-05.snippets.json');
  if (fs.existsSync(file)) {
    const rows = JSON.parse(fs.readFileSync(file)).readbacks;
    assert.equal(rows.length, 4);
    assert.ok(rows.every((r) => r.hasTemplate && r.snippet.trim()));
    for (const row of rows) {
      assert.equal(row.componentName, 'TabsView');
      assert.equal(row.source, 'https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/tabs-view/tabs-view.tsx?at=' + context.provenance.sourceCommit);
      assert.deepEqual(row.snippetImports, Array.from(render().imports));
      assert.equal(row.snippet, context.nativePreview.results.find(n => n.nodeId === row.queryNodeId).snippet);
    }
    assert.deepEqual(
      checkSnippets(
        rows.map((r) => ({ imports: r.snippetImports, code: r.snippet })),
        { sourceRoot, sdkModules }
      ),
      []
    );
  }
});
