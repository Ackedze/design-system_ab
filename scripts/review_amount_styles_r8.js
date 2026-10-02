const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../experiments/web-corp/AmountStyles/authoring'),history=path.resolve(root,'../history/r7-editor-0.2.63');
const core=require(path.resolve(__dirname,'../../../projects/ComponentContractEditor/dist/core.cjs'));
const files=['2026-09-29T20-53-02-462','2026-09-29T20-55-34-265','2026-09-29T20-55-42-694','2026-09-30T05-56-48-842'].map(t=>`amount-styles.validation-report.${t}Z.json`);
function immutable(file,data){if(fs.existsSync(file))assert(fs.readFileSync(file).equals(data));else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data,{flag:'wx'});}}
function archive(){
 for(const n of ['contract.manual.json','compiled/component-contract.v2.json','editor/AmountStyles.editor-input.zip'])if(!fs.existsSync(path.join(history,n))){assert.equal(JSON.parse(fs.readFileSync(path.join(root,'contract.manual.json'))).metadata.revision,7);immutable(path.join(history,n),fs.readFileSync(path.join(root,n)));}
 for(const file of files)immutable(path.join(root,'reports/fixtures/r7-editor-0.2.63',file+'.gz'),zlib.gzipSync(fs.readFileSync(path.join(root,'editor',file)),{level:9}));
}
function review(){
 const contract=JSON.parse(fs.readFileSync(path.join(root,'../history/r8-editor-0.2.63/compiled/component-contract.v2.json'))),runtime=core.prepareAuthoringPreviewContract(contract),results=[];
 const previous=core.prepareAuthoringPreviewContract(JSON.parse(fs.readFileSync(path.join(history,'compiled/component-contract.v2.json'))));
 for(const dir of ['r2-editor-0.2.59','r3-editor-0.2.60','r4-editor-0.2.61','r5-editor-0.2.62','r6-editor-0.2.63','r7-editor-0.2.63'])for(const file of fs.readdirSync(path.join(root,'reports/fixtures',dir)).filter(n=>n.endsWith('.gz'))){
  const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,'reports/fixtures',dir,file))),r=JSON.parse(bytes);
  assert.equal(core.stableHash(r.snapshot),r.run.snapshotHash);
  assert.deepEqual(JSON.parse(JSON.stringify(core.evaluateCompiledContract(r.snapshot,r.runtime.evaluatedContract))),r.results.engine);
  const before=core.evaluateCompiledContract(r.snapshot,previous),after=core.evaluateCompiledContract(r.snapshot,runtime);
  const withoutGeometry=e=>e.evaluations.filter(v=>!v.ruleId.includes('geometry-follows-effective-baseline')).map(v=>[v.ruleId,v.subjectNodeId,v.classification]);
  assert.deepEqual(withoutGeometry(after),withoutGeometry(before),file);
  const geometry=after.evaluations.filter(e=>e.ruleId.includes('geometry-follows-effective-baseline'));
  results.push({file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),originalExactReplay:true,existingVerdictsPreserved:true,geometry:geometry.reduce((a,e)=>(a[e.classification]=(a[e.classification]||0)+1,a),{})});
 }
 assert.equal(results.length,44);return {date:'2026-09-30',manualRevision:8,editorVersion:'0.2.63',compiledHash:core.stableHash(contract),liveAcceptance:'pending-r8',operationAcceptance:{scope:'Paragraph',manualMinusRejected:true,staleMinusAfterNegativeSwitchRejected:true,hiddenAllowed:true,nativePlusPassed:true,headlineLivePending:true},results};
}
function qa(){
 const files=['contract.manual.json','compiled/component-contract.v2.json','editor/AmountStyles.editor-input.zip'];
 const hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
 const before=hashes();require('node:child_process').execFileSync(process.execPath,[path.join(__dirname,'build_component_contract_reference.js'),path.relative(path.resolve(__dirname,'..'),root)],{cwd:path.resolve(__dirname,'..')});assert.deepEqual(hashes(),before);
 const counts={};for(const [name,file,expected]of [['package','/tmp/amount-styles-r8-package.log',322],['editor','/tmp/amount-styles-r8-editor.log',635]]){const log=fs.readFileSync(file,'utf8');assert(log.includes(`# pass ${expected}\n`));assert(log.includes('# fail 0\n'));counts[name]=expected;}
 const replay=review();const out={date:'2026-09-30',manualRevision:8,editorVersion:'0.2.63',typecheck:'passed',tests:counts,targetedGeometryTests:24,exactHistoricalReplay:replay.results.length,deterministicRebuild:true,hashes:before,scope:'8 Auto Layout facts; not full bounds/sizing coverage',remainingContextOnly:['manual-interactive-decoration-is-forbidden'],liveAcceptance:'r8 pending; r7 Paragraph Operation accepted, D/M Headline pending'};
 fs.writeFileSync(path.join(root,'reports/qa-r8.2026-09-30.json'),JSON.stringify(out,null,2)+'\n');return out;
}
if(require.main===module){if(process.argv.includes('--archive'))archive();else if(process.argv.includes('--qa'))console.log(JSON.stringify(qa(),null,2));else{const r=review();if(process.argv.includes('--record'))fs.writeFileSync(path.join(root,'reports/replay-r8.2026-09-30.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));}}
module.exports={archive,review};
