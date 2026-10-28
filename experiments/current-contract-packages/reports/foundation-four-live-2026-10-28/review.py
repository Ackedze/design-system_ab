import gzip
import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DS = ROOT.parents[3]
PREVIOUS = ROOT.parent / 'foundation-four-drafts-2026-10-27'
SOURCE = Path('/Users/alexkukhta/Downloads/apollo-v4-7ec3ad16f068.json')
WORKSPACE = DS.parent.parent
NAMES = ['Text', 'List', 'SegmentedControl', 'Slider']


def pin(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(name, value):
    (ROOT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


raw = SOURCE.read_bytes()
report = json.loads(raw)
assert report['schemaVersion'] == 'apollo.area-audit.v1-experimental'
assert len(report['components']) == 26
(ROOT / 'report.json.gz').write_bytes(gzip.compress(raw, mtime=0))
assert gzip.decompress((ROOT / 'report.json.gz').read_bytes()) == raw
components = {entry['scopeId']: entry for entry in report['components']}
rows, inputs = [], [pin(SOURCE)]
for name in NAMES:
    cases_path = PREVIOUS / name / 'test-cases.json'
    compiled_path = PREVIOUS / name / 'compiled.json'
    cases = json.loads(cases_path.read_text())['cases']
    compiled = json.loads(compiled_path.read_text())
    inputs.extend([pin(cases_path), pin(compiled_path)])
    for case in cases:
        actual = components[case['nodeId']]
        assert actual['result']['contract']['manualSourceHash'] == compiled['package']['manualSourceHash']
        evaluations = actual['result']['engine']['evaluations']
        violations = sorted(e['ruleId'] for e in evaluations if e['classification'] == 'violation')
        expected = sorted(case.get('expectedRuleIds', []))
        known_gap = case['caseId'] == 'SG-09'
        uncertain = [e for e in evaluations if e['classification'] not in ['compliant', 'allowed', 'violation', 'not-applicable']
                     or e['trace'].get('reason') in ['selector matched no visible nodes', 'rule authority is not active']
                     or e.get('collection', {}).get('missing')]
        row = {'caseId': case['caseId'], 'component': name, 'nodeId': case['nodeId'], 'url': case['url'],
               'acceptanceCase': not known_gap, 'expectedRuleIds': expected, 'actualViolationRuleIds': violations,
               'violationExpectationMatched': None if known_gap else violations == expected,
               'classifications': dict(Counter(e['classification'] for e in evaluations)),
               'coverage': actual['result']['coverage'], 'release': actual['release'],
               'uncertainEvaluations': [{'ruleId': e['ruleId'], 'classification': e['classification'],
                                        'reason': e['trace'].get('reason'), 'collectionMissing': e.get('collection', {}).get('missing', [])}
                                       for e in uncertain]}
        rows.append(row)

accepted = [r for r in rows if r['acceptanceCase']]
assert len(accepted) == 25
assert all(r['violationExpectationMatched'] for r in accepted)
assert sum(len(r['actualViolationRuleIds']) for r in rows) == 11
summary = []
for name in NAMES:
    subset = [r for r in accepted if r['component'] == name]
    summary.append({'component': name, 'acceptanceCases': len(subset),
                    'violationExpectationsMatched': sum(r['violationExpectationMatched'] for r in subset),
                    'executionCompleteCases': sum(r['coverage']['executionComplete'] for r in subset)})

blockers = [
    {'id': 'text-inapplicable-fields', 'cases': [r['caseId'] for r in rows if r['component'] == 'Text'],
     'observed': 'Two empty selectors per Text case: owned-text.1.1 layout.mode and owned-text.1.11 appearance.radius. The TEXT target is present; these baseline fields are absent.',
     'nextStep': 'Correct authoring constraints for the actual TEXT capabilities; preserve meaningful baseline/style/token checks. No broad suppression of missing selectors.'},
    {'id': 'slider-empty-text-scope', 'cases': ['SL-01', 'SL-03', 'SL-04', 'SL-05'],
     'observed': 'Nine typography selectors have no visible subject. SL-01 and SL-03 snapshots contain no TEXT nodes; the same empty typography scope occurs in SL-04/SL-05.',
     'nextStep': 'Use a source-proven applicability condition for variants without visible text; keep real missing text evidence inconclusive.'},
    {'id': 'segmented-control-mixed-direct-children', 'cases': ['SG-02', 'SG-03', 'SG-04', 'SG-06', 'SG-09'],
     'observed': 'Both active count/Selected assertions return human-review, collection-members-do-not-cover-reference. Native reference has Segment instances and Divider frames. Current closed memberCollection requires every direct reference child to be an INSTANCE and a listed member.',
     'nextStep': 'Find a supported representation for the segment-only collection, or plan a narrowly scoped operator extension if the existing schema cannot express it. Do not treat decorative dividers as selectable segments or remove the assertions.',
     'implementation': '.local/apollo-main/packages/component-contract-core/src/member-collections.ts:168'},
    {'id': 'segmented-control-inactive-collection-coverage', 'cases': [r['caseId'] for r in rows if r['component'] == 'SegmentedControl'],
     'observed': 'Inactive Capacity branches remain not-applicable but carry collection missing evidence; runtime includes them in uncertain coverage. This is distinct from the active branch failures.',
     'nextStep': 'Separate proven inactive branch diagnostics from active missing evidence in the scoped correction; never infer completeness from classification totals alone.'},
    {'id': 'segment-contract-gap', 'cases': ['SG-09'],
     'observed': 'The three-word label fixture remains an explicit non-acceptance gap. Nested Segment style/text constraints are not covered by the current parent Draft.',
     'nextStep': 'Prepare the separate Segment contract/dependency; preserve the existing coverage-map gap.'},
]
source_files = [WORKSPACE / '.local/apollo-main/src/runtime.js',
                WORKSPACE / '.local/apollo-main/packages/component-contract-core/src/member-collections.ts']
inputs.extend(pin(path) for path in source_files)
review = {'schemaVersion': 'apollo.contract-native-review.v1', 'status': 'PARTIAL', 'evidenceKind': 'user-supplied-apollo-native-area-report',
          'originalReport': pin(SOURCE), 'archivedReport': pin(ROOT / 'report.json.gz'), 'release': report['release'],
          'auditId': report['auditId'], 'timingMs': report['timings']['totalMs'],
          'summary': summary, 'acceptanceCases': 25, 'knownGapCases': 1, 'expectedViolationsFound': 11,
          'allExpectedViolationIdsMatch': True, 'areaCoverage': report['result']['coverage'],
          'notCheckedByName': dict(Counter(c['name'] for c in report['notChecked'])),
          'warnings': report['warnings'], 'blockers': blockers, 'cases': rows, 'inputPins': inputs,
          'productChanges': [], 'contractReadyChanged': False, 'freshApolloRun': False}
write('review.json', review)
write('eval.json', {'schemaVersion': 'apollo.contract-authoring-eval.v1', 'runId': ROOT.name,
                   'caseId': 'foundation-four-user-native-report', 'overall': 'PARTIAL',
                   'evidenceKind': 'user-supplied-native-live',
                   'review': {'author': 'Codex', 'reviewer': 'same-agent report analysis', 'independent': False},
                   'acceptedScope': ['25 case violation counts and exact RuleIDs match the sealed expectation matrix', 'List: 4 cases with executionComplete=true'],
                   'gaps': [b['id'] for b in blockers], 'evidence': ['review.json', 'report.json.gz'],
                   'learning': {'skillChange': False, 'reason': 'Saved regression evidence before any workflow/source changes; existing eval rules already require checking coverage.uncertain and executionComplete.'},
                   'ready': False})
write('lessons.json', [{'fact': b['observed'], 'causeOrLimit': b['id'], 'correction': b['nextStep'],
                       'owner': 'Contract authoring; execution owner only for a proven unsupported operator',
                       'status': 'OPEN_DIAGNOSED_NOT_FIXED', 'evidence': 'review.json'} for b in blockers])
outputs = ['review.py', 'report.json.gz', 'review.json', 'eval.json', 'lessons.json']
write('seal.json', {'status': 'CLOSED_REVIEW_ONLY', 'pins': [pin(ROOT / name) for name in outputs]})
print(json.dumps({'status': 'PARTIAL', 'cases': summary, 'expectedViolationIdsMatch': True, 'saved': str(ROOT)}, ensure_ascii=False))
