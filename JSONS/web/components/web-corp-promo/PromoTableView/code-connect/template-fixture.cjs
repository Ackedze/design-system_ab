const fs = require('node:fs'),
    path = require('node:path'),
    vm = require('node:vm'),
    assert = require('node:assert/strict'),
    ts = require('typescript');
const root = path.resolve(__dirname, '..'),
    context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json'))),
    compiled = new Map();
function code(sections) {
    return sections.map((s) => (assert.equal(s.type, 'CODE'), s.code)).join('');
}
function render(platform, changes = {}, index = 0) {
    const i = platform === 'desktop' ? 0 : 1,
        family = context.roots[i],
        members = context.members[i],
        native = structuredClone(family.fixtures[index].tree);
    native.properties = { ...family.fixtures[index].properties, ...changes.root };
    const familyFor = (role) =>
        context.aux.find((a) => a.name === (i ? '[M]' : '[D]') + ' ' + role);
    function walk(n, fn) {
        fn(n);
        for (const child of n.children || []) walk(child, fn);
    }
    function directNodes(n) {
        const out = [];
        function visit(p) {
            for (const c of p.children || []) {
                if (c.visible === false) continue;
                if (c.type === 'INSTANCE') out.push(c);
                else visit(c);
            }
        }
        visit(n);
        return out;
    }
    function prop(n, name, value) {
        const key =
            Object.keys(n.properties || {}).find((k) => k === name || k.split('#')[0] === name) ||
            name;
        (n.properties ??= {})[key] = value;
    }
    function replacePreset(n, role, index) {
        const family = familyFor(role),
            v = structuredClone(family.variants[index]);
        n.children = v.tree.children;
        n.symbolId = v.id;
        n.properties = {
            ...Object.fromEntries(
                Object.entries(family.definitions)
                    .filter(([, d]) => d.type === 'BOOLEAN')
                    .map(([k, v]) => [k, v.defaultValue]),
            ),
            ...v.properties,
        };
    }
    function changeText(n, name, value) {
        walk(n, (x) => {
            if (x.name === name && x.type === 'FRAME')
                walk(x, (t) => {
                    if (t.type === 'TEXT') t.text = value;
                });
        });
    }
    const rows = directNodes(native).filter((n) => members.row.includes(n.symbolId)),
        header = directNodes(native).find((n) => members.header.includes(n.symbolId));
    if (header && changes.header)
        for (const [k, v] of Object.entries(changes.header)) prop(header, k, v);
    for (let ri = 0; ri < rows.length; ri++) {
        const row = rows[ri],
            ch = changes.rows?.[ri] || {};
        if (ch.hidden) row.visible = false;
        for (const [k, v] of Object.entries(ch.props || {})) prop(row, k, v);
        const children = directNodes(row),
            first = children.find((n) => members.first.includes(n.symbolId)),
            last = children.find((n) => members.last.includes(n.symbolId)),
            cells = children.filter((n) => members.body.includes(n.symbolId)),
            heads = children.filter((n) => members.head.includes(n.symbolId));
        if (ch.firstPreset !== undefined) replacePreset(first, 'FirstBodyCell', ch.firstPreset);
        if (ch.lastPreset !== undefined) replacePreset(last, 'LastBodyCell', ch.lastPreset);
        if (ch.lastHidden) {
            last.visible = false;
            prop(row, 'LastCell', false);
        }
        for (const [j, c] of cells.entries()) {
            const cc = ch.cells?.[j] || {};
            if (cc.preset !== undefined) replacePreset(c, 'BodyCell', cc.preset);
            if (cc.hidden) c.visible = false;
            if (cc.foreign) c.symbolId = 'foreign';
            for (const [k, v] of Object.entries(cc.props || {})) prop(c, k, v);
            if (cc.props?.Subtitle === false)
                walk(c, (n) => {
                    if (n.type === 'FRAME' && n.name === 'Subtitle') n.visible = false;
                });
            if (cc.hideTitle)
                walk(c, (n) => {
                    if (n.type === 'FRAME' && n.name === 'Title') n.visible = false;
                });
            if (cc.title !== undefined) changeText(c, 'Title', cc.title);
            if (cc.subtitle !== undefined) changeText(c, 'Subtitle', cc.subtitle);
            if (cc.status)
                walk(c, (n) => {
                    if (n.name.includes('StatusPreset'))
                        for (const [k, v] of Object.entries(cc.status)) prop(n, k, v);
                });
            if (cc.badge)
                walk(c, (n) => {
                    if (n.name === 'StatusBadge')
                        for (const [k, v] of Object.entries(cc.badge)) prop(n, k, v);
                });
        }
        if (ch.headerText !== undefined && heads.length)
            changeText(heads[0], 'Title', ch.headerText);
        if (ch.action)
            walk(last, (n) => {
                if (n.type === 'INSTANCE' && ['Primary', 'Secondary'].includes(n.name))
                    for (const [k, v] of Object.entries(ch.action)) prop(n, k, v);
            });
    }
    const calls = [];
    function handle(n) {
        return {
            type: n.type,
            name: n.name,
            symbolId: n.symbolId,
            textContent: n.text,
            properties: Object.fromEntries(
                Object.entries(n.properties || {}).map(([k, value]) => [k, { value }]),
            ),
            value(name) {
                const k = Object.keys(n.properties || {}).find(
                    (k) => k === name || k.split('#')[0] === name,
                );
                if (!k) throw new Error('Unknown property ' + name);
                return n.properties[k];
            },
            getPropertyValue(name) {
                return this.value(name);
            },
            getEnum(name, map) {
                return map[this.value(name)];
            },
            getBoolean(name) {
                return this.value(name);
            },
            getString(name) {
                return this.value(name);
            },
            findLayers(fn, opts) {
                assert.ok(Array.isArray(opts.path));
                calls.push({
                    name: n.name,
                    path: opts.path,
                    traverseInstances: opts.traverseInstances,
                });
                const out = [];
                function visit(parent, parents) {
                    for (const child of parent.children || []) {
                        if (child.visible === false) continue;
                        let pos = 0;
                        for (const p of parents) if (opts.path[pos] === p) pos++;
                        if (pos === opts.path.length && ['INSTANCE', 'TEXT'].includes(child.type)) {
                            const h = handle(child);
                            if (fn(h)) out.push(h);
                        }
                        if (child.type !== 'INSTANCE' || opts.traverseInstances)
                            visit(child, [...parents, child.name]);
                    }
                }
                visit(n, []);
                return out;
            },
            findInstance(name, opts) {
                return (
                    this.findLayers((n) => n.type === 'INSTANCE' && n.name === name, opts)[0] || {
                        type: 'ERROR',
                    }
                );
            },
        };
    }
    const figma = {
        selectedInstance: handle(native),
        code(strings, ...values) {
            const sections = [];
            strings.forEach((s, i) => {
                if (s) sections.push({ type: 'CODE', code: s });
                const v = values[i];
                if (Array.isArray(v)) sections.push(...v.flatMap((x) => x?.sections ?? x));
                else if (v?.sections) sections.push(...v.sections);
                else if (v !== undefined && v !== '')
                    sections.push({ type: 'CODE', code: String(v) });
            });
            return { sections };
        },
    };
    const source = fs.readFileSync(path.join(root, context.files[i]), 'utf8');
    if (!compiled.has(source))
        compiled.set(
            source,
            ts.transpileModule(source, {
                compilerOptions: {
                    target: ts.ScriptTarget.ES2020,
                    module: ts.ModuleKind.CommonJS,
                    esModuleInterop: true,
                },
            }).outputText,
        );
    const exports = {};
    vm.runInNewContext(compiled.get(source), {
        exports,
        require(name) {
            assert.equal(name, 'figma');
            return figma;
        },
    });
    return { ...exports.default, calls };
}
function example(r) {
    const js = ts.transpileModule(code(r.example.sections), {
            compilerOptions: {
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.CommonJS,
                jsx: ts.JsxEmit.React,
            },
        }).outputText,
        exports = {};
    vm.runInNewContext(js + '\nexports.Example=Example;', {
        exports,
        React: { createElement: (_, props) => props },
        PromoTableViewDesktop() {},
        PromoTableViewMobile() {},
        Set,
        Error,
    });
    return exports.Example;
}
function inputs(r) {
    return {
        ids: {
            headers: r.metadata.props.headers.map((_, i) => 'header-' + i),
            rows: r.metadata.props.rows.map((row, i) => ({
                id: 'row-' + i,
                first: 'first-' + i,
                last: 'last-' + i,
                cells: row.cells.map((_, j) => 'cell-' + i + '-' + j),
            })),
        },
        bindings: Object.fromEntries(
            r.metadata.props.requiredBindings.map((key) => [
                key,
                key.endsWith('Props')
                    ? {}
                    : key.endsWith(':slot') || key.includes('Addon') || key.endsWith(':addon')
                      ? { real: 'ReactNode', key }
                      : () => {},
            ]),
        ),
        backgroundPlateBorder: false,
    };
}
module.exports = { root, context, render, code, example, inputs };
