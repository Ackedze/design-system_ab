const page = await figma.getNodeByIdAsync(CONFIG.pageId);
if (!page || page.type !== 'PAGE') throw new Error('Lab page missing');
await figma.setCurrentPageAsync(page);
figma.skipInvisibleInstanceChildren = false;
const createdNodeIds = [], textNodeIds = [], mutatedNodeIds = new Set(), cases = [], errors = [];
const styles = {}, colors = {}, spacing = {}, masters = new Map(), loaded = new Set();
const available = new Set((await figma.listAvailableFontsAsync()).map(x => JSON.stringify(x.fontName)));
async function font(f) { const k=JSON.stringify(f); if(!available.has(k)) throw new Error('Unavailable DS font '+k); if(!loaded.has(k)){await figma.loadFontAsync(f);loaded.add(k);} }
async function fonts(n) { for(const t of n.findAll(n => n.type === 'TEXT')) for(const s of t.getStyledTextSegments(['fontName'])) await font(s.fontName); }
for(const [name,key] of Object.entries(CONFIG.annotationStyles)){ styles[name]=await figma.importStyleByKeyAsync(key); if(styles[name].type!=='TEXT')throw new Error('Not a text style');await font(styles[name].fontName); }
async function fontFamilies(id,seen=new Set()){if(seen.has(id))return [];seen.add(id);const v=await figma.variables.getVariableByIdAsync(id);if(!v)throw new Error('Missing font family variable');const values=[];for(const x of Object.values(v.valuesByMode)){if(typeof x==='string')values.push(x);else if(x&&x.type==='VARIABLE_ALIAS')values.push(...await fontFamilies(x.id,seen));}return [...new Set(values)];}
for(const s of Object.values(styles)){const a=s.boundVariables&&s.boundVariables.fontFamily;if(a&&a.type==='VARIABLE_ALIAS')for(const family of await fontFamilies(a.id))await font({family,style:s.fontName.style});}
for(const [name,key] of Object.entries(CONFIG.colorVariables)) colors[name]=await figma.variables.importVariableByKeyAsync(key);
for(const [value,key] of Object.entries(CONFIG.spacingVariables)) spacing[value]=await figma.variables.importVariableByKeyAsync(key);
for(const key of new Set(SPECS.map(s=>s.variantKey))) { const m=await figma.importComponentByKeyAsync(key);await fonts(m);masters.set(key,m); }
function paint(variable){return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',variable);}
function frame(name,width,direction='VERTICAL',gap=16,padding=0){
  const n=figma.createAutoLayout(direction);createdNodeIds.push(n.id);n.name=name;n.fills=[];n.clipsContent=false;
  n.resize(width,10);n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode=direction==='HORIZONTAL'?'AUTO':'FIXED';
  n.itemSpacing=gap;n.setBoundVariable('itemSpacing',spacing[gap]);
  for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft']){n[k]=padding;if(padding)n.setBoundVariable(k,spacing[padding]);}
  return n;
}
async function text(parent,value,width,title=false){
  const t=figma.createText();createdNodeIds.push(t.id);textNodeIds.push(t.id);await figma.loadFontAsync(t.fontName);
  await t.setTextStyleIdAsync(styles[title?'title':'body'].id);await font(t.fontName);t.characters=value;t.fills=[paint(colors.text)];
  t.textAutoResize='HEIGHT';t.resize(width,Math.max(20,t.height));parent.appendChild(t);return t;
}
function touch(n){mutatedNodeIds.add(n.id);return n;}
function propKey(n,name){const keys=Object.keys(n.componentProperties).filter(k=>k===name||k.split('#')[0]===name);if(keys.length!==1)throw new Error('Property not unique '+name+' on '+n.name);return keys[0];}
function has(n,name){return Object.keys(n.componentProperties).some(k=>k===name||k.split('#')[0]===name);}
function properties(n,values){const out={};for(const [name,value] of Object.entries(values)){const k=propKey(n,name),p=n.componentProperties[k];if(p.type==='BOOLEAN'&&typeof value!=='boolean')throw new Error('Boolean type mismatch '+name);out[k]=value;}touch(n).setProperties(out);}
function path(root,value){let n=root;for(const part of value.split(' / ')){if(!('children' in n))throw new Error('Non-container in '+value);const matches=n.children.filter(c=>c.name===part);if(matches.length!==1)throw new Error('Path not unique '+value);n=matches[0];}return n;}
async function identity(n,allowedSets){
  if(n.type!=='INSTANCE')throw new Error('Fixture part is not an instance');const m=await n.getMainComponentAsync();
  const setKey=m&&m.parent&&m.parent.type==='COMPONENT_SET'?m.parent.key:null;
  if(!m||!allowedSets.includes(setKey))throw new Error('Native part identity not proven '+n.name);
  return {id:n.id,variantKey:m.key,setKey};
}
async function icon(root,s){
  properties(root,s.parameters);await fonts(root);const readback=[];
  for(const m of s.mutations){
    if(m.op!=='form')throw new Error('Unknown IconView mutation');const n=path(root,m.path);
    const part=m.path.includes('/ Border /')?'Border':'Shape',size=m.path.includes('Addon /')?'24':'64';
    const proof=await identity(n,[CONFIG.iconPartSetKeys[part+size]]);properties(n,{Form:m.value});
    readback.push({op:m.op,proof,value:n.componentProperties[propKey(n,'Form')].value});
  }
  return {properties:root.componentProperties,mutations:readback};
}
async function background(root,s){
  if(has(root,'Position'))properties(root,{Position:s.parameters.Position});
  const prefix=(s.platform==='desktop'?'[D]':'[M]')+(s.family==='promo'?'[Promo]':''),level=(s.parameters.Position||'').includes('2')?'2':'1';
  const wanted=CONFIG.backgroundStyleSetKeys[prefix+' Style Level '+level];
  const matches=[];
  for(const n of root.findAll(n=>n.type==='INSTANCE')){const m=await n.getMainComponentAsync();if(m&&m.parent&&m.parent.type==='COMPONENT_SET'&&m.parent.key===wanted)matches.push(n);}
  if(s.family!=='slot'&&matches.length!==1)throw new Error('Surface owner not unique '+prefix+' Level '+level);
  root.resize(s.platform==='desktop'?360:320,160);
  const surface=s.family==='slot'?root:matches[0];const proof=await identity(surface,[s.family==='slot'?CONFIG.backgroundPublicSetKeys[s.component]:wanted]);
  const controls=has(root,'Type')?root:surface;const vals={Type:s.parameters.Type,Skeleton:s.parameters.Skeleton};
  if(has(controls,'BackgroundColor'))vals.BackgroundColor=s.parameters.BackgroundColor;
  properties(controls,vals);await fonts(root);
  if(s.parameters.Type==='Colored'){touch(surface).fills=[paint(colors.canvas)];surface.strokes=[];}
  if(s.parameters.Type==='Border'){touch(surface).fills=[];surface.strokes=[paint(colors.text)];surface.strokeWeight=1;}
  const before={fills:surface.fills,strokes:surface.strokes,radius:surface.cornerRadius,opacity:surface.opacity,blendMode:surface.blendMode,effects:surface.effects};
  const mutations=[];
  for(const m of s.mutations){
    touch(surface);
    if(m.op==='rawFill'){await surface.setFillStyleIdAsync('');surface.fills=[{type:'SOLID',color:{r:.8,g:0,b:0}}];}
    else if(m.op==='rawStroke'){await surface.setStrokeStyleIdAsync('');surface.strokes=[{type:'SOLID',color:{r:.8,g:0,b:0}}];}
    else if(m.op==='extraStroke')surface.strokes=[paint(colors.text)];
    else if(m.op==='extraFill'||m.op==='primaryPaint')surface.fills=[paint(colors.text)];
    else if(m.op==='radius'){for(const field of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])surface.setBoundVariable(field,null);surface.cornerRadius=7;}
    else if(m.op==='opacity'){surface.setBoundVariable('opacity',null);surface.opacity=.5;}
    else if(m.op==='blend')surface.blendMode='MULTIPLY';
    else if(m.op==='shadow')surface.effects=[{type:s.platform==='desktop'?'DROP_SHADOW':'INNER_SHADOW',color:{r:0,g:0,b:0,a:.25},offset:{x:0,y:4},radius:8,spread:0,visible:true,blendMode:'NORMAL'}];
    else if(m.op==='thickStroke'){surface.setBoundVariable('strokeWeight',null);surface.strokeWeight=3;}
    else if(m.op==='clip'){touch(root).clipsContent=s.platform!=='desktop';}
    else throw new Error('Unknown BackgroundPlate mutation '+m.op);
    mutations.push(m.op);
  }
  return {proof,properties:controls.componentProperties,before,mutations,after:{fills:surface.fills,strokes:surface.strokes,strokeWeight:surface.strokeWeight,radius:surface.cornerRadius,opacity:surface.opacity,blendMode:surface.blendMode,effects:surface.effects,clipsContent:root.clipsContent}};
}
const boardName=CONFIG.boardNames[FAMILY];
let board;
if(BOARD_ID){board=await figma.getNodeByIdAsync(BOARD_ID);if(!board||board.type!=='FRAME'||board.name!==boardName)throw new Error('Owned board identity mismatch');touch(board);if(board.findAll(n=>n.type==='INSTANCE'&&SPECS.some(s=>n.name.startsWith(s.id+' ·'))).length)throw new Error('Batch already exists: inspect before retry');}
else{if(page.children.some(n=>n.name===boardName))throw new Error('Board exists: inspect before retry');const rightmost=Math.max(...page.children.map(n=>n.x+n.width));board=frame(boardName,1792,'VERTICAL',32,32);page.appendChild(board);board.x=rightmost+800;board.y=3287;board.fills=[paint(colors.canvas)];}
await text(board,FAMILY==='iconview'?'IconView · проверка контракта':SPECS[0].platform==='desktop'?'BackgroundPlate · desktop':'BackgroundPlate · mobile-web',1728,true);
await text(board,'Выбирайте экземпляр внутри кейса. На карточках указаны ожидания, живые прогоны ещё не выполнены. '+(FAMILY==='iconview'?'Первые 8 кейсов требуют пакета r7. r6 — дополнительные проверки после исправления reader.':'Контракт ещё в подготовке. RuleID исполнителя UNKNOWN; это заготовки для последующей проверки.'),1728);
for(let i=0;i<SPECS.length;i+=3){
  const row=frame('QA row '+(i/3+1),1728,'HORIZONTAL',24);board.appendChild(row);
  for(const s of SPECS.slice(i,i+3)){
    const card=frame(s.id+' · '+s.title,560,'VERTICAL',16,16);row.appendChild(card);card.fills=[paint(colors.surface)];
    await text(card,s.id+' · '+s.title,528,true);await text(card,s.norm+'\n\n'+(s.sourceRuleId?'Норма: '+s.sourceRuleId+'\n':'')+'RuleID: '+s.ruleIds.join('\n'),528);
    await text(card,'Параметры: '+Object.entries(s.parameters).map(([k,v])=>k+'='+v).join('; '),528);
    const preview=frame('Проверяемый экземпляр',528,'HORIZONTAL',16,24);card.appendChild(preview);
    const root=masters.get(s.variantKey).createInstance();createdNodeIds.push(root.id);await fonts(root);
    root.name=s.id+' · проверяемый '+s.component;preview.appendChild(root);
    const record={caseId:s.id,cardId:card.id,instanceId:root.id,fixtureStatus:'NOT_RUN',qaStatus:s.qaStatus};
    try {record.readback=FAMILY==='iconview'?await icon(root,s):await background(root,s);if(record.readback.after){for(const key of ['fills','strokes'])record.readback.after[key]=record.readback.after[key].map(p=>({type:p.type,visible:p.visible!==false,colorVariable:p.boundVariables&&p.boundVariables.color?p.boundVariables.color.id:null}));record.readback.after.effects=record.readback.after.effects.map(e=>e.type);}record.fixtureStatus='PREPARED_UNVALIDATED';}
    catch(e){record.fixtureStatus='FIXTURE_ERROR';record.error=String(e.message||e);errors.push({caseId:s.id,error:record.error});}
    await text(card,'Ожидаем: '+s.expected+'\nСтатус: '+s.qaStatus+(record.error?'\nОшибка подготовки: '+record.error:''),528);
    cases.push(record);
  }
}
for(const c of cases)if(c.readback&&c.readback.before)delete c.readback.before;
const annotations=board.findAll(n=>n.type==='TEXT'&&textNodeIds.includes(n.id));
return {status:'QA_FIXTURES_ONLY',boardId:board.id,boardBounds:{x:board.x,y:board.y,width:board.width,height:board.height},cases,errors,
  annotationViolations:annotations.filter(n=>!n.textStyleId||!n.fills[0]?.boundVariables?.color||n.width<=0).map(n=>n.id),
  createdNodeIds,mutatedNodeIds:[...mutatedNodeIds],freshNativeResults:0};
