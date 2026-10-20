from pathlib import Path
from copy import deepcopy
import hashlib,json

R=Path(__file__).resolve().parent
def pin(p):
    b=p.read_bytes()
    return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def tool_value(name):
    result=json.loads((R/name).read_text())
    assert not result.get('isError'),result
    for c in result['content']:
        if c.get('type')=='text':
            value=json.loads(c['text'])
            if 'rows' in value:return value
    raise AssertionError('Missing native rows')

scope=json.loads((R/'SCOPE.json').read_text())
assert pin(Path(scope['source']['path']))==scope['source']
catalog=json.loads((R/'inputs/BenefitCard.catalog.json').read_text())
expected={r['variantKey']:r for r in json.loads((R/'inputs/prior-title-policy.json').read_text())['rows']}
rows=[]
for c in catalog['components']:
    if c['name'] not in ['[D] BenefitCard','[M] BenefitCard']:continue
    for variant in c['variants']:
        tree={n['id']:deepcopy(n) for n in c['structure']}
        for patch in c['variantStructures'].get(variant['key'],[]):
            key=patch['id']
            if patch['op']=='remove':assert key in tree;del tree[key]
            elif patch['op']=='update':assert key in tree;tree[key].update(deepcopy(patch['value']))
            elif patch['op']=='add':assert key not in tree;tree[key]=deepcopy(patch['value'])
            else:raise AssertionError('Unsupported catalog patch')
        content=[n for n in tree.values() if n['type']=='INSTANCE' and n['name']=='Content']
        assert len(content)==1,(variant,len(content))
        title=content[0]['componentInstance']['variantProperties']['Title']
        norm=expected[variant['key']]
        assert title in norm['expected'],(variant,title,norm['expected'])
        rows.append(dict(platform=c['platform'],variantId=variant['id'],variantKey=variant['key'],variant=variant['name'],Title=title,expected=norm['expected'],normMatches=True))
assert len(rows)==32 and {r['variantKey'] for r in rows}==set(expected)
compact=[r for r in rows if r['platform']=='desktop' and 'Compact=True' in r['variant']]
assert len(compact)==8 and all(r['Title']=='Secondary' for r in compact)
library=tool_value('library.tool-result.json');workshop=tool_value('workshop.tool-result.json')
assert len(library['rows'])==8 and all(r['title']==dict(value='Secondary',type='VARIANT',boundVariables={}) for r in library['rows'])
assert len(library['bottom'])==2 and all(len(r['sizeOptions'])==4 for r in library['bottom'])
stale=[]
for row in workshop['rows']:
    links=[n for n in row['nested'] if n['setKey']=='c1a788fea95f376b3c344b85ce006493b530db94']
    assert len(links)==1,row
    if links[0]['sizeOptions']!=library['bottom'][0]['sizeOptions']:
        stale.append(dict(rootId=row['id'],rootName=row['name'],linkId=links[0]['id'],mainId=links[0]['mainId'],actualOptions=links[0]['sizeOptions'],expectedOptions=library['bottom'][0]['sizeOptions']))
assert pin(Path(scope['source']['path']))==scope['source']
report=dict(status='SOURCE_CATALOG_ACCEPTED_WORKSHOP_DEPENDENCY_STILL_STALE' if stale else 'SOURCE_AND_WORKSHOP_DEPENDENCY_READBACK_PASS',source=scope['source'],generatedAt=catalog['source']['generatedAt'],catalogTitleRows=rows,all32TitleDomainsMatch=True,desktopCompactSecondary=8,nativeLibraryCompactSecondary=8,nativeLibraryLinkSizes=4,workshopStaleLinks=stale,contractZipChanged=False,sharedSourceBuildChanged=False,nativeEditorValidation='NOT_RUN',Ready=False)
(R/'audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
files=[pin(p) for p in sorted(R.rglob('*')) if p.is_file() and p.name not in ['INVENTORY.json','HANDOFF.json','SEAL.json']]
(R/'INVENTORY.json').write_text(json.dumps(dict(files=files),ensure_ascii=False)+'\n')
handoff=dict(status=report['status'],writesClosed=True,scope=pin(R/'SCOPE.json'),report=pin(R/'audit.json'),inventory=pin(R/'INVENTORY.json'),next='Update the two declared Workshop instances to the published Link master with 4 Size variants before focused native tests; core authoring-admission review remains independent.',Ready=False)
(R/'HANDOFF.json').write_text(json.dumps(handoff,ensure_ascii=False,indent=2)+'\n')
seal=dict(status='CLOSED',writesClosed=True,handoff=pin(R/'HANDOFF.json'),inventory=pin(R/'INVENTORY.json'),Ready=False)
(R/'SEAL.json').write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
for p in files:assert pin(Path(p['path']))==p
print(json.dumps(dict(status=report['status'],catalogTitles=32,compact=8,staleWorkshop=len(stale),handoff=pin(R/'HANDOFF.json'),seal=pin(R/'SEAL.json')),ensure_ascii=False))
