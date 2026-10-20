from pathlib import Path
import hashlib
import json
import zipfile

W=Path('/Users/alexkukhta/Desktop/workplace')
R=Path(__file__).parent
G=W/'.local/apollo-general-2026-10-16/backgroundplate-window294/SOURCE-WRITER-GRANT.json'

def pin(path):
    data=path.read_bytes()
    return dict(path=str(path),sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))

def write(name,data):
    (R/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

assert not (R/'APPLIED.json').exists(), 'Do not replay application.'
assert pin(G)['sha256']=='2e957460b9a655fceadbd507ade2b392d3772c3dcfa495d45e94ddd8208255e2'
assert pin(G)['bytes']==21576
grant=json.loads(G.read_text())
assert grant['soleWriter'] and grant['writerThreadId']=='01a0f77a-11c9-7c10-bd21-e3e5d100feae'
assert grant['authoringOutputRoot']==str(R)
prepared=[]
for target in grant['targets']:
    path=Path(target['writePath'])
    if target['before']:
        actual=pin(path)
        assert actual['sha256']==target['before']['sha256'] and actual['bytes']==target['before']['bytes'],path
    else:
        assert not path.exists(),path
    with zipfile.ZipFile(target['payload']['path']) as archive:
        data=archive.read(target['payload']['entry'])
    assert hashlib.sha256(data).hexdigest()==target['payload']['sha256']
    assert len(data)==target['payload']['bytes']
    prepared.append((target,path,data))
assert len(prepared)==18
with zipfile.ZipFile(R/'before-images.zip','x',compression=zipfile.ZIP_DEFLATED) as archive:
    for index,(_,path,_) in enumerate(prepared):
        if path.exists():
            archive.write(path,f'{index:02d}/{path.name}')
write('PREFLIGHT.json',dict(status='PASS_ALL_18_BEFORE_AND_PAYLOAD_PINS',grant=pin(G),targets=grant['targets']))
done=[]
try:
    for target,path,data in prepared:
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_bytes(data)
        actual=pin(path)
        assert actual['sha256']==target['payload']['sha256'] and actual['bytes']==target['payload']['bytes']
        done.append(dict(path=str(path),pin=actual,canonicalSourcePath=target['canonicalSourcePath']))
    write('APPLIED.json',dict(status='PASS_EXACT_18_NORMATIVE_APPLY',grant=pin(G),writes=done,
        canonicalHubWrites=0,coreDistVersionZipManifestProxyFigmaWrites=0,Ready=False))
    print(json.dumps(dict(status='PASS_EXACT_18_NORMATIVE_APPLY',writes=len(done))))
except Exception as error:
    write('FIRST-FAILURE.json',dict(status='STOPPED_PARTIAL_APPLY',error=str(error),completedWrites=done))
    raise
