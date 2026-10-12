from pathlib import Path
import json,hashlib,copy
r=Path(__file__).parent;p=r.parents[2]
def read(f):return json.loads(f.read_text())
def check(x,base=None):
 f=base/x['path'] if base else Path(x['path']);b=f.read_bytes();assert len(b)==x['bytes'];assert hashlib.sha256(b).hexdigest()==x['sha256'],str(f)
inputs=read(r/'inputs.json')
for i,x in enumerate(inputs['files']):
 b=(r/'before'/str(i)).read_bytes();assert len(b)==x['bytes'] and hashlib.sha256(b).hexdigest()==x['sha256']
for x in inputs['evidence']:check(x)
source=p/'Link/reports/live-review-r3-2026-10-11T06-07-06Z';z=read(source/'technical-replay.json');assert z['resetPreservingConfiguredText']=='PASS_SAME_INSTANCE_SAME_TEXT_AND_CONTEXT'
counts=[]
for c in z['cases']:
 d=read(source/c['input']['path']);root=next(n for n in d['snapshot']['nodes'] if n['parentId'] is None);label=next(n for n in d['snapshot']['nodes'] if n['semantic']['role']=='label');text=label['text']['characters'];assert text==c['actualText'];assert text==root['component']['properties']['\u270e Label#493:29'];counts.append(len(text));assert c['textLength']==len(text)
assert counts==[25,25] and inputs['actualTextLengths']==counts
manual=d['sources']['manual'];rule=next(x for x in manual['rules'] if x['id']=='component:web-core.link.label-content');assert rule['permission']=='allowed' and rule['constraints']==[]
update=read(r/'status-update.json');entries=[]
for i,name in enumerate(['manifest.json','draft-manifest.json']):
 a=read(p/name);before=read(r/'before'/str(i));x=next(v for v in a['packages'] if v['componentId']=='core.web.link');old=next(v for v in before['packages'] if v['componentId']=='core.web.link');assert x['revision']==3 and x['status']=='draft';assert x['configuredLabelReview']['actualTextLength']==counts[0];assert x['configuredLabelReview']['requested38CharacterInput']=='NOT_RUN_NOT_REQUIRED_OPTIONAL_REPEAT';restored=copy.deepcopy(a);new=next(v for v in restored['packages'] if v['componentId']=='core.web.link')
 for key in update['allowedManifestFields']:
  if key in old:new[key]=old[key]
  else:new.pop(key,None)
 assert restored==before;entries.append(x)
assert entries[0]==entries[1]
for x in update['supportingPins']:check(x)
if (r/'seal.json').exists():
 for x in read(r/'seal.json')['files']:check(x,r)
print(json.dumps({'evidenceReuse':'PASS_SCOPED','actualCharacterCount':25,'nonLinkManifestUnchanged':True,'historicalPinsUnchanged':True,'wholeReady':False}))
