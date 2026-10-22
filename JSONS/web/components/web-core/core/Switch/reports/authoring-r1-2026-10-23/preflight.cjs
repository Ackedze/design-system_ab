'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const R=__dirname,C=path.resolve(R,'../..'),A=path.resolve(C,'../../../../../..'),W=path.resolve(A,'../..');
const F=W+'/.local/apollo-general-2026-10-16/mcp-pilot276/indicator-2026-10-23/runtime-input',core=require(F+'/packages/component-contract-core/dist/core.cjs');
const read=p=>JSON.parse(fs.readFileSync(p));
const native=read(R+'/native-source.json'),compiled=read(R+'/compiled.json'),cases=read(R+'/lab-cases.json').rows;
const checks=[];
for(const s of native.sets){
 const v=s.variants[0],properties=Object.fromEntries(Object.entries(s.properties).map(([k,p])=>[k,v.properties[k]??p.defaultValue])),propertyTypes=Object.fromEntries(Object.entries(s.properties).map(([k,p])=>[k,p.type]));
 const snapshot={source:{componentKey:v.key,componentSetKey:s.key},context:{platform:'universal'},selection:['root'],nodes:[{id:'root',component:{identity:{componentKey:v.key,componentSetKey:s.key},properties,propertyTypes},unknownFacts:[]}],variantReference:{properties,propertyTypes,definedProperties:Object.keys(properties)}};
 core.materializeSemanticFacts(snapshot,compiled);assert.equal(snapshot.nodes[0].semanticApi.representation,s.name.startsWith('SwitchLabel')?'label':'control');
 const missing=structuredClone(snapshot);delete missing.nodes[0].component.identity.componentSetKey;core.materializeSemanticFacts(missing,compiled);assert(missing.nodes[0].unknownFacts.includes('semanticApi.representation'));
 checks.push({representation:s.name,readOnlySurfaceBinding:'PASS',missingIdentity:'UNKNOWN_PRESERVED'});
}
const fontIR=compiled.rules.filter(r=>r.source.anchor==='component:web-core.switch.label-typography-baseline');assert.equal(fontIR.length,18);
for(const r of fontIR)assert(r.when.args.some(x=>x.actual?.fact==='host.semanticApi.representation'&&x.predicate==='one-of'&&JSON.stringify(x.expected.literal)==='["label"]'));
for(const c of cases){assert(compiled.facts.variantEvidence.variants.some(v=>v.componentKey===c.key));for(const [k,v]of Object.entries(c.props))assert.equal(c.actualProperties[k].value,v);if(c.expectedRuleId)assert(compiled.rules.some(r=>r.ruleId===c.expectedRuleId));}
assert.equal(cases[6].before,16);assert.equal(cases[6].after,17);
fs.writeFileSync(R+'/preconditions.json',JSON.stringify({status:'PASS',scope:'Native fixture properties, exact keys/IR, supported existing read-only surface binding; not fresh Apollo verdicts.',representations:checks,cases:cases.map(c=>({id:c.id,instanceId:c.instanceId,expected:c.expected,expectedRuleId:c.expectedRuleId||null})),nativeApollo:'NOT_RUN_USER_ONLY'})+'\n');
console.log(JSON.stringify({representations:checks.length,compiledTypographyRules:fontIR.length,cases:cases.length,status:'PASS'}));
