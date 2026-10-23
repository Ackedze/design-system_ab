'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),R=__dirname,C=path.resolve(R,'../..'),A=path.resolve(C,'../../../../../..');
const read=p=>JSON.parse(fs.readFileSync(p)),native=read(R+'/native-source.json').sets[0],compiled=read(R+'/compiled.json'),core=require(path.resolve(A,'../../.local/apollo-general-2026-10-16/mcp-pilot276/indicator-2026-10-23/runtime-input/packages/component-contract-core/dist/core.cjs')),lab=read(R+'/lab-cases.json').rows,actual=read(R+'/lab-readback.json').rows;
for(const v of native.variants){
 const properties=v.properties,propertyTypes=Object.fromEntries(Object.entries(native.properties).map(([k,p])=>[k,p.type])),snapshot={source:{componentKey:v.key,componentSetKey:native.key},context:{platform:'universal'},selection:['root'],nodes:[{id:'root',component:{identity:{componentKey:v.key,componentSetKey:native.key},properties,propertyTypes},unknownFacts:[]}],variantReference:{properties,propertyTypes,definedProperties:Object.keys(properties)}};
 core.materializeSemanticFacts(snapshot,compiled);for(const [p,x]of Object.entries(properties))assert.equal(snapshot.nodes[0].semanticApi[p.toLowerCase()],x);
 const missing=structuredClone(snapshot);delete missing.nodes[0].component.identity;delete missing.source.componentKey;delete missing.source.componentSetKey;core.materializeSemanticFacts(missing,compiled);assert(missing.nodes[0].unknownFacts.includes('semanticApi.size'));
}
for(const [i,c]of lab.entries()){
 const a=actual[i];assert.equal(c.instanceId,a.instanceId);assert.equal(c.key,a.key);for(const [k,v]of Object.entries(c.props))assert.equal(a.properties[k].value,v);
 assert.equal(a.labelOwner.properties[Object.keys(a.labelOwner.properties).find(k=>k.startsWith('✎ Label#'))].value,c.label);
 if(c.uppercase)assert.equal(a.labelOwner.properties.Uppercase.value,c.uppercase);
 if(c.expectedRuleId){assert(compiled.rules.some(r=>r.ruleId===c.expectedRuleId));assert.deepEqual(a.value,c.after);}
}
assert.equal(lab[6].before,14);assert.equal(lab[6].after,15);assert.equal(lab[7].before,10);assert.equal(lab[7].after,11);
const out={status:'PASS',scope:'24 native root API bindings +missing identity UNKNOWN;8 fixture native properties/mutations and exactIR; not Apollo verdicts',variants:24,cases:8,nativeApollo:'NOT_RUN_USER_ONLY'};
fs.writeFileSync(R+'/preconditions.json',JSON.stringify(out)+'\n');console.log(JSON.stringify(out));

