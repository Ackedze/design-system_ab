from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import zipfile

W = Path('/Users/alexkukhta/Desktop/workplace')
S = W / 'shared/design-system_ab'
H = W / 'ds-ai-hub'
R = Path(__file__).parent
P = R / 'payload'
B = R.parent / 'owner-scope-2026-10-16'
temporary_payload = None
if not P.exists():
    temporary_payload = tempfile.TemporaryDirectory(prefix='backgroundplate-payload-',dir='/private/tmp')
    with zipfile.ZipFile(R/'normative-sync.payload.zip') as archive:
        archive.extractall(temporary_payload.name)
    P = Path(temporary_payload.name)

def read(path):
    return json.loads(path.read_text())

def pin(path):
    data = path.read_bytes()
    return dict(path=str(path), sha256=hashlib.sha256(data).hexdigest(), bytes=len(data))

manifest = read(R / 'CHANGE-MANIFEST.json')
for item in manifest['changes']:
    payload = item['payload']
    if 'entry' in payload:
        entry_data = (P/payload['entry']).read_bytes()
        assert hashlib.sha256(entry_data).hexdigest() == payload['sha256']
        assert len(entry_data) == payload['bytes']
    else:
        assert pin(Path(payload['path'])) == payload
    if item['before']:
        assert pin(Path(item['target'])) == item['before'], item['target']
    else:
        assert not Path(item['target']).exists(), item['target']
for item in read(B / 'SEAL.json')['files']:
    assert pin(Path(item['path'])) == item

expected = {
    'rule:components.background-plate.level-2-over-level-1':'surface-composition',
    'rule:components.background-plate.slot-content-levels':'surface-composition',
    'rule:components.background-plate.root-surface-level-0':'surface-composition',
    'rule:components.background-plate.background-color-by-page':'surface-composition',
    'rule:system.library-tokens-only':'design-system-usage',
    'rule:system.component-channel-match':'design-system-usage',
    'rule:components.background-plate.blend-mode-fixed':'background-plate',
    'rule:components.background-plate.border-not-clickable':'background-plate',
    'rule:components.background-plate.skeleton-variant':'loading-states',
    'rule:components.background-plate.promo-slot-radius-collection':'landing-pages'
}
retired = ['rule:components.background-plate.single-background-color-per-page',
           'rule:components.background-plate.no-manual-shadows',
           'rule:components.background-plate.public-roots-only',
           'rule:components.background-plate.platform-version-must-match']
owners_by_repo = {}
for repo, folder, prefix in [('design-system_ab','patterns','p_'), ('ds-ai-hub','products/ab/patterns','')]:
    owners = {}
    for file in (P/repo/folder).glob('*.md'):
        for identity in re.findall(r'(?m)^- ruleId: (.+)$',file.read_text()):
            owners.setdefault(identity,[]).append(file.name)
    for identity, target in expected.items():
        assert owners.get(identity) == [prefix+target+'.md'], (repo,identity,owners.get(identity))
    assert all(identity not in owners for identity in retired)
    assert all(len(paths) == 1 for paths in owners.values()), repo
    owners_by_repo[repo] = owners

source = 'JSONS/web/components/web-corp/BackgroundPlate'
rules = read(P/'design-system_ab'/source/'rules.json')
active_ids = {rule['ruleId'] for rule in rules['manual']['rules']}
decisions = read(B/'owner-decisions.json')['decisions']
for decision in decisions:
    if decision['action'] in ['move','delete','passport']:
        for suffix in decision['sourceSuffixes']:
            assert 'component:web-corp.background-plate.'+suffix not in active_ids
assert len(active_ids) == 19
for item in rules['manual']['executionPolicy'].values():
    if isinstance(item,list):
        for value in item:
            identity = value if isinstance(value,str) else value.get('sourceRuleId')
            if identity and identity.startswith('component:web-corp.background-plate.'):
                assert identity in active_ids, identity

