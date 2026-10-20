from pathlib import Path
import hashlib
import json
import re
import shutil
import zipfile

W=Path('/Users/alexkukhta/Desktop/workplace')
S=W/'shared/design-system_ab'
R=Path(__file__).parent
G=W/'.local/apollo-general-2026-10-16/backgroundplate-window294/SOURCE-WRITER-GRANT.json'

def read(path):
    return json.loads(path.read_text())

def pin(path):
    data=path.read_bytes()
    return dict(path=str(path),sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))

def write(name,data):
    (R/name).write_text(json.dumps(data,ensure_ascii=False)+'\n')

assert not (R/'SEAL.json').exists()
grant=read(G)
assert pin(G)['sha256']=='2e957460b9a655fceadbd507ade2b392d3772c3dcfa495d45e94ddd8208255e2'
actual=[]
for target in grant['targets']:
    value=pin(Path(target['writePath']))
    assert value['sha256']==target['payload']['sha256'] and value['bytes']==target['payload']['bytes']
    actual.append(value)
    if '/ds-ai-hub/' in target['canonicalSourcePath']:
        source=Path(target['canonicalSourcePath'])
        assert pin(source)['sha256']==target['before']['sha256'] if target['before'] else not source.exists()

required={
 'rule:components.background-plate.level-2-over-level-1':'surface-composition',
 'rule:components.background-plate.slot-content-levels':'surface-composition',
 'rule:components.background-plate.root-surface-level-0':'surface-composition',
 'rule:components.background-plate.background-color-by-page':'surface-composition',
 'rule:system.library-tokens-only':'design-system-usage',
 'rule:system.component-channel-match':'design-system-usage',
 'rule:components.background-plate.blend-mode-fixed':'background-plate',
 'rule:components.background-plate.border-not-clickable':'background-plate',
 'rule:components.background-plate.skeleton-variant':'loading-states',
 'rule:components.background-plate.promo-slot-radius-collection':'landing-pages'}
H=Path(grant['acceptedHubCheckout'])
for root,folder,prefix in [(S,'patterns','p_'),(H,'products/ab/patterns','')]:
    seen={}
    for file in (root/folder).glob('*.md'):
        for identity in re.findall(r'(?m)^- ruleId: (.+)$',file.read_text()):
            if identity in required:
                seen.setdefault(identity,[]).append(file.name)
    for identity,owner in required.items():
        assert seen.get(identity)==[prefix+owner+'.md'],(identity,seen.get(identity))

rules=read(S/'JSONS/web/components/web-corp/BackgroundPlate/rules.json')['manual']['rules']
crosswalk=read(S/'apollo/rule-crosswalk.json')
entries=[entry for entry in crosswalk['entries'] if entry['apolloRuleId'].startswith('component:web-corp.background-plate.')]
assert len(rules)==len(entries)==19
for entry in entries:
    assert any(rule['ruleId']==entry['apolloRuleId'] for rule in rules)
    for evidence in entry['hubEvidence']:
        if evidence['kind']=='named-rule':
            text=(H/crosswalk['documents'][evidence['document']]['path']).read_text()
            assert '- ruleId: '+evidence['ruleId'] in text and '### '+evidence['heading'] in text
for prior in ['owner-scope-2026-10-16','normative-sync-2026-10-16','blend-mode-2026-10-16']:
    for file in read(R.parent/prior/'SEAL.json')['files']:
        assert pin(Path(file['path']))==file
