import hashlib
import json
import shutil
from pathlib import Path

root = Path(__file__).resolve().parent
packages = root.parents[1]
run = root.parent / 'reports/skill-evals/link-r1-2026-10-10'
workspace = root.parents[5]

def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, d):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

assert not (run / 'seal.json').exists(), 'Do not reopen a sealed eval'
checks = read(root / 'reports/package-checks.r1.json')
technical = read(run / 'technical/technical-report.json')
operators = read(root / 'reports/operator-checks.r1.json')
manual = read(root / 'contract.manual.json')
registry = read(root / 'reports/registry-sync.r1.json')
compiled = read(root / 'compiled/component-contract.v2.json')
zip_path = packages / 'Link.component-contract.zip'
assert checks['valid'] and technical['valid'] and technical['roundtrip'] == 'PASS'
assert read(run / 'technical/component-contract.v2.json') == compiled
assert sha(zip_path) == checks['zipSha256']
assert registry['manualSourceHash'] == checks['manualHash'] and registry['readbackVerified']
assert all(r['status'] == 'draft' for r in manual['rules'])
assert sha(packages / 'BenefitCard.component-contract.zip') == 'd2d93913ac82a7dd08eb8870d35afa4eeeb514dc42aa5eb7d9390ddf76742bed'

# Remove only the duplicate created during this unsealed authoring run.
old = root / 'sources/design-system_ab/JSONS/web/components/web-core/core/Link/contract.generated.json'
reference = old.with_name('contract.generated.json.reference.txt')
if old.exists():
    assert sha(old) == sha(reference)
    old.unlink()

item = {
    'name': 'Link', 'componentId': 'core.web.link', 'contractId': 'core.web.link',
    'revision': 1, 'file': zip_path.name, 'status': 'draft',
    'statusScope': 'Draft: native API / shared-core roundtrip / scoped local operator checks; Editor live and source conflicts pending',
    'sourceRules': 18, 'ruleIR': 32, 'nonExecutableRules': 3,
    'sourceRoutes': {'predicate': 10, 'policy-only': 5, 'context-only': 3},
    'ruleStatuses': {'draft': 18}, 'zipSha256': sha(zip_path), 'bytes': zip_path.stat().st_size,
    'manualSourceHash': checks['manualHash'], 'manualEntrySha256': sha(root / 'contract.manual.json'),
    'compiledHash': checks['compiledHash'], 'zipIncludesHostCompiled': True,
    'representations': [{k: r[k] for k in ['id', 'kind', 'platform', 'status']} for r in manual['representations']],
    'sourceManual': 'experiments/current-contract-packages/Link/authoring/contract.manual.json',
    'sourceCompiled': 'experiments/current-contract-packages/Link/authoring/compiled/component-contract.v2.json',
    'sourceReadme': 'experiments/current-contract-packages/Link/authoring/README.md',
    'sharedAuthoringRevision': 1, 'sharedAuthoringManualMatches': True,
    'dependencies': [], 'dependencyClosure': 'NO_CHILD_PINS; global icon asset policy pending',
    'sourceClosure': 'PINNED_SOURCE_DOCS_AND_NATIVE_CAPTURES_EMBEDDED; FOUR_SOURCE_DRIFTS_OPEN',
    'preparationAccepted': False, 'fullAcceptance': False, 'wholeReady': False,
    'coverageMap': 'Link/authoring/coverage-map.json',
    'caseMatrix': 'Link/authoring/case-matrix.json',
    'skillEval': 'Link/reports/skill-evals/link-r1-2026-10-10/eval.json',
    'packageChecks': 'Link/authoring/reports/package-checks.r1.json',
    'nativeLive': 'NOT_RUN_USER_ONLY', 'sourceDrift': 'Link/authoring/reports/source-drift.json',
    'testBoard': 'https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67846',
    'parentIntegration': 'BenefitCard r5 remains unchanged; add accepted Link pin later',
}
for name in ['manifest.json', 'draft-manifest.json']:
    p = packages / name
    d = read(p)
    assert not any(x['contractId'] == item['contractId'] for x in d['packages']), 'Unexpected existing Link entry'
    d['packages'].append(item)
    d['updatedAt'] = '2026-10-10T00:15:00Z'
    write(p, d)

evidence = ['candidate/contract.manual.json', 'candidate/coverage-map.json', 'candidate/case-matrix.json',
            'technical/technical-report.json', 'technical/operator-checks.r1.json', 'technical/registry-sync.r1.json']
for name in ['package-checks.r1.json', 'operator-checks.r1.json', 'registry-sync.r1.json',
             'source-drift.json', 'generated-source-regression.r1.json']:
    shutil.copyfile(root / 'reports' / name, run / 'technical' / name)
