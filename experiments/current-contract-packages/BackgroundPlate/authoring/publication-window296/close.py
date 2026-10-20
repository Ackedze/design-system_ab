from pathlib import Path
import copy, hashlib, json

W = Path('/Users/alexkukhta/Desktop/workplace')
O = Path(__file__).parent
P = O.parents[2]
G = W / '.local/apollo-general-2026-10-16/backgroundplate-publication296/ROOT-PUBLICATION-GRANT.json'

def read(p): return json.loads(Path(p).read_text())
def pin(p):
    p = Path(p); b = p.read_bytes()
    return dict(path=str(p), sha256=hashlib.sha256(b).hexdigest(), bytes=len(b))
def check(p): assert pin(p['path']) == p, p['path']
def save(n, d): (O / n).write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

assert not (O / 'SEAL.json').exists(), 'Closed outputs are immutable'
assert pin(G) == dict(path=str(G), sha256='f13376a839417f98b1e14d3210a79e6c389b90df04ea1b4c10c497a7992fd94c', bytes=8342)
g, applied = read(G), read(O / 'ROOT-APPLIED.json')
assert applied['status'] == 'PASS_ROOT_R6_DRAFT_PUBLICATION'
for p in [applied['rootPackage'], applied['historyInventory'], g['privateR6'], g['phaseBAcceptance']]: check(p)
for p in applied['manifests']: check(p)
assert not Path(g['oldRoot']['path']).exists()
for h in applied['history']:
    check(h['to']); assert h['from']['sha256'] == h['to']['sha256'] and h['from']['bytes'] == h['to']['bytes']
before = [read(Path(g['historyRoot']) / n) for n in ['manifest.json', 'draft-manifest.json']]
after = [read(P / n) for n in ['manifest.json', 'draft-manifest.json']]
for i, (old, new) in enumerate(zip(before, after)):
    assert len(old['packages']) == len(new['packages']) == (14 if i == 0 else 7)
    expected = copy.deepcopy(old)
    rows = [r for r in expected['packages'] if r.get('componentId') == 'web-corp.background-plate']; assert len(rows) == 1
    rows[0].update(applied['row']); expected['updatedAt'] = new['updatedAt']; assert expected == new
    bg = next(r for r in new['packages'] if r.get('componentId') == 'web-corp.background-plate')
    assert bg['revision'] == 6 and bg['ruleStatuses'] == {'draft': 31} and bg['ruleIR'] == 25 and bg['nonExecutableRules'] == 1
    assert not bg['wholeReady'] and not bg['fullAcceptance'] and not bg['productionPublication']
baseline = read(g['baseline']['path'])
unchanged = [x['pin'] for x in baseline['packages'] if x['componentId'] != 'web-corp.background-plate']
assert len(unchanged) == 13
for p in unchanged: check(p)
for p in applied['physicalRootAfter']: check(p)
assert {str(p) for p in P.glob('*.zip')} == {p['path'] for p in applied['physicalRootAfter']}
frozen = read(g['frozenSourceBuild']['seal']['path'])
for p in [g['frozenSourceBuild']['seal'], g['frozenSourceBuild']['handoff']] + frozen['files'] + frozen['sourceOutputs'] + frozen['completeBuildOutputs']: check(p)
for p in frozen['protectedInputs']:
    if p['path'] not in g['allowedRootWrites']: check(p)
sheet = read(O / 'SHEETS-READBACK.json')
assert sheet['status'] == 'PASS_PUBLICATION_SHEETS_READBACK' and sheet['valueRequests'] == 53 and sheet['comparedCells'] == 1096
assert sheet['Predicate'] == 'Draft' and sheet['RuleIDsPreserved'] and sheet['valuesFormulasValidationFormatsOutsideEditsPreserved']
assert len(sheet['modifiedDateCells']) == 2 and len(sheet['dateChecks']) == 7
for d in sheet['dateChecks']:
    assert d['nativeValue'] == 46311 and d['numberFormat'] == dict(type='DATE', pattern='yyyy-mm-dd') and d['display'] == '2026-10-16'
assert not sheet['issues']
save('PROCESS-NOTE.json', dict(status='PRIVATE_PUBLICATION_HARNESS_ERROR_FIXED',
    evidence=pin(O / 'FIRST-ROOT-FAILURE.json'), cause='Assumed ZIP entries had a component prefix; actual producer uses compiled/component-contract.v2.json and contract.manual.json at root.',
    consequence='Check stopped after exact history/newZIP copies, before manifest updates or oldR1 deletion.',
    fix='Inspected exact ZIP entry list; used exact producer entries. Resume verifies original preflight/history/current before pins and never rewrites history or first failure.',
    validation='Root importer/compile roundtrip and final history/root/manifests readback PASS.',
    owner='ContractCreation', sharedJournal='General followup; outside this writer scope'))
