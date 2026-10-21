#!/usr/bin/env python3
import json, pathlib, hashlib, zipfile, shutil, os
ROOT=pathlib.Path(__file__).resolve().parent
W=pathlib.Path('/Users/alexkukhta/Desktop/workplace')
DS=W/'shared/design-system_ab'
COMP=DS/'experiments/current-contract-packages/PaymentMaskedNumber'
CANON=DS/'JSONS/web/components/web-corp/PaymentMaskedNumber'
def sha(b): return hashlib.sha256(b).hexdigest()
def semantic(x): return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def pin(p):
 p=pathlib.Path(p).resolve(); b=p.read_bytes(); return dict(path=str(p),sha256=sha(b),bytes=len(b))
def save(name,x):
 p=ROOT/name;p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def freeze(src,dst):
 p=ROOT/dst;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(pathlib.Path(src).read_bytes());return pin(p)
inputs=[]
def record(p): inputs.append(pin(p)); return inputs[-1]
manifest=DS/'experiments/current-contract-packages/manifest.json'
entry=next(x for x in json.loads(manifest.read_text())['packages'] if x['componentId']=='web-corp.payment-masked-number')
assert entry['revision']==3
archive=manifest.parent/entry['file']
original_archive=record(archive)
assert original_archive['sha256']==entry['sha256']
frozen_archive=freeze(archive,'fixtures/PaymentMaskedNumber.r3.component-contract.zip')
with zipfile.ZipFile(archive) as z:
 entries=[dict(name=n,sha256=sha(z.read(n)),bytes=len(z.read(n))) for n in z.namelist()]
 manual=json.loads(z.read('contract.manual.json'))
 compiled=json.loads(z.read('compiled/component-contract.v2.json'))
 (ROOT/'contract.manual.json').write_bytes(z.read('contract.manual.json'))
 (ROOT/'compiled.component-contract.v2.json').write_bytes(z.read('compiled/component-contract.v2.json'))
canonical_manual=record(CANON/'contract.manual.json')
assert manual==json.loads((CANON/'contract.manual.json').read_text())
assert semantic(manual)==entry['manualSourceHash']
assert manual['metadata']['revision']==3 and manual['component']['platform']=='universal'
manual_pin=pin(ROOT/'contract.manual.json');compiled_pin=pin(ROOT/'compiled.component-contract.v2.json')
source_rules=record(CANON/'rules.json');freeze(CANON/'rules.json','fixtures/source-rules.json')
facts=record(CANON/'variant-evidence.json');freeze(CANON/'variant-evidence.json','fixtures/variant-evidence.json')
for p in [manifest,DS/'JSONS/indexes/component-contracts.index.json',W/'AGENTS.md',DS/'AGENTS.md',COMP.parent/'AGENTS.md',W/'docs/APOLLO_SYNC_WORKFLOW.md',W/'docs/APOLLO_PROCESS_LESSONS.md']:
 record(p)
for skill in ['apollo-map-figma','apollo-map-frontend','ponytail']:
 s=pathlib.Path('/Users/alexkukhta/.codex/skills')/skill
 for rel in ['SKILL.md','references/evals.md','references/api-evidence.md','references/native-evidence.md']:
  if (s/rel).exists():record(s/rel)
data_root=W/'services/apollo-proxy/runtime/data'
idx=json.loads((data_root/'manifest.json').read_text())
record(data_root/'manifest.json')
for k in ['frontend','native','semantic','mappings','ruleLinks','bindings']:
 record(data_root/idx['generation'][k]['file'])
for p in [W/'services/apollo-proxy/runtime/config/frontend.json',W/'services/apollo-proxy/runtime/config/figma.json']:
 record(p)
for f in ['mapping.js','api.js']:
 p=W/'projects/Apollo/src/generation/agent/figma'/f;record(p);freeze(p,'evidence/consumer/'+f)
