const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

// Compile public TabsView/typings with the exact private Base props projection; no SDK build claim.
function checkSnippets(snippets, { sourceRoot, sdkModules }) {
  sourceRoot = path.resolve(sourceRoot);
  sdkModules = path.resolve(sdkModules);
  const barrel = path.join(sourceRoot, 'src/tabs-view/index.ts');
  assert.equal(
    fs.readFileSync(barrel, 'utf8').trim(),
    "export { TabsView } from './tabs-view';\nexport * from './typings';"
  );
  const filename = path.join(sourceRoot, 'tabs-view-code-connect-check.tsx');
  const cssTypes = path.join(sourceRoot, 'tabs-view-code-connect-css.d.ts');
  const imports = [...new Set(snippets.flatMap((s) => s.imports))];
  const source =
    imports.join('\n') +
    '\n' +
    snippets
      .map(
        (s, i) =>
          `namespace Case${i} {\n${
            s.code.trim().startsWith('<') ? 'const example = ' : ''
          }${s.code}\n}`
      )
      .join('\n');
  const files = new Map([
    [filename, source],
    [
      cssTypes,
      "declare module '*.module.css' { const styles: Record<string,string>; export default styles; }",
    ],
  ]);
  // Exact private Base props projection; its implementation has an existing strict-null diagnostic.
  const base = path.join(sourceRoot, 'src/tabs-view/tabs-view-base.tsx');
  const ast = ts.createSourceFile(
    base,
    fs.readFileSync(base, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  const props = ast.statements.find(
    (s) => ts.isTypeAliasDeclaration(s) && s.name.text === 'Props'
  );
  const component = ast.statements
    .filter(ts.isVariableStatement)
    .flatMap((s) => Array.from(s.declarationList.declarations))
    .find((d) => d.name.getText(ast) === 'TabsViewBase');
  assert.ok(props);
  assert.equal(component.type.getText(ast), 'React.FC<Props>');
  const baseTypeImports = ast.statements
    .filter(ts.isImportDeclaration)
    .flatMap((s) => {
      const clause = s.importClause;
      if (clause?.isTypeOnly) return [s.getText(ast)];
      const bindings = clause?.namedBindings;
      const names =
        bindings && ts.isNamedImports(bindings)
          ? bindings.elements
              .filter((x) => x.isTypeOnly)
              .map((x) => x.name.text)
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
  files.set(
    base,
    "import type React from 'react';\n" +
      baseTypeImports.join('\n') +
      '\n' +
      props.getText(ast) +
      '\nexport declare const TabsViewBase: React.FC<Props>;'
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
      name === 'arui-private/tabs-view'
        ? { resolvedFileName: barrel, extension: ts.Extension.Ts }
        : ts.resolveModuleName(
            name,
            name.startsWith('.')
              ? containing
              : path.join(
                  path.dirname(sdkModules),
                  'tabs-view-dependencies.tsx'
                ),
            options,
            host
          ).resolvedModule
    );
  return ts
    .getPreEmitDiagnostics(
      ts.createProgram([filename, cssTypes], options, host)
    )
    .map((d) => ({
      file: d.file?.fileName,
      code: d.code,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    }));
}
module.exports = { checkSnippets };
