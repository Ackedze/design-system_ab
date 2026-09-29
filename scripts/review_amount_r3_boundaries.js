// Re-evaluate archived raw captures with current r3. This is NOT new Figma acceptance.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),root=path.join(repo,'experiments/web-core/core/Amount/authoring');
const corePath=path.resolve(repo,'../../projects/ComponentContractEditor/dist/core.cjs'),core=require(corePath);
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const historical=path.resolve(root,'../history/r3-editor-0.2.56');
const manual=JSON.parse(fs.readFileSync(path.join(historical,'contract.manual.json'))),compiled=JSON.parse(fs.readFileSync(path.join(historical,'compiled/component-contract.v2.json')));
assert.equal(manual.metadata.revision,3);assert.equal(compiled.package.manualSourceHash,core.stableHash(manual));
const runtime=core.prepareAuthoringPreviewContract(compiled),results=[];
for(const entry of read('reports/live-review-r2.2026-09-29.json').reportResults){
  const bytes=zlib.gunzipSync(fs.readFileSync(path.join(root,entry.fixtureFile)));assert.equal(sha(bytes),entry.sha256);
  const original=JSON.parse(bytes),snapshot=original.snapshot,before=JSON.stringify(snapshot);
  assert.equal(core.stableHash(snapshot),original.run.snapshotHash);
  const engine=core.evaluateCompiledContract(snapshot,runtime),report=core.buildEditorValidationReport(engine,{contract:compiled,issues:[]},manual,snapshot);
  const violations=engine.evaluations.filter(e=>e.classification==='violation').map(e=>e.ruleId).sort();
  const expected=[];
  if(snapshot.nodes[0].component.properties['Addon#100902:0'])expected.push('component:web-core.amount.addon-content-is-configurable.1.2');
  if(entry.caseId==='A15')expected.push('component:web-core.amount.layer-properties-use-effective-baseline.1.6');
  if(entry.caseId==='A16')expected.push('component:web-core.amount.fixed-part-order.visibility-011.1.1','component:web-core.amount.major-required.1.1');
  assert.deepEqual(violations,expected.sort());assert.equal(report.scenarioCoverage.complete,!entry.caseId.startsWith('A17'));
  assert.deepEqual(core.evaluateCompiledContract(snapshot,runtime),engine);assert.equal(JSON.stringify(snapshot),before);
  results.push({caseId:entry.caseId,fixtureFile:entry.fixtureFile,sha256:entry.sha256,sourceEditorVersion:original.editorVersion,
    complete:report.scenarioCoverage.complete,violations,inconclusive:report.scenarioCoverage.inconclusive,notExecuted:report.scenarioCoverage.notExecuted});
}
const files=['contract.manual.json','compiled/component-contract.v2.json','editor/Amount.editor-input.zip'];
const output={schemaVersion:'amount.owner-boundaries-review.v1',date:'2026-09-29',manualRevision:3,manualSourceHash:core.stableHash(manual),
  sourceBundleHash:manual.source.sourceHash,editorVersion:require(path.resolve(repo,'../../projects/ComponentContractEditor/package.json')).version,
  coreByteSha256:sha(fs.readFileSync(corePath)),artifactSha256:Object.fromEntries(files.map(p=>[p,sha(fs.readFileSync(path.join(historical,p)))])),
  interpretation:'Current r3 rules against immutable r2 raw captures. No new Figma capture or live acceptance.',liveAcceptance:'pending',
  counts:{reports:results.length,completePositive:results.filter(r=>r.complete&&!r.violations.length).length,completeNegative:results.filter(r=>r.complete&&r.violations.length).length,incomplete:results.filter(r=>!r.complete).length},results,
  tests:{editorCommand:'npm run typecheck && npm test',packageCommand:'node --test scripts/tests/amount-contract.test.js scripts/tests/button-*.test.js scripts/tests/spinner-contract.test.js scripts/tests/spinner-layout-acceptance.test.js scripts/tests/spinner-final-review.test.js',
    boundaryTests:'projects/ComponentContractEditor/tests/amount-owner-boundaries.test.js',syntheticMutationsAreNotLiveEvidence:true},
  caveats:['A06–A09 visible unswapped placeholders are now expected violations, not regressions.','Native-slot source v1 must be captured with Editor0.2.56; synthetic swap tests do not prove live Figma acceptance.','Two historical Spinner suites still depend on previously deleted source files and are not included.','Core Amount does not enforce uniform color/typography from AmountStyles.']};
if(process.argv.includes('--record'))fs.writeFileSync(path.join(root,'reports/owner-boundaries-r3.2026-09-29.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
