# -*- coding: utf-8 -*-
from pathlib import Path
import json, hashlib, datetime

w = Path('/Users/alexkukhta/Desktop/workplace')
d = Path(__file__).resolve().parent
e = w / 'projects/ComponentContractEditor'
def pin(p):
    return {'path': str(p), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def save(name, value):
    (d / name).write_text(json.dumps(value, separators=(',', ':')) + '\n', encoding='utf-8')

s = json.loads((d / 'scope.json').read_text())
r = json.loads((d / 'candidate-r7.json').read_text())
review = json.loads((d / 'final-technical-review.json').read_text())
isolation = json.loads((d / 'isolation-final.json').read_text())
files = ['package.json', 'src/version.ts', 'src/ui.html', 'src/core/index.ts',
    'src/core/compiler.ts', 'src/core/exporter.ts', 'src/core/runtime.ts',
    'src/core/validation-report.ts', 'src/core/dependency-usage.ts',
    'tests/helpers/dependency-usage.js', 'tests/dependency-usage.test.js']
build = ['dist/code.js', 'dist/code.js.map', 'dist/core.cjs', 'dist/ui.html']
before = {x['path']: x for x in s['editorBefore']}
changes = []
for name in files:
    p = e / name
    b = before.get(str(p))
    changes.append({'path': str(p), 'before': {k: v for k, v in b.items() if k != 'text'} if b else None,
        'after': pin(p), 'lines': len(p.read_text().splitlines()), 'beforeEvidence':
        'task-start exact snapshot' if b else ('new file' if name in
        ['src/core/dependency-usage.ts', 'tests/helpers/dependency-usage.js', 'tests/dependency-usage.test.js']
        else 'narrow shim/header edit; preimage not separately pinned')})
save('source-changes.json', {'scope': 'Editor-only', 'changes': changes,
    'build': [pin(e / name) for name in build], 'sharedCoreSourceOrDistWrites': False,
    'privateReportsCopiedIntoTrackedFixtures': False})
p = w / 'shared/design-system_ab/experiments/current-contract-packages'
working = p / 'BenefitCard.component-contract.zip'
manifests = [p / 'manifest.json', p / 'draft-manifest.json']
assert pin(working)['sha256'] == 'd2d93913ac82a7dd08eb8870d35afa4eeeb514dc42aa5eb7d9390ddf76742bed'
for mf in manifests:
    m = json.loads(mf.read_text())
    entry = next(x for x in m['packages'] if x.get('componentId') == 'web.benefit-card')
    assert entry['revision'] == 5 and entry['file'] == working.name
assert pin(Path(r['candidate']['path'])) == r['candidate']
assert pin(e / 'dist/core.cjs') == review['reader']
assert not isolation['changed']
save('candidate-manifest.json', {'schemaVersion': 'apollo.editor-contract-candidate.v1',
    'normative': False, 'revision': 7, 'workingRevision': 5, 'candidate': r['candidate'],
    'manualHash': r['manualHash'], 'compiledHash': r['compiledHash'], 'editorVersion': '0.2.104',
    'sharedCoreVersion': '0.1.17', 'reader': review['reader'], 'sourceClaims': 22, 'IR': 40,
    'deferred': 2, 'childClosure': 'EXACT_LINK_R5_DRAFT', 'nativeLive': 'NOT_RUN_USER_ONLY',
    'ready': False, 'v4Integration': 'HELD_UNTIL_CONTRACT_ACCEPTANCE', 'productionPublication': False})
save('scope-amendment.json', {'authorization': 'AGENTS same-task paired reader backlog, process lesson and DS registry; separate unpromoted candidate',
    'additionalDocumentWrites': ['projects/Apollo-v3/docs/ARCHITECTURE_BACKLOG.md', 'docs/APOLLO_PROCESS_LESSONS.md'],
    'candidateZip': r['candidate']['path'], 'workingManifestChanged': False,
    'workingDraftManifestChanged': False, 'v4ProductWrites': False, 'sharedCoreWrites': False, 'canvasWrites': False})
outputs = [pin(x) for x in sorted(d.iterdir()) if x.is_file()]
external = [pin(e / name) for name in files + build] + [r['candidate']]
gates = {'typecheck': 'PASS', 'fullEditorTests': '852 PASS', 'targetedTests': '23 PASS',
    'roundtrip': 'PASS', 'priorIR': '37 preserved', 'retainedCaptures': '57 preserved with new synthetic scenario',
    'nativeLive': 'NOT_RUN_USER_ONLY', 'independentAcceptance': 'NOT_RUN_GENERAL',
    'Ready': False, 'v4Integration': 'HELD_UNTIL_CONTRACT_ACCEPTANCE'}
handoff = {'schemaVersion': 'apollo.editor-only-handoff.v1',
    'generatedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'writer': 'Contract Creation',
    'writesClosed': True, 'editorVersion': '0.2.104', 'sharedCoreVersion': '0.1.17', 'candidateRevision': 7,
    'scope': 'Editor local source/build and unpromoted BenefitCard candidate; paired metadata sync',
    'sourceBuildPins': external, 'artifactPins': outputs, 'pilotIsolation': pin(d / 'isolation-final.json'),
    'workingPackagePreserved': pin(working), 'workingManifests': [pin(x) for x in manifests],
    'gates': gates, 'testPlan': pin(d / 'NATIVE_TESTS.ru.md')}
save('HANDOFF.json', handoff)
seal = {'schemaVersion': 'apollo.writer-seal.v1', 'writesClosed': True, 'scope': handoff['scope'],
    'pins': [pin(d / 'HANDOFF.json')] + outputs + external,
    'notSealedAsImmutable': ['mutable global backlog files and process journal', 'working manifests owned by future contract tasks'], 'ready': False}
save('seal.json', seal)
for x in seal['pins']:
    assert pin(Path(x['path'])) == x, x['path']
for x in s['pilotObservedInputs'] + s['sharedCore']:
    assert pin(Path(x['path'])) == {k: v for k, v in x.items() if k in ['path', 'sha256', 'bytes']}, x['path']
print(json.dumps({'sealPins': len(seal['pins']), 'candidate': r['candidate']['sha256'],
    'pilotInputsUnchanged': 347, 'sharedCoreUnchanged': 5, 'workingRevision': 5, 'candidateRevision': 7,
    'native': 'NOT_RUN_USER_ONLY'}))
