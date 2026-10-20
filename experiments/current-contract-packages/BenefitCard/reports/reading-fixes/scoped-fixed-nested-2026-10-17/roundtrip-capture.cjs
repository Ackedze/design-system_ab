const fs=require('node:fs'),assert=require('node:assert/strict');
const {root,guard}=require('./guard.cjs'),{fixture,clone}=require('./scoped-fixture.cjs');
(async()=>{
 const before=guard('before-private-roundtrip-capture'),f=fixture(),core=f.core,checks=[];
 const bundle=core.buildExportBundle(f.manual,f.evidence,[f.childContract]);assert.equal(bundle.validation.valid,true,JSON.stringify(bundle.validation.issues));
 const zip=core.buildAuthoringZip(bundle),files=(await core.readZip(zip)).map(v=>({name:v.name,text:core.zipEntryText(v)}));
 const opened=core.importWorkspace(files),rebuilt=core.buildExportBundle(opened.manual,opened.variantEvidence,opened.dependencyContracts);
 assert.deepEqual(clone(rebuilt.compiled),clone(bundle.compiled));assert.equal(core.stableHash(rebuilt.compiled),core.stableHash(bundle.compiled));assert.deepEqual(opened.manual,f.manual);assert.deepEqual(opened.dependencyContracts,clone([f.childContract]));
 checks.push({name:'candidate Editor ZIP/reopen preserves scoped manual, facts and closure',status:'PASS'});
 const frozen=JSON.parse(fs.readFileSync(root+'/FROZEN-COMPATIBILITY-INPUTS.json')).copies;
 const oldEditor=require(frozen.find(x=>x.original.path.endsWith('/ComponentContractEditor/dist/core.cjs')).copy.path);
 const oldOpened=oldEditor.importWorkspace(files),oldBundle=oldEditor.buildExportBundle(oldOpened.manual,oldOpened.variantEvidence,oldOpened.dependencyContracts);
 assert.equal(oldBundle.validation.valid,false);assert.ok(oldBundle.validation.issues.some(i=>i.code==='COMPONENT_DEPENDENCY'&&i.message==='Unknown dependency binding kind.'));
 assert.throws(()=>oldEditor.evaluateCompiledContract(f.snapshot,bundle.compiled),/REPRESENTATION_RUNTIME_UNSUPPORTED/);
 checks.push({name:'actual old Editor reopens as invalid Draft; direct new compiled root refuses',status:'PASS',issues:oldBundle.validation.issues.filter(i=>i.code==='COMPONENT_DEPENDENCY'),limitation:'Old requestSelectionTest ignores compile issues and controller receives only keys. This does not prove capture is blocked after old recompile.'});
 function node(id,opacity,parent){return {id,name:'Button',type:'INSTANCE',visible:true,parent,children:[],width:100,height:40,x:0,y:0,rotation:0,
  opacity,fills:[],strokes:[],effects:[],strokeWeight:0,cornerRadius:0,resolvedVariableModes:{},explicitVariableModes:{},boundVariables:{},
  componentProperties:{View:{type:'VARIANT',value:'Secondary'}},componentPropertyReferences:{},
  getMainComponentAsync:async()=>main,remove(){this.removed=true;}};}
 const created=[],page={id:'temporary',type:'PAGE',children:[],appendChild(n){n.parent=this;this.children.push(n);}};
 const owner={type:'COMPONENT_SET',key:'button-set',componentPropertyDefinitions:{View:{type:'VARIANT',defaultValue:'Secondary',variantOptions:['Primary','Secondary']}}};
 const main={id:'secondary-main',type:'COMPONENT',key:'secondary',name:'View=Secondary',variantProperties:{View:'Secondary'},parent:owner,componentPropertyDefinitions:{},
  createInstance(){const n=node('independent-reference',1,page);created.push(n);return n;}};
 const actual=node('native-member',.4,{id:'native-frame',type:'FRAME'});
 global.figma={mixed:Symbol('mixed'),fileKey:'synthetic-file',root:{name:'Synthetic fixture'},currentPage:page,getNodeByIdAsync:async id=>id==='native-member'?actual:null,variables:{getVariableCollectionByIdAsync:async()=>null,getVariableByIdAsync:async()=>null}};
 const snapshot=clone(f.snapshot),anatomy=[{id:'member-0',figmaNodeId:'native-member'}];
 const captureHelper=require(root+'/workspace/candidate/projects/Apollo-v3/packages/component-contract-core/dist/capture.cjs');
 await captureHelper.captureComponentDependencies(anatomy,snapshot,page,core.componentDependencyKeys(bundle.compiled));
 assert.equal(snapshot.componentDependencyCaptures.length,1);
 const capture=snapshot.componentDependencyCaptures[0];assert.equal(capture.failure,undefined,JSON.stringify(capture));
 const captured=capture.snapshot.nodes.find(n=>capture.snapshot.selection.includes(n.id));
 assert.equal(captured.appearance.opacity,.4);assert.equal(captured.baseline.effective.appearance.opacity,1);assert.equal(capture.nodeMap[captured.id],'member-0');
 assert.ok(created.length>0&&created.every(n=>n.removed));assert.equal(actual.removed,undefined);
 checks.push({name:'same native capture helper reaches nested FRAME child and uses independent master',status:'PASS',kind:'simulated Plugin API only',temporaryReferences:created.length,cleaned:true});
 delete global.figma;
 const after=guard('after-private-roundtrip-capture');fs.writeFileSync(root+'/ROUNDTRIP-CAPTURE.json',JSON.stringify({before,after,checks,oldEditorCaptureAdmission:'NOT_PROVEN: invalid Draft capture path requires explicit review',nativeModelCalls:0,Ready:false})+'\n',{flag:'wx'});
 console.log(JSON.stringify({passed:checks.length,capture:'simulated only',oldEditorCaptureAdmission:'NOT_PROVEN'}));
})().catch(error=>{const file=root+'/FIRST-ROUNDTRIP-CAPTURE-FAILURE.json';if(!fs.existsSync(file))fs.writeFileSync(file,JSON.stringify({error:error.stack})+'\n');console.error(error.stack);process.exitCode=1;});
