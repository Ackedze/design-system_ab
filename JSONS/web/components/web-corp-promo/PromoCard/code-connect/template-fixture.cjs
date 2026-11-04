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
        native = structuredClone(family.fixtures[index].tree);
    native.properties = {
        ...Object.fromEntries(
            Object.entries(family.definitions)
                .filter(([, d]) => d.type === 'BOOLEAN')
                .map(([k, d]) => [k, d.defaultValue]),
        ),
        ...family.fixtures[index].properties,
    };
    function prop(n, key, value) {
        const k =
            Object.keys(n.properties || {}).find((k) => k === key || k.split('#')[0] === key) ||
            key;
        (n.properties ??= {})[k] = value;
    }
    function walk(n, fn) {
        fn(n);
        for (const c of n.children || []) walk(c, fn);
    }
    const named = (name) => {
        let result;
        walk(native, (n) => {
            if (!result && n.name === name) result = n;
        });
        return result;
    };
    for (const [k, v] of Object.entries(changes.root || {})) prop(native, k, v);
    const content = named('Content');
    for (const [k, v] of Object.entries(changes.content || {})) prop(content, k, v);
    if (changes.title !== undefined || changes.subtitle !== undefined)
        for (const name of ['Title', 'Subtitle']) {
            const n = named(name);
            if (n)
                walk(n, (t) => {
                    if (t.type === 'TEXT' && changes[name.toLowerCase()] !== undefined)
                        t.text = changes[name.toLowerCase()];
                });
        }
    const prefix = i ? '[M]' : '[D]';
    if (changes.buttons !== undefined) {
        const family = context.aux.find((r) => r.name === prefix + ' ButtonGroup'),
            v = structuredClone(family.variants[changes.buttons]);
        const group = {
            ...v.tree,
            name: family.name,
            type: 'INSTANCE',
            symbolId: v.id,
            properties: v.properties,
        };
        prop(content, 'Buttons', true);
        content.children.push(group);
        walk(group, (n) => {
            if (n.type === 'INSTANCE' && ['Primary', 'Secondary'].includes(n.name)) {
                for (const [k, v] of Object.entries(changes.action || {})) prop(n, k, v);
            }
        });
    }
    if (changes.bottom !== undefined) {
        const family = context.aux.find((r) => r.name === prefix + ' BottomContent'),
            v = structuredClone(family.variants[changes.bottom]);
        prop(content, 'Bottom', true);
        content.children.push({
            ...v.tree,
            name: 'Bottom',
            type: 'INSTANCE',
            symbolId: v.id,
            properties: v.properties,
        });
    }
    if (changes.style)
        for (const [k, v] of Object.entries(changes.style))
            prop(named(prefix + '[Promo] Style Level 1'), k, v);
    if (changes.imageCentred !== undefined) {
        const n = named('ImageContainer');
        n.type = 'INSTANCE';
        n.properties = { 'Image Centred': changes.imageCentred };
    }
    const calls = [];
    function handle(n) {
        return {
            type: n.type,
            name: n.name,
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
                calls.push(opts);
                const found = [];
                function visit(parent, parents) {
                    for (const child of parent.children || []) {
                        if (child.visible === false) continue;
                        let pos = 0;
                        for (const p of parents) if (opts.path[pos] === p) pos++;
                        if (pos === opts.path.length && ['INSTANCE', 'TEXT'].includes(child.type)) {
                            const h = handle(child);
                            if (fn(h)) found.push(h);
                        }
                        if (child.type !== 'INSTANCE' || opts.traverseInstances)
                            visit(child, [...parents, child.name]);
                    }
                }
                visit(n, []);
                return found;
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
module.exports = { root, context, render, code };
