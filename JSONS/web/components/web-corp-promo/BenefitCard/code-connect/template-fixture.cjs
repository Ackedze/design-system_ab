const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json')));
const files = { desktop: 'code-connect/BenefitCardDesktop.figma.ts', mobile: 'mobile-web/code-connect/BenefitCardMobile.figma.ts' };
const compiled = new Map();

function render(platform, changes = {}, nativeIndex = 0) {
    const index = platform === 'desktop' ? 0 : 1;
    const native = context.nativeValues[index].variants[nativeIndex];
    const source = fs.readFileSync(path.join(root, files[platform]), 'utf8');
    if (!compiled.has(source)) compiled.set(source, ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText);
    const values = { ...native.properties, ...changes.root };
    let rows = structuredClone(context.nested[index].rows);
    for (const row of native.values) {
        const target = rows.find((r) => JSON.stringify(r.path) === JSON.stringify(row.path));
        if (target && row.properties) target.properties = Object.fromEntries(Object.entries(row.properties).map(([k, value]) => [k, { value }]));
        if (target && Object.hasOwn(row, 'text')) target.text = row.text;
    }
    const graphicName = index ? '[M] Graphic' : '[D] Graphic';
    function overlay(props, changes = {}) {
        const values = Object.fromEntries(Object.entries(props).map(([k, p]) => [k, p?.value ?? p]));
        for (const [key, value] of Object.entries(changes)) {
            const nativeKey = Object.keys(values).find((k) => k.split('#')[0] === key) ?? key;
            values[nativeKey] = value;
        }
        return values;
    }
    const graphicPath = ['GraphicContainer', graphicName];
    const graphic = rows.find((r) => r.name === graphicName);
    const preset = changes.graphic?.Presets ?? graphic.properties.Presets.value;
    const presetRows = context.presets[index].variants.find((v) => v.name === 'Presets=' + preset)?.rows ?? [];
    rows = rows.filter((r) => !(r.path.length > graphicPath.length && r.path[1] === graphicName));
    rows.push(...presetRows.map((r) => ({ ...r, path: [...graphicPath, ...r.path] })));
    const bottomPath = ['ContentWrapper', 'Content', 'Bottom'];
    const bottomPreset = changes.bottom?.Presets ?? 'SwapMe';
    const bottomRows = context.presets[index + 2].variants.find((v) => v.name === 'Presets=' + bottomPreset)?.rows ?? [];
    rows.push(...bottomRows.map((r) => ({ ...r, path: [...bottomPath, ...r.path] })));
    const calls = [];
    const error = () => ({ type: 'ERROR' });
    function handle(name, values, base = []) {
        return { type: 'INSTANCE', name,
            value(key) {
                const k = Object.keys(values).find((k) => k === key || k.split('#')[0] === key);
                if (k === undefined) throw new Error('Unknown fixture property: ' + key);
                return values[k];
            },
            getBoolean(key) { return this.value(key); },
            getEnum(key, mapping) { return mapping[this.value(key)]; },
            getString(key) { return this.value(key); },
            getPropertyValue(key) { return this.value(key); },
            findInstance(name, options = {}) {
                calls.push({ method: 'findInstance', name, path: [...base, ...(options.path ?? [])] });
                const target = [...base, ...(options.path ?? []), name];
                const crossesInstance = rows.some((r) => r.type !== 'TEXT' && r.path.length < target.length &&
                    JSON.stringify(r.path) === JSON.stringify(target.slice(0, r.path.length)));
                if (crossesInstance && !options.traverseInstances) return error();
                const row = rows.find((r) => r.type !== 'TEXT' && JSON.stringify(r.path) === JSON.stringify(target));
                if (!row || changes.missing === name) return error();
                const scope = name === graphicName ? 'graphic' : name === 'Content' ? 'content' : name === 'Bottom' ? 'bottom' :
                    name === 'Link' ? 'link' : name === 'Underline' ? 'underline' : name === 'IconView' ? 'iconView' :
                    name === '🔩 Content' ? 'icon' : name.endsWith('Style Level 1') ? 'surface' : name.endsWith('BackgroundPlate') ? 'plate' : name;
                return handle(name, overlay(row.properties, changes[scope]), target);
            },
            findText(name, options = {}) {
                // These paths cross Content INSTANCE, unlike PromoMainBlock frame paths.
                if (!options.traverseInstances) return error();
                const target = [...base, ...(options.path ?? []), name];
                calls.push({ method: 'findText', name, path: target });
                const row = rows.find((r) => r.type === 'TEXT' && JSON.stringify(r.path) === JSON.stringify(target));
                if (!row || changes.missing === target.at(-2)) return error();
                return { type: 'TEXT', name, textContent: changes[target.at(-2).toLowerCase()] ?? row.text };
            },
        };
    }
    const figma = { selectedInstance: handle(context.anatomy[index].name, values), code(strings, ...values) {
        const sections = [];
        strings.forEach((str, i) => {
            if (str) sections.push({ type: 'CODE', code: str });
            const value = values[i];
            if (Array.isArray(value)) sections.push(...value);
            else if (value?.sections) sections.push(...value.sections);
            else if (value !== undefined && value !== '') sections.push({ type: 'CODE', code: String(value) });
        });
        return { sections, language: 'tsx' };
    } };
    const exports = {};
    vm.runInNewContext(compiled.get(source), { exports, require(name) { assert.equal(name, 'figma'); return figma; } });
    return { ...exports.default, calls };
}
function code(sections) {
    return sections.map((s) => { assert.equal(s.type, 'CODE'); return s.code; }).join('');
}
module.exports = { root, context, files, render, code };
