const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const { root, context, files, render, code } = require('./template-fixture.cjs');
const { checkSnippets } = require('./check-source-api.cjs');
const sourceRoot = process.env.ARUI_SOURCE_ROOT;
const sdkModules = process.env.ARUI_SDK_NODE_MODULES;
const snippets = [];
function collect(result) {
    const snippet = { imports: result.imports, code: code(result.example.sections) };
    snippets.push(snippet);
    return snippet.code;
}

test('strict parserless types, scoped config and identical platform logic', () => {
    const filenames = Object.values(files).map((p) => path.join(root, p));
    const figmaTypes = path.resolve(path.dirname(require.resolve('@figma/code-connect')), '../../figma-types.d.ts');
    const program = ts.createProgram([...filenames, figmaTypes], { noEmit: true, strict: true, skipLibCheck: true,
        esModuleInterop: true, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Node10, types: [] });
    const errors = ts.getPreEmitDiagnostics(program);
    assert.equal(errors.length, 0, errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n'));
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'figma.config.json'))).codeConnect.include, Object.values(files));
    const sources = filenames.map((f) => fs.readFileSync(f, 'utf8').split('\n').slice(9).join('\n'));
    assert.equal(sources[0], sources[1]);
    assert.notEqual(render('desktop').id, render('mobile').id);
});

for (const platform of ['desktop', 'mobile']) {
    const index = platform === 'desktop' ? 0 : 1;
    test(`${platform}: all 16 native variants preserve public props, text, paths and title gap`, () => {
        assert.equal(context.nativeValues[index].variants.length, 16);
        for (let i = 0; i < 16; i++) {
            const native = context.nativeValues[index].variants[i];
            const result = render(platform, {}, i);
            const output = collect(result);
            assert.ok(result.imports[0].includes(`BenefitCard${index ? 'Mobile' : 'Desktop'} } from 'arui-private/benefit-card'`));
            for (const [figma, prop, value] of [
                ['GraphicPosition', 'graphicPosition', native.properties.GraphicPosition.toLowerCase()],
                ['CardAxis', 'orientation', native.properties.CardAxis.toLowerCase()],
            ]) assert.ok(output.includes(`${prop}="${value}"`), figma);
            assert.ok(output.includes(`compactView={${native.properties.Compact === 'True'}}`));
            assert.ok(output.includes(`withBackgroundPlate={${native.properties.Background === 'True'}}`));
            assert.equal(output.includes('backgroundPlateProps={{'), native.properties.Background === 'True');
            for (const name of ['Title', 'Subtitle']) {
                const text = native.values.find((v) => v.path.at(-2) === name && v.name === 'value').text;
                assert.ok(output.includes(`${name.toLowerCase()}={${JSON.stringify(text)}}`));
            }
            assert.equal(result.metadata.props.warnings.length > 0, !index && native.properties.Compact === 'True');
            assert.equal(result.metadata.nestable, false);
            assert.match(output, /image: ReactNode/);
            assert.match(output, /clickable: true; onClick: NonNullable<Props\['onClick'\]>/);
            assert.doesNotMatch(output, /\btitleView=|https?:|\.png|onClick:\s*\(\)\s*=>|\[object Object\]/);
        }
    });

    test(`${platform}: dynamic graphic, subtitle, Bottom and surface combinations`, () => {
        let count = 0;
        for (const preset of ['Image', 'IconView', 'Icon']) for (const bottom of ['Off', 'SwapMe', 'Link']) {
            for (const view of ['Primary', 'Secondary', 'Colored', 'Border']) for (const skeleton of ['False', 'True']) {
                const result = render(platform, { graphic: { Presets: preset }, content: { Bottom: bottom !== 'Off', Subtitle: false },
                    bottom: { Presets: bottom === 'Off' ? 'SwapMe' : bottom }, surface: { Type: view, Skeleton: skeleton } });
                const output = collect(result);
                assert.doesNotMatch(output, /subtitle=|\bchildren=|getSlot/);
                assert.ok(output.includes(`type: '${({ Image: 'image', IconView: 'icon-view', Icon: 'icon' })[preset]}'`));
                assert.ok(output.includes(`view: BackgroundPlateView.${view}`));
                assert.ok(output.includes(`showSkeleton: ${skeleton === 'True'}`));
                assert.equal(output.includes('bottomSlot={{'), bottom !== 'Off');
                if (bottom === 'Link') {
                    assert.match(output, /children: "Label"/);
                    assert.match(output, /href: string; rightAddons: ReactNode/);
                    assert.doesNotMatch(output, /rightAddons: undefined/);
                }
                if (preset === 'Icon') assert.ok(output.includes(`iconSize: ${index ? 24 : 32}`));
                count++;
            }
        }
        assert.equal(count, 72);
    });

    test(`${platform}: text escaping, hidden subtitle and underline/addon choices`, () => {
        const label = '" <>& }\nЮникод \\';
        const result = render(platform, { title: label, missing: 'Subtitle', content: { Bottom: true, Subtitle: false },
            bottom: { Presets: 'Link' }, link: { '✎ Label': label, 'Left Addon': true, 'Right Addon': false }, underline: { Line: 'Pseudo' } });
        const output = collect(result);
        assert.ok(output.includes(`title={${JSON.stringify(label)}}`));
        assert.ok(output.includes(`children: ${JSON.stringify(label)}`));
        assert.match(output, /underline: true, pseudo: true/);
        assert.match(output, /leftAddons: ReactNode/);
        assert.match(output, /rightAddons: undefined/);
        for (const line of ['Solid', 'None']) collect(render(platform, { content: { Bottom: true }, bottom: { Presets: 'Link' }, underline: { Line: line } }));
    });

    test(`${platform}: unsupported values and missing required layers refuse output`, () => {
        for (const name of ['GraphicPosition', 'CardAxis', 'Background', 'Compact']) assert.throws(() => render(platform, { root: { [name]: 'Unknown' } }), /Неизвестный/);
        for (const name of ['Content', 'ImageView', 'Title']) assert.throws(() => render(platform, { missing: name }), /Не найден/);
        assert.throws(() => render(platform, { content: { Subtitle: 'False' } }), /BOOLEAN/);
        assert.throws(() => render(platform, { graphic: { Presets: 'Unknown' } }), /Неизвестный/);
        assert.throws(() => render(platform, { graphic: { Presets: 'IconView' }, iconView: { Size: '80' } }), /Size/);
        assert.throws(() => render(platform, { graphic: { Presets: 'IconView' }, iconView: { TopAddon: true } }), /слоты/);
        assert.throws(() => render(platform, { graphic: { Presets: 'Icon' }, icon: { Type: 'Emoji' } }), /Logo\/Emoji/);
        assert.throws(() => render(platform, { surface: { BackgroundColor: 'modal-bg (white)' } }), /modal-bg/);
        assert.throws(() => render(platform, { plate: { Position: 'Level 2 (inner)' } }), /Level 2/);
        assert.throws(() => render(platform, { content: { Bottom: true }, bottom: { Presets: 'Unknown' } }), /Неизвестный/);
        assert.throws(() => render(platform, { content: { Bottom: true }, bottom: { Presets: 'Link' }, link: { Size: 'M (16-24)' } }), /Link Size/);
        assert.doesNotThrow(() => render(platform, { root: { Background: 'False' }, missing: index ? '[M][Promo] BackgroundPlate' : '[D][Promo] BackgroundPlate' }));
    });
}

