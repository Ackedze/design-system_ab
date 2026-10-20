from pathlib import Path
import difflib
import hashlib
import json
import shutil
import zipfile

W=Path('/Users/alexkukhta/Desktop/workplace')
C=W/'projects/Apollo-v3/packages/component-contract-core'
R=Path(__file__).parent
B=R.parent/'owner-scope-2026-10-16'

def read(path):
    return json.loads(path.read_text())

def pin(path):
    data=path.read_bytes()
    return dict(path=str(path),sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))

def write(name,data):
    (R/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

assert not (R/'SEAL.json').exists()
manifest=read(R/'SOURCE-MANIFEST.json')
for item in manifest['sourceInputs']:
    assert pin(Path(item['path']))==item
for item in read(B/'SEAL.json')['files']:
    assert pin(Path(item['path']))==item
source_archive=R/'source-candidate.zip'
patch=[]
with zipfile.ZipFile(source_archive,'x',compression=zipfile.ZIP_DEFLATED) as archive:
    for change in manifest['changes']:
        candidate=Path(change['candidate']['path'])
        assert pin(candidate)==change['candidate']
        target=Path(change['target'])
        assert pin(target)==change['before'] if change['before'] else not target.exists()
        relative=target.relative_to(C)
        before=target.read_text() if target.exists() else ''
        after=candidate.read_text()
        patch.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),
                     fromfile='a/'+str(relative) if target.exists() else '/dev/null',tofile='b/'+str(relative)))
        archive.write(candidate,str(relative))
        change['candidate']=dict(path=str(source_archive),entry=str(relative),
                                 sha256=change['candidate']['sha256'],bytes=change['candidate']['bytes'])
(R/'source.patch').write_text(''.join(patch))
manifest['candidateArchive']=pin(source_archive)
write('SOURCE-MANIFEST.json',manifest)
build_archive=R/'private-runtime-builds.zip'
with zipfile.ZipFile(build_archive,'x',compression=zipfile.ZIP_DEFLATED) as archive:
    for directory in ['baseline','candidate']:
        for file in sorted((R/directory).iterdir()):
            archive.write(file,directory+'/'+file.name)
for directory in ['source','baseline','candidate']:
    shutil.rmtree(R/directory)
with zipfile.ZipFile(source_archive) as archive:
    for change in manifest['changes']:
        data=archive.read(change['candidate']['entry'])
        assert hashlib.sha256(data).hexdigest()==change['candidate']['sha256']
        assert len(data)==change['candidate']['bytes']
regression=read(R/'regression-check.json')
assert regression['coreTests']==353 and regression['failed']==0
evaluation=read(R/'eval.json')
evaluation.update(typeCheck='PASS',coreTests=353,coreFailures=0,beforeFixFailures=3,
                  integration='NOT_APPLIED_GENERAL_HOLD',sourceArchive=pin(source_archive))
write('eval.json',evaluation)
manual=read(R/'contract.manual.json')
compiled=read(R/'component-contract.v2.json')
coverage=read(B/'coverage-map.json')
for row in coverage['rules']:
    rules=[rule for rule in manual['rules'] if row['sourceRuleId'] in rule['sourceRefs']]
    row['manualRuleIds']=[rule['id'] for rule in rules]
    row['compiledRuleIds']=[ir['ruleId'] for ir in compiled['rules'] if any(ir['ruleId'].startswith(rule['id']+'.') for rule in rules)]
    row['nativeStatus']='NOT_RUN_R4; historical unchanged bindings only'
write('coverage-map.json',coverage)
write('PROCESS-NOTE.json',dict(status='PRIVATE_FIX_VERIFIED_NO_SHARED_APPLICATION',
    firstProductFailure=pin(R/'FIRST-FAILURE.json'),beforeFixTests=pin(R/'before-fix-regression.json'),
    defect='Missing blendMode capture; old compiler filtered missing baseline and treated absent actual as a violation.',
    fix='Capture real string blendMode on both actual and independent reference. Reuse baseline comparator with explicit unknown missing policy and no absent-baseline selector filter.',
    protection='New regression file tests independent capture, root/nested changes, restore, missing actual/baseline; all353 core tests and type check pass.',
    harnessCorrections=['Use compileManualSource.issues rather than a nonexistent validation member.',
                        'Assert UNKNOWN through trace.truth and human-review classification, preserving the established unknownPolicy.',
                        'Copy source files into the disposable regression sandbox for the existing scenario type test.'],
    firstHarnessRegression=pin(R/'core-regression.first-attempt.log'),
    responsible='Contract Creation; integration and independent acceptance remain separate.',
    centralJournal='Shared journal update pending the authorized writer window.'))
write('FINAL-HANDOFF.json',dict(status='CLOSED_PRIVATE_BLEND_FIX_READY_FOR_INTAKE',writesClosed=True,
    baselineCoreVersion='0.1.17',baselineEditorVersion='0.2.104',sourceManifest=pin(R/'SOURCE-MANIFEST.json'),
    sourcePatch=pin(R/'source.patch'),sourceArchive=pin(source_archive),privateBuilds=pin(build_archive),
    eval=pin(R/'eval.json'),regression=pin(R/'regression-check.json'),
    beforeFix=pin(R/'before-fix-regression.json'),compatibilityBacklog=pin(R/'compatibility-backlog.candidate.json'),
    authoringCandidate=dict(revision=4,manual=pin(R/'contract.manual.json'),compiled=pin(R/'component-contract.v2.json'),
                           coverage=pin(R/'coverage-map.json'),manualRecords=31,IR=25,nonExecutable=1,zip='NOT_PUBLISHED_BEFORE_CAPTURE_INTEGRATION'),
    requestedSourceTargets=[dict(path=x['target'],before=x['before']) for x in manifest['changes']],
    relatedBacklogTargets=[str(W/'projects/ComponentContractEditor/docs/BACKLOG.ru.md'),str(W/'projects/Apollo-v3/docs/ARCHITECTURE_BACKLOG.md')],
    consumerImpact='Shared core capture/compiler. Editor and Apollo require separately accepted builds and current consumers. Old source/build pins become historical; no mutation of old receipts.',
    integrationRequirements=['General separate one-writer scope and current before-pin readback.',
      'Assign the new core/Editor release versions and corresponding dependency/build scope before shared edits.',
      'Apply the paired backlog entries with the actual source fix.',
      'Configured Editor/Apollo validation and fresh consumer/reader acceptance.',
      'Native root/surface blend override checks after the accepted Editor release; preserve unmodified bindings and historical evidence.',
      'Apply accepted normative-sync separately or in a combined explicit window; refresh source provenance/root ZIP/manifest only then.'],
    constraints=dict(sharedSourceBuildWrites=0,rootZipManifestSheetsHubWrites=0,nativeOrFigmaCalls=0,proxyRestarts=0,generationPilotScope='UNCHANGED',generationOnlyMode='UNCHANGED'),
    nativeAcceptance='NOT_RUN',EditorUi='NOT_RUN',ApolloConsumer='NOT_VERIFIED',Ready=False))
files=[pin(path) for path in sorted(R.iterdir()) if path.is_file() and path.name!='SEAL.json']
write('SEAL.json',dict(status='CLOSED_PRIVATE_FIX_NOT_INSTALLED',writesClosed=True,files=files,Ready=False))
for item in read(R/'SEAL.json')['files']:
    assert pin(Path(item['path']))==item
print(json.dumps(dict(status='CLOSED_PIN_READBACK_PASS',handoff=pin(R/'FINAL-HANDOFF.json'),
                     seal=pin(R/'SEAL.json'),files=len(files),sharedWrites=0)))
