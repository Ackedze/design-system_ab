const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json')));
const compiled = new Map();
function render(platform, changes = {}, variantIndex = 0) {
    const index = platform === 'desktop' ? 0 : 1, family = context.roots[index], variant = family.variants[variantIndex];
    const values = Object.fromEntries(Object.entries(family.definitions).filter(([,p]) => p.type === 'BOOLEAN').map(([k,p]) => [k.split('#')[0], p.defaultValue]));
    Object.assign(values, variant.properties, changes.root);
    const tree = structuredClone(variant.tree);
    if (changes.root?.TitleStatus && variant.properties.Skeleton === 'False') {
        const meta = context.extras.statuses[index].variants.find((v) => v.properties.Type === (changes.titleStatusType ?? 'Approved'));
        const extra = context.extras.roots[index].rows.find((r) => r.name.endsWith('TitleStatus'));
        const node = { ...extra, props: { ...extra.props, Type: meta.properties.Type }, children: meta.rows.filter((r) => r.type === 'TEXT').map((r) => ({ ...r, path: [...extra.path, ...r.path] })) };
        tree.children[0].children.push(node);
    }
    const rows = [];
    function walk(n) { rows.push(n); (n.children ?? []).forEach(walk); }
    walk(tree);
    const calls = [];
    function overlay(props, changes) { const out = { ...props }; for (const [k,v] of Object.entries(changes ?? {})) out[Object.keys(out).find((x) => x.split('#')[0] === k) ?? k] = v; return out; }
    function handle(n, values) { return { type: 'INSTANCE', name: n.name,
        value(k) { const key = Object.keys(values).find((x) => x === k || x.split('#')[0] === k); if (!key) throw new Error('Unknown fixture property: '+k); return values[key]; },
        getEnum(k, map) { return map[this.value(k)]; }, getBoolean(k) { return this.value(k); }, getString(k) { return this.value(k); }, getPropertyValue(k) { return this.value(k); },
        findInstance(name, opts) {
            assert.equal(opts.traverseInstances, true); const target=[...opts.path,name]; calls.push({ name, path: target });
            const r=rows.find((r) => r.type === 'INSTANCE' && JSON.stringify(r.path) === JSON.stringify(target));
            return r && changes.missing !== name ? handle(r, overlay(r.props, changes[name])) : { type: 'ERROR' };
        },
        findText(name, opts) {
            assert.equal(opts.traverseInstances, true); const target=[...opts.path,name]; calls.push({ name, path: target });
            const r=rows.find((r) => r.type === 'TEXT' && JSON.stringify(r.path) === JSON.stringify(target));
            return r && changes.missing !== name ? { type: 'TEXT', name, textContent: changes.text?.[name] ?? r.text } : { type: 'ERROR' };
        },
        findLayers(fn, opts) { assert.equal(opts.traverseInstances, true); return rows.filter((r) => r.type === 'INSTANCE' && opts.path.every((p,i) => r.path[i] === p)).map((r) => handle(r,r.props)).filter(fn); },
    }; }
    const figma = { selectedInstance: handle(tree, values), code(strings, ...values) {
        const sections=[];strings.forEach((s,i) => { if(s)sections.push({type:'CODE',code:s});const v=values[i];if(Array.isArray(v))sections.push(...v);else if(v?.sections)sections.push(...v.sections);else if(v!==undefined&&v!=='')sections.push({type:'CODE',code:String(v)}); });return {sections};
    } };
    const source = fs.readFileSync(path.join(root,context.files[index]),'utf8'); if(!compiled.has(source))compiled.set(source,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText);
    const exports={};vm.runInNewContext(compiled.get(source),{exports,require(name){assert.equal(name,'figma');return figma;}});return {...exports.default,calls};
}
function code(sections){return sections.map((s)=>(assert.equal(s.type,'CODE'),s.code)).join('');}
module.exports={root,context,render,code};
