const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const repo = path.resolve(__dirname, '../..');
const root = path.join(repo, 'experiments/web-core/core/Button');
const core = require(path.resolve(repo, '../../projects/ComponentContractEditor/dist/core.cjs'));
const review = JSON.parse(fs.readFileSync(path.join(root, 'qa/ownership-scope-live-review.2026-09-27.json')));
const reports = review.reportResults.map(item => {
  const bytes = zlib.gunzipSync(fs.readFileSync(path.join(root, item.fixtureFile)));
  return { item, bytes, r: JSON.parse(bytes) };
});
const clone = x => JSON.parse(JSON.stringify(x));
const get = id => reports.find(x => x.item.caseId === id).r;
const failures = r => r.results.engine.evaluations.filter(e => e.classification === 'violation');
const hiddenIds = ['component:web-core.button.label-and-hint-color-locked', 'component:web-core.button.label-text-style-locked'];

// Original r17 bytes retain the 0.2.35 presenter defect. 0.2.36 intentionally
// changes only reasonLabel/showComparison on the proven scope exclusions.
function correctedDetails(r) {
  return r.results.details.map(d => {
    if (d.classification !== 'not-applicable') return d;
    const trace = r.results.engine.evaluations.find(e => e.evaluationId === d.id)?.trace;
    const owned = trace?.children?.some(t => t.predicate === 'equals' && t.actual === false
      && t.expected === true && t.truth === 'false' && t.factPaths.includes('ruleScopeV1.local'));
    if (owned) return { ...d, showComparison: false,
      reasonLabel: 'Область принадлежит подтверждённому вложенному контракту; внутренние свойства проверяются его правилами' };
    if (d.factPath === 'ruleScopeV1.targets.text.visible') return { ...d, showComparison: false,
      reasonLabel: 'Цель доказанно скрыта или отсутствует в варианте; стилевое правило не применяется по условию контракта' };
    return d;
  });
}
for (const { item, bytes, r } of reports) test(`${item.caseId}: immutable r17 report, exact verdict/coverage replay and scope-only presentation delta`, () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256);
  assert.equal(r.editorVersion, 'component-contract-editor@0.2.35');
  assert.equal(r.run.manualRevision, 17);
  assert.equal(r.snapshot.source.rootNodeId, item.nodeId);
  assert.equal(r.run.context.product, review.context.product);
  assert.equal(core.stableHash(r.sources.manual), review.manualSourceHash);
  assert.equal(core.stableHash(r.sources.compiledContract), review.compiledHash);
  assert.equal(core.stableHash(r.runtime.evaluatedContract), review.evaluatedContractHash);
  assert.equal(r.run.manualSourceHash, review.manualSourceHash);
  assert.equal(r.run.evaluatedContractHash, review.evaluatedContractHash);
  const child = r.sources.compiledContract.componentDependencies[0];
  assert.equal(child.revision, review.dependency.revision);
  assert.equal(core.stableHash(child.contract), review.dependency.compiledHash);
  assert.equal(r.snapshot.source.truncated, false);
  assert.equal(r.snapshot.nodes.length, item.matchedNodes);
  assert.equal(r.run.capture.matchedBaselineNodes, item.matchedNodes);
  assert.deepEqual(r.run.capture.warnings, []);
  assert.deepEqual(r.run.capture.unmatchedBaselineNodeIds, []);
  const engine = core.evaluateCompiledContract(r.snapshot, r.runtime.evaluatedContract);
  const editor = core.buildEditorValidationReport(engine, { contract: r.sources.compiledContract, issues: r.sources.compilerIssues }, r.sources.manual, r.snapshot);
  const details = clone(core.buildEvaluationDetails(editor, r.runtime.evaluatedContract, r.anatomy));
  assert.deepEqual(engine, r.results.engine);
  assert.deepEqual(editor, r.results.editor);
  const expectedDetails = correctedDetails(r);
  assert.equal(details.length, expectedDetails.length);
  details.forEach((d, i) => assert.deepEqual(d, expectedDetails[i], `${item.caseId}: ${d.ruleId} ${d.nodeId}`));
  assert.equal(engine.evaluations.length, item.engineEvaluations);
  const nested = engine.evaluations.filter(e => e.dependency);
  assert.equal(nested.length, item.dependencyEvaluations);
  assert.ok(nested.every(e => e.ruleId.includes('.spinner.') && e.dependency.compiledHash === review.dependency.compiledHash));
  assert.ok(nested.every(e => r.anatomy.some(n => n.id === e.subjectNodeId)));
  const found = details.filter(e => e.classification === 'violation');
  assert.equal(found.length, item.atomicViolations);
  assert.equal(core.groupEvaluationDetails(found).length, item.uiCards);
  assert.equal(editor.scenarioCoverage.complete, false);
  assert.equal(editor.scenarioCoverage.notExecuted, item.notExecuted);
  assert.equal(editor.scenarioCoverage.inconclusive, 0);
  assert.deepEqual(editor.evaluations.filter(e => e.classification === 'not-executed').map(e => e.ruleId).sort(), [...review.pendingRuleIds].sort());
  assert.equal(editor.contractReadiness.status, 'draft');
});

test('BS03: parent nominal Size remains mandatory while Spinner24 is intrinsically valid', () => {
  const r = get('BS03'), found = failures(r);
  assert.equal(found.length, 1);
  assert.equal(found[0].dependency, undefined);
  assert.equal(found[0].ruleId, 'component:web-core.button.addon-size-follows-button-size.1.8.1');
  const detail = r.results.details.find(e => e.classification === 'violation');
  assert.equal(detail.actual, '24'); assert.deepEqual(detail.expected, ['16']);
  const spinner = r.snapshot.nodes.find(n => n.name === 'Spinner');
  assert.equal(spinner.component.properties.Size, '24');
  assert.equal(spinner.bounds.width, 24); assert.equal(spinner.bounds.height, 24);
});

