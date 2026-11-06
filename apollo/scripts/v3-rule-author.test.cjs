'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createCandidate,inspectComponent,interview}=require('./v3-rule-author.cjs');
const apolloRoot=process.env.APOLLO_ROOT||path.resolve(__dirname,'../../../../projects/Apollo');
function put(root,file,value){const p=path.join(root,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n');return p;}
function fixture(t){
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'v3-rule-author-')));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const host='a'.repeat(40),member='b'.repeat(40),baseUrl='https://example.test/JSONS/';
 const entry={componentKey:'fixture.group',packageName:'Group',packagePath:'fixture/Group',figmaKeys:[host],coverage:'required',artifacts:{generatedContract:'api.json',rules:'rules.json',composition:'composition-contract.json'}};
 put(root,'JSONS/apollo/indexes/componentContractIndex.json',{schemaVersion:2,documentType:'component-contract-index',coverage:{defaultPolicy:'required'},baseUrl,packages:[entry]});
 put(root,'JSONS/fixture/Group/api.json',{schemaVersion:'apollo.ds-contracts.v1',contracts:[{id:'fixture',name:'Group',normalizedName:'group',componentKey:host,status:'current',role:'Main',platform:'Desktop',figma:{variants:{properties:{},allowedCombinations:[],variantKeys:[]}}}]});
 put(root,'JSONS/fixture/Group/rules.json',{rules:[]});
 const body={schemaVersion:2,documentType:'composition-contract',metadata:{componentKey:'fixture.group',ownershipSchema:'apollo.artifact-ownership.v2'},generated:{component:{name:'Group'}},manual:{contracts:[{id:'fixture.layout',match:{hostComponentKeys:[host]},select:{nestedComponentKeys:[member],visibility:'visible',order:'document'},constraints:[{id:'amount',op:'countBetween',min:2,max:4,message:'От двух до четырёх',presentation:{expectation:'Старый текст',action:'Старый текст'}},{id:'other',op:'propertyDomain',property:'View',values:['Primary'],message:'Соседнее правило'}]}]}};
 const source=put(root,'JSONS/fixture/Group/composition-contract.json',body),sourceBytes=fs.readFileSync(source);
 return{root,source,body,sourceBytes,options:{dsRoot:root,apolloRoot,component:'fixture.group',contract:'fixture.layout',id:'amount',min:3,max:4,message:'От трёх до четырёх видимых действий',source:'synthetic:test-only',output:path.join(root,'candidate')}};
}
test('creates a candidate, normalizes it, tests actual V3 and preserves the source and neighbouring rule',async t=>{
 const f=fixture(t),report=await createCandidate(f.options);assert.equal(report.status,'DRAFT_CANDIDATE_VERIFIED');assert.equal(report.ruleId,'fixture.layout.amount');assert(report.examples.some(c=>c.result==='VIOLATION'));assert(report.examples.some(c=>c.result==='NO_VIOLATION'));assert(report.examples.some(c=>c.result==='NOT_APPLICABLE'));
 const candidate=JSON.parse(fs.readFileSync(path.join(f.options.output,'composition-contract.candidate.json')));assert.equal(candidate.manual.contracts[0].constraints[0].min,3);assert.equal(candidate.manual.contracts[0].constraints[0].presentation.expectation,f.options.message);assert.deepEqual(candidate.manual.contracts[0].constraints[1],f.body.manual.contracts[0].constraints[1]);assert.deepEqual(fs.readFileSync(f.source),f.sourceBytes);
 assert(fs.readFileSync(path.join(f.options.output,'preview.md'),'utf8').includes('fixture.layout.amount'));
});
test('adds a count rule and a new explicitly selected owner group in the existing source format',async t=>{
 const f=fixture(t),report=await createCandidate({...f.options,contract:'fixture.new-layout',id:'new-count',hostName:'New Group',memberName:'New Action',visibility:'all'});assert.equal(report.ruleId,'fixture.new-layout.new-count');assert.equal(report.examples.find(c=>c.kind==='selector-control').actualCount,2);
 const candidate=JSON.parse(fs.readFileSync(path.join(f.options.output,'composition-contract.candidate.json')));assert.deepEqual(candidate.manual.contracts[0],f.body.manual.contracts[0]);assert.deepEqual(fs.readFileSync(f.source),f.sourceBytes);
});
test('invalid/unsupported constraints and missing source do not produce a candidate',async t=>{
 for(const change of [{min:5,max:2},{min:-1},{min:1.5},{min:''},{max:undefined},{source:''},{id:'other'},{visibility:'all'},{component:'not-indexed'}]){const f=fixture(t);await assert.rejects(createCandidate({...f.options,...change}));assert(!fs.existsSync(f.options.output));assert.deepEqual(fs.readFileSync(f.source),f.sourceBytes);}
});
test('runtime overlay shadowing is reported instead of claiming the manual candidate executes',async t=>{
 const f=fixture(t);f.body.runtime={contracts:JSON.parse(JSON.stringify(f.body.manual.contracts))};f.body.runtime.contracts[0].constraints[0].min=1;put(f.root,'JSONS/fixture/Group/composition-contract.json',f.body);await assert.rejects(createCandidate(f.options),/не попало в исполняемую проекцию/);assert(!fs.existsSync(f.options.output));
});
test('a shadowed presentation edit cannot pass merely because its numeric bounds agree',async t=>{
 const f=fixture(t);f.body.runtime={contracts:JSON.parse(JSON.stringify(f.body.manual.contracts))};put(f.root,'JSONS/fixture/Group/composition-contract.json',f.body);
 await assert.rejects(createCandidate({...f.options,min:2,max:4,message:f.body.manual.contracts[0].constraints[0].message,action:'Новое действие'}),/не попало в исполняемую проекцию/);assert(!fs.existsSync(f.options.output));
});
test('existing output and source drift are refused without overwriting files',async t=>{
 const f=fixture(t);fs.mkdirSync(f.options.output);fs.writeFileSync(path.join(f.options.output,'keep.txt'),'keep');await assert.rejects(createCandidate(f.options),{code:'EEXIST'});assert.equal(fs.readFileSync(path.join(f.options.output,'keep.txt'),'utf8'),'keep');
 const g=fixture(t),read=fs.readFileSync;let scheduled=false;
 fs.readFileSync=function(file,...args){const bytes=read.call(fs,file,...args);if(file===g.source&&!scheduled){scheduled=true;queueMicrotask(()=>fs.appendFileSync(g.source,' '));}return bytes;};
 try{await assert.rejects(createCandidate(g.options),/Исходные данные изменились/);assert(scheduled);assert(!fs.existsSync(g.options.output));}finally{fs.readFileSync=read;}
});
test('large count boundaries exercise the existing numeric operator without huge fake trees',async t=>{
 const f=fixture(t),report=await createCandidate({...f.options,min:1000000000,max:1000000002});assert(report.examples.some(c=>c.count===1000000003&&c.result==='VIOLATION'));assert.equal(report.examples.find(c=>c.kind==='selector-control').actualCount,1);
});
async function answerInterview(options,answers){
 const pending=answers.slice(),prompts=[],messages=[];
 const result=await interview(options,{ask:async label=>{prompts.push(label);assert(pending.length,'Unexpected question: '+label);return pending.shift();},write:line=>messages.push(line)});
 assert.equal(pending.length,0,'All scripted answers must be consumed');return{options:result,prompts,messages};
}
test('guided editing searches components, keeps stable IDs and shows executable positive/negative examples',async t=>{
 const f=fixture(t),flow=await answerInterview({dsRoot:f.root,apolloRoot},['Missing','Group','wrong-kind','1','1','1','','5','От двух до пяти действий','','synthetic:guided-example',f.options.output]);
 assert.equal(flow.options.component,'fixture.group');assert.equal(flow.options.kind,'countBetween');assert.equal(flow.options.contract,'fixture.layout');assert.equal(flow.options.id,'amount');assert.equal(flow.options.min,2);
 assert(flow.messages.some(line=>line.includes('не найден')));assert(flow.messages.some(line=>line.includes('Другие условия')&&line.includes('other (propertyDomain)')));assert(flow.messages.includes('RuleID V3: fixture.layout.amount'));
 const report=await createCandidate(flow.options),preview=fs.readFileSync(path.join(f.options.output,'preview.md'),'utf8');assert.equal(report.normalizedRule.max,5);assert.equal(report.sourceReference,'synthetic:guided-example');assert(preview.includes('Положительный пример: 2'));assert(preview.includes('Отрицательный пример: 6'));assert(preview.includes('/manual/contracts/0/constraints/0/max'));assert.deepEqual(fs.readFileSync(f.source),f.sourceBytes);
});
test('guided creation asks an explicit selector and defaults a readable group ID without touching existing rules',async t=>{
 const f=fixture(t),flow=await answerInterview({dsRoot:f.root,apolloRoot,component:'fixture.group',kind:'countBetween',output:f.options.output},['+new','','Fresh Group','Fresh Action','all','+new','new-count','2','4','От двух до четырёх действий','synthetic:new-group']);
 assert.equal(flow.options.contract,'fixture.group.composition');assert.equal(flow.options.visibility,'all');const report=await createCandidate(flow.options);assert.equal(report.ruleId,'fixture.group.composition.new-count');assert.equal(report.examples.find(row=>row.kind==='selector-control').actualCount,2);
 const candidate=JSON.parse(fs.readFileSync(path.join(f.options.output,'composition-contract.candidate.json')));assert.deepEqual(candidate.manual.contracts[0],f.body.manual.contracts[0]);assert.deepEqual(fs.readFileSync(f.source),f.sourceBytes);
});
test('component disambiguation and declared path aliases use the existing V3 artifact reader',async t=>{
 const f=fixture(t),indexPath=path.join(f.root,'JSONS/apollo/indexes/componentContractIndex.json'),index=JSON.parse(fs.readFileSync(indexPath));index.packages[0].compositionPath='fixture/Group/composition-contract.json';index.packages[0].artifacts.composition='unused.json';index.packages.push({...index.packages[0],componentKey:'fixture.second',packageName:'Other Group'});put(f.root,'JSONS/apollo/indexes/componentContractIndex.json',index);
 const supplied={...f.options};delete supplied.component;
 const flow=await answerInterview(supplied,['Group','1','countBetween']);assert.equal(flow.options.component,'fixture.group');const report=await createCandidate(flow.options);assert.equal(report.sourceFile,'JSONS/fixture/Group/composition-contract.json');
});
test('unsupported kinds and duplicate IDs fail explicitly instead of creating a different rule',async t=>{
 const f=fixture(t);await assert.rejects(createCandidate({...f.options,kind:'propertyDomain'}),/не поддержано/);await assert.rejects(interview({...f.options,kind:'propertyDomain'},{ask:async()=>assert.fail('Must not ask about unsupported conditions'),write:()=>{}}),/не поддержано/);assert(!fs.existsSync(f.options.output));
 f.body.manual.contracts[0].constraints.push(cloneCount(f.body.manual.contracts[0].constraints[0]));put(f.root,'JSONS/fixture/Group/composition-contract.json',f.body);await assert.rejects(createCandidate(f.options),/Неоднозначный ID правила/);assert(!fs.existsSync(f.options.output));
});
test('guided additions refuse an existing group or rule ID',async t=>{
 for(const [answers,pattern]of [[['countBetween','+new','fixture.layout'],/ID группы уже существует/],[['countBetween','1','+new','amount'],/ID правила уже существует/]]){
  const f=fixture(t),pending=answers.slice();await assert.rejects(interview({dsRoot:f.root,apolloRoot,component:'fixture.group'},{ask:async()=>pending.shift(),write:()=>{}}),pattern);assert.equal(pending.length,0);assert(!fs.existsSync(f.options.output));assert.deepEqual(fs.readFileSync(f.source),f.sourceBytes);
 }
});
test('source drift during or after the interview cannot silently change the chosen rule',async t=>{
 const f=fixture(t);await assert.rejects(interview({...f.options,kind:'countBetween',source:undefined},{ask:async()=>{fs.appendFileSync(f.source,' ');return'synthetic:drift';},write:()=>{}}),/изменились во время анкеты/);assert(!fs.existsSync(f.options.output));
 const g=fixture(t),flow=await answerInterview({...g.options,kind:'countBetween'},[]);fs.appendFileSync(g.source,' ');await assert.rejects(createCandidate(flow.options),/изменились после анкеты/);assert(!fs.existsSync(g.options.output));
});
function cloneCount(rule){return JSON.parse(JSON.stringify(rule));}
test('inspection shows effective norms and selectors with separate source and authoring support',async t=>{
 const f=fixture(t),rule={ruleId:'fixture.visual',appliesTo:'radius',ruleText:'Keep library radius',severity:'error',checkType:'deterministic',ruleKind:'design-rule',authority:{status:'active',provenance:'design-system-author',revision:1},target:{layers:['Group']},source:'pattern-link',patternRuleId:'pattern:test.radius'};
 put(f.root,'JSONS/fixture/Group/rules.json',{schemaVersion:2,documentType:'component-rules',metadata:{ownershipSchema:'apollo.artifact-ownership.v2'},generated:{rules:[{...rule,severity:'warning'}]},manual:{rules:[rule]}});
 const report=await inspectComponent({dsRoot:f.root,apolloRoot,component:'fixture.group'});assert.equal(report.status,'COMPONENT_RULES_INSPECTED');assert.equal(report.rules.length,3);
 const norm=report.rules.find(r=>r.ruleId==='fixture.visual');assert.equal(norm.condition.severity,'error');assert.deepEqual(norm.selector.target,{layers:['Group']});assert.deepEqual(norm.normReferences.patternRuleIds,['pattern:test.radius']);assert.equal(norm.sources[0].equalsEffective,false);assert.equal(norm.sources[1].equalsEffective,true);assert.equal(norm.authoringKindSupported,true);
 const count=report.rules.find(r=>r.ruleId==='fixture.layout.amount');assert.equal(count.authoringKindSupported,true);assert.equal(count.condition.min,2);assert.deepEqual(count.selector.select,f.body.manual.contracts[0].select);assert.equal(report.rules.find(r=>r.ruleId==='fixture.layout.other').authoringKindSupported,false);assert(report.rules.every(r=>r.examplesVerified===false));assert(!fs.existsSync(f.options.output));assert.deepEqual(fs.readFileSync(f.source),f.sourceBytes);
});
test('inspection exposes a runtime overlay and declarations outside the effective projection',async t=>{
 const f=fixture(t);f.body.runtime={contracts:cloneCount(f.body.manual.contracts)};f.body.runtime.contracts[0].constraints[0].min=1;f.body.manual.contracts[0].constraints.push({id:'hidden-by-overlay',op:'countBetween',min:0,max:1,message:'Not effective'});put(f.root,'JSONS/fixture/Group/composition-contract.json',f.body);
 const report=await inspectComponent({dsRoot:f.root,apolloRoot,component:'fixture.group'}),count=report.rules.find(r=>r.ruleId==='fixture.layout.amount');assert.equal(count.condition.min,1);assert.deepEqual(count.sources.map(s=>s.equalsEffective),[false,true]);assert.equal(report.outsideProjection[0].ruleId,'fixture.layout.hidden-by-overlay');assert(!fs.existsSync(f.options.output));
});
test('inspection refuses unknown components, output writes and drift during preparation',async t=>{
 const f=fixture(t);await assert.rejects(inspectComponent({...f.options}),/inspect только читает/);await assert.rejects(inspectComponent({dsRoot:f.root,apolloRoot,component:'unknown'}),/componentKey/);assert(!fs.existsSync(f.options.output));
 const g=fixture(t),read=fs.readFileSync;let scheduled=false;
 fs.readFileSync=function(file,...args){const bytes=read.call(fs,file,...args);if(file===g.source&&!scheduled){scheduled=true;queueMicrotask(()=>fs.appendFileSync(g.source,' '));}return bytes;};
 try{await assert.rejects(inspectComponent({dsRoot:g.root,apolloRoot,component:'fixture.group'}),/изменились во время просмотра/);assert(scheduled);assert(!fs.existsSync(g.options.output));}finally{fs.readFileSync=read;}
});
function propertyFixture(t,kind='propertyBaseline',property='radius'){
 const f=fixture(t),rules={schemaVersion:2,documentType:'component-rules',metadata:{componentKey:'fixture.group',ownershipSchema:'apollo.artifact-ownership.v2'},generated:{rules:[]},manual:{rules:[]}};
 const file=put(f.root,'JSONS/fixture/Group/rules.json',rules);
 return{...f,rules,rulesFile:file,options:{dsRoot:f.root,apolloRoot,component:'fixture.group',kind,id:'component:fixture.group.test-property',property,message:'Synthetic property rule',source:'synthetic:test-only',baseline:12,invalid:20,min:100,max:200,output:f.options.output}};
}
function activePropertyRule(f,extra={}){return{ruleId:f.options.id,ruleText:'Original norm',appliesTo:f.options.property,target:{component:'fixture.group',layers:['root']},severity:'error',checkType:'deterministic',matchKind:'exact_component_rule',source:'test-only',ruleKind:'design-rule',authority:{status:'active',provenance:'design-system-author',revision:1},...extra};}
test('property example reports finalize the matching active rule while foreign and draft rules cannot prove a candidate',async t=>{
 for(const [kind,property,options]of [['propertyBaseline','radius',{}],['propertyRange','layout.width',{invalid:201}]]){
  const f=propertyFixture(t,kind,property),report=await createCandidate({...f.options,...options});
  const negative=report.examples.find(x=>x.kind==='property-negative');
  assert.equal(negative.change.assessment.verdict,'violation');assert.equal(negative.change.assessment.reasonCode,'component-contract-violation');assert.equal(negative.change.assessment.source,'component-contract');assert.equal(negative.change.assessment.ruleId,f.options.id);
  assert.equal(report.examples.find(x=>x.kind==='property-positive').result,'NO_VIOLATION');assert.equal(report.examples.find(x=>x.kind==='foreign-owner').result,'NOT_APPLICABLE');
  const saved=JSON.parse(fs.readFileSync(path.join(f.options.output,'report.json')));assert.deepEqual(saved.examples,report.examples);
 }
 for(const [extra,reason]of [[{target:{componentKeys:['c'.repeat(40)],layers:['root']}},/не выполнил выбранное правило\/селектор/],[{authority:{status:'draft',provenance:'design-system-author',revision:1}},/активной/]]){
  const f=propertyFixture(t);f.rules.manual.rules=[activePropertyRule(f,extra)];put(f.root,'JSONS/fixture/Group/rules.json',f.rules);const before=fs.readFileSync(f.rulesFile);
  await assert.rejects(createCandidate(f.options),reason);assert(!fs.existsSync(f.options.output));assert.deepEqual(fs.readFileSync(f.rulesFile),before);
 }
});
test('rules.json baseline authoring verifies each supported property via real V3, selectors and report',async t=>{
 for(const property of ['radius','opacity','layout.width','layout.height','layout.itemSpacing','layout.padding.top','layout.padding.right','layout.padding.bottom','layout.padding.left','styles.text','fill','stroke']){
  const f=propertyFixture(t,'propertyBaseline',property),before=fs.readFileSync(f.rulesFile),text=['styles.text','fill','stroke'].includes(property),options={...f.options,baseline:text?'synthetic-expected':property==='opacity'?1:12,invalid:text?'synthetic-wrong':property==='opacity'?0.5:20,...(property==='styles.text'?{layer:'Label'}:{})};
  const report=await createCandidate(options);assert.equal(report.status,'DRAFT_PROPERTY_CANDIDATE_VERIFIED');assert(report.examples.some(x=>x.result==='NO_VIOLATION'&&x.factsPresent));assert(report.examples.some(x=>x.result==='VIOLATION'&&x.ruleId===options.id));assert(report.examples.some(x=>x.result==='NOT_APPLICABLE'));assert.equal(report.normalizedRule.appliesTo,property);assert.deepEqual(fs.readFileSync(f.rulesFile),before);
  assert(fs.readFileSync(path.join(options.output,'preview.md'),'utf8').includes(options.id));assert.equal(JSON.parse(fs.readFileSync(path.join(options.output,'rules.candidate.json'))).manual.rules[0].ruleId,options.id);
  if(['layout.width','layout.height'].includes(property))assert.deepEqual(report.examples.filter(x=>x.kind==='derived-sizing').map(x=>[x.sizing,x.result]),[['HUG','NOT_APPLICABLE'],['FILL','NOT_APPLICABLE']]);if(property==='layout.itemSpacing')assert(report.examples.some(x=>x.kind==='empty-spacing'&&x.result==='NOT_APPLICABLE'));
 }
});
test('rules.json range authoring uses the existing numeric producer on all supported dimensions',async t=>{
 for(const property of ['layout.width','layout.height','layout.minWidth','layout.maxWidth','layout.minHeight','layout.maxHeight']){
  const f=propertyFixture(t,'propertyRange',property),report=await createCandidate({...f.options,invalid:201,valid:200});assert.deepEqual(report.normalizedRule.numericConstraint,{minimum:100,maximum:200});assert.equal(report.examples.find(x=>x.result==='VIOLATION').change.assessment.ruleId,f.options.id);assert.equal(report.examples.find(x=>x.result==='NO_VIOLATION').actual,200);
 }
});
test('rules.json editing preserves ID, selector and neighbours and updates the authority revision',async t=>{
 const f=propertyFixture(t,'propertyRange','layout.width'),original=activePropertyRule(f,{numericConstraint:{minimum:100,maximum:200},remediation:'Keep existing action',patternRuleId:'pattern:source'}),neighbour={ruleId:'neighbour',ruleText:'Keep',appliesTo:'variant.*',severity:'info'};f.rules.manual.rules=[original,neighbour];put(f.root,'JSONS/fixture/Group/rules.json',f.rules);const before=fs.readFileSync(f.rulesFile);
 const report=await createCandidate({...f.options,min:150,max:250,invalid:251}),candidate=JSON.parse(fs.readFileSync(path.join(f.options.output,'rules.candidate.json')));assert.equal(report.ruleId,original.ruleId);assert.deepEqual(candidate.manual.rules[0].target,original.target);assert.equal(candidate.manual.rules[0].authority.revision,2);assert.equal(candidate.manual.rules[0].remediation,original.remediation);assert.equal(candidate.manual.rules[0].patternRuleId,original.patternRuleId);assert.deepEqual(candidate.manual.rules[1],neighbour);assert.deepEqual(fs.readFileSync(f.rulesFile),before);
 const view=await inspectComponent({dsRoot:f.root,apolloRoot,component:'fixture.group'}),shown=view.rules.find(x=>x.ruleId===f.options.id);assert.equal(shown.authoringKind,'propertyRange');assert.deepEqual(shown.condition.numericConstraint,original.numericConstraint);
});
test('rules.json generated norm editing creates a manual override without rewriting generated data',async t=>{
 const f=propertyFixture(t);f.rules.generated.rules=[activePropertyRule(f)];put(f.root,'JSONS/fixture/Group/rules.json',f.rules);await createCandidate(f.options);const candidate=JSON.parse(fs.readFileSync(path.join(f.options.output,'rules.candidate.json')));assert.deepEqual(candidate.generated,f.rules.generated);assert.equal(candidate.manual.rules[0].ruleId,f.options.id);assert.equal(candidate.manual.rules[0].authority.revision,2);
});
test('rules.json runtime overlays and duplicate norms or IDs cannot produce a verified candidate',async t=>{
 for(const mode of ['runtime','duplicate-id','duplicate-norm']){
  const f=propertyFixture(t),rule=activePropertyRule(f);
  if(mode==='runtime')f.rules.runtime={rules:[rule]};else if(mode==='duplicate-id')f.rules.manual.rules=[rule,{...rule}];else f.rules.manual.rules=[{...rule,ruleId:'existing-unique-norm'}];
  put(f.root,'JSONS/fixture/Group/rules.json',f.rules);const before=fs.readFileSync(f.rulesFile);await assert.rejects(createCandidate(f.options),/runtime|Неоднозначный|уже существует/);assert(!fs.existsSync(f.options.output));assert.deepEqual(fs.readFileSync(f.rulesFile),before);
 }
});
test('rules.json unsupported conditions and missing or dishonest examples are rejected explicitly',async t=>{
 for(const options of [{property:'clipsContent'},{baseline:null},{baseline:true},{baseline:[12]},{invalid:12},{property:'opacity',baseline:1,invalid:2},{kind:'propertyRange',property:'radius'},{kind:'propertyRange',property:'layout.width',min:200,max:100},{kind:'propertyRange',property:'layout.width',valid:50,invalid:250},{kind:'propertyRange',property:'layout.width',invalid:150},{property:'styles.text',baseline:'style-a',invalid:'style-b'},{source:''}]){
  const f=propertyFixture(t);await assert.rejects(createCandidate({...f.options,...options}));assert(!fs.existsSync(f.options.output));
 }
 for(const extra of [{conditions:{variant:{View:'Primary'}}},{requiredPaintState:{fill:'none'}},{authority:{status:'draft',provenance:'design-system-author',revision:1}},{checkType:'manual'}]){
  const f=propertyFixture(t);f.rules.manual.rules=[activePropertyRule(f,extra)];put(f.root,'JSONS/fixture/Group/rules.json',f.rules);await assert.rejects(createCandidate(f.options),/неподдержанного типа|активной/);assert(!fs.existsSync(f.options.output));
 }
});
test('rules.json cannot claim execution for a selector which does not match the observed component',async t=>{
 const f=propertyFixture(t);f.rules.manual.rules=[activePropertyRule(f,{target:{componentKeys:['c'.repeat(40)],layers:['root']}})];put(f.root,'JSONS/fixture/Group/rules.json',f.rules);await assert.rejects(createCandidate(f.options),/не выполнил выбранное правило\/селектор/);assert(!fs.existsSync(f.options.output));
});
test('property examples cannot borrow their owner name from the selector being verified',async t=>{
 const f=propertyFixture(t);f.rules.manual.rules=[activePropertyRule(f,{target:{componentNames:['Definitely Foreign Owner'],layers:['root']}})];put(f.root,'JSONS/fixture/Group/rules.json',f.rules);const before=fs.readFileSync(f.rulesFile);
 await assert.rejects(createCandidate(f.options),/не выполнил выбранное правило\/селектор/);assert(!fs.existsSync(f.options.output));assert.deepEqual(fs.readFileSync(f.rulesFile),before);
});
test('property examples accept an independently indexed owner name',async t=>{
 const f=propertyFixture(t);f.rules.manual.rules=[activePropertyRule(f,{target:{componentNames:['Group'],layers:['root']}})];put(f.root,'JSONS/fixture/Group/rules.json',f.rules);
 const report=await createCandidate(f.options);assert.equal(report.status,'DRAFT_PROPERTY_CANDIDATE_VERIFIED');assert(report.examples.some(x=>x.result==='VIOLATION'));assert(report.examples.some(x=>x.kind==='foreign-owner'&&x.result==='NOT_APPLICABLE'));
});
test('rules.json output protection and source drift preserve the working source and existing results',async t=>{
 const f=propertyFixture(t);fs.mkdirSync(f.options.output);fs.writeFileSync(path.join(f.options.output,'keep.txt'),'keep');await assert.rejects(createCandidate(f.options),{code:'EEXIST'});assert.equal(fs.readFileSync(path.join(f.options.output,'keep.txt'),'utf8'),'keep');
 const g=propertyFixture(t),read=fs.readFileSync;let scheduled=false;fs.readFileSync=function(file,...args){const b=read.call(fs,file,...args);if(file===g.rulesFile&&!scheduled){scheduled=true;queueMicrotask(()=>fs.appendFileSync(file,' '));}return b;};
 try{await assert.rejects(createCandidate(g.options),/Исходные данные изменились/);assert(scheduled);assert(!fs.existsSync(g.options.output));}finally{fs.readFileSync=read;}
});
test('rules.json interview creates a property candidate with an explicit source and distinct examples',async t=>{
 const f=propertyFixture(t),flow=await answerInterview({dsRoot:f.root,apolloRoot,component:'fixture.group'},['propertyBaseline','+new',f.options.id,'radius','root','12','20','Keep radius','synthetic:interview',f.options.output]);assert.equal(flow.options.kind,'propertyBaseline');const report=await createCandidate(flow.options);assert.equal(report.ruleId,f.options.id);assert.equal(report.sourceReference,'synthetic:interview');
});
test('rules.json interview refuses an index change between component choice and package reread',async t=>{
 const f=propertyFixture(t);let prompts=0;await assert.rejects(interview({dsRoot:f.root,apolloRoot,component:'fixture.group'},{write:()=>{},ask:async label=>{prompts++;assert(label.includes('Условие'));fs.appendFileSync(path.join(f.root,'JSONS/apollo/indexes/componentContractIndex.json'),' ');return'propertyBaseline';}}),/изменились во время повторного чтения/);assert.equal(prompts,1);assert(!fs.existsSync(f.options.output));
});
