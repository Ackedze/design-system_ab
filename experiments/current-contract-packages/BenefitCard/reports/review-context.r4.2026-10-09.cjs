const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const component = path.resolve(__dirname, '..'), packages = path.resolve(component, '..');
const workspace = path.resolve(packages, '../../../..');
const core = require(path.join(workspace, 'projects/Apollo-v3/packages/component-contract-core/dist/core.cjs'));
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const wire = value => JSON.parse(JSON.stringify(value));
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manual = read(path.join(component, 'authoring/contract.manual.json'));
const compiled = read(path.join(component, 'authoring/compiled/component-contract.v2.json'));
const evaluated = wire(core.prepareAuthoringPreviewContract(compiled));
const planPath = path.join(__dirname, 'figma-test-plan.r4.json'), plan = read(planPath);
const byInstance = new Map(plan.cases.map(c => [c.figma.instanceId, c]));
const expected = {
  'BC4-V01': ['compliant','compliant'], 'BC4-V17': ['compliant','compliant'],
  'BC4-109': ['compliant','violation'], 'BC4-110': ['compliant','violation'],
  'BC4-111': ['compliant','not-applicable'], 'BC4-112': ['compliant','not-applicable'],
  'BC4-113': ['violation','compliant'], 'BC4-114': ['violation','compliant'],
  'BC4-115': ['human-review','compliant'], 'BC4-116': ['human-review','compliant'],
  'BC4-117': ['compliant','human-review'], 'BC4-118': ['compliant','human-review'],
};
const names = fs.readdirSync(component).filter(name => /^benefit-card\.validation-report\.2026-10-09T13-(55|56|57|58)-\d\d-\d{3}Z\.json$/.test(name)
  && name <= 'benefit-card.validation-report.2026-10-09T13-58-19-766Z.json').sort();
assert.equal(names.length, 12);
assert.equal(sha(path.join(packages, 'BenefitCard.component-contract.zip')), '9854199f6be6335efc9849d4eeca3712015f561beed2ef9ae78824ec79e33ca0');
const checks = names.map(name => {
  const file = path.join(component, name), report = read(file), snapshot = report.snapshot;
  const c = byInstance.get(snapshot.source.rootNodeId);
  assert(c && expected[c.id], `Unexpected instance in ${name}`);
  assert.equal(report.editorVersion, 'component-contract-editor@0.2.94');
  assert.equal(report.run.manualRevision, 4);
  assert.deepEqual(report.sources.manual, manual);
  assert.deepEqual(report.sources.compiledContract, compiled);
  assert.deepEqual(report.runtime.evaluatedContract, evaluated);
  assert.equal(core.stableHash(manual), report.run.manualSourceHash);
  assert.equal(core.stableHash(snapshot), report.run.snapshotHash);
  assert.equal(core.stableHash(evaluated), report.run.evaluatedContractHash);
  assert.equal(core.validationSnapshotHash(snapshot, evaluated), report.run.engineSnapshotHash);
  assert.equal(snapshot.source.truncated, false);
  assert.equal(snapshot.source.captureTopology.complete, true);
  assert.deepEqual(report.run.capture.warnings, []);
  assert.equal(snapshot.source.componentKey, c.key);
  assert.equal(report.run.context.platform, c.platform);
  assert.deepEqual(snapshot.validationIntent.values, c.context);
  assert(snapshot.declaredTargetIdentitiesV1.targets.every(t => t.status === 'resolved'));
  const replay = core.evaluateCompiledContract(snapshot, evaluated);
  assert.deepEqual(wire(replay), report.results.engine);
  assert.deepEqual(wire(core.buildEditorValidationReport(replay,
    {contract: compiled, issues: report.sources.compilerIssues}, manual, snapshot)), report.results.editor);
  const viewportId = `component:web.benefit-card-platform-version-must-match.${c.platform}.1.1`;
  const hugId = 'component:web.benefit-card.vertical-resizing-policy.1.1';
  const target = [viewportId, hugId].map(id => replay.evaluations.find(e => e.ruleId === id));
  assert(target.every(Boolean));
  assert.deepEqual(target.map(e => e.classification), expected[c.id]);
  assert.deepEqual(replay.evaluations.filter(e => e.classification === 'violation').map(e => e.ruleId).sort(),
    target.filter(e => e.classification === 'violation').map(e => e.ruleId).sort());
  assert.deepEqual(replay.evaluations.filter(e => e.classification === 'human-review').map(e => e.ruleId).sort(),
    target.filter(e => e.classification === 'human-review').map(e => e.ruleId).sort());
  assert.equal(report.summary.complete, false);
  assert.equal(report.summary.notExecuted, 3);
  return {caseId: c.id, platform: c.platform, file: name, sha256: sha(file), instanceId: c.figma.instanceId,
    figmaUrl: c.figma.url, context: c.context, expected: expected[c.id],
    actual: target.map(e => ({ruleId: e.ruleId, classification: e.classification,
      applicability: e.applicability, trace: e.trace})), expectedResultsMatched: true,
    hashesVerified: true, exactEngineReplay: true, exactEditorReplay: true,
    captureComplete: true, captureWarnings: [], allDeclaredTargetsResolved: true,
    fullScenarioComplete: false, notExecuted: 3, scopedContextAcceptance: true, fullCardAcceptance: false};
});
assert.equal(new Set(checks.map(c => c.caseId)).size, 12);
const targetCounts = {};
for (const c of checks) for (const e of c.actual) targetCounts[e.classification] = (targetCounts[e.classification] || 0) + 1;
const stem = 'context-live-review.r4.2026-10-09';
const receipt = {schemaVersion: 'benefit-card.live-test-review.v1', date: '2026-10-09',
  status: 'PASS_INSTALLED_EDITOR_VIEWPORT_HUG_SCOPE', revision: 4, editorVersion: '0.2.94', sharedCoreVersion: '0.1.13',
  archiveSha256: sha(path.join(packages, 'BenefitCard.component-contract.zip')), manualSourceHash: core.stableHash(manual),
  compiledHash: core.stableHash(compiled), totals: {reports: 12, matchedCases: 12, targetedEvaluations: 24,
    classifications: targetCounts, unexpectedViolations: 0, unexpectedUnknown: 0},
  scope: 'Explicit ViewportClass and CardPlacement; D/M positive, mismatch, single Fixed, group Fixed, and deliberately missing context.',
  authoringPreview: true, draftRulesActivated: true, fullComponentAcceptance: false,
  sourceRulesChanged: false, contractChanged: false, ruleReviewStatusChanged: false, productionPublication: false,
  installedApolloAcceptance: false, remainingReadingGaps: ['PLATE_FORBIDDEN_PROPERTIES','ICON_GRAPHIC_APPLICABILITY','BACKGROUND_FALSE_APPLICABILITY'],
  pairedBacklogId: 'CC-COMPAT-NATIVE-CARD-FACTS-03', reports: checks};
