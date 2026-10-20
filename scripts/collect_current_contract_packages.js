// Verify the current manifest; never reconstruct it from older source directories.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),destination=path.join(repo,'experiments/current-contract-packages');
const core=require(path.resolve(repo,'../../projects/Apollo/packages/component-contract-core/dist/core.cjs'));
const {readContractCatalog}=require(path.resolve(repo,'../../projects/Apollo/scripts/contract-catalog.cjs'));
function renderReadme(manifest){
 const rows=['# Контракты компонентов','','Актуальные ZIP хранятся в папках компонентов. Единственный список текущих пакетов — [manifest.json](manifest.json); прошлые версии из `history` автоматически не подбираются.','','| Компонент | Версия | Статус | Пакет |','| --- | --- | --- | --- |'];
 for(const e of manifest.packages)rows.push(`| ${e.name} | r${e.revision} | ${e.status[0].toUpperCase()+e.status.slice(1)} | [ZIP](${e.file}) |`);
 rows.push('','Ready относится только к `statusScope` конкретного пакета. Размещение файлов не меняет нормы, версии, готовность или область приёмки.','','- [Индекс исходников](../../JSONS/indexes/component-contracts.index.json) выбирает manual и факты в `JSONS/web/components/<library>/<component>`; мобильные версии — в `mobile-web`. ZIP — производная поставка.',
 '- Прежние `<Component>/authoring` и reports сохранены как историческое происхождение; новые правки manual выполняются в основных папках компонентов.','- `<Component>/mobile-web` — отдельный пакет мобильной платформы, когда он существует.','- [draft-manifest.json](draft-manifest.json) — производный список Draft из основного индекса.','- [history](history/) — неизменяемые прежние пакеты и evidence; старые пути остаются историческим происхождением.','- [AGENTS.md](AGENTS.md) и [инструкция авторинга](CONTRACT_AUTHORING_GUIDE.ru.md) — порядок работы.','- `node ../../scripts/collect_current_contract_packages.js --check` проверяет текущие архивы и индексы; без `--check` обновляет только производные список Draft и эту страницу.','');
 return rows.join('\n');
}
async function collect(checkOnly=false,{root=destination}={}){
 const catalog=readContractCatalog(root),manifest=catalog.manifest;
 assert(manifest,'A current package manifest is required.');
 for(let i=0;i<manifest.packages.length;i++){
  const entry=manifest.packages[i],archive=catalog.archives[i],entries=await core.readZip(archive.bytes);
  const imported=core.importWorkspace(entries.filter(e=>/\.json$/i.test(e.name)).map(e=>({name:e.name,text:core.zipEntryText(e)})),entry.componentId);
  assert.equal(imported.manual.component.componentId,entry.componentId,entry.name);
  assert.equal(imported.manual.metadata.revision,entry.revision,entry.name);
  assert.equal(core.stableHash(imported.manual),entry.manualSourceHash,entry.name+': manual identity');
  if(imported.compiledInput){
   assert.equal(imported.compiledInput.package.manualSourceHash,entry.manualSourceHash,entry.name+': compiled identity');
   assert.equal(imported.compiledInput.rules.length,entry.ruleIR,entry.name+': rule inventory');
  }
 }
 catalog.assertCurrent();
 const draftFile=path.join(root,'draft-manifest.json'),draft=JSON.parse(fs.readFileSync(draftFile,'utf8'));
 const expected=Object.assign({},draft,{updatedAt:manifest.updatedAt,authoringIndex:manifest.authoringIndex,packages:manifest.packages.filter(p=>p.status!=='ready')});
 const readme=renderReadme(manifest);
 if(checkOnly){assert.deepEqual(draft,expected,'Draft index differs from current manifest.');assert.equal(fs.readFileSync(path.join(root,'README.md'),'utf8'),readme,'README differs from current manifest.');}
 else{
  fs.writeFileSync(draftFile+'.next',JSON.stringify(expected,null,2)+'\n');fs.renameSync(draftFile+'.next',draftFile);
  fs.writeFileSync(path.join(root,'README.md'),readme);
 }
 return manifest;
}
if(require.main===module)collect(process.argv.includes('--check')).then(m=>console.log(JSON.stringify({packages:m.packages.length,componentFolders:true,archiveIdentity:'verified',normsChanged:false}))).catch(e=>{console.error(e);process.exitCode=1;});
module.exports={collect,renderReadme};
