const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),path=require('path');
const args=Object.fromEntries(process.argv.slice(2).reduce((a,v,i,x)=>i%2?a:a.concat([[v,x[i+1]]]),[]));
if(!args['--apollo']||!args['--output'])throw Error('Use --apollo APOLLO_ROOT --output NEW_DIRECTORY');
const B=path.resolve(args['--apollo']),R=path.resolve(args['--output']),T=path.dirname(__dirname);
fs.mkdirSync(R,{recursive:false});
const core=require(B+'/packages/component-contract-core/dist/core.cjs'),copy=x=>JSON.parse(JSON.stringify(x)),read=p=>JSON.parse(fs.readFileSync(p)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
require(B+'/node_modules/esbuild').buildSync({absWorkingDir:B,entryPoints:['packages/component-contract-core/src/catalog-reference.ts'],outfile:R+'/catalog-final.cjs',bundle:true,platform:'node',format:'cjs'});
const catalog=require(R+'/catalog-final.cjs'),manual=read(T+'/contract.manual.json'),evidence=read(T+'/variant-evidence.json'),compiled=core.compileManualSource(manual,evidence);assert(!compiled.issues.some(i=>i.level==='error'));const contract=core.prepareAuthoringPreviewContract(compiled.contract),raw=read(T+'/pilot/catalog.json');
function tree(c,v){const m=new Map(c.structure.map(n=>[n.id,copy(n)]));for(const p of c.variantStructures[v.key]||[]){if(p.op==='remove')m.delete(p.id);else if(p.op==='update')Object.assign(m.get(p.id),copy(p.value));else m.set(p.node.id,copy(p.node));}return[...m.values()];}
const controls=[],defaults=[];
for(const component of raw.components.filter(c=>['[D] TitleView','[M] TitleView'].includes(c.name)))for(const variant of component.variants){
 const rep=manual.representations.find(r=>r.locator.componentKey===component.key),selection={contractId:manual.component.contractId,componentId:manual.component.componentId,revision:5,representationId:rep.id,componentKey:variant.key,variantKey:variant.key},response={success:true,schemaVersion:'apollo.catalog-reference.v1',releaseId:'a'.repeat(64),contract:{id:manual.component.contractId,componentId:manual.component.componentId,revision:5,manualSourceHash:compiled.contract.package.manualSourceHash},selection,component:{key:component.key,name:component.name},variant:{key:variant.key},structure:tree(component,variant),dependencies:[],provenance:{catalog:{file:'catalog.json',sha256:sha(fs.readFileSync(T+'/pilot/catalog.json'))},contract:{file:'manual',sha256:sha(JSON.stringify(manual))}},completeness:{structure:'assembled',issues:[]}};response.referenceHash=sha(JSON.stringify(response));
 const prepared=catalog.buildCatalogReference(response,compiled.contract,{releaseId:response.releaseId,selection});
 const witnesses=prepared.resourceRequirements.map(r=>Object.assign({kind:r.kind,sourceId:r.sourceId,sourceKey:r.sourceKey,consumerId:r.sourceId,consumerKey:r.sourceKey},r.kind==='collection'?{consumerModes:prepared.sourceResources.collection[r.sourceId].modes}:{}));
 const baseline=catalog.applyCatalogResourceRemap(prepared,witnesses),a=copy(baseline.snapshot);a.source.rootNodeId='synthetic-actual:'+a.source.rootNodeId;const swapKeys=Object.fromEntries(Object.entries(prepared.sourceResources.component).map(([id,r])=>[id,r.key]));a.source.swapComponentKeys=swapKeys;baseline.snapshot.source.swapComponentKeys=swapKeys;a.variantReference=core.captureVariantReference(baseline.snapshot,variant.key,component.key,prepared.definedProperties);
 const baseResult=core.evaluateCompiledContract(a,contract),usage=es=>es.filter(e=>e.ruleId.includes('.status-and-title-status-color-match.')||e.ruleId.includes('.desktop-button-accent-excluded.'));
 assert(!usage(baseResult.evaluations).some(e=>['violation','human-review'].includes(e.classification)),rep.platform+variant.name);defaults.push({platform:rep.platform,variant:variant.name,status:'PASS'});
 if(a.nodes[0].component.properties.View!=='xLarge'||a.nodes[0].component.properties.Skeleton!=='False')continue;
 const root=a.nodes[0],getTarget=id=>{const target=manual.targets.find(t=>t.id===id),b=target.identityBindingsV1.find(b=>b.componentKey===variant.key);return a.nodes.find(n=>core.snapshotPaths(a).get(n.id)===b.referencePath);};
 const status=getTarget('target.status-preset'),title=getTarget('target.part-3b14b8b89be2');
 function show(n){let p=n;while(p){p.visible=true;p=a.nodes.find(n=>n.id===p.parentId);}}
 show(status);show(title);
 const run=()=>usage(core.evaluateCompiledContract(a,contract).evaluations),types=manual.semanticApi.find(p=>p.id==='status-type').domain;
 for(const [i,type]of types.entries()){
  status.component.properties.Type=type;title.component.properties.Type=type;assert(!run().some(e=>e.classification==='violation'));
  title.component.properties.Type=types[(i+1)%types.length];assert(run().some(e=>e.ruleId.includes('.status-and-title-status-color-match.')&&e.classification==='violation'));
  title.component.properties.Type=type;assert(!run().some(e=>e.classification==='violation'));controls.push({platform:rep.platform,case:'Type='+type,positive:true,negative:true,reset:true});
 }
 status.visible=false;assert(!run().some(e=>e.ruleId.includes('.status-and-title-status-color-match.')&&['violation','human-review'].includes(e.classification)));controls.push({platform:rep.platform,case:'TitleStatus-standalone',status:'PASS'});status.visible=true;
 delete title.component.properties.Type;assert(run().some(e=>e.ruleId.includes('.status-and-title-status-color-match.')&&e.classification==='human-review'));title.component.properties.Type=status.component.properties.Type;
 if(rep.platform==='desktop')for(let i=1;i<=4;i++){
  const button=getTarget('target.desktop-button-'+i);show(button);const old=button.component.properties.View;button.component.properties.View='Accent';assert(run().some(e=>e.ruleId.includes('.desktop-button-accent-excluded.button-'+i+'.')&&e.classification==='violation'));
  button.component.properties.View='Primary';assert(!run().some(e=>e.ruleId.includes('.desktop-button-accent-excluded.button-'+i+'.')&&e.classification==='violation'));
  button.visible=false;assert(!run().some(e=>e.ruleId.includes('.desktop-button-accent-excluded.button-'+i+'.')&&e.classification==='violation'));button.visible=true;button.component.properties.View=old;controls.push({platform:rep.platform,case:'Accent-button-'+i,negative:true,reset:true,hidden:true});
 }
}
assert.equal(defaults.length,16);assert.equal(controls.length,18);
fs.writeFileSync(R+'/RULE-CONTROLS.json',JSON.stringify({status:'PASS',kind:'ordinary-runtime-independent-source-synthetic-mutations',defaultProfiles:defaults,controls,forcedRoles:false,actualBaselineBorrowed:false,manualFigma:false},null,2)+'\n');console.log({status:'PASS',defaults:defaults.length,controls:controls.length});