fs.writeFileSync(path.join(__dirname, stem + '.json'), JSON.stringify(receipt, null, 2) + '\n');
const label = c => c === 'compliant' ? 'Соответствует' : c === 'violation' ? 'Нарушение'
  : c === 'not-applicable' ? 'Неприменимо' : 'UNKNOWN (ожидаемый)';
fs.writeFileSync(path.join(__dirname, stem + '.md'), [
  '# BenefitCard r4 — живая проверка viewport и Hug, 09.10.2026', '',
  '**12/12 кейсов совпали с ожиданием.** Проверен установленный Editor 0.2.94 / core 0.1.13. Exact source/snapshot/runtime hashes, engine и Editor replay совпали. Capture complete, warnings=0; все declared targets resolved. ZIP, нормы и Draft-статусы не изменены.', '',
  'Целевые 24 оценки: 14 compliant, 4 ожидаемых violation, 2 not-applicable и 4 ожидаемых UNKNOWN. Незаданный контекст сохраняет UNKNOWN; group исключает Hug одиночной карточки. Неправильный viewport и Fixed single обнаруживаются на D/M.', '',
  '| Кейс | ViewportClass | CardPlacement | Viewport | Hug | Отчёт |',
  '| --- | --- | --- | --- | --- | --- |',
  ...checks.map(c => `| [${c.caseId}](${c.figmaUrl}) | ${c.context.ViewportClass || 'Не задано'} | ${c.context.CardPlacement || 'Не задано'} | ${label(c.actual[0].classification)} | ${label(c.actual[1].classification)} | [JSON](../${c.file}) |`), '',
  'Контекстные проверки приняты в указанной области Editor. Все полные сценарии остаются incomplete с тремя nonExecutable rules; это не приёмка всей карточки, Source Reviewed/Ready или installed Apollo. Чтение BackgroundPlate BC4-307–312, Graphic=Icon BC4-319/320 и Background=False остаётся открытым. Остальные группы борда ещё не проверены.', '',
  `Доказательства: [${stem}.json](${stem}.json). Результаты первого столбца сохраняются отдельно в [первом разборе](first-column-live-review.r4.2026-10-09.md).`, ''
].join('\n'));
plan.liveContextReview = {date: receipt.date, evidence: stem + '.json', status: receipt.status, totals: receipt.totals,
  fullComponentAcceptance: false, installedApolloAcceptance: false};
for (const c of plan.cases) {
  const check = checks.find(r => r.caseId === c.id);
  if (check) c.liveContextEvidence = {review: stem + '.json', report: check.file, sha256: check.sha256,
    expectedResultsMatched: true, scopedContextAcceptance: true, fullCardAcceptance: false};
}
fs.writeFileSync(planPath, JSON.stringify(plan, null, 2) + '\n');
console.log(JSON.stringify({status: receipt.status, totals: receipt.totals, exactReplay: true, contractChanged: false}));
