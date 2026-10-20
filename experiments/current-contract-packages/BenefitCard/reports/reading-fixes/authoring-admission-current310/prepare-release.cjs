const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,W,pin,guard}=require('./guard.cjs');
const before=guard('before-private-release-preparation');
const snapshot=root+'/workspace/build-attempts/candidate02';
fs.cpSync(root+'/workspace/candidate',snapshot,{recursive:true,errorOnExist:true,force:false});
fs.writeFileSync(root+'/CANDIDATE02-SNAPSHOT.json',JSON.stringify({status:'HISTORICAL_PRIVATE_ATTEMPT',originalRoot:root+'/workspace/candidate',preservedRoot:snapshot,reason:'Preserve admission guards before assigning the candidate release versions.'})+'\n',{flag:'wx'});
const additional=JSON.parse(fs.readFileSync(root+'/ADDITIONAL-INPUTS.json'));
for(const relative of ['projects/Apollo-v3/docs/ARCHITECTURE_BACKLOG.md','projects/ComponentContractEditor/docs/BACKLOG.ru.md']){
 const source=W+'/'+relative;additional.inputs.push(pin(source));
 for(const phase of ['baseline','candidate']){const target=root+'/workspace/'+phase+'/'+relative;fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);}
}
fs.writeFileSync(root+'/ADDITIONAL-INPUTS.json',JSON.stringify(additional)+'\n');
const E=root+'/workspace/candidate/projects/ComponentContractEditor',C=root+'/workspace/candidate/projects/Apollo-v3/packages/component-contract-core';
for(const [file,oldVersion,newVersion]of [[C+'/package.json','0.1.18','0.1.19'],[E+'/package.json','0.2.105','0.2.106']]){
 const d=JSON.parse(fs.readFileSync(file));assert.equal(d.version,oldVersion);d.version=newVersion;
 if(file===E+'/package.json')d.scripts['test:authoring-admission']='node tests/authoring-admission.browser.cjs';
 fs.writeFileSync(file,JSON.stringify(d,null,2)+'\n');
}
for(const [file,oldVersion,newVersion]of [[E+'/src/version.ts','@0.2.105','@0.2.106'],[E+'/src/ui.html','v0.2.105','v0.2.106']]){
 const s=fs.readFileSync(file,'utf8');assert.equal(s.split(oldVersion).length,2);fs.writeFileSync(file,s.replace(oldVersion,newVersion));
}
const block=`
### CC-COMPAT-SCOPED-FIXED-DEPENDENCY-01 — зависимости по Figma representation и authoring admission

Core 0.1.19 / Editor 0.2.106 candidate. Новый opt-in \`fixed-nested-scoped\` требует
непустые уникальные \`representationIds\` и \`crossRepresentationBindingsVersion=2\`.
Один точный child pin может иметь непересекающиеся D/M bindings через FRAME.
Off-scope становится notApplicable только после независимого доказательства
единственного actual host representation; stale/foreign/ambiguous/missing capture
сохраняют UNKNOWN. Старый unscoped route и direct-child не расширяются.

Editor проверяет compiler errors до preview/capture, повторного запроса и evaluation.
Неизвестная manual schema отклоняется при импорте. Compiled-only evidence остаётся
read-only; запуск и экспорт восстановленного без исходного manual пакета запрещены.
Ошибочный авторский Draft можно сохранить с validation=false без исторического
projection stamp, но после reopen он по-прежнему не допускается к исполнению.

Совместимость: старый compiled Core/Editor/V4 reader отклоняет feature version2;
старый Editor может повторно скомпилировать ошибочный источник, поэтому universal
old-authoring refusal не заявляется. Поддержка scoped-пакета требует установки
проверенной пары нового UI + core Editor 0.2.106; одиночная замена core недостаточна.

Private проверки: actual bundled UI/controller с controlled mocks, ZIP/reopen,
legacy compiler/runtime equality и fail-closed cases. Shared integration, полный
validate, текущие V4 consumers/config/runtime и native acceptance имеют отдельные
гейты; статус — **PRIVATE_VERIFIED / SHARED_ACCEPTANCE_PENDING**.
Generation pilot и Ready не расширяются. Закрытие: точная совместная сборка UI/core,
полный validate и paired consumer verification; затем отдельный native тест пакета.
`;
for(const [relative,link]of [['projects/Apollo-v3/docs/ARCHITECTURE_BACKLOG.md','../../ComponentContractEditor/docs/BACKLOG.ru.md'],['projects/ComponentContractEditor/docs/BACKLOG.ru.md','../../Apollo-v3/docs/ARCHITECTURE_BACKLOG.md']]){
 const file=root+'/workspace/candidate/'+relative;let s=fs.readFileSync(file,'utf8');assert.ok(!s.includes('CC-COMPAT-SCOPED-FIXED-DEPENDENCY-01'));
 const entry=block+'Парная запись: [CC-COMPAT-SCOPED-FIXED-DEPENDENCY-01]('+link+').\n';
 if(relative.startsWith('projects/Apollo-v3')){const marker='## Apollo v4: совместимость с ComponentContract Editor';assert.ok(s.includes(marker));s=s.replace(marker,marker+'\n'+entry);}else s+='\n'+entry;
 fs.writeFileSync(file,s);
}
fs.writeFileSync(root+'/RELEASE-PREPARATION.json',JSON.stringify({before,after:guard('after-private-release-preparation'),versions:{core:'0.1.19',editor:'0.2.106'},sharedWrites:0,Ready:false})+'\n',{flag:'wx'});
console.log('Private release metadata and paired backlog candidates prepared.');
