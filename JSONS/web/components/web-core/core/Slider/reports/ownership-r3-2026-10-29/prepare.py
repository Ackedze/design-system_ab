import json,hashlib,zipfile,datetime
from pathlib import Path
R=Path(__file__).parent
A=R.parents[7]
D=R.parent.parent
read=lambda p:json.loads(p.read_text())
def write(name,v):(R/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
old=read(R/'previous.manual.json');native=read(R/'native-full-source-readback.json');assert native.get('skipInvisibleInstanceChildren') is False;mains={m['id']:m for m in read(R/'native-private-mains.json')['mains']}
generated=read(D/'contract.generated.json')
expected={v['key']:{**v,'setKey':c['componentKey']} for c in generated['contracts'] if any(r['locator']['componentKey']==c.get('componentKey') for r in old['representations']) for v in c['figma']['variants']['variantKeys']}
assert len(expected)==len(native['variants'])==24
from urllib.parse import quote
groups={};bindings=[]
for v in native['variants']:
 root=v['root'];e=expected[root['key']]
 assert e['id']==root['id'] and e['setKey']==root['setKey'] and e['properties']==root['variantProperties']
 rep=next(r for r in old['representations'] if r['locator']['componentKey']==root['setKey'])
 nodes={n['id']:n for n in v['nodes']};paths={root['id']:''};proof=[]
 def source_id(n):
  owner=nodes.get(n['parentId'])
  while owner and owner['type']!='INSTANCE':owner=nodes.get(owner['parentId'])
  if not owner:return n['id']
  prefix=(owner['id'] if owner['id'].startswith('I') else 'I'+owner['id'])+';'
  assert n['id'].startswith(prefix)
  sid=n['id'][len(prefix):];main=mains[owner['main']['id']]
  assert main['key']==owner['main']['key']
  ref=next(x for x in main['nodes'] if x['id']==sid)
  assert ref['type']==n['type'] and ref['name']==n['name']
  par=nodes[n['parentId']]
  assert ref['parentId']==(main['id'] if par['id']==owner['id'] else par['id'][len(prefix):])
  proof.append({'nodeId':n['id'],'ownerId':owner['id'],'mainKey':main['key'],'sourceNodeId':sid})
  return sid
 def rel(n):
  if n['id'] in paths:return paths[n['id']]
  par=nodes[n['parentId']];assert n['id'] in par['childIds']
  dup=sum(x['parentId']==n['parentId'] and x['name']==n['name'] for x in v['nodes'])>1
  seg='@source:'+quote(source_id(n),safe="~!*'()-._") if dup else '@name:'+quote(n['name'],safe="~!*'()-._") if n['name'].startswith('@') or ' / ' in n['name'] else n['name']
  p=' / '.join(x for x in [rel(par),seg] if x);assert p not in paths.values()
  paths[n['id']]=p;return p
 for n in v['nodes']:rel(n)
 for n in v['nodes']:
  if n['type']!='INSTANCE':continue
  assert n['main']['id'] in mains
  p=paths[n['id']]
  if p=='Pips':continue
  row={'representationId':rep['id'],'componentKey':root['key'],'sourceRootId':root['id'],'nativeNodeId':n['id'],'relativePath':p,'pathHint':rep['locator']['name']+' / '+p,'nestedComponentKey':n['main']['key'],'nestedComponentSetKey':n['main']['setKey']}
  bindings.append(row);groups.setdefault(p,[]).append(row)
 v['reviewedPaths']=paths;v['provenSourceAddresses']=proof
assert len(bindings)==124 and len({r['componentKey'] for r in bindings})==24
targets=[]
for p,rows in groups.items():
 id='owned-'+hashlib.sha256(p.encode()).hexdigest()[:12]
 targets.append({'id':'target.'+id,'semanticRole':id,'label':p,'lineage':[old['component']['componentId']]+p.split(' / '),'pathHint':rows[0]['pathHint'],'nameHint':p.split(' / ')[-1],'resolution':'resolved','representationHints':[{'representationId':rid,'pathHint':next(r['pathHint'] for r in rows if r['representationId']==rid)} for rid in dict.fromkeys(r['representationId'] for r in rows)],'variantHints':[{k:r[k] for k in ['representationId','componentKey','pathHint']} for r in rows]})
manual=json.loads(json.dumps(old));manual['targets']+=targets;manual['metadata']['revision']=3;manual['metadata']['updatedAt']=read(R/'contract.manual.json')['metadata']['updatedAt'] if (R/'contract.manual.json').exists() else datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z')
assert manual['rules']==old['rules'] and manual['controlPorts']==old['controlPorts']
write('contract.manual.json',manual);write('bindings.json',{'rootVariants':24,'newTargetCount':len(targets),'ownedInstanceOccurrences':124,'bindings':bindings});write('native-address-proofs.json',native)
entry=read(D/'history/r2.json')['archive'] if (D/'history/r2.json').exists() else next(p for p in read(A/'experiments/current-contract-packages/manifest.json')['packages'] if p['componentId']=='web-core.slider')
data=(A/entry['file']).read_bytes();assert hashlib.sha256(data).hexdigest()==entry['zipSha256']
directory=R/'source-inputs';directory.mkdir(exist_ok=True)
files=[{'name':'contract.manual.json','path':str(R/'contract.manual.json'),'sha256':hashlib.sha256((R/'contract.manual.json').read_bytes()).hexdigest()}]
with zipfile.ZipFile(A/entry['file']) as z:
 for name in z.namelist():
  if not name.endswith('.json'):continue
  b=z.read(name);j=json.loads(b);base=Path(name).name
  if j.get('documentType')=='component-contract-manual':assert j==old;continue
  if j.get('documentType')=='component-contract' or base in ['coverage.json','validation-report.json']:continue
  p=directory/base;assert not p.exists() or p.read_bytes()==b;p.write_bytes(b);files.append({'name':base,'path':str(p),'sha256':hashlib.sha256(b).hexdigest()})
write('input-inventory.json',{'schemaVersion':'apollo.contract-authoring-inputs.v1','contractId':'web-core.slider','files':files})
print({'variants':24,'newTargets':len(targets),'newOccurrences':124,'sourceFiles':len(files)})