test('BS04: inactive gaps do not fail; six host geometry cards and two child bounds cards remain', () => {
  const r = get('BS04'), child = failures(r).filter(e => e.dependency);
  assert.equal(child.length, 2);
  assert.ok(child.every(e => e.ruleId.includes('spinner.intrinsic-size-required')));
  for (const id of ['preview:2', 'preview:3']) {
    const node = r.snapshot.nodes.find(n => n.id === id);
    assert.equal(node.propertyActivityV1.gapApplicable, false);
    assert.equal(node.baseline.effective.propertyActivityV1.gapApplicable, false);
    assert.equal(r.results.details.filter(e => e.nodeId === id && e.classification === 'violation' && e.factPath === 'layout.itemSpacing').length, 0);
  }
  const groups = core.groupEvaluationDetails(r.results.details.filter(e => e.classification === 'violation'));
  assert.equal(groups.filter(g => g.evaluations.every(e => e.nodeId === 'preview:0')).length, 6);
  const bounds = r.results.details.filter(e => e.classification === 'violation' && e.ruleId.includes('spinner.intrinsic-size-required'));
  assert.deepEqual(bounds.map(e => e.factPath).sort(), ['bounds.height', 'bounds.width']);
  assert.ok(bounds.every(e => e.actual === 30 && e.expected === 24));
});

test('BS05: only Spinner owns its opacity, both original source rules retained in one card', () => {
  const r = get('BS05'), found = failures(r);
  assert.equal(found.length, 2); assert.ok(found.every(e => e.dependency));
  assert.deepEqual(found.map(e => e.ruleId).sort(), [
    'component:core.web.spinner.root.visual-style-1.3.1',
    'component:web-core.spinner.layer-properties-use-effective-baseline.1.3',
  ]);
  const groups = core.groupEvaluationDetails(r.results.details.filter(e => e.classification === 'violation'));
  assert.equal(groups.length, 1); assert.equal(groups[0].evaluations.length, 2);
  assert.ok(groups[0].evaluations.every(e => e.actual === .5 && e.expected === 1));
});

test('BS01-BS06: hidden text rules are genuinely not-applicable, not missing-target gaps', () => {
  for (const { r, item } of reports.filter(x => x.item.caseId !== 'BS07')) {
    const text = r.snapshot.nodes.find(n => n.semantic.role === 'text');
    assert.equal(text.visibility.effective, false, item.caseId);
    for (const id of hiddenIds) {
      const entries = r.results.engine.evaluations.filter(e => e.ruleId.startsWith(id + '.'));
      assert.equal(entries.length, 1, item.caseId);
      assert.equal(entries[0].classification, 'not-applicable');
      assert.equal(entries[0].trace.truth, 'false');
    }
    assert.equal(r.results.editor.evaluations.filter(e => e.classification === 'not-executed' && hiddenIds.includes(e.ruleId)).length, 0);
  }
});

test('BS06 right binding executes and BS07 ordinary icon does not execute Spinner checks', () => {
  assert.equal(get('BS06').results.engine.dependencyRuns.find(d => d.bindingId === 'right').status, 'executed');
  assert.equal(get('BS06').results.engine.dependencyRuns.find(d => d.bindingId === 'left').reason, 'target-hidden');
  assert.equal(get('BS07').results.engine.evaluations.filter(e => e.dependency).length, 0);
  assert.deepEqual(get('BS07').results.engine.dependencyRuns.map(d => d.reason), ['owner-variant-inactive', 'target-hidden']);
  assert.equal(failures(get('BS07')).length, 0);
});

test('r17 explanation defect is preserved in the original report, corrected by the current presenter only', () => {
  const r = get('BS01');
  const current = core.buildEvaluationDetails(r.results.editor, r.runtime.evaluatedContract, r.anatomy);
  for (const id of ['component:web-core.button.label-text-style-locked.1.1', 'component:core.web.button.root.visual-style-1.1.1']) {
    const node = id.includes('label-text') ? 'preview:0' : 'preview:3';
    const evaluation = r.results.engine.evaluations.find(e => e.ruleId === id && e.subjectNodeId === node);
    assert.equal(evaluation.classification, 'not-applicable');
    assert.ok(evaluation.trace.children.some(t => t.truth === 'false' && t.actual === false && t.factPaths.some(p => p.startsWith('ruleScopeV1.'))));
    const detail = r.results.details.find(e => e.ruleId === id && e.nodeId === node);
    assert.equal(detail.reasonLabel, 'Условие применения правила не выполнено; ограничение не проверялось');
    assert.equal(detail.showComparison, true);
    assert.deepEqual(detail.actual, ['true', 'false']);
    assert.equal(detail.expected, 'all true');
    const corrected = current.find(e => e.ruleId === id && e.nodeId === node);
    assert.equal(corrected.showComparison, false);
    assert.match(corrected.reasonLabel, id.includes('label-text') ? /Цель доказанно скрыта/ : /подтверждённому вложенному контракту/);
    assert.deepEqual({ ...corrected, reasonLabel: detail.reasonLabel, showComparison: detail.showComparison }, detail);
  }
  assert.equal(review.openIssues[0].id, 'rule-scope-diagnostic-boolean-trace');
  assert.equal(review.openIssues[0].fixedInThisReview, false);
});
