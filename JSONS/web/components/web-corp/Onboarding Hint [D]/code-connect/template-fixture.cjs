const fs = require('node:fs'),
    path = require('node:path'),
    vm = require('node:vm');
const ts = require('typescript'),
    assert = require('node:assert/strict');
const context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json')));
const kind = context.sourceImport.endsWith('hint') ? 'hint' : 'tooltip';
const filename = path.join(
    __dirname,
    kind === 'hint' ? 'OnboardingHint.figma.ts' : 'OnboardingTooltip.figma.ts',
);
const source = fs.readFileSync(filename, 'utf8');
const clone = (value) => JSON.parse(JSON.stringify(value));
function find(node, predicate) {
    if (predicate(node)) return node;
    for (const child of node.children ?? []) {
        const found = find(child, predicate);
        if (found) return found;
    }
}
function setProperty(node, name, value) {
    const key = Object.keys(node.properties).find((k) => k.replace(/#\d+:\d+$/, '') === name);
    assert.ok(key, name);
    node.properties[key].value = value;
}
function handle(node, variant) {
    function property(name) {
        const props =
            node.type === 'COMPONENT'
                ? Object.fromEntries(
                      Object.entries(variant.properties).map(([k, value]) => [
                          k,
                          { type: 'VARIANT', value },
                      ]),
                  )
                : (node.properties ?? {});
        const matches = Object.entries(props).filter(
            ([key]) => key.replace(/#\d+:\d+$/, '') === name,
        );
        assert.ok(matches.length <= 1, 'Ambiguous property alias');
        return matches[0]?.[1];
    }
    return {
        type: node.type === 'COMPONENT' ? 'INSTANCE' : node.type,
        name: node.name,
        symbolId: node.symbolId,
        textContent: node.text,
        getEnum(name, map) {
            const p = property(name);
            return p?.type === 'VARIANT' ? map[p.value] : undefined;
        },
        getPropertyValue(name) {
            return property(name)?.value;
        },
        getBoolean(name) {
            const p = property(name);
            return p?.type === 'BOOLEAN' ? p.value : undefined;
        },
        getString(name) {
            const p = property(name);
            return p?.type === 'TEXT' ? p.value : undefined;
        },
        findLayers(predicate, options) {
            assert.deepEqual(Array.from(options.path), []);
            const result = [];
            function walk(children) {
                for (const child of children ?? []) {
                    if (child.visible === false) continue;
                    if (['INSTANCE', 'TEXT'].includes(child.type)) {
                        const h = handle(child, variant);
                        if (predicate(h)) result.push(h);
                    }
                    if (child.type !== 'INSTANCE' || options.traverseInstances)
                        walk(child.children);
                }
            }
            walk(node.children);
            return result;
        },
    };
}
function render(index = 0, mutate = () => {}) {
    const variant = clone(context.root.variants[index]);
    mutate(variant.tree, variant);
    const figma = {
        selectedInstance: handle(variant.tree, variant),
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
function code(result) {
    return result.example.sections
        .map((s) => {
            assert.equal(s.type, 'CODE');
            return s.code;
        })
        .join('');
}
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
function example(result, props) {
    const exports = {};
    vm.runInNewContext(
        ts.transpileModule(code(result) + '\nexports.example = Example;', {
            compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
        }).outputText,
        {
            exports,
            React,
            OnboardingHint: 'OnboardingHint',
            OnboardingTooltip: 'OnboardingTooltip',
        },
    );
    return exports.example(props);
}
function runtimeSource(file, props) {
    const sourceRoot = process.env.ARUI_SOURCE_ROOT,
        sdk = process.env.ARUI_SDK_NODE_MODULES;
    const exports = {},
        stateWrites = [],
        scrollCalls = [],
        effects = [];
    const react = {
        ...React,
        memo: (component) => component,
        useCallback: (fn) => fn,
        useMemo: (fn) => fn(),
        useRef: () => ({ current: null }),
        useState: (initial) => [initial, (value) => stateWrites.push(value)],
        useEffect: (fn) => effects.push(fn),
    };
    const moduleSource = fs.readFileSync(path.join(sourceRoot, 'src', file), 'utf8');
    const mocks = {
        '@alfalab/core-components/tooltip/desktop': { TooltipDesktop: 'TooltipDesktop' },
        '@alfalab/core-components/button/desktop': { ButtonDesktop: 'ButtonDesktop' },
        '@alfalab/core-components/button': { Button: 'Button' },
        '@alfalab/core-components/icon-button': { IconButton: 'IconButton' },
        '@alfalab/icons-glyph-26/CrossLine20Icon': { CrossLine20Icon: 'CrossLine20Icon' },
        '@alfalab/icons-glyph-26/CrossLine24Icon': { CrossLine24Icon: 'CrossLine24Icon' },
        '../highlighter/highlighter': { Highlighter: 'Highlighter' },
        '../lib/hooks': { useScrollTo: (p) => scrollCalls.push(p) },
        '../onboarding-footer': { OnboardingFooter: 'OnboardingFooter' },
        '../pips': { Pips: 'Pips' },
        './onboarding-item': { __esModule: true, default: 'OnboardingItem' },
        './utils': { calculateOffset: () => [0, 20] },
    };
    vm.runInNewContext(
        ts.transpileModule(moduleSource, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                esModuleInterop: true,
                jsx: ts.JsxEmit.React,
            },
        }).outputText,
        {
            exports,
            require(name) {
                if (name === 'react') return react;
                if (name === 'classnames' || name === 'bem-react-classname')
                    return require(path.join(sdk, name));
                if (name.endsWith('.css'))
                    return {
                        onboardingHint: 'onboardingHint',
                        onboardingTooltip: 'onboardingTooltip',
                    };
                if (mocks[name]) return mocks[name];
                throw Error('Unknown source dependency ' + name);
            },
        },
    );
    const component = file.includes('onboarding-hint/')
        ? exports.OnboardingHint
        : file.includes('onboarding-footer/')
          ? exports.OnboardingFooter
          : exports.OnboardingTooltip;
    return { node: component(props), stateWrites, scrollCalls, effects };
}
module.exports = {
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
};
