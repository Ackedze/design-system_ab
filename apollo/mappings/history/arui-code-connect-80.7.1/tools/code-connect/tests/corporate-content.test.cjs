const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'CorporateContent.figma.ts'), 'utf8');
const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true}}).outputText;
function render(slot) {
    const calls = [], exports = {};
    const figma = {
        selectedInstance: {getSlot(name) {calls.push(name); return slot;}},
        code(strings, ...values) {
            const result = [];
            strings.forEach((str, i) => {
                if (str) result.push({type: 'CODE', code: str});
                if (values[i] !== undefined) result.push(...values[i]);
            });
            return result;
        },
    };
    vm.runInNewContext(js, {exports, require(name) {assert.equal(name, 'figma'); return figma;}});
    return {template: exports.default, calls};
}
test('the verified native Body property maps dynamically to children, not swap or text', () => {
    const slot = [{type: 'SLOT', guid: 'body'}];
    const {template, calls} = render(slot);
    assert.deepEqual(calls, ['[D] Body']);
    assert.deepEqual(JSON.parse(JSON.stringify(template.example)), [
        {type: 'CODE', code: '<CorporateContent>'}, ...slot,
        {type: 'CODE', code: '</CorporateContent>'},
    ]);
    assert.equal(template.id, 'web-corp.corporate-content');
    assert.equal(template.metadata.nestable, true);
    assert.equal(template.imports[0], 'import { CorporateContent } from "arui-private/corporate-content";');
});
for (const [label, slot] of [['empty', []], ['missing', undefined], ['mixed contents', [
    {type: 'INSTANCE', guid: 'a', symbolId: 'x'}, {type: 'CODE', code: 'text'}, {type: 'INSTANCE', guid: 'b', symbolId: 'y'},
]]]) test(`${label} are preserved without placeholder or hardcoded Section`, () => {
    const {template} = render(slot);
    assert.equal(template.example.length, 2 + (slot?.length || 0));
    assert.ok(!template.example.some(s => s.code?.includes('[object Object]')));
});
test('the snippet uses the real public export and only supported React props', () => {
    const repo = path.resolve(root, '../..');
    const props = ts.createSourceFile('types.ts', fs.readFileSync(path.join(repo, 'src/corporate-content/types.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
    const declaration = props.statements.find(s => ts.isTypeAliasDeclaration(s) && s.name.text === 'CorporateContentProps');
    assert.ok(declaration.type.members.some(m => m.name?.getText(props) === 'children'));
    assert.match(fs.readFileSync(path.join(repo, 'src/corporate-content/index.ts'), 'utf8'), /export \* from '.\/corporate-content'/);
    assert.match(fs.readFileSync(path.join(repo, 'src/corporate-content/corporate-content.tsx'), 'utf8'), /export const CorporateContent/);
    assert.ok(!/figma\.connect|getInstanceSwap|findText|\.join\(/.test(source));
    assert.ok(!/<CorporateContent\s+\w+=/.test(source));
    assert.match(source, /node-id=89622-29551/);
});
