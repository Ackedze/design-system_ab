const fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm'),
  assert = require('node:assert/strict'),
  ts = require('typescript');
const root = path.resolve(__dirname, '..'),
  context = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'figma-context.json'))
  );
function find(node, predicate) {
  if (predicate(node)) return node;
  for (const c of node.children ?? []) {
    const r = find(c, predicate);
    if (r) return r;
  }
}
function setProperty(node, name, value) {
  const key = Object.keys(node.properties).find(
    (k) => k.replace(/#\d+:\d+$/, '') === name
  );
  assert.ok(key, name);
  node.properties[key].value = value;
}
function render(platform = 'desktop', index = 0, mutate = () => {}) {
  const i = platform === 'desktop' ? 0 : 1,
    c = context.roots[i],
    v = JSON.parse(JSON.stringify(c.fixtures[index]));
  const rootProps = Object.fromEntries(
    Object.entries(c.definitions).map(([k, x]) => [
      k,
      { type: x.type, value: x.defaultValue },
    ])
  );
  for (const [k, value] of Object.entries(v.properties))
    rootProps[k] = { type: 'VARIANT', value };
  v.tree.properties = rootProps;
  mutate(v.tree, v);
  function handle(n) {
    function prop(name) {
      const entries = Object.entries(n.properties ?? {}).filter(
        ([k]) => k.replace(/#\d+:\d+$/, '') === name
      );
      assert.ok(entries.length <= 1);
      return entries[0]?.[1];
    }
    return {
      type: n.type === 'COMPONENT' ? 'INSTANCE' : n.type,
      name: n.name,
      symbolId: n.symbolId,
      textContent: n.text,
      getEnum(name, map) {
        const p = prop(name);
        return p?.type === 'VARIANT' ? map[p.value] : undefined;
      },
      getPropertyValue(name) {
        return prop(name)?.value;
      },
      getBoolean(name) {
        const p = prop(name);
        return p?.type === 'BOOLEAN' ? p.value : undefined;
      },
      getString(name) {
        const p = prop(name);
        return p?.type === 'TEXT' ? p.value : undefined;
      },
      findLayers(predicate, opts) {
        assert.deepEqual(Array.from(opts.path), []);
        const result = [];
        function walk(children) {
          for (const child of children ?? []) {
            if (child.visible === false) continue;
            if (['TEXT', 'INSTANCE'].includes(child.type)) {
              const h = handle(child);
              if (predicate(h)) result.push(h);
            }
            if (child.type !== 'INSTANCE' || opts.traverseInstances)
              walk(child.children);
          }
        }
        walk(n.children);
        return result;
      },
    };
  }
  const figma = {
    selectedInstance: handle(v.tree),
    code(strings, ...values) {
      const sections = [];
      strings.forEach((code, i) => {
        if (code) sections.push({ type: 'CODE', code });
        const v = values[i];
        if (Array.isArray(v)) sections.push(...v);
        else if (v?.sections) sections.push(...v.sections);
        else if (v !== undefined && v !== '')
          sections.push({ type: 'CODE', code: String(v) });
      });
      return { type: 'SECTIONS', sections, language: 'tsx' };
    },
  };
  const source = fs.readFileSync(path.join(root, context.files[i]), 'utf8'),
    exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }).outputText,
    {
      exports,
      require(name) {
        assert.equal(name, 'figma');
        return figma;
      },
    }
  );
  return exports.default;
}
const code = (r) =>
  r.example.sections
    .map((s) => {
      assert.equal(s.type, 'CODE');
      return s.code;
    })
    .join('');
const React = {
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        ...(children.length
          ? { children: children.length === 1 ? children[0] : children }
          : {}),
      },
    };
  },
  Fragment: 'Fragment',
};
function example(r, props) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(code(r) + '\nexports.example=Example;', {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
      },
    }).outputText,
    { exports, React, TabsView: 'TabsView' }
  );
  return exports.example(props);
}
function inputs(r) {
  const m = r.metadata.props,
    primary = ['main-A', 'main-B', 'main-C'],
    secondary = ['secondary-A', 'secondary-B', 'secondary-C', 'secondary-D'];
  return {
    ids: { primary, secondary },
    tabs: primary.map((id) => ({
      mainTabProps: { id, title: 'Реальный пункт ' + id },
      secondaryTabProps: secondary.map((id) => ({
        id,
        title: 'Реальный подпункт ' + id,
      })),
      activeSecondaryTabId: secondary[0],
    })),
    activePrimaryTab: primary[0],
    dataTestId: 'application-tabs',
    onMainTabChange() {},
    onSecondaryTabChange() {},
    addons: Object.fromEntries(
      m.requiredAddons.map((k) => [k, { type: 'REAL_ADDON' }])
    ),
  };
}
function sourceRuntime(file, { desktop = true } = {}) {
  const sourceRoot = process.env.ARUI_SOURCE_ROOT,
    sdk = process.env.ARUI_SDK_NODE_MODULES,
    state = [],
    events = [];
  let cursor = 0;
  const react = {
    ...React,
    useState(initial) {
      const i = cursor++;
      if (!(i in state))
        state[i] = typeof initial === 'function' ? initial() : initial;
      return [
        state[i],
        (value) => {
          state[i] = typeof value === 'function' ? value(state[i]) : value;
          events.push(state[i]);
        },
      ];
    },
    useMemo: (fn) => fn(),
  };
  function compile(file) {
    const exports = {};
    vm.runInNewContext(
      ts.transpileModule(
        fs.readFileSync(path.join(sourceRoot, 'src', file), 'utf8'),
        {
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            jsx: ts.JsxEmit.React,
            esModuleInterop: true,
          },
        }
      ).outputText,
      {
        exports,
        require(name) {
          if (name === 'react') return react;
          if (name === '../utils/use-corp-is-desktop')
            return { useCorpIsDesktop: () => desktop };
          if (name === '@alfalab/core-components/tabs/desktop')
            return { TabsDesktop: 'TabsDesktop', Tab: 'Tab' };
          if (name === '@alfalab/core-components/tabs/mobile')
            return { TabsMobile: 'TabsMobile' };
          if (name === '@alfalab/core-components/gap') return { Gap: 'Gap' };
          if (name === './tabs-view-base')
            return { TabsViewBase: 'TabsViewBase' };
          if (name === './tabs-view-desktop')
            return { TabsViewDesktop: 'TabsViewDesktop' };
          if (name === './tabs-view-mobile')
            return { TabsViewMobile: 'TabsViewMobile' };
          if (name === './utils') return compile('tabs-view/utils.ts');
          throw Error(name);
        },
      }
    );
    return exports;
  }
  const exports = compile(file);
  return {
    exports,
    state,
    events,
    render(props) {
      cursor = 0;
      return file.endsWith('tabs-view-base.tsx')
        ? exports.TabsViewBase(props)
        : exports.TabsView(props);
    },
  };
}
module.exports = {
  root,
  context,
  render,
  code,
  example,
  inputs,
  find,
  setProperty,
  sourceRuntime,
};
