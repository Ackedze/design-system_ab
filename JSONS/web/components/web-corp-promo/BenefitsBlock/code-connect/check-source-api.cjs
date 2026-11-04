const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

// Source API projection, not a build or installed BenefitBlock SDK check.
function checkSnippets(snippets, { sourceRoot, sdkModules }) {
    sourceRoot = path.resolve(sourceRoot);
    sdkModules = path.resolve(sdkModules);
    const files = new Map();
    const directory = path.join(sourceRoot, 'src/benefit-block');
    const barrel = path.join(directory, 'index.ts');
    const publicExports = fs.readFileSync(barrel, 'utf8');
    const surfaceDirectory = path.join(sourceRoot, 'src/background-plate');
    const surfaceBarrel = path.join(surfaceDirectory, 'index.ts');
    const surfaceExports = fs.readFileSync(surfaceBarrel, 'utf8');
    const titleDirectory = path.join(sourceRoot, 'src/title-view');
    const titleBarrel = path.join(titleDirectory, 'index.ts');
    const titleExports = fs.readFileSync(titleBarrel, 'utf8');
    const titleStatus = path.join(titleDirectory, 'components/title-status/title-status-base/title-status-base.tsx');
    const statusSource = ts.createSourceFile(titleStatus, fs.readFileSync(titleStatus, 'utf8'), ts.ScriptTarget.Latest, true);
    const statusProps = statusSource.statements.find((s) => ts.isTypeAliasDeclaration(s) && s.name.text === 'TitleStatusProps');
    assert.ok(statusProps);
    assert.ok(fs.readFileSync(path.join(titleDirectory, 'components/index.ts'), 'utf8').includes("export * from './title-status'"));
    assert.ok(fs.readFileSync(path.join(titleDirectory, 'components/title-status/index.ts'), 'utf8').includes('type TitleStatusProps'));
    files.set(titleStatus, "import type React from 'react';\nimport type { TitleStatusType } from '../../../typings';\n" + statusProps.getText(statusSource));
    const components = [
        ['BenefitBlockDesktop', directory, 'benefit-block-desktop', 'BenefitBlockProps', './types', publicExports],
        ['BenefitBlockMobile', directory, 'benefit-block-mobile', 'BenefitBlockProps', './types', publicExports],
        ['TitleView', titleDirectory, 'title-view', 'TitleViewProps', './typings', titleExports],
        ['BackgroundPlate', surfaceDirectory, 'background-plate', 'BackgroundPlateProps', './types', surfaceExports],
    ];
    for (const [name, componentDirectory, file, propsName, propsPath, exports] of components) {
        const filename = path.join(componentDirectory, file + '.tsx');
        const text = fs.readFileSync(filename, 'utf8');
        const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
        const declaration = source.statements.filter(ts.isVariableStatement)
            .flatMap((s) => Array.from(s.declarationList.declarations)).find((d) => d.name.getText(source) === name);
        const call = declaration?.initializer;
        assert.ok(call && ts.isCallExpression(call));
        assert.equal(call.expression.getText(source), name.startsWith('BenefitBlock') ? 'forwardRef' : 'React.forwardRef');
        if (name.startsWith('BenefitBlock')) assert.ok(source.statements.some((s) => ts.isImportDeclaration(s) && s.moduleSpecifier.text === 'react' && s.getText(source).includes('forwardRef')));
        assert.equal(call.typeArguments.length, 2);
        const [ref, props] = call.typeArguments.map((p) => p.getText(source));
        assert.equal(props, propsName);
        const propsImport = source.statements.filter(ts.isImportDeclaration).find((s) => s.moduleSpecifier.text === propsPath);
        assert.ok(propsImport?.getText(source).includes(propsName));
        assert.ok(exports.includes(`export * from './${file}'`));
        files.set(filename, `import type { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';\n${propsImport.getText(source)}\nexport declare const ${name}: ForwardRefExoticComponent<PropsWithoutRef<${props}> & RefAttributes<${ref}>>;`);
    }
    files.set(barrel, "export * from './benefit-block-desktop';\nexport * from './benefit-block-mobile';");
    assert.ok(titleExports.includes("export * from './typings'"));
    files.set(titleBarrel, "export * from './title-view';\nexport * from './typings';");
    files.set(surfaceBarrel, "export * from './types';\nexport * from './background-plate';");
    const entries = {
        'arui-private/benefit-block': barrel,
        'arui-private/title-view': titleBarrel,
        'arui-private/background-plate': surfaceBarrel,
    };
    assert.ok(fs.readFileSync(path.join(sourceRoot, 'src/background-plate/index.ts'), 'utf8').includes("export * from './types'"));
    const generated = path.join(sourceRoot, 'benefit-block-code-connect-check.tsx');
    const imports = [...new Set(snippets.flatMap((s) => s.imports).filter((s) => !/from ['"]react['"]/.test(s))),
        "import type { ComponentProps, MouseEventHandler } from 'react';"];
    files.set(generated, imports.join('\n') + '\n' + snippets.map((s, i) => `namespace Case${i} {\n${s.code}\n}`).join('\n'));
    const options = { noEmit: true, strict: true, skipLibCheck: true, esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler, types: ['react'], typeRoots: [path.join(sdkModules, '@types')] };
    const host = ts.createCompilerHost(options);
    const originalGet = host.getSourceFile.bind(host);
    host.getSourceFile = (name, language, ...rest) => files.has(name)
        ? ts.createSourceFile(name, files.get(name), language, true) : originalGet(name, language, ...rest);
    const exists = host.fileExists.bind(host);
    host.fileExists = (name) => files.has(name) || exists(name);
    host.resolveModuleNames = (names, containing) => names.map((name) => {
        if (entries[name]) return { resolvedFileName: entries[name], extension: ts.Extension.Ts };
        if (name === 'src/background-plate') return { resolvedFileName: path.join(surfaceDirectory, 'types.ts'), extension: ts.Extension.Ts };
        if (containing.endsWith('/title-view/typings.ts') && name === './components') return { resolvedFileName: titleStatus, extension: ts.Extension.Tsx };
        if (containing.endsWith('/title-view/typings.ts') && name === '../filter-company-select') {
            assert.ok(fs.readFileSync(path.join(sourceRoot, 'src/filter-company-select/index.ts'), 'utf8').includes("export * from './typings'"));
            return { resolvedFileName: path.join(sourceRoot, 'src/filter-company-select/typings.ts'), extension: ts.Extension.Ts };
        }
        const base = name.startsWith('.') ? containing : path.join(path.dirname(sdkModules), 'code-connect-dependencies.tsx');
        return ts.resolveModuleName(name, base, options, host).resolvedModule;
    });
    return ts.getPreEmitDiagnostics(ts.createProgram([generated], options, host)).map((d) => ({
        file: d.file?.fileName,
        line: d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : undefined,
        code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    }));
}
module.exports = { checkSnippets };
