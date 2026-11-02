const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..'), repo = path.resolve(root, '../..'), workspaceRoot = path.dirname(repo);
const consumer = require('../registry/consumer.cjs');
const inventory = require('../registry/source-inventory.cjs');
const registry = consumer.loadRegistry(), lock = consumer.lockFor(registry);
const copy = o => JSON.parse(JSON.stringify(o));
function planGroup() {
    const m = registry.mappings.find(m=>m.kind==='buttons-group');
    return {mappingId:m.id,platform:'desktop',figma:{representationId:m.figma.representationId,componentKey:m.figma.componentKey,Size:'56',Overflow:'false'},
        actions:[{id:'send',label:'Отправить',view:'primary',disabled:false,onClick:{handlerRef:'onSend'}},
            {id:'cancel',label:'Отменить',view:'secondary',disabled:false,onClick:{handlerRef:'onCancel'}}]};
}
function planContent() {
    const m=registry.mappings.find(m=>m.id==='arui-private.corporate-content.desktop');
    return {mappingId:m.id,platform:'desktop',figma:{representationId:m.figma.representationId,componentKey:m.figma.componentKey,slotProperty:m.figma.bodyProperty},slots:{Body:[planGroup()]}};
}
function assertFailure(code, run) {assert.throws(run,e=>e.code===code,code);}
test('registry matches exact source/contract pins and read-only consumer',()=>{
    assert.equal(registry.targetProduct,'apollo-v4');
    assert.equal(consumer.verifySource(registry,repo,workspaceRoot),true);
    assert.ok(Object.isFrozen(registry.mappings[0].code.api));
});
test('source exports exist; a Core peer dependency is not a public arui-private Button export',()=>{
    assert.ok(inventory.publicExport(repo,'button-group','ButtonGroup'));
    assert.ok(inventory.publicExport(repo,'corporate-content','CorporateContent'));
    assert.equal(inventory.publicExport(repo,'button','Button'),false);
    assert.equal(inventory.publicExport(repo,'ButtonsGroup','ButtonsGroup'),false);
    assertFailure('UNAVAILABLE_COMPONENT',()=>consumer.resolve(registry,'@alfalab/core-components/button','desktop'));
});
test('desktop CorporateContent→Body→ButtonGroup preserves typed actions and handler identities',()=>{
    const receipt=consumer.preflight(registry,planContent(),lock,{repo,workspaceRoot});
    assert.equal(receipt.status,'availability-pass');assert.equal(receipt.fullContractParity,'not-confirmed');
    const body=receipt.prepared.children[0];assert.equal(body.props.primaryFirst,true);assert.equal(body.props.size,56);
    assert.deepEqual(body.props.elements.map(e=>e.onClick.handlerRef),['onSend','onCancel']);
    const code=consumer.emit(receipt.prepared);assert.match(code,/onClick: onSend/);assert.doesNotMatch(code,/@alfalab|<Button\b|overflow=/);
    const compiled=ts.transpileModule('const screen = '+code+';',{reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS}});
    assert.equal(compiled.diagnostics?.length,0); // syntax/JSX emission; not a missing-peer application typecheck
});
test('empty and mixed Body payload keep sequence; no synthetic placeholder/layout component',()=>{
    const p=planContent();p.slots.Body=[];assert.equal(consumer.emit(consumer.prepare(registry,p,lock)),'<CorporateContent></CorporateContent>');
    p.slots.Body=['Строка',planGroup(),'Конец'];const code=consumer.emit(consumer.prepare(registry,p,lock));
    assert.ok(code.indexOf('Строка')<code.indexOf('<ButtonGroup'));assert.ok(code.indexOf('Конец')>code.indexOf('<ButtonGroup'));
    assert.doesNotMatch(code,/Section|Tailwind|placeholder/);
});
const negatives=[
    ['UNAVAILABLE_COMPONENT',p=>p.mappingId='arui-private/unknown'],
    ['UNSUPPORTED_PLATFORM',p=>p.platform='mobile-web'],
    ['UNAPPROVED_IMPORT',p=>p.import='@alfalab/core-components/button'],
    ['UNSUPPORTED_PROP',p=>p.props={overflow:true}],
    ['UNSUPPORTED_SLOT',p=>p.slots={Body:[]}],
    ['UNSUPPORTED_SIZE',p=>p.figma.Size='64'],
    ['UNVERIFIED_FIGMA_OCCURRENCES',p=>p.figma.Size='32'],
    ['OVERFLOW_PARITY_GAP',p=>p.figma.Overflow='true'],
    ['FIGMA_IDENTITY_MISMATCH',p=>p.figma.componentKey='same-name-different-key'],
    ['MISSING_EVENT_BINDING',p=>delete p.actions[0].onClick],
    ['PRIMARY_ORDER_GAP',p=>p.actions[1].view='primary'],
    ['INVALID_ACTION_ID',p=>p.actions[1].id=p.actions[0].id],
    ['UNSUPPORTED_ACTION_PROP',p=>p.actions[0].icon='<CoreIcon/>'],
];
for(const [code,mutate] of negatives)test('rejects '+code,()=>{const p=planGroup();mutate(p);assertFailure(code,()=>consumer.prepare(registry,p,lock));});
test('rejects unknown CorporateContent slot, fabricated background prop, theme equivalence and extra Body children input',()=>{
    const p=planContent();p.slots={Content:[]};assertFailure('UNSUPPORTED_SLOT',()=>consumer.prepare(registry,p,lock));
    p.slots={Body:[]};p.props={background:'grey'};assertFailure('UNSUPPORTED_PROP',()=>consumer.prepare(registry,p,lock));
    p.props={theme:'grey'};assertFailure('UNMAPPED_CODE_PROP',()=>consumer.prepare(registry,p,lock));
    p.props={children:[]};assertFailure('AMBIGUOUS_BODY',()=>consumer.prepare(registry,p,lock));
});
test('unknown child component cannot bypass Body availability gate',()=>{
    const p=planContent();p.slots.Body[0].mappingId='core.web.input';assertFailure('UNAVAILABLE_COMPONENT',()=>consumer.prepare(registry,p,lock));
});
test('registry corruption, stale locks, source and contract pins fail closed',()=>{
    const broken=copy(registry);broken.source.version='80.7.2';assertFailure('REGISTRY_DIGEST_MISMATCH',()=>consumer.validateRegistry(broken));
    assertFailure('REGISTRY_DIGEST_MISMATCH',()=>consumer.preflight(broken,planContent(),lock,{repo,workspaceRoot}));
    const stale=copy(lock);stale.codeCommit='old';assertFailure('STALE_MAPPING_LOCK',()=>consumer.prepare(registry,planContent(),stale));
    const source=copy(registry);source.source.files[0].sha256='0'.repeat(64);assertFailure('STALE_CODE_HASH',()=>consumer.verifySource(source,repo,workspaceRoot));
    const mapping=copy(registry);mapping.mappingArtifacts[0].sha256='0'.repeat(64);assertFailure('STALE_MAPPING_HASH',()=>consumer.verifySource(mapping,repo,workspaceRoot));
    const contract=copy(registry);contract.mappings[0].contract.archiveSha256='0'.repeat(64);assertFailure('STALE_CONTRACT_PIN',()=>consumer.verifySource(contract,repo,workspaceRoot));
});
function template(file,figma) {
    const source=fs.readFileSync(path.join(root,file),'utf8');
    const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
    const exports={};vm.runInNewContext(js,{exports,require(n){assert.equal(n,'figma');return figma;}});return exports.default;
}
const code=(strings,...values)=>{const sections=[];strings.forEach((s,i)=>{if(s)sections.push({type:'CODE',code:s});const v=values[i];if(v===undefined)return;if(Array.isArray(v))sections.push(...v);else if(v?.sections)sections.push(...v.sections);else sections.push({type:'CODE',code:String(v)});});return {sections,language:'tsx',type:'SECTIONS'};};
function button(id,label,view='Secondary') {
    return {type:'INSTANCE',id,symbolId:'symbol-'+id,name:'[D] Button',getString(n){assert.equal(n,'✎ Label');return label;},
        getEnum(n,map){return map[{View:view,Size:'56',SingleIcon:'False',DisabledState:'False'}[n]];},getBoolean(n){return n==='Label';}};
}
function groupContext() {
    const a=button('a','Отправить','Primary'),b=button('b','Отменить'),hidden=button('c','Hidden');
    return {code,selectedInstance:{children:[a,b,hidden],getEnum(n,map){return map[{Size:'56',Overflow:'false'}[n]];}},batch:{buttonsGroupBinding:{visibleOccurrenceIds:['a','b'],handlersByOccurrenceId:{a:'onSend',b:'onCancel'},identityByOccurrenceId:Object.fromEntries([a,b].map(n=>[n.id,{symbolId:n.symbolId,componentSetKey:'f9979d6cc8598aec25f721e0a45b7eef2eeb0088'}]))}}};
}
test('ButtonsGroup template maps only proven visible occurrences to element objects without standalone Core imports',()=>{
    const t=template('ButtonsGroup.figma.ts',groupContext());const output=t.example.sections.map(s=>s.code??'').join('');
    assert.match(output,/primaryFirst=\{true\}/);assert.match(output,/children: "Отправить"/);assert.match(output,/onClick: onSend/);
    assert.doesNotMatch(output,/Hidden|\[object Object\]/);assert.deepEqual(JSON.parse(JSON.stringify(t.imports)),['import { ButtonGroup } from "arui-private/button-group";']);
});
test('template refuses missing visibility/event evidence, stale identity and occurrence reordering',()=>{
    const a=groupContext();a.batch={};assert.throws(()=>template('ButtonsGroup.figma.ts',a),/MISSING_VISIBILITY_EVIDENCE/);
    const b=groupContext();delete b.batch.buttonsGroupBinding.handlersByOccurrenceId.a;assert.throws(()=>template('ButtonsGroup.figma.ts',b),/MISSING_EVENT_BINDING/);
    const c=groupContext();c.batch.buttonsGroupBinding.identityByOccurrenceId.a.symbolId='other';assert.throws(()=>template('ButtonsGroup.figma.ts',c),/UNPROVEN_CHILD_IDENTITY/);
    const d=groupContext();d.batch.buttonsGroupBinding.visibleOccurrenceIds.reverse();assert.throws(()=>template('ButtonsGroup.figma.ts',d),/OCCURRENCE_ORDER_MISMATCH/);
});
test('mobile Body uses its native SLOT; public code API is shared but platform/contract pin is separate',()=>{
    let requested;const sections=[{type:'SLOT',guid:'mobile-body'}];
    const t=template('CorporateContentMobile.figma.ts',{code,selectedInstance:{getSlot(name){requested=name;return sections;}}});
    assert.equal(requested,'[M] Body');assert.equal(t.example.sections[1].guid,'mobile-body');
    const m=registry.mappings.find(m=>m.id.endsWith('corporate-content.mobile-web'));
    const p={mappingId:m.id,platform:'mobile-web',figma:{representationId:m.figma.representationId,componentKey:m.figma.componentKey,slotProperty:m.figma.bodyProperty},slots:{Body:[]}};
    assert.equal(consumer.prepare(registry,p,lock).export,'CorporateContent');
    p.slots.Body=[{...planGroup(),platform:'mobile-web'}];assertFailure('UNSUPPORTED_PLATFORM',()=>consumer.prepare(registry,p,lock));
});
// Execute the real pure implementation helpers, not a second implementation.
function sourceModule(relative,cache={}) {
    if(cache[relative])return cache[relative];const filename=path.join(repo,relative);
    const source=fs.readFileSync(filename,'utf8');const exports={};cache[relative]=exports;
    const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
    vm.runInNewContext(js,{exports,require(specifier){
        if(specifier==='@alfalab/core-components/vars')return {gapXl:'unresolved:gapXl',gap3xl:'unresolved:gap3xl',gap5xl:'unresolved:gap5xl'};
        if(!specifier.startsWith('.'))throw new Error('External runtime unavailable: '+specifier);
        return sourceModule(path.posix.normalize(path.posix.join(path.posix.dirname(relative),specifier+'.ts')),cache);
    }});return exports;
}
test('actual width/count helper exposes automatic overflow and mobile collapse mismatch',()=>{
    const {calculateHiddenElements}=sourceModule('src/button-group/utils/calculate-hidden-elements.ts');
    const elements=Array.from({length:4},()=>({clientWidth:100}));
    const run=options=>JSON.parse(JSON.stringify(calculateHiddenElements({elements,margin:16,isMobile:false,limitWidth:1000,maxVisibleButtons:4,...options})));
    assert.deepEqual(run({elements:elements.slice(0,2)}).hiddenIndexes,[]);
    assert.deepEqual(run({limitWidth:210}).hiddenIndexes,[1,2,3]);
    assert.deepEqual(run({maxVisibleButtons:3}).hiddenIndexes,[2,3]);
    assert.deepEqual(run({elements:elements.slice(0,2),isMobile:true}).hiddenIndexes,[1]);
});
test('actual overflow mapper preserves disabled but drops onClick/icon/reason by default; custom mapper can route action',()=>{
    const {getPickerButtonOptions}=sourceModule('src/button-group/utils/get-picker-button-options.ts');
    const onClick=()=>{},elements=[{children:'First'},{children:'Second',onClick,disabled:true,leftAddons:'icon',disabledReason:'Why'},{children:'Third'}];
    const r=getPickerButtonOptions({elements,hiddenIndexes:[1,2]});assert.deepEqual(JSON.parse(JSON.stringify(r.map(x=>x.content))),['Second','Third']);
    assert.equal(r[0].disabled,true);assert.equal(r[0].onClick,undefined);assert.equal(r[0].leftAddons,undefined);assert.equal(r[0].disabledReason,undefined);
    const custom=getPickerButtonOptions({elements,hiddenIndexes:[1],mapElementToPickerOption:(p,i)=>({key:'action-'+i,content:p.children,actionId:'second'})});assert.equal(custom[0].actionId,'second');
});
test('actual CorporateContent utility selects explicit mobile/desktop padding; unresolved peer tokens remain labelled',()=>{
    const {getVerticalPaddings}=sourceModule('src/corporate-content/utils.ts');
    const input={desktop:[40,'64px'],mobile:[24,24]};
    assert.equal(getVerticalPaddings(true,input).paddingBottom,'64px');assert.equal(getVerticalPaddings(false,input).paddingTop,24);
    assert.equal(getVerticalPaddings(true).paddingTop,'unresolved:gap3xl');
});
