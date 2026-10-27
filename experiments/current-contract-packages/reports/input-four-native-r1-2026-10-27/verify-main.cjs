const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto'), zlib = require('node:zlib');
const R = __dirname, A = path.resolve(R, '../../../..'), W = path.resolve(A, '../..');
const core = require(W + '/.local/apollo-main/packages/component-contract-core/dist/core.cjs');
const read = p => JSON.parse(fs.readFileSync(p));
const write = (p,v) => fs.writeFileSync(p, JSON.stringify(v,null,2)+'\n');
const report = JSON.parse(zlib.gunzipSync(fs.readFileSync(R + '/native-report.json.gz')));
const prior = path.join(R, '../input-four-drafts-2026-10-26'), fixture = require(W + '/.local/apollo-main/tests/document-audit.test.js').fixture();
const codePath = W + '/projects/Apollo/dist/code.js', bytes = fs.readFileSync(codePath), code = bytes.toString(), at = code.lastIndexOf('\n})();');
const ctx = {figma:fixture.api, __html__:'', TextEncoder, setTimeout, clearTimeout};
vm.runInNewContext(code.slice(0,at) + '\nglobalThis.__runtime=runtime;' + code.slice(at),ctx);
const sdk = ctx.__runtime, options = {evaluationMode:'authoring-preview'}, results = [], controls = [], packages = [];
const categories = out => Object.fromEntries(Object.entries(out.engine.coverage.byClassification).sort());
const one = (label, s, c, inspect) => { const out = sdk.auditContractSnapshot(s,c,options); inspect(out); controls.push({id:label,status:'PASS',uncertain:out.coverage.uncertain,executionComplete:out.coverage.executionComplete}); };
try {
  for (const name of ['Input','NumberInput','AmountInput','Select']) {
    const m = read(R+'/'+name+'/probe-manual.json'), facts = read(prior+'/'+name+'/variant-evidence.json');
    m.metadata.revision = 2; m.metadata.updatedAt = '2026-10-27T05:00:00.000Z';
    const b = core.buildExportBundle(m,facts,[]); assert(b.validation.valid);
    const source = {schemaVersion:sdk.SOURCE_SCHEMA, documentType:'component-contract-source',manual:m, variantEvidence:facts, dependencies:[],
      projectionStamp:{sourceExportVersion:b.compiled.package.sourceExportVersion,compiledHash:core.stableHash(b.compiled)}};
    const loaded = sdk.loadAuthoringSource(source, options); assert.equal(sdk.contractHash(loaded.contract),core.stableHash(b.compiled));
    const wrong = structuredClone(source); wrong.projectionStamp.compiledHash = '0'.repeat(64);
    assert.throws(() => sdk.loadAuthoringSource(wrong,options), /не воспроизводят/);
    const expected = read(prior+'/'+name+'/test-cases.json').cases;
    const scopes = report.components.filter(c => c.release.contractId === m.component.componentId);
    for (const c of scopes) {
      const out = sdk.auditContractSnapshot(c.snapshot,loaded.contract,options), t = expected.find(t => t.nodeId === c.scopeId);
      const actual = out.engine.evaluations.filter(e => e.classification==='violation').map(e => e.ruleId).sort();
      assert.equal(JSON.stringify(actual),JSON.stringify([...t.expectedRuleIds].sort()),t.caseId);
      assert.equal(out.coverage.uncertain,0,t.caseId); assert.equal(out.coverage.executionComplete,true,t.caseId);
      results.push({component:name,caseId:t.caseId,expectedRuleIds:t.expectedRuleIds,actualRuleIds:actual,uncertain:0,executionComplete:true,classifications:categories(out)});
    }
    const base = structuredClone(scopes[0].snapshot), paths = core.snapshotPaths(base), slot = base.nodes.find(n => n.type==='SLOT'); assert(slot);
    const s = structuredClone(base), sn = s.nodes.find(n => n.id===slot.id), snOwner = s.nodes.find(n => n.id===sn.parentId);
    delete sn.component.propertyReferenceBindings.slotContentId;
    one(name+'-slot-unreadable',s,loaded.contract,o => assert(o.coverage.uncertain>0));
    const foreign = structuredClone(base), fn = foreign.nodes.find(n => n.id===slot.parentId);
    fn.component.identity.componentKey = 'foreign-component-key';
    one(name+'-slot-foreign-owner',foreign,loaded.contract,o => assert(o.coverage.uncertain>0));
    const ambiguous = structuredClone(base), an = structuredClone(ambiguous.nodes.find(n => n.id===slot.id));
    an.id = 'ambiguous-slot'; an.childIds = []; ambiguous.nodes.push(an); ambiguous.nodes.find(n => n.id===an.parentId).childIds.push(an.id);
    one(name+'-slot-ambiguous',ambiguous,loaded.contract,o => assert(o.coverage.uncertain>0));
    const container = structuredClone(base), cn = container.nodes.find(n => n.id===slot.id); cn.appearance.opacity = .51;
    one(name+'-slot-container-still-checked',container,loaded.contract,o => assert(o.engine.evaluations.some(e => e.subjectNodeId===cn.id && e.ruleId.endsWith('.layer-properties-use-effective-baseline.1.13') && e.classification==='violation')));
    const payload = structuredClone(base), pn = payload.nodes.find(n => n.parentId===slot.id); pn.appearance.opacity = .37;
    one(name+'-slot-payload-external',payload,loaded.contract,o => { assert.equal(o.coverage.uncertain,0); assert(!o.engine.evaluations.some(e=>e.subjectNodeId===pn.id && e.classification==='violation')); });
    const owned = structuredClone(base), on = owned.nodes.find(n => n.name==='Field'); on.appearance.opacity = .42;
    one(name+'-owned-field-still-checked',owned,loaded.contract,o => assert(o.engine.evaluations.some(e=>e.subjectNodeId===on.id && e.classification==='violation')));
    const text = structuredClone(base), tn = text.nodes.find(n => n.type==='TEXT' && n.name==='Label'); assert(tn); tn.text.fontSize += 1;
    one(name+'-owned-label-typography-still-checked',text,loaded.contract,o => assert(o.engine.evaluations.some(e=>e.subjectNodeId===tn.id && e.ruleId.includes('visible-text-typography') && e.classification==='violation')));
    const outside = structuredClone(base), xn = outside.nodes.find(n=>n.parentId===slot.id);
    outside.nodes.find(n=>n.id===slot.id).childIds = outside.nodes.find(n=>n.id===slot.id).childIds.filter(id=>id!==xn.id);
    xn.parentId = slot.parentId; outside.nodes.find(n=>n.id===slot.parentId).childIds.push(xn.id);
    one(name+'-fixer-outside-proven-slot-not-exempt',outside,loaded.contract,o => { assert(o.coverage.uncertain>0); assert(!o.coverage.executionComplete); });
    if (name==='NumberInput') {
      const stripped = structuredClone(m); for (const t of stripped.targets) delete t.variantHints;
      const c = core.buildExportBundle(stripped,facts,[]).compiled;
      one('NumberInput-missing-variant-binding',base,c,o => assert(o.coverage.uncertain>0));
      const child = structuredClone(scopes.find(c => c.name.startsWith('NI-05')).snapshot);
      child.variantReference.nodeProperties['Label / Label'].diagnosticName = 'foreign-label';
      one('NumberInput-foreign-reference',child,loaded.contract,o => assert(o.coverage.uncertain>0));
    }
    fs.writeFileSync(R+'/'+name+'/candidate-manual.json',JSON.stringify(m)+'\n');
    packages.push({name,revision:2,componentId:m.component.componentId,manualSourceHash:b.compiled.package.manualSourceHash,compiledHash:core.stableHash(b.compiled),IR:b.compiled.rules.length,policies:m.rules.length});
  }
  const out = {status:'PASS_RETAINED_CAPTURE_REPLAY',nativeFreshRun:'NOT_RUN',review:{independent:false},
    installedMain:{path:codePath,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length},
    expectedCases:25,matchedCases:results.length,expectedViolations:13,actualViolations:results.reduce((n,r)=>n+r.actualRuleIds.length,0),uncertain:0,
    packages,cases:results,controls,areaNotChecked:{original:report.notChecked.length,reason:'contract-not-found',separateFromRootExecution:true},runtimeWrites:false};
  write(R+'/INSTALLED-MAIN-REPLAY.json',out); console.log(JSON.stringify({status:out.status,cases:results.length,violations:out.actualViolations,uncertain:0,controls:controls.length}));
} catch(e) {
  const p = R+'/INSTALLED-MAIN-FIRST-FAILURE.json'; if (!fs.existsSync(p)) write(p,{message:e.message,stack:e.stack,completed:results,controls});
  console.error(e); process.exitCode=1;
} finally { fixture.emit('close'); }