shutil.copyfile(zip_path, run / 'candidate' / zip_path.name)
write(run / 'candidate/manifest-entry.json', item)
for name in ['README.md', 'TEST_CASES.ru.md']:
    shutil.copyfile(root / name, run / 'candidate' / name)
for name in ['figma-board-created.r1.json', 'figma-board-readback.r1.json', 'figma-board-final-readback.r1.json']:
    shutil.copyfile(root.parent / 'reports' / name, run / 'technical' / name)

criteria = [
    {'id': 'semantic-fidelity', 'status': 'PARTIAL', 'evidence': evidence[:2],
     'gaps': ['Four source conflicts and exact View token mapping require owner decision',
              'New observed API limits/defaults are Draft, not approved universal norms']},
    {'id': 'source-completeness', 'status': 'PASS', 'evidence': ['candidate/coverage-map.json'],
     'gaps': ['PASS means source preservation and route mapping; section support is not identity-based norm acceptance']},
    {'id': 'bindings-prerequisites', 'status': 'PARTIAL', 'evidence': ['technical/operator-checks.r1.json'],
     'gaps': ['Four native variant bindings/eight targets locally resolved; public swap/configured-state live pending',
              'Mode catalogs, host variable usage and style/paint evidence omitted from scoped counterfactual snapshot']},
    {'id': 'schema-compile', 'status': 'PASS', 'evidence': ['technical/validation-report.json', 'technical/technical-report.json'], 'gaps': []},
    {'id': 'preservation-roundtrip', 'status': 'PARTIAL', 'evidence': ['technical/package-checks.r1.json', 'technical/technical-report.json'],
     'gaps': ['Exact manual/compiled/available facts survive core ZIP reopen; installed Editor UI NOT_RUN_USER_ONLY',
              'Native captures are not the complete installed Editor capture schema']},
    {'id': 'case-behavior', 'status': 'PARTIAL', 'evidence': ['technical/operator-checks.r1.json', 'candidate/case-matrix.json'],
     'gaps': ['32 local native-derived counterfactual checks pass; all installed Editor live tests pending',
              'LINK-13 physical mutation could not be prepared by Plugin API; expected >24 violation retained',
              'Public slots/BOOL conditions, more baseline properties and capture UNKNOWN remain to test']},
    {'id': 'status-scope', 'status': 'PASS', 'evidence': ['technical/operator-checks.r1.json', 'technical/registry-sync.r1.json', 'candidate/manifest-entry.json'],
     'gaps': ['No Ready/release/independent review claim; ordinary runtime keeps 32 Draft rules not-evaluable']},
]
eval_data = {'schemaVersion': 'apollo.contract-authoring-eval.v1', 'runId': run.name,
    'caseId': 'link-r1-universal-native-api', 'skill': {'version': '0.1.3', 'snapshotPins': 'skill-snapshot/pins.json'},
    'evidenceKind': 'native capture + counterfactual operator checks + actual shared-core roundtrip',
    'evaluationMode': 'retrospective candidate evaluation',
    'review': {'author': 'Codex', 'reviewer': 'same author', 'independent': False},
    'criteria': criteria, 'overall': 'PARTIAL',
    'acceptedScope': ['current-schema compilation without issues', 'exact shared-core manual/compiled/facts roundtrip',
        'four observed native variants/eight declared targets', '32 explicit local operator checks', '23 Google rows reread'],
    'gaps': [g for c in criteria for g in c['gaps']], 'errors': [],
    'learning': {'skillChange': False, 'reason': 'No demonstrated defect in v0.1.3; applied after initial authoring',
        'centralRegistrySync': 'deferred: preserve pinned skill/consumer snapshot; durable eval stored locally'},
    'liveAcceptance': False, 'readyAdmission': False, 'releaseAdmission': False}