test('source leaf overrides titleView after spreading supplied props', { skip: !sourceRoot && 'set ARUI_SOURCE_ROOT' }, () => {
    for (const platform of ['desktop', 'mobile']) {
        const source = fs.readFileSync(path.join(sourceRoot, `src/benefit-card/benefit-card-${platform}.tsx`), 'utf8');
        const js = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
        const exports = {};
        vm.runInNewContext(js, { exports, require(name) {
            if (name === 'react') return { forwardRef: (render) => render, createElement: (type, props) => ({ type, props }) };
            if (name === './benefit-card-base') return { BenefitCardBase: 'base' };
            throw new Error(name);
        } });
        const component = exports[platform === 'desktop' ? 'BenefitCardDesktop' : 'BenefitCardMobile'];
        const result = component({ compactView: true, titleView: platform === 'desktop' ? 'secondary' : 'primary' }, null);
        assert.equal(result.props.titleView, platform === 'desktop' ? 'primary' : 'secondary');
    }
});

test('all generated examples match real source API and negative examples fail', {
    skip: (!sourceRoot || !sdkModules) && 'set ARUI_SOURCE_ROOT and ARUI_SDK_NODE_MODULES',
}, () => {
    assert.deepEqual(checkSnippets(snippets, { sourceRoot, sdkModules }), []);
    for (const prop of ['children', 'textAlign', 'loading', 'platform', 'mobile']) {
        const invalid = { imports: ["import { BenefitCardDesktop } from 'arui-private/benefit-card';"], code: `const invalid = <BenefitCardDesktop ${prop}="invalid" />;` };
        assert.ok(checkSnippets([invalid], { sourceRoot, sdkModules }).some((d) => d.message.includes(`Property '${prop}' does not exist`)), prop);
    }
    const invalid = { imports: ["import { BenefitCardMobile } from 'arui-private/benefit-card';"], code: 'const invalid = <BenefitCardMobile onClick="navigate" />;' };
    assert.ok(checkSnippets([invalid], { sourceRoot, sdkModules }).some((d) => d.message.includes('not assignable')));
});
