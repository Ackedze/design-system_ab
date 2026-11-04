const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json')));
const compiled = new Map();
function render(fileIndex, changes = {}, variantIndex = 0) {
    const file = context.files[fileIndex], family = context.families.find((f) => f.id === file.nodeId), variant = family.variants[variantIndex];
    const source = fs.readFileSync(path.join(root, file.path), 'utf8');
    if (!compiled.has(source)) compiled.set(source, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText);
    const props = { ...variant.properties, ...changes.root }, calls = [];
    function handle(name, values) {
        return { type: 'INSTANCE', name,
            value(key) { const k = Object.keys(values).find((k) => k === key || k.split('#')[0] === key); if (!k) throw new Error('Unknown property: ' + key); return values[k]; },
            getEnum(key, map) { return map[this.value(key)]; }, getPropertyValue(key) { return this.value(key); },
            findInstance(name, opts) {
                calls.push({ method: 'findInstance', name, opts });
                assert.equal(opts.traverseInstances, true); assert.equal(opts.path.length, 0);
                const node = variant.tree.children.find((n) => n.name === name);
                if (!node || changes.missing) return { type: 'ERROR' };
                return handle(name, { ...node.props, ...changes.style });
            },
            getSlot(name) {
                calls.push({ method: 'getSlot', name }); assert.equal(file.slot, true); assert.equal(name, 'Slot');
                return Object.hasOwn(changes, 'slot') ? changes.slot : [];
            },
        };
    }
    const figma = { selectedInstance: handle(family.name, props), code(strings, ...values) {
        const sections = []; strings.forEach((s, i) => { if (s) sections.push({ type: 'CODE', code: s }); const v = values[i];
            if (Array.isArray(v)) sections.push(...v); else if (v?.sections) sections.push(...v.sections);
            else if (v !== undefined && v !== '') sections.push({ type: 'CODE', code: String(v) }); }); return { sections, language: 'tsx' };
    } };
    const exports = {}; vm.runInNewContext(compiled.get(source), { exports, require(name) { assert.equal(name, 'figma'); return figma; } });
    return { ...exports.default, calls };
}
function code(sections) { return sections.map((s) => s.type === 'INSTANCE' ? code(s.resultSections ?? []) : (assert.equal(s.type, 'CODE'), s.code)).join(''); }
module.exports = { root, context, render, code };