old = read(S/source/'contract.overrides.json')
new = read(P/'design-system_ab'/source/'contract.overrides.json')
assert new['generated'] == old['generated']
assert new['manual']['generationPolicy']['defaultForNewContent'] == old['manual']['generationPolicy']['defaultForNewContent']
assert new['manual']['generationPolicy']['legacyComponents'] == old['manual']['generationPolicy']['legacyComponents']
old_api = old['manual']['publicApi']['components']
new_api = new['manual']['publicApi']['components']
assert [{k:v for k,v in item.items() if k not in ['exposure','standaloneAllowed']} for item in new_api] == old_api
assert sum(item['exposure']=='public' for item in new_api) == 6
assert sum(item['exposure']=='auxiliary' for item in new_api) == 8
assert new['manual']['generationPolicy']['variableDrivenBehavior']['collections'] == old['manual']['generationPolicy']['variableDrivenBehavior']['collections']
assert read(B/'eval.json')['existingIRSemantics'] == 'UNCHANGED'

for file in P.rglob('*'):
    if not file.is_file():
        continue
    text=file.read_text()
    assert not re.search(r'единый.*фон.*подлож|один.*BackgroundColor|BackgroundColor.*один раз|shadow.*запрещ|тен[ьи].*запрещ|no-manual-shadows|single-background-color-per-page',text,re.I), file
    if file.suffix == '.json':
        read(file)
    if 'ds-ai-hub' in file.parts:
        assert 'predicateContour' not in text, file

crosswalk = read(P/'design-system_ab/apollo/rule-crosswalk.json')
new_entries = [e for e in crosswalk['entries'] if e['apolloRuleId'].startswith('component:web-corp.background-plate.')]
assert len(new_entries) == 19
for entry in new_entries:
    assert entry['apolloRuleId'] in active_ids
    for evidence in entry['hubEvidence']:
        if evidence['kind'] == 'named-rule':
            file = P/'ds-ai-hub'/crosswalk['documents'][evidence['document']]['path']
            assert '- ruleId: '+evidence['ruleId'] in file.read_text()
            assert '### '+evidence['heading'] in file.read_text()

audit = subprocess.run(['python3',str(S/'.codex/skills/redpol-md-format/scripts/audit_redpol_markdown.py'),
                        str(P/'design-system_ab/patterns')],capture_output=True,text=True)
(R/'redpol-audit.log').write_text(audit.stdout+audit.stderr)
assert audit.returncode == 0, audit.stdout+audit.stderr
with tempfile.TemporaryDirectory(prefix='backgroundplate-hub-check-',dir='/private/tmp') as temp:
    root=Path(temp)
    component='products/ab/components/background-plate'
    shutil.copytree(H/component,root/component)
    shutil.copytree(P/'ds-ai-hub',root,dirs_exist_ok=True)
    lint=subprocess.run(['node',str(H/'tools/lint-knowledge.mjs')],cwd=root,capture_output=True,text=True)
    (R/'hub-lint.log').write_text(lint.stdout+lint.stderr)
    assert lint.returncode == 0, lint.stdout+lint.stderr

result=dict(status='PASS_PRIVATE_NORMATIVE_SYNC',files=len(manifest['changes']),targetedNorms=10,
    uniqueOwnersPerRepo=True,retiredNormsAbsent=True,activeComponentSourceRecords=19,
    activeCrosswalkEntries=19,publicRoots=6,auxiliarySets=8,nativeIdentityAndApi='UNCHANGED',
    generationAdmissionFlags='UNCHANGED',existing23IR='UNCHANGED_SEALED_R3_PROOF_REUSED',
    redpol='PASS_5_FILES',hubLint='PASS_14_FILES_WITH_EXISTING_WARNINGS',
    sharedApplication='NOT_APPLIED',freshNative='NOT_RUN',generationPilotScope='UNCHANGED',Ready=False)
(R/'eval.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))
