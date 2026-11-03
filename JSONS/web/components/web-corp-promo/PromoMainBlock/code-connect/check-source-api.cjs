const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

// Source-only API check: no installed PromoMainBlock distribution is available.
// Prop types come unchanged from the real source; component bodies are not built.
function checkSnippets(snippets, { sourceRoot, sdkModules }) {
    sourceRoot = path.resolve(sourceRoot);
    sdkModules = path.resolve(sdkModules);
    const files = new Map();
    const entries = {};
    for (const platform of ['desktop', 'mobile']) {
        const name = platform === 'desktop' ? 'PromoMainBlockDesktop' : 'PromoMainBlockMobile';
        const directory = path.join(sourceRoot, 'src/promo-main-block', platform);
        const filename = path.join(directory, `promo-main-block-${platform}.tsx`);
        const text = fs.readFileSync(filename, 'utf8');
        const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
        const declaration = source.statements.filter(ts.isVariableStatement)
            .flatMap((s) => Array.from(s.declarationList.declarations))
            .find((d) => d.name.getText(source) === name);
        assert.ok(declaration && ts.isArrowFunction(declaration.initializer));
        const props = declaration.initializer.parameters[0].type.getText(source);
        const typeAliases = source.statements.filter(ts.isTypeAliasDeclaration).map((s) => s.getText(source));
        const propsImport = source.statements.filter(ts.isImportDeclaration).find((s) =>
            s.importClause?.namedBindings && ts.isNamedImports(s.importClause.namedBindings) &&
            s.importClause.namedBindings.elements.some((e) => e.name.text === 'PromoMainBlockProps'));
        assert.equal(propsImport.moduleSpecifier.text, '../typings');
        assert.ok(fs.readFileSync(path.join(directory, 'index.ts'), 'utf8').includes(`'./promo-main-block-${platform}'`));
        files.set(filename, `import type { ComponentType } from 'react';\nimport type { PromoMainBlockProps } from '../typings';\n${typeAliases.join('\n')}\nexport declare const ${name}: ComponentType<${props}>;`);
        entries[`arui-private/promo-main-block/${platform}`] = filename;
    }
    const generated = path.join(sourceRoot, 'promo-main-block-code-connect-check.tsx');
    const imports = [...new Set(snippets.flatMap((s) => s.imports).filter((s) => !/from ['"]react['"]/.test(s))),
        "import type { ComponentProps, ReactNode } from 'react';"];
    files.set(generated, imports.join('\n') + '\n' + snippets.map((s, i) =>
        `namespace Case${i} {\n${s.code}\n}`).join('\n'));
    const options = { noEmit: true, strict: true, skipLibCheck: true, esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler, types: ['react'],
        typeRoots: [path.join(sdkModules, '@types')] };
    const host = ts.createCompilerHost(options);
    const originalGet = host.getSourceFile.bind(host);
    host.getSourceFile = (name, language, ...rest) => files.has(name)
        ? ts.createSourceFile(name, files.get(name), language, true)
        : originalGet(name, language, ...rest);
    const exists = host.fileExists.bind(host);
    host.fileExists = (name) => files.has(name) || exists(name);
    host.resolveModuleNames = (names, containing) => names.map((name) => {
        if (entries[name]) return { resolvedFileName: entries[name], extension: ts.Extension.Tsx };
        if (name === '../filter-company-select' && containing.endsWith('/corporate-filter-company-select/types.ts')) {
            const barrel = path.join(sourceRoot, 'src/filter-company-select/index.ts');
            assert.ok(fs.readFileSync(barrel, 'utf8').includes("export * from './typings'"));
            return { resolvedFileName: path.join(sourceRoot, 'src/filter-company-select/typings.ts'), extension: ts.Extension.Ts };
        }
        const base = name.startsWith('.') ? containing : path.join(path.dirname(sdkModules), 'code-connect-dependencies.tsx');
        return ts.resolveModuleName(name, base, options, host).resolvedModule;
    });
    return ts.getPreEmitDiagnostics(ts.createProgram([generated], options, host)).map((d) => ({
        file: d.file?.fileName,
        line: d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : undefined,
        code: d.code,
        message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    }));
}

module.exports = { checkSnippets };