p=W/'projects/Apollo/scripts/agent-run-inputs.cjs';record(p);freeze(p,'evidence/consumer/agent-run-inputs.cjs')
for f in ['index.ts','payment-masked-number.tsx','payment-masked-number.css','utils.ts']:
 p=W/'arui-private/src/payment-masked-number'/f;record(p);freeze(p,'fixtures/source/payment-masked-number/'+f)
for p in [W/'arui-private/package.json',W/'arui-private/tools/build/copy-package-json.mjs',W/'arui-private/tools/build/utils.mjs',W/'arui-private/tools/code-connect/frontend-host/package.json',W/'arui-private/tools/code-connect/frontend-host/package-lock.json']:
 record(p)
host=W/'arui-private/tools/code-connect/frontend-host'
installed=host/'node_modules/arui-private'
distribution=installed.resolve()
record(distribution/'package.json')
gapfile=host/'node_modules/@alfalab/core-components-vars/gaps.css'
record(gapfile)
gapcss=gapfile.read_text()
assert '--gap-2xs: 4px' in gapcss
existence={str(distribution/f): (distribution/f).exists() for f in ['esm/payment-masked-number/index.js','esm/payment-masked-number/index.d.ts','cjs/payment-masked-number/index.js','cjs/payment-masked-number/index.d.ts']}
assert not any(existence.values())
save('INPUT-PINS.json',{'schemaVersion':'apollo.mapping-input-pins.v1','files':inputs,'absenceAssertions':existence,'symlinks':[{'path':str(installed),'target':str(distribution)}]})
save('ARCHIVE-PIN.json',{'revision':3,'currentManifestEntry':entry,'originalArchive':original_archive,'frozenArchive':frozen_archive,'entries':entries,'canonicalManual':canonical_manual,'manual':manual_pin,'manualSemanticHash':semantic(manual),'compiled':compiled_pin,'compiledSemanticHash':semantic(compiled),'canonicalFacts':facts})
links={'schemaVersion':'apollo.agent-rule-links.v1','links':[{'RuleID':r['id'],'source':dict(manual_pin,pointer='/rules/'+str(i)),'rule':r} for i,r in enumerate(manual['rules'])]}
save('rule-links.json',links)
raw=json.loads((ROOT/'evidence/figma-source.readback.json').read_text())
assert not raw.get('isError')
live=json.loads(next(c['text'] for c in raw['content'] if c['type']=='text'))
raw=json.loads((ROOT/'evidence/figma-parts.readback.json').read_text())
assert not raw.get('isError')
parts=json.loads(next(c['text'] for c in raw['content'] if c['type']=='text'))
assert not live['mutatedNodeIds'] and not parts['mutatedNodeIds']
save('evidence/native-evidence.json',{'root':live,'parts':parts,'freshReadOnly':True,'nativeGeneration':False})
cid=manual['component']['componentId']; rep=manual['representations'][0]['id']; mid='arui-private.payment-masked-number.universal'; choiceid='paymentmaskednumber.universal'
owners={o['name']:o for o in live['owners']}
rootkey=live['sourceRoot']['key']
domains={'addonVisible':{'type':'boolean','enum':[False,True]},'maskNumber':{'type':'string','enum':['False','True']},'major':{'type':'string'},'minor':{'type':'string'},'addonPreset':{'type':'string','enum':[x for x in manual['semanticApi'][4]['domain'] if x!='SwapMe']}}
port_rules={'addonVisible':['addon-geometry'],'maskNumber':['mask-format'],'major':[],'minor':[],'addonPreset':[]}
ports={}; bindings=[]
for i,p in enumerate(manual['semanticApi']):
 b=p['bindings'][0]; prop=b['path'].removeprefix('component.properties.'); target=b.get('targetId','target.root')
 typ={'addonVisible':'BOOLEAN','maskNumber':'VARIANT','major':'TEXT','minor':'TEXT','addonPreset':'VARIANT'}[p['id']]
 ruleids=['component:'+cid+'.'+n for n in port_rules[p['id']]]
 ports[p['id']]={'nativePort':p['id'],'type':typ,'property':prop,'targetId':target,'writeDomain':domains[p['id']]}
 bindings.append({'mappingId':mid,'representationId':rep,'port':p['id'],'kind':'property','type':typ,'componentProperty':prop,'targetId':target,'writeDomain':domains[p['id']],'sourceDomain':p.get('domain'),'normativeSource':dict(manual_pin,pointer='/semanticApi/'+str(i),RuleIDs=ruleids),'runtimeAdmission':'NOT_GRANTED'})
