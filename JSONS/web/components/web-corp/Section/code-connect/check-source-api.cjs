const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

// Compile the real Section, public barrel and withTheme, without building the library.
function checkSnippets(snippets, { sourceRoot, sdkModules }) {
    sourceRoot = path.resolve(sourceRoot);
    sdkModules = path.resolve(sdkModules);
    const barrel = path.join(sourceRoot, 'src/section/index.ts');
    assert.equal(fs.readFileSync(barrel, 'utf8').trim(), "export { default } from './section';");
    const filename = path.join(sourceRoot, 'section-code-connect-check.tsx');
    const cssTypes = path.join(sourceRoot, 'section-code-connect-css.d.ts');
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
            name === 'arui-private/section'
                ? { resolvedFileName: barrel, extension: ts.Extension.Ts }
                : ts.resolveModuleName(
                      name,
                      name.startsWith('.')
                          ? containing
                          : path.join(path.dirname(sdkModules), 'section-dependencies.tsx'),
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
