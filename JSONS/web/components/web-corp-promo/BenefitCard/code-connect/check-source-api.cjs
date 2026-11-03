const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

// Source API projection, not a build or installed BenefitCard SDK check.
function checkSnippets(snippets, { sourceRoot, sdkModules }) {
    sourceRoot = path.resolve(sourceRoot);
    sdkModules = path.resolve(sdkModules);
    const files = new Map();
    const directory = path.join(sourceRoot, 'src/benefit-card');
    const barrel = path.join(directory, 'index.ts');
    const publicExports = fs.readFileSync(barrel, 'utf8');
    const surfaceDirectory = path.join(sourceRoot, 'src/background-plate');
    const surfaceBarrel = path.join(surfaceDirectory, 'index.ts');
    const surfaceExports = fs.readFileSync(surfaceBarrel, 'utf8');
    const components = [
        ['BenefitCardDesktop', directory, 'benefit-card-desktop', 'BenefitCardProps', './typings', publicExports],
        ['BenefitCardMobile', directory, 'benefit-card-mobile', 'BenefitCardProps', './typings', publicExports],
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
        assert.equal(call.expression.getText(source), 'React.forwardRef');
        assert.equal(call.typeArguments.length, 2);
        const [ref, props] = call.typeArguments.map((p) => p.getText(source));
        assert.equal(props, propsName);
        const propsImport = source.statements.filter(ts.isImportDeclaration).find((s) => s.moduleSpecifier.text === propsPath);
        assert.ok(propsImport?.getText(source).includes(propsName));
        assert.ok(exports.includes(`export * from './${file}'`));
        files.set(filename, `import type { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';\n${propsImport.getText(source)}\nexport declare const ${name}: ForwardRefExoticComponent<PropsWithoutRef<${props}> & RefAttributes<${ref}>>;`);
    }
    files.set(barrel, "export * from './benefit-card-desktop';\nexport * from './benefit-card-mobile';");
    files.set(surfaceBarrel, "export * from './types';\nexport * from './background-plate';");
    const entries = {
        'arui-private/benefit-card': barrel,
        'arui-private/background-plate': surfaceBarrel,
    };
    assert.ok(fs.readFileSync(path.join(sourceRoot, 'src/background-plate/index.ts'), 'utf8').includes("export * from './types'"));
    const generated = path.join(sourceRoot, 'benefit-card-code-connect-check.tsx');
    const imports = [...new Set(snippets.flatMap((s) => s.imports).filter((s) => !/from ['"]react['"]/.test(s))),
        "import type { ComponentProps, ReactNode } from 'react';"];
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
        if (containing.endsWith('/benefit-card/typings.ts') && ['../anima-icon-view', '../background-plate'].includes(name)) {
            const component = name.slice(3);
            const typeFile = component === 'anima-icon-view' ? 'typings' : 'types';
            assert.ok(fs.readFileSync(path.join(sourceRoot, 'src', component, 'index.ts'), 'utf8').includes(`export * from './${typeFile}'`));
            return { resolvedFileName: path.join(sourceRoot, 'src', component, typeFile + '.ts'), extension: ts.Extension.Ts };
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