defs=live['sourceRoot']['definitions']
default={'id':choiceid+'.source-default','representationId':rep,'platform':'universal','properties':{'addonVisible':False,'maskNumber':'False','addonPreset':'StatusBadge'},'intent':'Public source default; number content is supplied by scenario.'}
target_rows=[]
specs=[('target.root',[],rootkey,None,{},{}),('target.major',[0],live['rows'][1]['mainComponent']['key'],owners['Major']['key'],{},{}),('target.minor',[1],owners['Minor']['key'],None,{},{}),('target.addon',[2],next(v['key'] for v in owners['RightAddon']['variants'] if v['name']=='Presets=StatusBadge'),owners['RightAddon']['key'],{},{}),('target.major-text',[0,0],None,None,{'characters':'✎ Major#26906:0'},{}),('target.minor-text',[1,0],None,None,{'characters':'✎ Minor#26906:4'},{})]
for t,path,key,setkey,refs,props in specs:
 row={'targetId':t,'sourceTemplatePath':path,'runtimeType':'TEXT' if t.endswith('-text') else 'INSTANCE','sourceType':'COMPONENT' if t=='target.root' else ('TEXT' if t.endswith('-text') else 'INSTANCE'),'cardinality':1,'nativeRefs':refs,'nativeProperties':props}
 row['sourceNodeId']=next(r['id'] for r in live['rows'] if r['path']==['PaymentMaskedNumber']+[{'target.major':'Major','target.minor':'Minor','target.addon':'Addon'}.get(t,'')] ) if False else None
 if key:row.update(requiredMainKey=key,requiredSetKey=setkey)
 if t.endswith('-text'): row['semanticOwner']=t.replace('-text','')
 target_rows.append(row)
# Fixed source child indices are proven by the bounded root readback, never runtime IDs.
for r,liveid in zip(target_rows,['23266:258531','23266:258532','23266:258533','23266:258534','I23266:258532;23266:258527','I23266:258533;23266:258520']):r['sourceNodeId']=liveid
partdefs=[]
for owner in live['owners']:
 variants=owner['variants'] or [{'id':owner['id'],'key':owner['key'],'name':owner['name']}]
 vr=[]
 for v in variants:
  prop={}
  if owner['name']=='Major':prop={'Mask Number':v['name'].split('=')[1]}
  if owner['name']=='RightAddon':prop={'Presets':v['name'].split('=')[1]}
  vr.append(dict(v,properties=prop))
 partdefs.append({'id':owner['id'],'key':owner['key'],'type':owner['type'],'definitions':owner['definitions'],'variants':vr})
