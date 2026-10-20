from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import zipfile

R = Path(__file__).parent
W = Path('/Users/alexkukhta/Desktop/workplace')
B = R.parent / 'owner-scope-2026-10-16'

def read(path):
    return json.loads(path.read_text())

def pin(path):
    data=path.read_bytes()
    return dict(path=str(path),sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))

def write(name,data):
    (R/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

assert not (R/'SEAL.json').exists(), 'Closed packets are immutable; use a new directory.'
manifest=read(R/'CHANGE-MANIFEST.json')
payload=R/'payload'
archive_path=R/'normative-sync.payload.zip'
with zipfile.ZipFile(archive_path,'x',compression=zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(payload.rglob('*')):
        if file.is_file():
            archive.write(file,str(file.relative_to(payload)))
with zipfile.ZipFile(archive_path) as archive:
    assert len(archive.namelist()) == 18
    for item in manifest['changes']:
        previous=item['payload']
        entry=str(Path(previous['path']).relative_to(payload))
        data=archive.read(entry)
        assert hashlib.sha256(data).hexdigest() == previous['sha256']
        assert len(data) == previous['bytes']
        item['payload']=dict(path=str(archive_path),entry=entry,sha256=previous['sha256'],bytes=previous['bytes'])
manifest['payloadArchive']=pin(archive_path)
write('CHANGE-MANIFEST.json',manifest)
shutil.rmtree(payload)
# Reopen the archive and repeat checks after removal of the expanded staging tree.
result=subprocess.run(['python3',str(R/'verify.py')],capture_output=True,text=True)
(R/'final-verify.log').write_text(result.stdout+result.stderr)
assert result.returncode == 0, result.stdout+result.stderr
write('PROCESS-NOTE.json',dict(status='PRIVATE_DEFECTS_CAUGHT_AND_CORRECTED_BEFORE_SHARED_WRITE',
    evidence=pin(R/'FIRST-ROUTING-CHECK.json'),
    cause='Migration keyed only by destination IDs lost the old channel alias and removed the Border usage rule without a destination.',
    consequence='Two private routing errors; source/Hub/Sheets/root packages unaffected.',
    repair='Keep the canonical Border usage rule; explicitly retire the old component channel ID. Verify all ten intended owners in both repositories.',
    protection='Validate owner and source-ID migration separately; require one active owner per norm and zero retired source IDs before closure.',
    responsible='Contract Creation',verification=pin(R/'eval.json'),
    centralJournal='Shared journal/skill changes deferred while General HOLD remains.'))
write('FINAL-HANDOFF.json',dict(status='CLOSED_PRIVATE_NORMATIVE_SYNC_READY_FOR_FUTURE_WINDOW',writesClosed=True,
    payloadArchive=pin(archive_path),changeManifest=pin(R/'CHANGE-MANIFEST.json'),
    eval=pin(R/'eval.json'),routingCrosswalk=pin(R/'norm-routing-crosswalk.json'),
    priorCandidate=read(B/'eval.json')['zip'],priorSeal=pin(B/'SEAL.json'),
    requestedTargets=[dict(path=x['target'],before=x['before']) for x in manifest['changes']],
    scope='Only prepared norms/passport/source/Hub mirrors. No shared writes, no core/runtime/dist/proxy changes, no Figma or generation actions.',
    futureApplication=['Obtain a distinct General writer window with updated current pins.',
                       'Use an accepted isolated Hub checkout; do not patch the dirty canonical checkout.',
                       'Apply exact payloads only when before pins still match; revalidate otherwise.',
                       'Create the next contract revision with actual applied source provenance; do not relabel old r3 receipts.',
                       'Update root ZIP/manifest and Rules/Ledger/Predicate under that window; read back exact rows.',
                       'Keep component/native acceptance, runtime feature availability and Ready separate.'],
    sheets=dict(completedBookkeeping=pin(B/'sheets-readback.json'),newWrites=0,
                futureNormIds=read(B/'owner-decisions.json')['decisions'],
                requirement='Read current row locations and validation immediately before an authorized write; do not replay prior bookkeeping.'),
    remaining=['Actual/baseline blendMode capture is still absent; implementation requires a separate source/core writer scope.',
               'Global approved-library membership and independent UI-channel readers remain planned.',
               'Page assembly, loading, usage and landing norms have routes but no new native execution proof.',
               'Code mapping remains unverified; historical padding/sizing human-mirror drift is outside this targeted change.'],
    generationPilotScope='UNCHANGED',Ready=False))
files=[pin(p) for p in sorted(R.iterdir()) if p.is_file() and p.name!='SEAL.json']
write('SEAL.json',dict(status='CLOSED_PRIVATE_PREPARATION_NOT_SHARED_APPLICATION',writesClosed=True,files=files,Ready=False))
for item in read(R/'SEAL.json')['files']:
    assert pin(Path(item['path'])) == item
print(json.dumps(dict(status='CLOSED_AND_READ_BACK',handoff=pin(R/'FINAL-HANDOFF.json'),
                     seal=pin(R/'SEAL.json'),payload=pin(archive_path),expandedTemporaryTreeRemoved=True)))
