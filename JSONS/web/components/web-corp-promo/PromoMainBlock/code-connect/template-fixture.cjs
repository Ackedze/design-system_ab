const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json')));
const files = { desktop: 'code-connect/PromoMainBlockDesktop.figma.ts', mobile: 'mobile-web/code-connect/PromoMainBlockMobile.figma.ts' };
const compiled = new Map();
const error = () => ({ type: 'ERROR' });

function render(platform, changes = {}) {
    const source = fs.readFileSync(path.join(root, files[platform]), 'utf8');
    if (!compiled.has(source)) compiled.set(source, ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText);
    const anatomy = context.anatomy[platform === 'desktop' ? 0 : 1];
    const values = Object.fromEntries(Object.entries(anatomy.definitions).map(([key, d]) => [key, d.defaultValue]));
    Object.assign(values, changes.root);
    const calls = [];
    function handle(name, properties) {
        return { type: 'INSTANCE', name,
            value(key) {
                if (Object.hasOwn(properties, key)) return properties[key];
                const match = Object.keys(properties).find((k) => k === key || k.split('#')[0] === key);
                if (match === undefined) throw new Error('Unknown fixture property: ' + key);
                return properties[match];
            },
            getBoolean(key) { return this.value(key); },
            getEnum(key, mapping) { return mapping[this.value(key)]; },
            getString(key) { return this.value(key); },
            getPropertyValue(key) { return this.value(key); },
        };
    }
    const instance = handle(anatomy.name, values);
    const rawPrimary = anatomy.rows.find((row) => row.type === 'INSTANCE' && row.name === 'Primary');
    const buttonProperties = Object.fromEntries(Object.entries(rawPrimary.properties).map(([k, p]) => [k, p.value]));
    function button(name) {
        return handle(name, { ...buttonProperties, View: name, Size: values.Compact === 'True' ? '48' : '56',
            '✎ Label#16:294': changes[name.toLowerCase() + 'Label'] ?? name,
            ...changes.button });
    }
    const group = handle('ButtonGroup', { PrimaryButton: 'True', SecondaryButton: 'False',
        '🔒 Compact': values.Compact ?? 'False', Axis: 'Horizontal', ...changes.group });
    group.findInstance = (name) => changes.missingButton === name ? error() : button(name);
    instance.findText = (name, opts) => {
        calls.push({ method: 'findText', name, opts });
        const row = anatomy.rows.find((r) => r.type === 'TEXT' && r.name === name &&
            JSON.stringify(r.path.slice(1, -1)) === JSON.stringify(opts.path));
        if (!row || changes.missingText === row.path.at(-2)) return error();
        return { type: 'TEXT', name, textContent: changes[row.path.at(-2).toLowerCase()] ?? row.characters };
    };
    instance.findInstance = (name, opts) => {
        calls.push({ method: 'findInstance', name, opts });
        const row = anatomy.rows.find((r) => r.type === 'INSTANCE' && r.name === name &&
            JSON.stringify(r.path.slice(1, -1)) === JSON.stringify(opts.path));
        if (!row || changes.missingInstance === name) return error();
        return name === 'ButtonGroup' ? group : handle(name, {});
    };
    instance.getSlot = (name) => {
        calls.push({ method: 'getSlot', name });
        assert.equal(name, 'Bottom slot');
        return Object.hasOwn(changes, 'slot') ? changes.slot : [{ type: 'SLOT', propertyName: 'Bottom slot' }];
    };
    const figma = { selectedInstance: instance, code(strings, ...values) {
        const sections = [];
        strings.forEach((str, i) => {
            if (str) sections.push({ type: 'CODE', code: str });
            const value = values[i];
            if (Array.isArray(value)) sections.push(...value);
            else if (value?.sections) sections.push(...value.sections);
            else if (value !== undefined && value !== '') sections.push({ type: 'CODE', code: String(value) });
        });
        return { type: 'SECTIONS', sections, language: 'tsx' };
    } };
    const exports = {};
    vm.runInNewContext(compiled.get(source), { exports, require(name) { assert.equal(name, 'figma'); return figma; } });
    return { ...exports.default, calls };
}

function code(parts) {
    return parts.map((s) => {
        if (s.type === 'CODE') return s.code;
        assert.equal(s.type, 'INSTANCE', 'unresolved SLOT/ERROR reached output');
        return code(s.resultSections);
    }).join('');
}
module.exports = { root, context, files, render, code };