figma={'semantic':{'schemaVersion':'apollo.agent-figma-semantic-mapping.v1','status':'PRIVATE_CANDIDATE_NOT_ADOPTED','mappings':[{'mappingId':mid,'componentId':cid,'representationId':rep,'platform':'universal','choices':[choiceid],'ports':ports,'defaults':[default]}],'Ready':False},'typed':{'schemaVersion':'apollo.agent-figma-typed-native-binding-input.v1','bindings':bindings,'Ready':False},'profiles':{'sourceDependencies':[{'componentId':cid,'revision':3,'manual':manual_pin,'archive':frozen_archive,'manualSemanticHash':semantic(manual),'compiledSemanticHash':semantic(compiled),'dependencyPins':[]}],'profiles':[{'mappingId':mid,'platform':'universal','representationId':rep,'sourceChoices':[choiceid],'default':default}],'choices':[{'id':choiceid,'key':rootkey,'setKey':None,'properties':{},'definitions':defs,'generic':True,'exactDefinitions':True,'representationId':rep,'platform':'universal'}],'actualPartDefinitions':partdefs,'actualNativeGeneration':False,'Ready':False},'targets':{'schemaVersion':'apollo.agent-figma-source-targets.v1','profiles':[{'choiceId':choiceid,'targets':target_rows}],'Ready':False},'manuals':[{'pin':manual_pin,'manual':manual}],'ruleLinks':links,'denials':[{'mappingId':mid,'port':'addonPreset','value':'SwapMe','reason':'Service placeholder has no admitted replacement content port.'}]}
save('payment-masked-number.figma-mapping.json',figma)
mask_rule=manual['rules'][2]['id']
front={'schemaVersion':'apollo.agent-frontend-mapping.v1','target':'frontend','status':'PARTIAL_SOURCE_API_CANDIDATE_NOT_DISTRIBUTION_ADMITTED','accepted':False,'Ready':False,'ruleLinksFile':'rule-links.json','context':{'contracts':{'PaymentMaskedNumber':{'revision':3,'archive':frozen_archive,'manual':manual_pin}},'package':{'name':'arui-private','version':'80.7.1','sourcePackage':pin(W/'arui-private/package.json')},'distribution':{'installedModuleLink':str(installed),'physicalRoot':str(distribution),'missingInputs':list(existence)},'browser':{'executed':False}},'bindings':[{'mappingId':mid,'componentId':cid,'representationId':cid+'.code.arui-private.universal','sourceRepresentationId':rep,'declaredInContract':False,'representationStatus':'external-draft-proposal','platform':'universal','import':{'module':'arui-private/payment-masked-number','export':'PaymentMaskedNumber'},'contract':{'archive':frozen_archive,'manual':dict(manual_pin,semanticHash=semantic(manual)),'revision':3,'compiledHash':semantic(compiled),'sourceStatus':'draft'},'ports':[{'logical':'maskNumber','codePath':'props.hideNumber','targetId':'target.major','domain':['False','True'],'transform':{'id':'enum-map','entries':[{'from':'False','to':False},{'from':'True','to':True}]},'RuleIDs':[mask_rule]}],'requiredPublicInputs':{'props.type':['card','account'],'props.number':'Caller-supplied full raw number; never reconstruct from masked Major/Minor.'},'unmappedSemanticPorts':['major','minor','addonVisible','addonPreset'],'rightAddon':{'codePath':'props.rightAddon','type':'React.ReactNode','composition':'Caller-owned; no Figma-preset-to-component renderer is invented. Not props.children.','absence':'omit rightAddon for hidden addon'},'behavior':'No required callback or fabricated loading/disabled/error props. HTML event props are caller context.','helper':{'file':'bindings.ts','export':'mapMaskNumber','scope':'Pure enum-to-boolean only'},'runtimeAdmission':False,'normVerdicts':'UNKNOWN','Ready':False}]}
save('payment-masked-number.frontend-mapping.json',front)
api={'schemaVersion':'apollo.public-api-evidence.v1','publicImport':'arui-private/payment-masked-number','namedExport':'PaymentMaskedNumber','sourceEntry':pin(W/'arui-private/src/payment-masked-number/index.ts'),'implementation':pin(W/'arui-private/src/payment-masked-number/payment-masked-number.tsx'),'publicProps':{'required':{'type':"'card' | 'account'",'number':'string'},'optional':{'hideNumber':'boolean','rightAddon':'React.ReactNode','rightAddonClassName':'string','className':'string'},'inherited':'React.HTMLAttributes<HTMLDivElement>'},'platforms':['desktop','mobile-web'],'platformEvidence':'Same responsive DOM/CSS and ResizeObserver algorithm for both; no desktop/mobile export or platform prop. Browser parity not run.','formatting':{'accountMask':'xxxxx xxx x xxxx xxxxxxx','cardMask':'xxxx xxxx xxxx xxxx','separator':'U+205F','lastSymbols':4,'hiddenMajor':'U+00B7 U+00B7 U+2009','sourceValidation':'formatNumber does not validate digits/length and can truncate excess input or pad short input with U+205F. No normative validity inferred.'},'distribution':{'status':'MISSING_COMPONENT_SUBPATH','observedFiles':existence,'sourceDistributionCorrespondence':'NOT_ESTABLISHED'},'addonGap':{'contractPx':6,'sourceCSS':'margin-left: var(--gap-2xs)','observedTokenPx':4,'tokenInput':pin(gapfile),'scope':'Observed source/token mismatch; no browser run; theme overrides must be independently proven.'}}
save('PUBLIC-API-EVIDENCE.json',api)
source=json.loads((CANON/'rules.json').read_text())
coverage=[]
for i,r in enumerate(source['manual']['rules']):
 rid=r['ruleId']; authoritative=next((q for q in links['links'] if q['RuleID']==rid),None)
 coverage.append({'RuleID':rid,'text':r['ruleText'],'source':dict(source_rules,pointer='/manual/rules/'+str(i)),'compiledAuthority':authoritative['source'] if authoritative else None,'figma':'source correspondence only; no new checking/native acceptance','frontend':'mask literal source correspondence' if rid.endswith('.mask-format') else ('SOURCE_TOKEN_CONFLICT_6_VS_4' if rid.endswith('.addon-geometry') else 'UNKNOWN_NORM_PARITY'),'Ready':False})
