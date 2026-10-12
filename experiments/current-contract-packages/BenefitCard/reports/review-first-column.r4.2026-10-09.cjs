const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const component = path.resolve(__dirname, '..'), packages = path.resolve(component, '..');
const workspace = path.resolve(packages, '../../../..');
const core = require(path.join(workspace, 'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const wire = value => JSON.parse(JSON.stringify(value));
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const counts = evaluations => evaluations.reduce((out, e) => {
  out[e.classification] = (out[e.classification] || 0) + 1;
  return out;
}, {});
const stem = 'first-column-live-review.r4.2026-10-09';
const manual = read(path.join(component, 'authoring/contract.manual.json'));
const compiled = read(path.join(component, 'authoring/compiled/component-contract.v2.json'));
const expectedContract = wire(core.prepareAuthoringPreviewContract(compiled));
const planPath = path.join(__dirname, 'figma-test-plan.r4.json');
const plan = read(planPath);
const cases = plan.cases.filter(c => [0, 3].includes(c.group));
const byInstance = new Map(cases.map(c => [c.figma.instanceId, c]));
const names = fs.readdirSync(component).filter(name => /^benefit-card\.validation-report\.2026-10-09T13-\d\d-\d\d-\d{3}Z\.json$/.test(name)
  && name <= 'benefit-card.validation-report.2026-10-09T13-27-25-605Z.json').sort();
assert.equal(cases.length, 52);
assert.equal(names.length, 52);
assert.equal(plan.manualSourceHash, core.stableHash(manual));
assert.equal(sha(path.join(packages, 'BenefitCard.component-contract.zip')), '9854199f6be6335efc9849d4eeca3712015f561beed2ef9ae78824ec79e33ca0');
const checks = names.map(name => {
  const file = path.join(component, name), report = read(file);
  const c = byInstance.get(report.snapshot.source.rootNodeId);
  assert(c, `Unknown test instance in ${name}`);
  assert.equal(report.editorVersion, 'component-contract-editor@0.2.94');
  assert.equal(report.run.manualRevision, 4);
  assert.deepEqual(report.sources.manual, manual);
  assert.deepEqual(report.sources.compiledContract, compiled);
  assert.deepEqual(report.runtime.evaluatedContract, expectedContract);
  assert.equal(core.stableHash(report.sources.manual), report.run.manualSourceHash);
  assert.equal(core.stableHash(report.snapshot), report.run.snapshotHash);
  assert.equal(core.stableHash(report.runtime.evaluatedContract), report.run.evaluatedContractHash);
  assert.equal(core.validationSnapshotHash(report.snapshot, report.runtime.evaluatedContract), report.run.engineSnapshotHash);
  assert.equal(report.snapshot.source.truncated, false);
  assert.equal(report.snapshot.source.captureTopology.complete, true);
  assert.deepEqual(report.run.capture.warnings, []);
  assert.equal(report.snapshot.source.componentKey, c.key);
  assert.equal(report.run.context.platform, c.platform);
  assert.deepEqual(report.snapshot.validationIntent.values, {});
  const replay = core.evaluateCompiledContract(report.snapshot, report.runtime.evaluatedContract);
  assert.deepEqual(wire(replay), report.results.engine);
  assert.deepEqual(wire(core.buildEditorValidationReport(replay,
    {contract: compiled, issues: report.sources.compilerIssues}, manual, report.snapshot)), report.results.editor);
  const targeted = replay.evaluations.filter(e => c.IR.includes(e.ruleId));
  assert.equal(new Set(targeted.map(e => e.ruleId)).size, c.IR.length);
  const violations = replay.evaluations.filter(e => e.classification === 'violation');
  const unknown = replay.evaluations.filter(e => e.classification === 'human-review');
  const expectedViolationFound = c.expected === 'FAIL' && targeted.some(e => e.classification === 'violation');
  const outcome = expectedViolationFound ? 'EXPECTED_VIOLATION_DETECTED_SCOPE_INCOMPLETE'
    : c.expected === 'FAIL' ? 'EXPECTED_VIOLATION_UNRESOLVED'
      : c.expected === 'NOT_APPLICABLE' ? (targeted.every(e => e.classification === 'not-applicable') ? 'EXPECTED_NOT_APPLICABLE' : 'APPLICABILITY_UNRESOLVED')
        : targeted.every(e => e.classification === 'compliant') ? 'TARGET_CHECKS_COMPLIANT_SCOPE_INCOMPLETE' : 'PARTIAL_POSITIVE_CONTEXT_UNRESOLVED';
  // A separate diagnostic replay supplies the board's authored context. It is
  // not a live rerun, does not alter the original report, and grants no acceptance.
  const diagnostic = wire(report.snapshot);
  diagnostic.validationIntent = core.createValidationIntent(diagnostic, expectedContract, c.context);
  const diagnosticResult = core.evaluateCompiledContract(diagnostic, expectedContract);
  const contextRule = e => e.ruleId.includes('platform-version-must-match') || e.ruleId.includes('vertical-resizing-policy');
  const contextBefore = replay.evaluations.filter(contextRule);
  const contextAfter = diagnosticResult.evaluations.filter(contextRule);
  assert.equal(contextBefore.filter(e => e.classification === 'human-review').length, 2);
  assert.equal(contextAfter.filter(e => e.classification === 'compliant').length, 2);
  const summary = e => ({ruleId: e.ruleId, subjectNodeId: e.subjectNodeId, classification: e.classification,
    applicability: e.applicability, reason: e.trace.reason, factPaths: e.trace.factPaths, actual: e.trace.actual, expected: e.trace.expected});
  return {caseId: c.id, group: c.group, platform: c.platform, file: name, sha256: sha(file),
    generatedAt: report.generatedAt, instanceId: c.figma.instanceId, figmaUrl: c.figma.url,
    expected: c.expected, expectedNote: c.expectedNote, outcome, targetEvaluations: targeted.map(summary),
    violations: violations.map(summary), inconclusive: unknown.map(summary), evaluationCounts: counts(replay.evaluations),
    scenarioComplete: report.summary.complete, notExecuted: report.summary.notExecuted,
    expectedContext: c.context, suppliedContext: report.snapshot.validationIntent.values,
    unresolvedTargets: report.snapshot.declaredTargetIdentitiesV1.targets.filter(t => t.status !== 'resolved'),
    capture: report.run.capture, hashesVerified: true, exactEngineReplay: true, exactEditorReplay: true,
    contextDiagnostic: {kind: 'offline-counterfactual-not-live', inputs: c.context, evaluations: contextAfter.map(summary),
      fullScenarioAccepted: false}, liveAccepted: false};
});
assert.equal(new Set(checks.map(c => c.caseId)).size, 52);
const evaluationCounts = {};
for (const check of checks) for (const [key, value] of Object.entries(check.evaluationCounts)) evaluationCounts[key] = (evaluationCounts[key] || 0) + value;
const receipt = {
  schemaVersion: 'benefit-card.live-test-review.v1', date: '2026-10-09', status: 'ANALYZED_PARTIAL_LIVE_FIRST_COLUMN',
  revision: 4, editorVersion: '0.2.94', sharedCoreVersion: '0.1.13',
  archiveSha256: sha(path.join(packages, 'BenefitCard.component-contract.zip')), manualSourceHash: core.stableHash(manual),
  compiledHash: core.stableHash(compiled), sectionUrl: plan.sectionUrl,
  scope: 'Groups 01 and 04 only: 32 native variant baselines and 20 ImageView/BackgroundPlate cases.',
  totals: {reports: checks.length, reportsWithViolations: checks.filter(c => c.violations.length).length,
    expectedNegativeCases: checks.filter(c => c.expected === 'FAIL').length,
    expectedNegativeCasesDetected: checks.filter(c => c.outcome === 'EXPECTED_VIOLATION_DETECTED_SCOPE_INCOMPLETE').length,
    expectedNegativeCasesUnresolved: checks.filter(c => c.outcome === 'EXPECTED_VIOLATION_UNRESOLVED').length,
    applicabilityCasesUnresolved: checks.filter(c => c.outcome === 'APPLICABILITY_UNRESOLVED').length,
    completeScenarios: checks.filter(c => c.scenarioComplete).length, evaluationCounts},
  findings: [
    {id: 'COMPACT_LIBRARY_DRIFT', cases: checks.filter(c => /^BC4-V(09|1[0-6])$/.test(c.caseId)).map(c => c.caseId),
      result: 'All eight desktop Compact=True published variants have Primary and correctly violate Secondary-only.'},
    {id: 'IMAGE_SIZE_CROP_GRID', cases: ['BC4-301','BC4-302','BC4-303','BC4-304','BC4-305','BC4-306'], result: 'All six intended violations detected.'},
    {id: 'PLATE_FORBIDDEN_PROPERTIES', cases: ['BC4-307','BC4-308','BC4-309','BC4-310','BC4-311','BC4-312'],
      result: 'BackgroundColor, Skeleton and Position variant switches lose independent target correspondence; all six intended violations unresolved.'},
    {id: 'PLATE_TOKEN_BINDINGS', cases: ['BC4-313','BC4-314','BC4-315','BC4-316'],
      result: 'All four intended violations detected; each also triggers the related visual baseline lock.'},
    {id: 'ALLOWED_SEGMENT', cases: ['BC4-317','BC4-318'], result: 'All three ImageView locks compliant per case. This proves the scoped allowed Segment setting, not whole-card readiness.'},
    {id: 'ICON_GRAPHIC_APPLICABILITY', cases: ['BC4-319','BC4-320'],
      result: 'Graphic/Image target identity unresolved; three Image rules are human-review instead of not-applicable and Graphic presence is also unresolved.'},
    {id: 'BACKGROUND_FALSE_APPLICABILITY', cases: checks.filter(c => c.caseId.startsWith('BC4-V') && c.unresolvedTargets.some(t => t.targetId === 'target.surface')).map(c => c.caseId),
      result: 'Sixteen Background=False baselines produce five surface human-review evaluations each (selected-binding-unavailable), despite the proven root Background=False condition.'},
    {id: 'CONTEXT_UNSET', cases: checks.map(c => c.caseId),
      result: 'ViewportClass and CardPlacement absent in all live reports. Both checks become compliant in separate offline diagnostic replay with authored board context; this is not live acceptance.',
      ui: 'Expand Ожидаемые параметры; explicitly choose Контекст: Ширина viewport and Контекст: Способ размещения for each selected case. Inputs reset on subject/mode/contract change.'}
  ],
  authoringPreview: true, draftRulesActivated: true, fullComponentAcceptance: false,
  sourceRulesChanged: false, contractChanged: false, ruleReviewStatusChanged: false, productionPublication: false,
  allLiveAccepted: false, pairedBacklogId: 'CC-COMPAT-NATIVE-CARD-FACTS-03', reports: checks,
};
fs.writeFileSync(path.join(__dirname, stem + '.json'), JSON.stringify(receipt, null, 2) + '\n');
const labels = {
  EXPECTED_VIOLATION_DETECTED_SCOPE_INCOMPLETE: 'Нарушение обнаружено; контекст не задан',
  EXPECTED_VIOLATION_UNRESOLVED: 'Пропуск ожидаемого нарушения: UNKNOWN',
  APPLICABILITY_UNRESOLVED: 'UNKNOWN вместо неприменимости',
  TARGET_CHECKS_COMPLIANT_SCOPE_INCOMPLETE: 'Целевые проверки выполнены; сценарий неполный',
  PARTIAL_POSITIVE_CONTEXT_UNRESOLVED: 'Compact проверен; Hug без контекста UNKNOWN',
  EXPECTED_NOT_APPLICABLE: 'Неприменимость подтверждена',
};
const lines = [
  '# BenefitCard r4 — проверка первого столбца, 09.10.2026', '',
  'Проверены 52 пользовательских отчёта Editor 0.2.94: все 32 варианта и 20 кейсов ImageView/BackgroundPlate. Все source/snapshot/runtime hashes совпадают; точный engine и Editor replay воспроизведён. ZIP и нормы не изменены. Проверка выполнялась с активированными Draft-правилами.', '',
  'Из 24 отрицательных кейсов ожидаемое нарушение найдено в 18. Шесть изменений BackgroundColor/Skeleton/Position дали UNKNOWN. Два переключения Graphic=Icon дали UNKNOWN вместо неприменимости правил ImageView. В 16 вариантах Background=False пять проверок отсутствующей подложки дают UNKNOWN.', '',
  'Во всех 52 отчётах ViewportClass и CardPlacement не заданы: viewport и Hug не приняты. В Editor нужно раскрыть «Ожидаемые параметры» и выбрать ширину viewport (desktop/mobile-web) и способ размещения single. Значения сбрасываются при смене проверяемого instance. Отдельный офлайн диагностический replay с контекстом борда подтверждает эти две проверки, но не заменяет живой прогон.', '',
  'Size/Crop/Grid (6 кейсов), fill/stroke bindings (4) и допустимый Segment (2) работают в проверенной области. Восемь desktop Compact=True правильно обнаруживают библиотечное расхождение Title=Primary. Все сценарии остаются неполными; Reviewed/Ready не повышены. Зависимые Link/IconView и standalone admission остаются открытыми.', '',
  '| Кейс | Ожидание | Нарушений | UNKNOWN | Результат | Отчёт |',
  '| --- | --- | ---: | ---: | --- | --- |',
  ...checks.map(c => `| [${c.caseId}](${c.figmaUrl}) | ${c.expected} | ${c.violations.length} | ${c.inconclusive.length} | ${labels[c.outcome]} | [JSON](../${c.file}) |`), '',
  `Машиночитаемые доказательства: [${stem}.json](${stem}.json). Парный backlog: CC-COMPAT-NATIVE-CARD-FACTS-03 в Editor и Apollo v4.`, '',
  'Повторная приёмка после исправления чтения: BC4-307–312 и BC4-319–320; Background=False D/M; затем контроль Size/Crop/Grid, Segment и токенов. Контекстные проверки повторить с явно заполненными полями. Остальные четыре группы борда этой серией не проверены.', ''
];
fs.writeFileSync(path.join(__dirname, stem + '.md'), lines.join('\n'));
plan.liveReview = {date: receipt.date, evidence: stem + '.json', reports: 52, groups: [0,3],
  allLiveAccepted: false, fullComponentAcceptance: false, totals: receipt.totals};
for (const c of plan.cases) {
  const check = checks.find(r => r.caseId === c.id);
  if (check) c.liveEvidence = {review: stem + '.json', report: check.file, sha256: check.sha256,
    outcome: check.outcome, liveAccepted: false, contextMissing: ['ViewportClass','CardPlacement']};
}
fs.writeFileSync(planPath, JSON.stringify(plan, null, 2) + '\n');
console.log(JSON.stringify({status: receipt.status, totals: receipt.totals, exactReplay: true, contractChanged: false}));
