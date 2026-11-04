const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const { root, context, files, render, code } = require('./template-fixture.cjs');
const { checkSnippets } = require('./check-source-api.cjs');
const sourceRoot = process.env.ARUI_SOURCE_ROOT;
const sdkModules = process.env.ARUI_SDK_NODE_MODULES;
const snippets = [];
function collect(result) { const s = { imports: result.imports, code: code(result.example.sections) }; snippets.push(s); return s.code; }

test('two scoped parserless files have strict template types and identical logic', () => {
    const filenames = Object.values(files).map((f) => path.join(root, f));
    const figmaTypes = path.resolve(path.dirname(require.resolve('@figma/code-connect')), '../../figma-types.d.ts');
    const program = ts.createProgram([...filenames, figmaTypes], { noEmit: true, strict: true, skipLibCheck: true,
        esModuleInterop: true, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Node10, types: [] });
    const errors = ts.getPreEmitDiagnostics(program);
    assert.equal(errors.length, 0, errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n'));
    const sources = filenames.map((f) => fs.readFileSync(f, 'utf8').split('\n').slice(9).join('\n'));
    assert.equal(sources[0], sources[1]);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'figma.config.json'))).codeConnect.include, Object.values(files));
});
for (const platform of ['desktop', 'mobile']) {
    const index = platform === 'desktop' ? 0 : 1;
    test(`${platform}: every native root variant maps exact API, text, position and height context`, () => {
        assert.equal(context.roots[index].variants.length, index ? 4 : 16);
        for (let i = 0; i < context.roots[index].variants.length; i++) {
            const v = context.roots[index].variants[i], r = render(platform, {}, i), output = collect(r);
            assert.ok(r.imports[0].includes(`BenefitBlock${index ? 'Mobile' : 'Desktop'} } from 'arui-private/benefit-block'`));
            assert.ok(output.includes(`imagePosition${index ? 'Mobile' : 'Desktop'}="${v.properties.Image.toLowerCase()}"`));
            assert.ok(output.includes(`withBackground={${v.properties.Background === 'True'}}`));
            assert.equal(output.includes('heightCustom={heightCustom}'), v.properties.HeightCustom === 'True');
            assert.equal(output.includes('backgroundPlateProps={{ children: null'), v.properties.Background === 'True');
            assert.ok(output.includes(`title={${JSON.stringify(v.rows.find((r) => r.name === 'Title').text)}}`));
            if (index) assert.doesNotMatch(output, /\bcompact=|heightCustom=/);
            assert.equal(r.metadata.nestable, false);
            assert.doesNotMatch(output, /\bchildren=|onClick:\s*\(\)\s*=>|https?:|\.png|\[object Object\]/);
        }
    });
    test(`${platform}: Text/List/Steps and all CTA combinations preserve real native values`, () => {
        let count = 0;
        for (let i = 0; i < context.roots[index].variants.length; i++) {
            for (const preset of ['Text', 'List', 'Steps']) for (const [primary, secondary] of [[true, false], [false, true], [true, true]]) {
                const r = render(platform, { preset, group: { PrimaryButton: String(primary).replace(/^./, (s) => s.toUpperCase()), SecondaryButton: String(secondary).replace(/^./, (s) => s.toUpperCase()) } }, i);
                const output = collect(r);
                assert.equal(output.includes('primaryButtonProps={{'), primary);
                assert.equal(output.includes('secondaryButtonProps={{'), secondary);
                if (preset === 'List') { assert.match(output, /preset="list" listItems=\{\[\{"title":"Text"\},\{"title":"Text"\},\{"title":"Text"\}\]\}/); assert.doesNotMatch(output, /Caption/); }
                if (preset === 'Steps') { assert.equal((output.match(/"title":"Title"/g) ?? []).length, 5); assert.equal((output.match(/"subtitle":"Subtitle"/g) ?? []).length, 5); assert.ok(r.metadata.props.warnings.some((w) => w.includes('больше трёх'))); }
                count++;
            }
        }
        assert.equal(count, index ? 36 : 144);
    });
    test(`${platform}: hidden optional regions are not read; text escaped; colored and disabled/addons mapped`, () => {
        const off = collect(render(platform, { root: { Presets: false, ButtonGroup: false, Background: 'False' }, missing: index ? 'TextContent' : 'Presets' }));
        assert.doesNotMatch(off, /subtitle=|listItems=|stepsItems=|primaryButtonProps=|secondaryButtonProps=|backgroundPlateProps=/);
        const label = '" <>& }\nЮникод \\', output = collect(render(platform, { text: { Title: label, Subtitle: label }, primary: { '✎ Label': label, DisabledState: 'True', LeftAddon: true }, surface: { Type: 'Colored', Skeleton: 'True' } }));
        assert.ok(output.includes(`title={${JSON.stringify(label)}}`)); assert.ok(output.includes(`label: ${JSON.stringify(label)}`));
        assert.match(output, /disabled: true/); assert.match(output, /leftAddons: NonNullable/); assert.match(output, /coloredViewValue: NonNullable/); assert.match(output, /showSkeleton: true/);
    });
    test(`${platform}: unsupported or missing data refuses explicitly`, () => {
        for (const key of ['Image', 'Background', ...(index ? [] : ['Compact', 'HeightCustom'])]) assert.throws(() => render(platform, { root: { [key]: 'Unknown' } }), /Неизвестный/);
        for (const name of ['TitleView', 'ImageView', 'Title']) assert.throws(() => render(platform, { missing: name }), /Не найден/);
        assert.throws(() => render(platform, { root: { Presets: 'False' } }), /BOOLEAN/);
        for (const name of ['Subtitle', 'TitleAddon', 'RightAddon', 'TitleStatus']) assert.throws(() => render(platform, { titleView: { [name]: true } }), /только строку/);
        assert.throws(() => render(platform, { titleView: { View: 'Small' } }), /типографики/);
        assert.throws(() => render(platform, { preset: 'List', List: { Caption: 'True' } }), /Caption/);
        assert.throws(() => render(platform, { preset: 'Steps', '🔩 IndicatorContent': { Active: 'True' } }), /неинтерактивное/);
        assert.throws(() => render(platform, { preset: 'Steps', hidden: 'RowTitle' }), /ожидается title/);
        assert.throws(() => render(platform, { primary: { Hint: true } }), /без Hint/);
        assert.throws(() => render(platform, { image: { Crop: 'Left' } }), /Center/);
        assert.throws(() => render(platform, { surface: { Type: 'Secondary' } }), /Неизвестный/);
        assert.throws(() => render(platform, { plate: { Position: 'Level 2 (inner)' } }), /Level 1/);
    });
}