authoring=read(R/'authoring-check.json')
assert authoring['IR']==23 and authoring['nonExecutable']==2 and authoring['old23IR']=='UNCHANGED'
assert pin(Path(authoring['zip']['path']))==authoring['zip']
sheet=read(R/'SHEETS-READBACK.json')
assert sheet['status']=='PASS_PHASE_A_SHEETS_READBACK' and sheet['Predicate']=='Draft'
assert sheet['sourceSha']==pin(S/'JSONS/web/components/web-corp/BackgroundPlate/rules.json')['sha256']
shutil.copyfile(R.parent/'application-294/PHASE-B-SCOPE.candidate.json',R/'PHASE-B-SCOPE.candidate.json')
write('eval.json',dict(status='PASS_PHASE_A_NORMATIVE_APPLICATION',targets=18,componentSourceRecords=19,
  targetedNorms=10,uniqueOwnersBothRepositories=True,activeCrosswalkEntries=19,
  redpol='PASS_5_FILES',hubLint='PASS_14_SELECTED_FILES_3_PREEXISTING_WARNINGS',
  sourceAndPayloadPins='BYTE_EXACT',canonicalDirtyHub='UNCHANGED',
  privateAuthoring=authoring,sheets=sheet,native='NOT_RUN_R5',coreIntegration='PHASE_B_NOT_APPLIED',Ready=False))
write('PROCESS-NOTE.json',dict(status='PHASE_A_CORRECTIONS_VERIFIED',responsible='Contract Creation',
  findings=[dict(evidence=pin(R/'AUTHORING-FIRST-FAILURE.json'),
    cause='A superseded cancellation decision cannot retain retiredRuleIds in the current schema.',
    repair='Keep owner cancellation decisions accepted; record applied-source state as a separate accepted decision.',
    protection='Compile/export/reopen before handing off private revision; no status/validator weakening.'),
   dict(evidence=pin(R/'SHEETS-FIRST-READBACK-FAILURE.json'),
    cause='The last-row formatting exemplar had no DATE format on N.',
    repair='Set only N1973:N1974 to DATE yyyy-mm-dd and repeat full readback.',
    protection='Readback verifies displayed dates, native number format and dropdown validation, not just values.')],
  centralJournal='General follow-up: docs/APOLLO_PROCESS_LESSONS.md was outside the18-path writer grant; no ungranted shared edit.',
  verification='Private R5 compile/export/reopen PASS;319 Sheet values and native date/dropdown metadata PASS.'))
write('FINAL-HANDOFF.json',dict(status='CLOSED_PHASE_A294_SOURCE_AND_ACCOUNTING',writesClosed=True,
  grant=pin(G),actualNormativeOutputs=actual,acceptedHubCheckout=str(H),acceptedHubBranch=grant['acceptedHubBranch'],
  eval=pin(R/'eval.json'),sheetsReadback=pin(R/'SHEETS-READBACK.json'),
  privateCandidate=authoring['zip'],sourceProvenance=pin(R/'source-provenance.json'),
  phaseBProposal=pin(R/'PHASE-B-SCOPE.candidate.json'),
  sourceRuleCount=19,privateManualRecords=30,privateIR=23,privateNonExecutable=2,
  priorSeals='UNCHANGED_AND_READ_BACK',
  closure='All18 granted normative target writes, private authoring and addressed Sheets writes closed after final physical/cell readback. No further writes without a new window.',
  remaining=['General independent phaseA acceptance.',
    'Separate phaseB core/Editor version/build/backlog/consumer scope for the closed blendMode fix; not applied here.',
    'Separate root ZIP/manifest publication and native Editor acceptance. Current root package was not replaced.',
    'Global token membership/UI channel and external page/loading/usage/landing execution remain separate.',
    'Historical padding/sizing human-mirror drift and unrelated ContentCardWrapper crosswalk finding were not changed.'],
  forbiddenActionsPerformed=dict(core=0,dist=0,versions=0,rootZip=0,manifests=0,canonicalHub=0,proxy=0,Figma=0,generation=0),
  Ready=False))
files=[pin(file) for file in sorted(R.iterdir()) if file.is_file() and file.name!='SEAL.json']
write('SEAL.json',dict(status='CLOSED_PHASE_A294_NOT_RELEASED',writesClosed=True,files=files,normativeOutputs=actual,Ready=False))
for file in read(R/'SEAL.json')['files']+actual:
    assert pin(Path(file['path']))==file
print(json.dumps(dict(status='CLOSED_PHASE_A294_READBACK_PASS',handoff=pin(R/'FINAL-HANDOFF.json'),seal=pin(R/'SEAL.json'),outputs=18,sourceRules=19,privateRevision=5,IR=23,Ready=False)))
