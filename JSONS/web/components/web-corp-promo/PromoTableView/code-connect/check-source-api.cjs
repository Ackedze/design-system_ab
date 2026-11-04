const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
// Source declaration projection; no build or installed SDK claim.
function checkSnippets(snippets, { sourceRoot, sdkModules }) {
    sourceRoot = path.resolve(sourceRoot);
    sdkModules = path.resolve(sdkModules);
    const files = new Map(),
        directory = path.join(sourceRoot, 'src/promo-table-view');
    const barrel = path.join(directory, 'index.ts'),
        exports = fs.readFileSync(barrel, 'utf8');
    for (const [name, file] of [
        ['PromoTableViewDesktop', 'promo-table-view-desktop'],
        ['PromoTableViewMobile', 'promo-table-view-mobile'],
    ]) {
        const filename = path.join(directory, file + '.tsx'),
            text = fs.readFileSync(filename, 'utf8'),
            ast = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
        const declaration = ast.statements
            .filter(ts.isVariableStatement)
            .flatMap((s) => Array.from(s.declarationList.declarations))
            .find((d) => d.name.getText(ast) === name);
        assert.ok(ts.isArrowFunction(declaration.initializer));
        assert.equal(
            declaration.initializer.parameters[0].type.getText(ast),
            'PromoTableViewProps',
        );
        assert.ok(
            ast.statements
                .filter(ts.isImportDeclaration)
                .some(
                    (i) =>
                        i.moduleSpecifier.text === './typings' &&
                        i.getText(ast).includes('PromoTableViewProps'),
                ),
        );
        assert.ok(exports.includes(`export * from './${file}'`));
        files.set(
            filename,
            `import type {ReactElement} from 'react';\nimport type {PromoTableViewProps} from './typings';\nexport declare const ${name}: (props:PromoTableViewProps)=>ReactElement;`,
        );
    }
    assert.ok(exports.includes("export { type PromoTableViewProps } from './typings'"));
    files.set(
        barrel,
        "export * from './promo-table-view-desktop';\nexport * from './promo-table-view-mobile';\nexport {type PromoTableViewProps} from './typings';",
    );
    const surface = path.join(sourceRoot, 'src/background-plate');
    for (const [name, dir, file, propsPath] of [
        ['BackgroundPlate', surface, 'background-plate', './types'],
        [
            'BackgroundPlateDesktop',
            path.join(surface, 'desktop'),
            'background-plate-desktop',
            '../types',
        ],
        [
            'BackgroundPlateMobile',
            path.join(surface, 'mobile'),
            'background-plate-mobile',
            '../types',
        ],
    ]) {
        const filename = path.join(dir, file + '.tsx'),
            text = fs.readFileSync(filename, 'utf8'),
            ast = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true),
            declaration = ast.statements
                .filter(ts.isVariableStatement)
                .flatMap((s) => Array.from(s.declarationList.declarations))
                .find((d) => d.name.getText(ast) === name),
            call = declaration.initializer;
        assert.ok(ts.isCallExpression(call));
        assert.equal(
            call.expression.getText(ast),
            name === 'BackgroundPlate' ? 'React.forwardRef' : 'forwardRef',
        );
        assert.equal(call.typeArguments[1].getText(ast), 'BackgroundPlateProps');
        const publicBarrel = path.join(dir, 'index.ts');
        assert.ok(fs.readFileSync(publicBarrel, 'utf8').includes(`export * from './${file}'`));
        files.set(
            filename,
            `import type {ForwardRefExoticComponent,PropsWithoutRef,RefAttributes} from 'react';\nimport type {BackgroundPlateProps} from '${propsPath}';\nexport declare const ${name}:ForwardRefExoticComponent<PropsWithoutRef<BackgroundPlateProps>&RefAttributes<HTMLDivElement>>;`,
        );
        files.set(
            publicBarrel,
            `export * from './${file}';` +
                (name === 'BackgroundPlate' ? "\nexport * from './types';" : ''),
        );
    }
    const generated = path.join(sourceRoot, 'promo-table-view-code-connect-check.tsx'),
        imports = [...new Set(snippets.flatMap((s) => s.imports))];
    files.set(
        generated,
        imports.join('\n') +
            '\n' +
            snippets.map((s, i) => `namespace Case${i}{\n${s.code}\n}`).join('\n'),
    );
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
            name === 'arui-private/promo-table-view'
                ? { resolvedFileName: barrel, extension: ts.Extension.Ts }
                : ts.resolveModuleName(
                      name,
                      name.startsWith('.')
                          ? containing
                          : path.join(path.dirname(sdkModules), 'table-dependencies.tsx'),
                      options,
                      host,
                  ).resolvedModule,
        );
    return ts
        .getPreEmitDiagnostics(ts.createProgram([generated], options, host))
        .map((d) => ({
            file: d.file?.fileName,
            line:
                d.file && d.start !== undefined
                    ? d.file.getLineAndCharacterOfPosition(d.start).line + 1
                    : undefined,
            code: d.code,
            message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
        }));
}
module.exports = { checkSnippets };
