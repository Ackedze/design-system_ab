// Read-only source regression. Writes normal-export diagnostic ZIPs only under fixtures/.
// Run: node <this file> [workspace root]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=process.argv[2]||'/Users/alexkukhta/Desktop/workplace';
const core=require(path.join(root,'projects/ComponentContractEditor/dist/core.cjs'));
const runtime=require(path.join(root,'projects/Apollo-v3/apps/apollo-v4/dist/runtime.cjs'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
function delta(a,b,p=''){if(JSON.stringify(a)===JSON.stringify(b))return [];if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)||Array.isArray(b))return [p];return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>delta(a[k],b[k],p+'/'+k));}
async function readArchive(file){const bytes=fs.readFileSync(file),entries=await core.readZip(bytes);const files=entries.filter(e=>e.name.endsWith('.json')).map(e=>({name:e.name,text:core.zipEntryText(e)}));return {bytes,entries,files};}
async function main(){
 const timestamp=new Date().toISOString(),reportDir=__dirname,outDir=path.join(reportDir,'fixtures','next-02-normal-export');fs.mkdirSync(outDir,{recursive:true});
 const originals={},exports={},checks=[];
 for(const name of ['Spinner','Button']){
  const input=path.join(root,'shared/design-system_ab/experiments/current-contract-packages',`${name}.component-contract.zip`),original=await readArchive(input),workspace=core.importWorkspace(original.files);
  const projectionPath=path.join(root,'shared/design-system_ab/experiments/web-core/core',name,'compiled/component-contract.v2.json');const pinned=JSON.parse(fs.readFileSync(projectionPath));
  assert.equal(core.stableHash(workspace.manual),pinned.package.manualSourceHash);
  const bundle=core.buildExportBundle(workspace.manual,workspace.variantEvidence,workspace.dependencyContracts);assert.equal(bundle.validation.valid,true);assert.equal(bundle.compiled.status,'ready');
  const zip=core.buildAuthoringZip(bundle,original.files),output=path.join(outDir,`${name}.normal-editor-export.zip`);fs.writeFileSync(output,zip);
  const actual=await readArchive(output),reopened=core.importWorkspace(actual.files);assert.deepEqual(reopened.manual,workspace.manual);assert.equal(core.stableHash(reopened.compiledInput),core.stableHash(bundle.compiled));
  const changed=delta(pinned,bundle.compiled);
  if(name==='Spinner'){assert.deepEqual(changed,['/package/sourceExportVersion']);assert.equal(pinned.package.sourceExportVersion,'component-contract-editor@0.2.33');assert.equal(bundle.compiled.package.sourceExportVersion,'component-contract-editor@0.2.37');}
  else {assert.deepEqual(changed,[]);assert.equal(core.stableHash(bundle.compiled),'6136013045fbcab513f8e7cbcd0ce968903ef81851c927dd7426e218438f5f8b');}
  originals[name]={input,originalSha256:sha(original.bytes)};exports[name]={output,files:actual.files,manual:reopened.manual};
  checks.push({component:name,input,originalSha256:sha(original.bytes),output,outputSha256:sha(zip),status:'normal-export-ready-but-not-promoted',manualSourceHash:core.stableHash(workspace.manual),pinnedCompiledHash:core.stableHash(pinned),exportedCompiledHash:core.stableHash(bundle.compiled),oldExporterStamp:pinned.package.sourceExportVersion,newExporterStamp:bundle.compiled.package.sourceExportVersion,projectionDiffPaths:changed,originalFactsHash:core.stableHash(workspace.variantEvidence),reopenedFactsHash:core.stableHash(reopened.variantEvidence),factsPreserved:core.stableHash(workspace.variantEvidence)===core.stableHash(reopened.variantEvidence),factsDiffPaths:delta(workspace.variantEvidence,reopened.variantEvidence),originalEntries:original.entries.map(e=>e.name),exportedEntries:actual.entries.map(e=>e.name),originalReadOnlyJsonNotCarried:original.entries.filter(e=>e.name.endsWith('.json')&&e.name!=='contract.manual.json'&&!actual.entries.some(x=>x.name===e.name)).map(e=>e.name)});
 }
 const spinnerSource=runtime.sourceFromFiles(exports.Spinner.files);const spinnerLoaded=runtime.loadAuthoringSource(spinnerSource);assert.equal(spinnerLoaded.contract.status,'ready');
 const buttonSource=runtime.sourceFromFiles(exports.Button.files,[spinnerSource]);
 let failure;
 try {runtime.loadAuthoringSource(buttonSource);assert.fail('Current exporter must reproduce dependency link failure');}catch(e){assert.match(e.message,/COMPONENT_DEPENDENCY_LINK/);failure={code:e.code,message:e.message};}
 const bgArchive=path.join(root,'shared/design-system_ab/experiments/current-contract-packages/ButtonsGroup.component-contract.zip'),bg=await readArchive(bgArchive);const bgSource=runtime.sourceFromFiles(bg.files,[buttonSource]);
 let groupFailure;try {runtime.loadAuthoringSource(bgSource);assert.fail('Group must not bypass dependency link');}catch(e){assert.match(e.message,/COMPONENT_DEPENDENCY_LINK/);groupFailure={code:e.code,message:e.message};}
 for(const name of ['Spinner','Button'])assert.equal(sha(fs.readFileSync(originals[name].input)),originals[name].originalSha256);
 const report={documentType:'next-02-exporter-packaging-repro',status:'reproduced-exporter-blocker',normative:false,generatedAt:timestamp,method:'Unmodified Editor core importWorkspace → buildExportBundle → buildAuthoringZip. Re-read actual on-disk ZIPs; no manual injection of old projections, no source/projection stamp rewriting, no production archive replacement.',checks,actualZipV4Load:{spinner:'ready-with-new-compiled-hash',button:failure,buttonsGroup:groupFailure},acceptedInputArchivesUnchanged:true,productionArchiveChanges:[],requiredExporterChange:{owner:'shared exporter / Generation executor',constraint:'Preserve exact verified accepted exporter stamp in authoritative authoring exports when predicates/manual/facts reproduce the pinned historical projection; otherwise require deliberate transitive recompile/repin. No guessed compiled hash.',requiredChecks:['Actual unchanged exported ZIP closure loads via v4 sourceFromFiles/loadAuthoringSource.','Spinner r8 expected 909113967175c1ae618d2857d96855a3d3f53cdfe0b38cf923ce10b56e553221 and Button r31 expected 6136013045fbcab513f8e7cbcd0ce968903ef81851c927dd7426e218438f5f8b reproduced from original manuals/facts.','Historical projection can supply verified exporter/anatomy stamp only; compiler never trusts cached predicates.','Mismatched cache/facts/metadata fail closed.','Read-only input evidence preservation is explicit: actual input paths or declared source inventory, including legacy descriptive importedFiles labels.','BG remains blocked by its nine context Draft rules after packaging is fixed.']},notClaimed:['Complete dependency packaging fix','Production ZIP promotion','Registry/Generation input refresh','New code/Figma/live acceptance']};
 const out=path.join(reportDir,'next-02.exporter-packaging.repro.2026-10-05.json');fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({report:out,status:report.status,actualZipV4Load:report.actualZipV4Load,archivesUnchanged:true,exports:checks.map(c=>({component:c.component,output:c.output,sha256:c.outputSha256,pinnedHash:c.pinnedCompiledHash,exportedHash:c.exportedCompiledHash,factsPreserved:c.factsPreserved}))}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