save('coverage-map.json',{'sourceNorms':coverage,'compiledRules':len(manual['rules']),'sourceRules':len(coverage),'technicalGeneratedRules':source['generated']['rules'],'note':'No legacy/technical source norm is promoted into a new contract rule.'})
gaps=[
 ('PMN-DISTRIBUTION','frontend/package-owner','Public subpath JS/d.ts are absent from selected physical distribution. Source import is a proposal; no installed-module/type/browser acceptance.'),
 ('PMN-ADDON-GAP','frontend/design-system-owner','Contract 6px vs source var(--gap-2xs) observed 4px; no override or source fix in mapping scope.'),
 ('PMN-RAW-NUMBER','frontend/generation-owner','Manual supplies Major/Minor, code requires full number and explicit card/account type. Masked content is non-invertible; caller must provide raw number; existing semantic API is not silently extended.'),
 ('PMN-ADDON-COMPOSITION','both/generation-owner','rightAddon is ReactNode; Presets is a nested Figma VARIANT. No automatic renderer, public SLOT or INSTANCE_SWAP is exposed for service SwapMe.'),
 ('PMN-MASKED-MAJOR','figma/generation-owner','Masked Major source text has no characters property reference; never write custom Major text in True profile. Re-resolve targets after variant switch; masked reference must refuse.'),
 ('PMN-TEXT-DOMAIN','frontend/generation-owner','Current frontend admission accepts finite enum domains, not arbitrary string Major/Minor ports; no inferred raw-number bridge.'),
 ('PMN-STYLE-AND-OVERFLOW','both/design-system-owner','Token/text-style pairing, addon height and narrow overflow need separate behavior/browser/native coverage; bare part empty style IDs are not composed-style failures.'),
 ('PMN-DEPENDENCIES','figma/generation-owner','Native nested StatusBadge/icons keys are observed only; no approved public component dependency mappings are introduced.'),
 ('PMN-RUNTIME-ADOPTION','consumer/integration-owner','No PMN mapping installed into active data package; MCP/built-in/frontend admission remain separate. Draft code representation is external proposal.')
]
save('CAPABILITY-GAPS.json',{'gaps':[{'id':i,'owner':o,'evidence':e,'status':'OPEN'} for i,o,e in gaps],'Ready':False})
print(json.dumps({'root':str(ROOT),'filesPinned':len(inputs),'sourceRules':len(coverage),'figmaPorts':len(bindings),'frontendPorts':1,'archiveSha256':frozen_archive['sha256'],'dataSnapshotId':idx['id']}))

