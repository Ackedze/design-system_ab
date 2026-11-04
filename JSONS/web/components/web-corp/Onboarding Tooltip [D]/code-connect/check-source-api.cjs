const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

// Check actual Hint source and exact Tooltip/Highlighter props through an explicit API projection.
function checkSnippets(snippets, { sourceRoot, sdkModules }) {
    sourceRoot = path.resolve(sourceRoot);
    sdkModules = path.resolve(sdkModules);
    const barrel = path.join(sourceRoot, 'src/onboarding-hint/index.ts');
    const tooltipBarrel = path.join(sourceRoot, 'src/onboarding-tooltip/index.ts');
    assert.equal(
        fs.readFileSync(barrel, 'utf8').trim(),
        "export { default } from './onboarding-hint';",
    );
    assert.equal(
        fs.readFileSync(tooltipBarrel, 'utf8').trim(),
        "export * from './onboarding-tooltip';",
    );
    const filename = path.join(sourceRoot, 'onboarding-code-connect-check.tsx');
    const cssTypes = path.join(sourceRoot, 'onboarding-code-connect-css.d.ts');
    const imports = [...new Set(snippets.flatMap((s) => s.imports))];
    const source =
        imports.join('\n') +
        '\n' +
        snippets
            .map(
                (s, i) =>
                    `namespace Case${i} {\n${s.code.trim().startsWith('<') ? 'const example = ' : ''}${s.code}\n}`,
            )
            .join('\n');
    const files = new Map([
        [filename, source],
        [
            cssTypes,
            "declare module '*.module.css' { const styles: Record<string,string>; export default styles; }",
        ],
    ]);
    // API-only projection excludes Highlighter implementation and scroll-hook build errors.
    const tooltipFile = path.join(sourceRoot, 'src/onboarding-tooltip/onboarding-tooltip.tsx');
    const highlighterFile = path.join(sourceRoot, 'src/highlighter/highlighter.tsx');
    for (const [file, propsName, component] of [
        [tooltipFile, 'OnboardingTooltipProps', 'OnboardingTooltip'],
        [highlighterFile, 'HighlighterProps', null],
    ]) {
        const ast = ts.createSourceFile(
            file,
            fs.readFileSync(file, 'utf8'),
            ts.ScriptTarget.Latest,
            true,
        );
        const props = ast.statements.find(
            (s) => ts.isTypeAliasDeclaration(s) && s.name.text === propsName,
        );
        assert.ok(props, propsName);
        const imports = ast.statements.filter(ts.isImportDeclaration).flatMap((s) => {
            if (s.moduleSpecifier.text === 'react') return [];
            const clause = s.importClause;
            if (clause?.isTypeOnly) return [s.getText(ast)];
            const bindings = clause?.namedBindings;
            const names =
                bindings && ts.isNamedImports(bindings)
                    ? bindings.elements.filter((x) => x.isTypeOnly).map((x) => x.name.text)
                    : [];
            return names.length
                ? [
                      'import type { ' +
                          names.join(', ') +
                          ' } from ' +
                          JSON.stringify(s.moduleSpecifier.text) +
                          ';',
                  ]
                : [];
        });
        if (component) {
            const declaration = ast.statements
                .filter(ts.isVariableStatement)
                .flatMap((s) => Array.from(s.declarationList.declarations))
                .find((x) => x.name.getText(ast) === component);
            assert.ok(declaration && ts.isCallExpression(declaration.initializer));
            assert.equal(declaration.initializer.expression.getText(ast), 'React.memo');
            assert.equal(declaration.initializer.typeArguments[0].getText(ast), propsName);
        }
        files.set(
            file,
            "import type React from 'react';\n" +
                imports.join('\n') +
                '\n' +
                props.getText(ast) +
                (component
                    ? '\nexport declare const ' +
                      component +
                      ': React.NamedExoticComponent<' +
                      propsName +
                      '>;'
                    : ''),
        );
    }
    const options = {
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        types: ['react'],
        typeRoots: [path.join(sdkModules, '@types')],
    };
    const host = ts.createCompilerHost(options),
        get = host.getSourceFile.bind(host),
        exists = host.fileExists.bind(host);
    host.getSourceFile = (name, language, ...rest) =>
        files.has(name)
            ? ts.createSourceFile(name, files.get(name), language, true)
            : get(name, language, ...rest);
    host.fileExists = (name) => files.has(name) || exists(name);
    host.resolveModuleNames = (names, containing) =>
        names.map((name) =>
            name === 'arui-private/onboarding-hint'
                ? { resolvedFileName: barrel, extension: ts.Extension.Ts }
                : name === 'arui-private/onboarding-tooltip'
                  ? { resolvedFileName: tooltipBarrel, extension: ts.Extension.Ts }
                  : ts.resolveModuleName(
                        name,
                        name.startsWith('.')
                            ? containing
                            : path.join(path.dirname(sdkModules), 'onboarding-dependencies.tsx'),
                        options,
                        host,
                    ).resolvedModule,
        );
    return ts
        .getPreEmitDiagnostics(ts.createProgram([filename, cssTypes], options, host))
        .map((d) => ({
            file: d.file?.fileName,
            code: d.code,
            message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
        }));
}
module.exports = { checkSnippets };