write(run / 'eval.json', eval_data)
write(run / 'lessons.json', {'schemaVersion': 'apollo.contract-authoring-lessons.v1', 'lessons': [
    {'id': 'link.old-generated-input-precedence', 'status': 'verified', 'cause': 'conflicting active importer inputs',
     'beforeAfter': 'technical/generated-source-regression.r1.json',
     'observed': 'Old generated JSON replaces fresh four-variant native anatomy with six old variants',
     'decision': 'Keep exact old bytes as reference text; do not import as active evidence', 'skillChange': False},
    {'id': 'link.native-fact-keys', 'status': 'observed-corrected', 'cause': 'authoring error before skill application',
     'observed': 'text.textCase/text.textDecoration/text.autoResize were incorrect; current core uses text.case/text.decoration/text.textAutoResize',
     'evidence': 'candidate/contract.manual.json', 'limitation': 'Initial candidate bytes not retained; no controlled before/after skill regression claim'},
    {'id': 'link.property-activity-gates', 'status': 'observed-corrected', 'cause': 'incomplete compact test snapshot',
     'observed': 'Missing propertyActivityV1 caused gap/padding operator UNKNOWN; native activity capture added',
     'evidence': 'technical/operator-checks.r1.json', 'limitation': 'Initial snapshot not preserved; final scoped tests pass'},
    {'id': 'link.geometry-fixture-limitation', 'status': 'verified-limitation', 'cause': 'Plugin API nested geometry override did not persist',
     'observed': 'resize remained 24; rescale rejected; larger public icon swap preserved 24 dimensions',
     'decision': 'Restore clean native asset; mark fixture pending; retain expected negative height rule',
     'evidence': 'technical/figma-board-final-readback.r1.json', 'skillChange': False},
], 'measurements': {'speedImprovement': 'NOT_MEASURED'}})

groups = {
    'Каталоги': ['JSONS/web/components/web-core/core/Web _ Core -- Link.json',
        'JSONS/styles/Web _ Typography.json', 'JSONS/tokens/001 _ Interface Dynamic Colors.json',
        'JSONS/tokens/Web _ Themization.json'],
    'Агентские файлы': [f'JSONS/web/components/web-core/core/Link/{n}' for n in
        ['agent-context.json', 'rules.json', 'composition-contract.json', 'contract.generated.json',
         'contract.overrides.json', 'examples.json', 'audit-mapping.json']],
    'Паттерны': ['patterns/p_link.md'], 'Редполитика': ['redpolrules/redpol_rules_context.md'],
}
report = {'schemaVersion': 'link.figma-context-report.v1', 'fileKey': 'I3MsagXR8Tz2eZcGtIgUk8',
    'pageId': '8701:32684', 'sectionId': '13666:67846', 'parentId': '13573:169065',
    'components': ['native Link S', 'native Link S + glyph20', 'native Link M', 'native Link L'],
    'contextFiles': {g: [{'path': str(workspace / 'shared/design-system_ab' / p),
                         'sha256': sha(workspace / 'shared/design-system_ab' / p)} for p in paths]
                    for g, paths in groups.items()},
    'scope': 'fixed illustrative test matrix in laboratory; no product page or CorporatePage shell',
    'layout': {'width': 2400, 'height': 1260, 'columns': 4, 'cell': [560, 220], 'gap': 24,
        'position': [15191, 100], 'nativeBaselineGaps': {'S': 4, 'S20': 4, 'M': 8, 'L': 8}},
    'checks': ['Published catalog keys, no detach/local substitute; library natural dimensions retained',
        '33 annotation text nodes have DS typography and color bindings',
        'Section surface bound to base-bg/primary', 'Screenshot inspected: no overlap',
        'Negative cases deliberately override requested native facts; title/copy explains test',
        'Existing contracts parent changed only by append of new section; existing siblings unchanged'],
    'compromises': ['LINK-13 remains fixture pending; geometry mutation not fabricated',
                    'Absolute positions only within fixed illustrative matrix'],
    'liveContractEvaluation': False}
write(root.parent / 'reports/figma-context.r1.json', report)
write(run / 'technical/figma-context.r1.json', report)
write(root.parent / 'reports/handoff.r1.json', {
    'componentId': 'core.web.link', 'revision': 1, 'status': 'draft',
    'zipSha256': sha(zip_path), 'manualSourceHash': checks['manualHash'], 'compiledHash': checks['compiledHash'],
    'wholeReady': False, 'live': 'NOT_RUN_USER_ONLY', 'eval': str(run / 'eval.json'),
    'firstTests': ['LINK-03 baseline', 'LINK-09 violation then restore gap 8 on same instance',
                   'LINK-12 violation then restore fontSize 16 on same instance'],
    'dependencyPlan': ['Link acceptance → BenefitCard pin', 'IconView', 'BackgroundPlate', 'global icon asset policy'],
    'writesClosed': True})
pins = [{'path': str(p.relative_to(run)), 'sha256': sha(p)} for p in sorted(run.rglob('*')) if p.is_file()]
write(run / 'seal.json', {'schemaVersion': 'apollo.contract-authoring-eval-seal.v1', 'runId': run.name,
    'writesClosed': True, 'pins': pins, 'workingPackageSha256': sha(zip_path),
    'reviewIndependent': False, 'overall': 'PARTIAL', 'wholeReady': False})
print(json.dumps({'manifestAdded': 'Link r1 Draft', 'eval': 'PARTIAL', 'sealedFiles': len(pins),
                  'localChecks': len(operators['checks']), 'zipSha256': sha(zip_path)}))
