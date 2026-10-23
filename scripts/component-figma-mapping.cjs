const assert=require('node:assert/strict');

// Keep the existing generic mapping format, including authority and dependency closure.
function projectComponentMapping(source,componentId){
 const result=JSON.parse(JSON.stringify(source));
 result.semantic.mappings=result.semantic.mappings.filter(m=>m.componentId===componentId);
 assert(result.semantic.mappings.length,'Component has no generic Figma mapping');
 const ids=new Set(result.semantic.mappings.map(m=>m.mappingId));
 result.typed.bindings=result.typed.bindings.filter(b=>ids.has(b.mappingId));
 const required=new Set([componentId]);
 for(const b of result.typed.bindings){
  const p=b.normativeSource;
  const matches=source.manuals.filter(m=>m.pin.path===p.path&&m.pin.sha256===p.sha256&&m.pin.bytes===p.bytes&&(!p.manualPointer||m.manualPointer===p.manualPointer));
  assert.equal(matches.length,1,'Port authority manual is missing or ambiguous');
  required.add(matches[0].manual.component.componentId);
 }
 for(const id of required){
  const deps=source.profiles.sourceDependencies.filter(d=>d.componentId===id);
  assert.equal(deps.length,1,'Mapping dependency is missing or ambiguous');
  for(const pin of deps[0].dependencyPins){
   assert(source.profiles.sourceDependencies.some(d=>d.componentId===pin.componentId&&d.revision===pin.revision&&d.manualSemanticHash===pin.manualSourceHash&&d.compiledSemanticHash===pin.compiledHash),'Stale mapping dependency');
   required.add(pin.componentId);
  }
 }
 const choices=new Set(result.semantic.mappings.flatMap(m=>m.choices));
 result.profiles.choices=result.profiles.choices.filter(c=>choices.has(c.id));
 result.profiles.profiles=result.profiles.profiles.filter(p=>ids.has(p.mappingId)||choices.has(p.choiceId));
 result.targets.profiles=result.targets.profiles.filter(p=>choices.has(p.choiceId));
 result.profiles.sourceDependencies=result.profiles.sourceDependencies.filter(d=>required.has(d.componentId));
 result.manuals=result.manuals.filter(m=>required.has(m.manual.component.componentId));
 result.ruleLinks.links=result.ruleLinks.links.filter(r=>required.has(r.componentId||r.rule?.ownership?.ownerId)||result.manuals.some(m=>m.pin.path===r.source.path&&m.pin.sha256===r.source.sha256&&m.pin.bytes===r.source.bytes&&(!r.source.manualPointer||m.manualPointer===r.source.manualPointer)));
 result.denials=result.denials.filter(d=>ids.has(d.mappingId));
 result.typed.portCount=result.typed.bindings.length;
 result.typed.nativeSLOTCount=result.typed.bindings.filter(b=>b.type==='SLOT').length;
 // Part definitions are shared source evidence required by native ancestry checks.
 assert.equal(result.profiles.choices.length,choices.size,'Unknown mapping choice');
 assert.equal(result.targets.profiles.length,choices.size,'Unknown mapping target profile');
 return result;
}
module.exports={projectComponentMapping};
