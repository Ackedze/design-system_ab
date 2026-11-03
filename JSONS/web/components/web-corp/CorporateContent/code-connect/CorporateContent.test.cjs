const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const context = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-context.json')));
const cases = [
    ['Desktop', 'code-connect/CorporateContentDesktop.figma.ts', '[D] Body', '89622-29551'],
    ['Mobile Web', 'mobile-web/code-connect/CorporateContentMobile.figma.ts', '[M] Body', '89653-28862'],
];

function evaluate(file, property, sections) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const js = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const exports = {};
    const figma = {
        selectedInstance: { getSlot(name) { assert.equal(name, property); return sections; } },
        code(strings, ...values) {
            const result = [];
            strings.forEach((code, i) => {
                if (code) result.push({ type: 'CODE', code });
                const value = values[i];
                if (Array.isArray(value)) result.push(...value);
                else if (value?.sections) result.push(...value.sections);
                else if (value !== undefined && value !== '') result.push({ type: 'CODE', code: String(value) });
            });
            return { type: 'SECTIONS', sections: result, language: 'tsx' };
        },
    };
    vm.runInNewContext(js, { exports, require(name) { assert.equal(name, 'figma'); return figma; } });
    return exports.default;
}

function code(parts) {
    return parts.map((section) => {
        if (section.type === 'CODE') return section.code;
        assert.equal(section.type, 'INSTANCE', 'unresolved slot/error must never reach the snippet');
        return code(section.resultSections);
    }).join('');
}

for (const [platform, file, property, node] of cases) {
    const run = (sections) => evaluate(file, property, sections);
    test(`${platform}: exact identity, Core format and real public import`, () => {
        const source = fs.readFileSync(path.join(root, file), 'utf8');
        const component = context.components.find((item) => item.nodeId === node.replace('-', ':'));
        const properties = Object.values(component.properties);
        assert.equal(properties.length, 1);
        assert.equal(properties[0].name, property);
        assert.equal(properties[0].type, 'SLOT');
        assert.ok(properties[0].key.startsWith(`${property}#`));
        assert.ok(source.includes(`node-id=${node}`));
        assert.match(source, /\/\/ source=https:\/\/git\.moscow\.alfaintra\.net\/projects\/EF\/repos\/arui-private\/browse\/src\/corporate-content\/corporate-content\.tsx\?at=[a-f0-9]{40}/);
        assert.doesNotMatch(source, /figma\.connect|connectedInstances|findText|getInstanceSwap/);
        assert.deepEqual(Array.from(run([]).imports), ["import { CorporateContent } from 'arui-private/corporate-content';"]);
    });
    test(`${platform}: empty slot and resolved content remain directly nestable`, () => {
        assert.equal(code(run([]).example.sections), '<CorporateContent></CorporateContent>');
        const sections = [
            { type: 'CODE', code: '{"Текст < & }"}' },
            { type: 'INSTANCE', guid: 'child', symbolId: 'component', nestedImports: ["import { Link } from 'library';"], resultSections: [{ type: 'CODE', code: '<Link href="/terms">Условия</Link>' }] },
        ];
        const result = run(sections);
        assert.equal(result.metadata.nestable, true);
        assert.equal(code(result.example.sections), '<CorporateContent>{"Текст < & }"}<Link href="/terms">Условия</Link></CorporateContent>');
        assert.equal(result.example.sections[2].nestedImports[0], sections[1].nestedImports[0]);
    });
    test(`${platform}: native SLOT becomes explicit application children`, () => {
        const result = run([{ type: 'SLOT', propertyName: property, guid: 'body' }]);
        assert.equal(result.metadata.nestable, false);
        assert.match(code(result.example.sections), /function Example\(\{ children \}: \{ children: ReactNode \}\)/);
        assert.match(code(result.example.sections), /<CorporateContent>\{children\}<\/CorporateContent>/);
        assert.ok(result.imports.includes("import type { ReactNode } from 'react';"));
    });
    test(`${platform}: mixed and nested opaque regions keep their original order`, () => {
        const result = run([
            { type: 'CODE', code: '<p>До</p>' },
            { type: 'INSTANCE', guid: 'frame', symbolId: 'unknown' },
            { type: 'INSTANCE', guid: 'nested', symbolId: 'known', resultSections: [
                { type: 'CODE', code: '<section>' },
                { type: 'SLOT', propertyName: 'nested' },
                { type: 'CODE', code: '</section>' },
            ] },
            { type: 'CODE', code: '<p>После</p>' },
        ]);
        assert.match(code(result.example.sections), /children: ReactNode\[\]/);
        assert.match(code(result.example.sections), /<p>До<\/p>\{children\[0\]\}<section>\{children\[1\]\}<\/section><p>После<\/p>/);
        assert.equal(result.metadata.nestable, false);
    });
    test(`${platform}: unconnected-content comment requires real children`, () => {
        const result = run([{ type: 'CODE', code: '{/* Unknown — no Code Connect template found */}' }]);
        assert.match(code(result.example.sections), /\{children\}/);
        assert.doesNotMatch(code(result.example.sections), /Unknown|no Code Connect template/);
    });
    test(`${platform}: missing slot and nested execution errors fail explicitly`, () => {
        assert.throws(() => run(undefined), /обязательный Body SLOT/);
        assert.throws(() => run([{ type: 'ERROR', message: 'broken child' }]), /broken child/);
        assert.throws(() => run([{ type: 'INSTANCE', guid: 'nested', symbolId: 'known', resultSections: [{ type: 'ERROR', message: 'nested failure' }] }]), /nested failure/);
    });
}

