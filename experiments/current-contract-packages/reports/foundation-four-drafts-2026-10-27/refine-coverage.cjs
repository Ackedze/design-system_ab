const fs=require('fs'),path=require('path'),crypto=require('crypto');
const R=__dirname,A=path.resolve(R,'../../../..'),W=path.resolve(A,'../..'),read=p=>JSON.parse(fs.readFileSync(p));
for(const name of ['Text','SegmentedControl']){
 const p=R+'/'+name+'/coverage-map.json',map=read(p),m=read(R+'/'+name+'/contract.manual.json'),by=s=>m.rules.filter(r=>r.id.includes(s)).map(r=>r.id);
 for(const row of map.entries.filter(r=>r.source!== 'rules.json')){
  row.coverageEntryId=row.sourceRuleId;row.sourceRuleId=null;row.manualRuleIds=[];row.compiledRuleIds=[];
  row.route='context-or-reference';row.scope='Full source wording retained; no local predicate claimed.';
  if(name==='SegmentedControl'){
   if(/\*\*2–5 сегментов/.test(row.sourceNorm)){row.route='authored';row.manualRuleIds=by('.segment-count.');}
   else if(/Ровно \*\*один/.test(row.sourceNorm)){row.route='authored';row.manualRuleIds=by('.single-selected.');}
   else if(/Подписи — короткие/.test(row.sourceNorm)){row.route='unresolved-child-contract';row.gap='Maximum2words and icon-only exception remain explicit pending Segment contract; SG-09 is not acceptance.';}
   else if(/`disabled`|Загрузка —/.test(row.sourceNorm))row.route='code-only';
   else if(/Inverted=True/.test(row.sourceNorm)){row.route='context-and-source-conflict';row.gap='Old API documentation; current public roots have Muted/Resize and no Inverted property.';}
  }else{
   if(/Стиль текста — только|не переопределяй кегль/.test(row.sourceNorm)){row.route='authored';row.manualRuleIds=by('.text-library-style');}
   else if(/Значение — CSS-цвет|не hex вне токенов/.test(row.sourceNorm)){row.route='authored';row.manualRuleIds=by('.text-color-token');row.scope='Binding checked locally; DS library membership is a separate global contour.';}
   else if(/В коде — `textBackgroundColor` с токеном/.test(row.sourceNorm)){row.route='authored-figma-equivalent';row.manualRuleIds=by('.content-color-token');}
   else if(/нет component properties|Нет component properties/.test(row.sourceNorm)){row.route='source-conflict';row.gap='Current native TEXT property ✎ Value#86982:0 is independently captured; Ledger records technical drift.';}
  }
  const c=read(R+'/'+name+'/compiled.json');row.compiledRuleIds=c.rules.filter(r=>row.manualRuleIds.includes(r.source.anchor)).map(r=>r.ruleId);
 }
 const docs=[...new Set(map.sourcePins.filter(p=>p.path.startsWith(W+'/ds-ai-hub/')).map(p=>p.path))];
 map.sourceDocuments=docs.map(p=>{const b=fs.readFileSync(p);return{path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),fullText:b.toString('utf8'),scope:'Verbatim source, including paragraphs/tables; unclassified guidance is reference/context/manual review, not executable coverage.'};});
 map.coverageStatement='No source norm is removed. Counts are not coverage proof. Explicit context/code/source-conflict and unresolved child norms remain outside local IR.';
 fs.writeFileSync(p,JSON.stringify(map,null,2)+'\n');const canonical=A+'/JSONS/web/components/web-core/core/'+name+'/reports/draft-r1-2026-10-27/coverage-map.json';if(fs.existsSync(canonical))fs.copyFileSync(p,canonical);
}