save('eval.json', dict(status='PASS_ROOT_R6_DRAFT_PUBLICATION_AND_SHEETS', revision=6, manual=31, canonicalSource=19, IR=25, nonExecutable=1,
    declaredPackageRows=14, otherPackageRowsUnchanged=13, draftRows=7, otherDraftRowsUnchanged=6,
    physicalRootZIPs=len(applied['physicalRootAfter']), existingUnlistedZIPs=applied['unlistedExistingRootZIPs'],
    physicalCountNote='One pre-existing unlisted BackgroundPlate.r2 candidate remains byte-exact; not authorized for removal. Declared manifest package set is14.',
    importCompileRoundtrip='PASS', history='BYTE_EXACT', sheets=pin(O / 'SHEETS-READBACK.json'),
    modifiedDateCoverage='Both touched dates verified by native numberValue+DATE numberFormat+formattedValue; five previously corrected/new rule dates also preserved.',
    sourceBuildFreeze='EXACT_11_SOURCE_51_BUILD', native='NOT_RUN_USER_ONLY_R6', codeMapping='NOT_VERIFIED', consumerRuntime='PENDING_GENERAL', Ready=False))
handoff = dict(status='CLOSED_PUBLICATION296_R6_WORKING_DRAFT', writesClosed=True, grant=pin(G),
    before=dict(root=g['oldRoot'], manifests=[g['currentManifest'], g['currentDraftManifest']]),
    after=dict(root=applied['rootPackage'], manifests=applied['manifests']), history=applied['history'], historyInventory=applied['historyInventory'],
    unchanged13PackageFiles=unchanged, physicalRootZIPs=applied['physicalRootAfter'], existingUnlistedZIPs=applied['unlistedExistingRootZIPs'],
    sourceBuildHandoff=g['frozenSourceBuild']['handoff'], sourceBuildSeal=g['frozenSourceBuild']['seal'], sourceOutputs=frozen['sourceOutputs'], buildOutputs=frozen['completeBuildOutputs'],
    sourceBuildAcceptance=g['phaseBAcceptance'], Sheets=pin(O / 'SHEETS-READBACK.json'), sheetBefore=pin(O / 'SHEETS-BEFORE.json'), sheetAfter=pin(O / 'SHEETS-AFTER.json'),
    eval=pin(O / 'eval.json'), nativeTestPlan=pin(O / 'NATIVE-EDITOR-TEST-PLAN.ru.md'), processNote=pin(O / 'PROCESS-NOTE.json'),
    actualRootLastWriteAt=applied['actualRootLastWriteAt'], lastSheetWriteAckAt=sheet['lastSheetWriteAckAt'], lastSharedWriteObservedAt=max(applied['actualRootLastWriteAt'], sheet['lastSheetWriteAckAt']),
    closure='All authorized root/history/manifest/authoring/Sheet writes closed after final physical/cell readback. Original phaseB seal unchanged; its old rootR1 authority is historical and relocated explicitly above.',
    remaining=['General independent publication acceptance, then fresh consumer/runtime.', 'Separate Figma-labelled blendMode cases and fresh user-only native Editor acceptance. No new cases created or assigned.', 'One adaptive padding context warning; code mapping and external patterns remain separate.'],
    forbiddenActionsPerformed=dict(coreSource=0, EditorSource=0, ApolloSource=0, build=0, registry=0, Hub=0, proxy=0, consumer=0, model=0, MCP=0, Figma=0), Ready=False)
save('FINAL-HANDOFF.json', handoff)
files = [pin(p) for p in sorted(O.rglob('*')) if p.is_file() and p.name != 'SEAL.json']
historyFiles = [pin(p) for p in sorted(Path(g['historyRoot']).rglob('*')) if p.is_file()]
save('SEAL.json', dict(status='CLOSED_PUBLICATION296_R6_WORKING_DRAFT', writesClosed=True, files=files,
    currentRoot=applied['rootPackage'], manifests=applied['manifests'], history=historyFiles, other13PackageFiles=unchanged,
    sourceOutputs=frozen['sourceOutputs'], buildOutputs=frozen['completeBuildOutputs'], oldRootAbsent=g['oldRoot']['path'], grant=pin(G), Ready=False))
s = read(O / 'SEAL.json')
for p in s['files'] + [s['currentRoot']] + s['manifests'] + s['history'] + s['other13PackageFiles'] + s['sourceOutputs'] + s['buildOutputs']: check(p)
assert not Path(s['oldRootAbsent']).exists()
print(json.dumps(dict(status='CLOSED_PUBLICATION296_FINAL_READBACK_PASS', handoff=pin(O / 'FINAL-HANDOFF.json'), seal=pin(O / 'SEAL.json'), root=applied['rootPackage'], Ready=False)))
