const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),zlib=require('zlib'),vm=require('vm');
const R=__dirname,A=path.resolve(R,'../../../..'),W=path.resolve(A,'../..'),B=W+'/.local/apollo-main',core=require(B+'/packages/component-contract-core/dist/core.cjs');
const read=p=>JSON.parse(fs.readFileSync(p)),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const pin=p=>{const b=fs.readFileSync(p);return{path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const {fixture}=require(B+'/tests/document-audit.test.js'),f=fixture(),installed=pin(W+'/projects/Apollo/dist/code.js'),code=fs.readFileSync(installed.path,'utf8'),at=code.lastIndexOf('\n})();'),ctx={figma:f.api,__html__:'',TextEncoder,setTimeout,clearTimeout};
vm.runInNewContext(code.slice(0,at)+'\nglobalThis.__runtime=runtime;'+code.slice(at),ctx);
const counts=es=>es.reduce((o,e)=>(o[e.classification]=(o[e.classification]||0)+1,o),{}),violations=es=>Array.from(es).filter(e=>e.classification==='violation').map(e=>e.ruleId).sort();
const rows=[];
try{for(const name of ['Text','List','SegmentedControl','Slider']){
 const m=read(R+'/'+name+'/contract.manual.json'),facts=read(R+'/'+name+'/variant-evidence.json'),c=read(R+'/'+name+'/compiled.json'),bundle=core.buildExportBundle(m,facts,[]);
 assert(bundle.validation.valid);assert.equal(core.stableHash(bundle.compiled),core.stableHash(c));
 const hashes=c.rules.map(r=>core.stableHash({select:r.select,when:r.when,assert:r.assert,effect:r.effect,scope:r.scope}));assert.equal(hashes.length,new Set(hashes).size,'Duplicate assertions '+name);
 const source={schemaVersion:'apollo.component-contract-source.v1-experimental',documentType:'component-contract-source',manual:m,variantEvidence:facts,dependencies:[],projectionStamp:{sourceExportVersion:c.package.sourceExportVersion,compiledHash:core.stableHash(c)}};
 const loaded=ctx.__runtime.loadAuthoringSource(source,{evaluationMode:'authoring-preview'});assert.equal(ctx.__runtime.contractHash(loaded.contract),core.stableHash(c));
 const bad=structuredClone(source);bad.projectionStamp.compiledHash='0'.repeat(64);assert.throws(()=>ctx.__runtime.loadAuthoringSource(bad,{evaluationMode:'authoring-preview'}),/не воспроизводят/);
 const packed=read(name==='SegmentedControl'?R+'/sg-sdk-full-capture.json':R+'/'+name+'/native-sdk-capture.json'),snap=JSON.parse(zlib.inflateRawSync(Buffer.from(packed.snapshot,'base64')));
 const native=ctx.__runtime.auditContractSnapshot(structuredClone(snap),loaded.contract,{evaluationMode:'authoring-preview'}),e=native.engine?.evaluations;
 assert(e,'SDK audit return shape: '+Object.keys(native));const expected=name==='SegmentedControl'?['component:web-core.segmented-control.single-selected.capacity-2.1.1']:[];
 assert.deepEqual(violations(e),expected,name+' native capture');assert.equal(counts(e)['human-review']||0,0,name+' native uncertain');
 const tests=[];
 if(name!=='SegmentedControl'){
  const active=core.prepareAuthoringPreviewContract(c),neg=structuredClone(snap),root=neg.nodes.find(n=>neg.selection.includes(n.id));root.appearance.opacity=.55;
  const n=core.evaluateCompiledContract(neg,active).evaluations,opacity='component:'+m.component.componentId+'.layer-properties-use-effective-baseline.1.13';
  assert.deepEqual(violations(n),[opacity]);assert.equal(counts(n)['human-review']||0,0);tests.push({id:'root-opacity',evidenceKind:'synthetic-mutation-of-real-native-capture',expected:[opacity],actual:violations(n)});
  root.appearance.opacity=1;const restored=core.evaluateCompiledContract(neg,active).evaluations;assert.deepEqual(violations(restored),[]);assert.equal(counts(restored)['human-review']||0,0);tests.push({id:'root-opacity-restoration',evidenceKind:'synthetic',actual:counts(restored)});
  delete root.appearance.opacity;root.unknownFacts=[...(root.unknownFacts||[]),'appearance.opacity'];const unknown=core.evaluateCompiledContract(neg,active).evaluations;assert(unknown.some(e=>e.ruleId===opacity&&e.classification==='human-review'));tests.push({id:'missing-opacity-remains-unknown',evidenceKind:'synthetic',actual:counts(unknown)});
 }
 const draft=core.evaluateCompiledContract(structuredClone(snap),c).evaluations;assert(!draft.some(e=>e.classification==='violation'),'Draft must remain preview-only');
 const row={name,componentId:m.component.componentId,manualHash:core.stableHash(m),compiledHash:core.stableHash(c),sourceLoad:'PASS_ACTUAL_INSTALLED_MAIN_IN_VM',tamperRejected:true,nativeCaptureProducer:'existing Core SDK executed in Figma via read-scoped adapter; not Apollo UI',nativeScope:name==='SegmentedControl'?'SG-07 root/collection contour; nested Segment explicitly outside coverage':name==='Text'?'TX-02 changed library Text Style':name==='List'?'LI-02 Caption=True with custom text':'SL-02 Size4 Range Pips+D ots',nativeCounts:counts(e),nativeViolations:violations(e),captureWarnings:packed.warnings,tests,ready:false};
 rows.push(row);write(R+'/'+name+'/verification.json',row);
}
 for(const p of read(R+'/input-inventory.json').inputPins)assert.equal(pin(p.path).sha256,p.sha256,'Athena input drift');
 write(R+'/VERIFICATION.json',{status:'PASS_SCOPED',installedMain:installed,core:pin(B+'/packages/component-contract-core/dist/core.cjs'),predicate:pin(B+'/packages/component-contract-core/dist/predicate.cjs'),rows,nativeApolloUi:'NOT_RUN_USER_ONLY',engineChanged:false,proxyChanged:false,delivery:'PENDING_CAPACITY'});
 console.log(JSON.stringify(rows.map(r=>({name:r.name,counts:r.nativeCounts,syntheticChecks:r.tests.length}))));
}finally{f.emit('close');}