test('Desktop and Mobile share identical slot handling; registration selects only these two templates', () => {
    const sources = cases.map(([, file]) => fs.readFileSync(path.join(root, file), 'utf8'));
    const helper = (source) => source.slice(source.indexOf('function slotContent'), source.indexOf('\nconst body ='));
    assert.equal(helper(sources[0]), helper(sources[1]));
    const ids = cases.map(([, file, property]) => evaluate(file, property, []).id);
    assert.equal(new Set(ids).size, 2);
    const config = JSON.parse(fs.readFileSync(path.join(root, 'figma.config.json')));
    assert.deepEqual(config.codeConnect.include, cases.map(([, file]) => file));
    assert.equal(config.codeConnect.parser, 'react');
    assert.equal(context.source.fileKey, 'NrzEFUSTXgzOUmsfYym0xD');
});

test('both templates pass strict checking against official Figma types', () => {
    const figmaTypes = path.resolve(path.dirname(require.resolve('@figma/code-connect')), '../../figma-types.d.ts');
    const program = ts.createProgram([
        ...cases.map(([, file]) => path.join(root, file)), figmaTypes,
    ], { noEmit: true, strict: true, skipLibCheck: true, esModuleInterop: true,
        target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Node10, types: [] });
    const errors = ts.getPreEmitDiagnostics(program);
    assert.equal(errors.length, 0, errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n'));
});

test('generated JSX typechecks through the selected SDK public import and rejects invented props', {
    skip: !process.env.ARUI_SDK_NODE_MODULES && 'set ARUI_SDK_NODE_MODULES to check a real SDK',
}, () => {
    const sdkModules = path.resolve(process.env.ARUI_SDK_NODE_MODULES);
    const filename = path.join(path.dirname(sdkModules), 'corporate-content.code-connect.generated.tsx');
    function diagnostics(source) {
        const options = { noEmit: true, strict: true, skipLibCheck: true, esModuleInterop: true,
            target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
            types: [], typeRoots: [path.join(sdkModules, '@types')] };
        const host = ts.createCompilerHost(options);
        const readFile = host.readFile.bind(host);
        host.readFile = (name) => name === filename ? source : readFile(name);
        const exists = host.fileExists.bind(host);
        host.fileExists = (name) => name === filename || exists(name);
        return ts.getPreEmitDiagnostics(ts.createProgram([filename], options, host));
    }
    for (const [, file, property] of cases) {
        for (const sections of [[], [{ type: 'SLOT', propertyName: property }], [
            { type: 'CODE', code: '<p>До</p>' },
            { type: 'INSTANCE', guid: 'unknown', symbolId: 'opaque' },
            { type: 'SLOT', propertyName: 'nested' },
        ]]) {
            const result = evaluate(file, property, sections);
            const source = `${result.imports.join('\n')}\n${result.metadata.nestable ? 'const example = ' : ''}${code(result.example.sections)}`;
            const errors = diagnostics(source);
            assert.equal(errors.length, 0, errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n'));
        }
    }
    for (const prop of ['platform', 'background', 'width', 'body']) {
        const errors = diagnostics(`import { CorporateContent } from 'arui-private/corporate-content';\nconst invalid = <CorporateContent ${prop}="invalid" />;`);
        assert.ok(errors.some((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n').includes(`Property '${prop}' does not exist`)), prop);
    }
});
