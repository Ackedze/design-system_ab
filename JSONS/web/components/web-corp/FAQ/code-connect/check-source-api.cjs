const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
// API projection from the actual React.FC annotation/barrel, not an installed SDK check.
function checkSnippets(snippets,{sourceRoot,sdkModules}){
 sourceRoot=path.resolve(sourceRoot);sdkModules=path.resolve(sdkModules);const files=new Map(),dir=path.join(sourceRoot,'src/faq'),entry=path.join(dir,'faq.tsx'),barrel=path.join(dir,'index.ts');
 const text=fs.readFileSync(entry,'utf8'),ast=ts.createSourceFile(entry,text,ts.ScriptTarget.Latest,true);
 const decl=ast.statements.filter(ts.isVariableStatement).flatMap(s=>Array.from(s.declarationList.declarations)).find(d=>d.name.getText(ast)==='FAQ');assert.equal(decl.type.getText(ast),'React.FC<FAQProps>');
 assert.ok(ast.statements.filter(ts.isImportDeclaration).some(i=>i.moduleSpecifier.text==='./types'&&i.getText(ast).includes('FAQProps')));
 const exports=fs.readFileSync(barrel,'utf8');assert.match(exports,/export \{ FAQ \} from '\.\/faq'/);assert.match(exports,/export \* from '\.\/types'/);
 files.set(entry,"import type React from 'react';\nimport type { FAQProps } from './types';\nexport declare const FAQ: React.FC<FAQProps>;");
 const generated=path.join(sourceRoot,'faq-code-connect-check.tsx'),imports=[...new Set(snippets.flatMap(s=>s.imports))];files.set(generated,imports.join('\n')+'\n'+snippets.map((s,i)=>`namespace Case${i}{\n${s.code}\n}`).join('\n'));
 const options={noEmit:true,strict:true,skipLibCheck:true,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,types:['react'],typeRoots:[path.join(sdkModules,'@types')]};
 const host=ts.createCompilerHost(options),get=host.getSourceFile.bind(host),exists=host.fileExists.bind(host);host.getSourceFile=(name,language,...rest)=>files.has(name)?ts.createSourceFile(name,files.get(name),language,true):get(name,language,...rest);host.fileExists=name=>files.has(name)||exists(name);
 host.resolveModuleNames=(names,containing)=>names.map(name=>name==='arui-private/faq'?{resolvedFileName:barrel,extension:ts.Extension.Ts}:ts.resolveModuleName(name,name.startsWith('.')?containing:path.join(path.dirname(sdkModules),'faq-dependencies.tsx'),options,host).resolvedModule);
 return ts.getPreEmitDiagnostics(ts.createProgram([generated],options,host)).map(d=>({file:d.file?.fileName,line:d.file&&d.start!==undefined?d.file.getLineAndCharacterOfPosition(d.start).line+1:undefined,code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,'\n')}));
}
module.exports={checkSnippets};
