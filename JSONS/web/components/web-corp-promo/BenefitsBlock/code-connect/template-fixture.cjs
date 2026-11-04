const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json')));
const files = { desktop: 'code-connect/BenefitBlockDesktop.figma.ts', mobile: 'mobile-web/code-connect/BenefitBlockMobile.figma.ts' };
const compiled = new Map();
function render(platform, changes = {}, nativeIndex = 0) {
    const index = platform === 'desktop' ? 0 : 1;
    const native = context.roots[index].variants[nativeIndex];
    const tree = structuredClone(context.roots[index].defaultTree);
    const values = { Presets: true, ButtonGroup: true, ...native.properties, ...changes.root };
    function walk(n, fn) { fn(n); (n.children ?? []).forEach((c) => walk(c, fn)); }
    walk(tree, (n) => {
        const row = native.rows.find((r) => r.name === n.name);
        if (row?.props) n.props = row.props;
        if (row?.text !== undefined) n.text = row.text;
        const pi = n.name === (index ? 'TextContent' : 'Presets') ? index : n.name === 'ButtonGroup' ? index + 2 : -1;
        if (pi >= 0) {
            const props = n.name === 'ButtonGroup' ? changes.group ?? n.props : { Type: changes.preset ?? 'Text' };
            const v = context.presets[pi].variants.find((v) => Object.entries(v.properties).every(([k, value]) => props[k] === value));
            if (v) { n.props = { ...v.properties }; n.children = structuredClone(v.tree.children); }
        }
    });
    function overlay(props, changed) {
        const values = { ...props };
        for (const [key, value] of Object.entries(changed ?? {})) values[Object.keys(values).find((k) => k.split('#')[0] === key) ?? key] = value;
        return values;
    }
    walk(tree, (n) => {
        const scope = n.name === 'TitleView' ? 'titleView' : n.name === 'ImageView' ? 'image' : n.name.endsWith('Style Level 1') ? 'surface' :
            n.name.endsWith('BackgroundPlate') ? 'plate' : n.name === 'Button' ? (n.props.View === 'Primary' ? 'primary' : 'secondary') : n.name;
        n.props = overlay(n.props ?? {}, changes[scope]);
        if (n.type === 'TEXT' && Object.hasOwn(changes.text ?? {}, n.name)) n.text = changes.text[n.name];
    });
    const calls = [];
    const error = () => ({ type: 'ERROR' });
    function handle(n, base = []) {
        return { type: n.type, name: n.name, textContent: n.text,
            value(key) { const found = Object.keys(n.props ?? {}).find((k) => k === key || k.split('#')[0] === key); if (!found) throw new Error('Unknown fixture property: ' + key); return n.props[found]; },
            getBoolean(key) { return this.value(key); }, getEnum(key, values) { return values[this.value(key)]; },
            getString(key) { return this.value(key); }, getPropertyValue(key) { return this.value(key); },
            findLayers(selector, options = {}) {
                const out = [], wanted = options.path ?? [];
                function visit(parent, p) {
                    for (const c of parent.children ?? []) {
                        if (changes.missing === c.name || changes.hidden === c.name) continue;
                        const relative = p.slice(base.length), h = handle(c, [...p, c.name]);
                        if (wanted.every((name, i) => relative[i] === name) && selector(h)) out.push(h);
                        if (c.type !== 'INSTANCE' || options.traverseInstances) visit(c, [...p, c.name]);
                    }
                }
                visit(n, base); calls.push({ method: 'findLayers', path: [...base, ...wanted] }); return out;
            },
            findInstance(name, options = {}) { return this.findLayers((n) => n.type === 'INSTANCE' && n.name === name, options)[0] ?? error(); },
            findText(name, options = {}) { return this.findLayers((n) => n.type === 'TEXT' && n.name === name, options)[0] ?? error(); },
        };
    }
    tree.type = 'INSTANCE'; tree.props = values;
    const source = fs.readFileSync(path.join(root, files[platform]), 'utf8');
    if (!compiled.has(source)) compiled.set(source, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText);
    const figma = { selectedInstance: handle(tree), code(strings, ...values) {
        const sections = [];
        strings.forEach((s, i) => { if (s) sections.push({ type: 'CODE', code: s }); const v = values[i];
            if (Array.isArray(v)) sections.push(...v); else if (v?.sections) sections.push(...v.sections);
            else if (v !== undefined && v !== '') sections.push({ type: 'CODE', code: String(v) }); });
        return { sections, language: 'tsx' };
    } };
    const exports = {}; vm.runInNewContext(compiled.get(source), { exports, require(name) { assert.equal(name, 'figma'); return figma; } });
    return { ...exports.default, calls };
}
function code(sections) { return sections.map((s) => { assert.equal(s.type, 'CODE'); return s.code; }).join(''); }
module.exports = { root, context, files, render, code };