test('source owns BackgroundPlate children after forwarding its required public props', { skip: !sourceRoot && 'set ARUI_SOURCE_ROOT' }, () => {
    const filename = path.join(sourceRoot, 'src/benefit-block/components/benefit-block-base/benefit-block-base.tsx');
    const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
    const plates = [];
    function visit(n) { if (ts.isJsxElement(n) && n.openingElement.tagName.getText(source) === 'BackgroundPlate') plates.push(n); ts.forEachChild(n, visit); }
    visit(source);
    assert.equal(plates.length, 1);
    assert.ok(plates[0].openingElement.attributes.properties.some((p) => ts.isJsxSpreadAttribute(p) && p.expression.getText(source) === 'backgroundPlateProps'));
    assert.ok(plates[0].children.some((c) => ts.isJsxExpression(c) && c.expression?.getText(source) === 'content'));
});

test('generated examples typecheck against actual source public API; invented props and wrong types fail', {
    skip: (!sourceRoot || !sdkModules) && 'set ARUI_SOURCE_ROOT and ARUI_SDK_NODE_MODULES',
}, () => {
    assert.deepEqual(checkSnippets(snippets, { sourceRoot, sdkModules }), []);
    const published = JSON.parse(fs.readFileSync(path.join(__dirname, 'publication/2026-11-04.snippets.json'))).readbacks;
    assert.equal(published.length, 22);
    for (const r of published) { assert.equal(r.hasTemplate, true); assert.ok(r.snippet.trim()); }
    assert.deepEqual(checkSnippets(published.map((r) => ({ imports: r.snippetImports, code: r.snippet })), { sourceRoot, sdkModules }), []);
    const imports = ["import { BenefitBlockDesktop } from 'arui-private/benefit-block';"];
    for (const prop of ['children', 'onClick', 'titleAddon', 'platform']) {
        const invalid = { imports, code: `const bad = <BenefitBlockDesktop title="Title" image={null} ${prop}="invalid" />;` };
        assert.ok(checkSnippets([invalid], { sourceRoot, sdkModules }).some((d) => d.message.includes(`Property '${prop}' does not exist`)), prop);
    }
    for (const props of ['heightCustom={true}', 'preset="list"', 'backgroundPlateProps={{}}', 'primaryButtonProps={{ text: "fake" }}']) {
        assert.ok(checkSnippets([{ imports, code: `const bad = <BenefitBlockDesktop title="Title" image={null} ${props} />;` }], { sourceRoot, sdkModules }).length > 0, props);
    }
});
