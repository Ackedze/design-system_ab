const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {resolveInputFile}=require('../registry/contract-inputs.cjs');
test('archive location comes from the component manifest while unsafe or ambiguous relocations fail',t=>{
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'code-connect-locations-')));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const prefix='shared/design-system_ab/experiments/current-contract-packages',catalog=path.join(root,prefix),relative='Button/Button.component-contract.zip',actual=path.join(catalog,relative),requested=prefix+'/Button.component-contract.zip';fs.mkdirSync(path.dirname(actual),{recursive:true});fs.writeFileSync(actual,'archive');
 const manifest=packages=>fs.writeFileSync(path.join(catalog,'manifest.json'),JSON.stringify({packages}));manifest([{file:relative}]);assert.equal(resolveInputFile(root,requested),actual);
 manifest([{file:relative},{file:relative}]);assert.throws(()=>resolveInputFile(root,requested),/INVALID_INPUT_PATH/);
 manifest([{file:'../Button.component-contract.zip'}]);assert.throws(()=>resolveInputFile(root,requested),/INVALID_INPUT_PATH/);
 manifest([{file:relative}]);const target=path.join(root,'copied');fs.renameSync(path.dirname(actual),target);fs.symlinkSync(target,path.dirname(actual),'dir');assert.throws(()=>resolveInputFile(root,requested),/INVALID_INPUT_PATH/);
});
test('repository-relative archives admit component spaces and Unicode with explicit base, preserving old compatibility copies',t=>{
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'code-connect-repo-locations-')));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const ds=path.join(root,'shared/design-system_ab'),catalog=path.join(ds,'experiments/current-contract-packages'),file='JSONS/web/components/Корпоративная библиотека/ButtonGroup [D]/packages/ButtonsGroup.zip',actual=path.join(ds,file),requested='shared/design-system_ab/experiments/current-contract-packages/ButtonsGroup.zip';
 fs.mkdirSync(path.dirname(actual),{recursive:true});fs.writeFileSync(actual,'same archive');fs.mkdirSync(catalog,{recursive:true});
 const manifest=(entry=file,base='design-system_ab')=>fs.writeFileSync(path.join(catalog,'manifest.json'),JSON.stringify({archivePathBase:base,packages:[{file:entry}]}));manifest();assert.equal(resolveInputFile(root,requested),actual);
 for(const bad of ['../outside.zip','/outside.zip','JSONS/web/components/X/../packages/ButtonsGroup.zip','JSONS/web/components/X\\packages/ButtonsGroup.zip','JSONS/web/components/X\u0000/packages/ButtonsGroup.zip','history/ButtonsGroup.zip']){manifest(bad);assert.throws(()=>resolveInputFile(root,requested),/INVALID_INPUT_PATH/);}
 manifest(file,'workspace');assert.throws(()=>resolveInputFile(root,requested),/INVALID_INPUT_PATH/);
 manifest();const moved=path.dirname(actual)+'.moved';fs.renameSync(path.dirname(actual),moved);fs.symlinkSync(moved,path.dirname(actual),'dir');assert.throws(()=>resolveInputFile(root,requested),/INVALID_INPUT_PATH/);
 fs.writeFileSync(path.join(root,requested),'frozen old input');assert.equal(resolveInputFile(root,requested),path.join(root,requested));
});
