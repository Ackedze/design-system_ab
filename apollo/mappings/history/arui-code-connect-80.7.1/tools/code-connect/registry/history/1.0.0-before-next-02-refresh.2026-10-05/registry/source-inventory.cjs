// Read-only source evidence. This does not resolve uninstalled transitive types.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const ts = require('typescript');

const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const canonical = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
const digest = value => hash(canonical(value));

function sourceFile(repo, relative) {
    const file = path.join(repo, relative);
    return ts.createSourceFile(relative, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}
function api(repo, relative, name) {
    const file = sourceFile(repo, relative);
    const declaration = file.statements.find(n => ts.isTypeAliasDeclaration(n) && n.name.text === name);
    if (!declaration || !ts.isTypeLiteralNode(declaration.type)) throw new Error(`API_NOT_FOUND: ${name}`);
    return declaration.type.members.map(n => ({
        name: n.name.getText(file), required: !n.questionToken, type: n.type.getText(file),
        evidence: {path: relative, line: file.getLineAndCharacterOfPosition(n.getStart(file)).line + 1},
    }));
}
function defaults(repo, relative, component) {
    const file = sourceFile(repo, relative), result = {};
    function visit(node) {
        if (ts.isVariableDeclaration(node) && node.name.getText(file) === component) {
            function parameter(n) {
                if (ts.isParameter(n) && ts.isObjectBindingPattern(n.name)) {
                    for (const entry of n.name.elements) if (entry.initializer) result[entry.name.getText(file)] = entry.initializer.getText(file);
                }
                ts.forEachChild(n, parameter);
            }
            parameter(node);
        }
        ts.forEachChild(node, visit);
    }
    visit(file);
    return result;
}
function publicExport(repo, subpath, symbol) {
    if (!/^[a-z-]+$/.test(subpath)) return false;
    const index = `src/${subpath}/index.ts`;
    if (!fs.existsSync(path.join(repo, index))) return false;
    const file = sourceFile(repo, index);
    for (const entry of file.statements) {
        if (!ts.isExportDeclaration(entry) || !entry.moduleSpecifier || entry.exportClause) continue;
        const module = entry.moduleSpecifier.text;
        if (!module.startsWith('./')) continue;
        for (const extension of ['.ts', '.tsx']) {
            const relative = path.posix.join(path.posix.dirname(index), module + extension);
            if (!fs.existsSync(path.join(repo, relative))) continue;
            const child = sourceFile(repo, relative);
            const exported = child.statements.some(s => ts.isVariableStatement(s)
                && s.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
                && s.declarationList.declarations.some(d => d.name.getText(child) === symbol));
            if (exported) return {index, implementation: relative, symbol};
        }
    }
    return false;
}
function imports(repo, relative) {
    const file = sourceFile(repo, relative);
    return file.statements.filter(ts.isImportDeclaration).map(n => ({
        module: n.moduleSpecifier.text,
        clause: n.importClause?.getText(file) ?? null,
        line: file.getLineAndCharacterOfPosition(n.getStart(file)).line + 1,
        generatorImportAllowed: false,
    }));
}
function pinFiles(repo, relatives) {
    const modified = new Set(cp.execFileSync('git', ['diff', '--name-only', 'HEAD'], {cwd: repo, encoding: 'utf8'}).trim().split('\n'));
    return [...new Set(relatives)].sort().map(relative => ({
        path: relative, sha256: hash(fs.readFileSync(path.join(repo, relative))),
        trackedSourceDirty: modified.has(relative),
    }));
}
module.exports = {hash, canonical, digest, api, defaults, publicExport, imports, pinFiles};
