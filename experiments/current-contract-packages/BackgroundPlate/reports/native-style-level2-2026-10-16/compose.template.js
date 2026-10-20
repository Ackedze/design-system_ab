const input=__INPUT__;
const page=figma.root.children.find(p=>p.id===input.pageId);
if(page?.type!=='PAGE')throw Error('Laboratory missing');
await figma.setCurrentPageAsync(page);figma.skipInvisibleInstanceChildren=false;
if(page.children.some(n=>n.name===input.sectionName))throw Error('Dedicated section exists; inspect before retry');
const styles={},variables={},mains=new Map(),created=[],cases=[],loadedFonts=[];
async function loadFamily(id,weight,seen=new Set()){
  if(seen.has(id))return;seen.add(id);
  const v=await figma.variables.getVariableByIdAsync(id);if(!v)throw Error('Font variable unavailable');
  for(const value of Object.values(v.valuesByMode)){
    if(typeof value==='string'){const f={family:value,style:weight};await figma.loadFontAsync(f);loadedFonts.push(f);}
    else if(value?.type==='VARIABLE_ALIAS')await loadFamily(value.id,weight,seen);
  }
}
for(const [name,key]of Object.entries({title:'952e7df724ba0235d6d170ca152117522e48f11c',card:'69723bb178c1d1f9ec90e7b5670389dadb9de724',body:'6fb5ab6969beee7da9e23dfcbab2f4864b30b665',small:'002fd09fb152f69d6c345b171102ed33001b2684'})){
  const s=await figma.importStyleByKeyAsync(key);if(s.type!=='TEXT')throw Error('Text style unavailable');
  await figma.loadFontAsync(s.fontName);if(s.boundVariables?.fontFamily)await loadFamily(s.boundVariables.fontFamily.id,s.fontName.style);styles[name]=s;
}
for(const [name,key]of Object.entries({text:'53f842b1771349c5dca692351edfc422e8f081b5',secondary:'d9d26239617e3ab9e69d7ed378d811a3c4561063',surface:'14ac29210fc546f67acfa8e0dfd252c210d0c78b',canvas:'5ffdfac4b248819bc8fc25adf4a5f74b165af190'})){
  const v=await figma.variables.importVariableByKeyAsync(key);if(v.resolvedType!=='COLOR')throw Error('Color token unavailable');variables[name]=v;
}
for(const c of input.cases)if(!mains.has(c.componentKey)){
  const m=await figma.importComponentByKeyAsync(c.componentKey);
  if(m.key!==c.componentKey||m.parent?.type!=='COMPONENT_SET'||m.parent.key!==c.componentSetKey)throw Error('Public component identity drift');mains.set(c.componentKey,m);
}
const paint=v=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',v);
const clean=x=>typeof x==='symbol'?'MIXED':Array.isArray(x)?x.map(clean):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,clean(v)])):x;
function track(n){created.push(n.id);if('children'in n)for(const ch of n.children)track(ch);}
function stack(parent,name,direction,width){const n=figma.createAutoLayout(direction);created.push(n.id);parent.appendChild(n);n.name=name;n.fills=[];n.resize(width,1);n.itemSpacing=16;n.primaryAxisSizingMode=direction==='VERTICAL'?'AUTO':'FIXED';n.counterAxisSizingMode=direction==='VERTICAL'?'FIXED':'AUTO';return n;}
async function text(parent,value,kind='body',width=392,color='text'){
  const n=figma.createText();created.push(n.id);parent.appendChild(n);await n.setTextStyleIdAsync(styles[kind].id);
  if(n.fontName!==figma.mixed)await figma.loadFontAsync(n.fontName);else for(const s of n.getStyledTextSegments(['fontName']))await figma.loadFontAsync(s.fontName);
  n.resize(width,1);n.textAutoResize='HEIGHT';n.characters=value;n.fills=[paint(variables[color])];return n;
}
const section=figma.createSection();created.push(section.id);section.name=input.sectionName;section.x=input.position.x;section.y=input.position.y;section.fills=[];
const board=stack(section,'Проверки Style и Level2 · BP-QA-21–25','VERTICAL',1432);board.x=32;board.y=56;board.paddingTop=32;board.paddingRight=32;board.paddingBottom=32;board.paddingLeft=32;board.itemSpacing=24;board.fills=[paint(variables.canvas)];
await text(board,'BackgroundPlate r2 · Style и Level2','title',1368);
await text(board,'5 отдельных экземпляров. Параметры и нарушения уже подготовлены. Выбирай сам компонент в карточке; подпись находится снаружи проверяемого экземпляра. Сначала проверь 21–23, затем 24–25. RESET выполняется на том же экземпляре 25.','body',1368);
let row;
for(let index=0;index<input.cases.length;index++){
  const c=input.cases[index];if(index%3===0){row=stack(board,index===0?'Контрольные состояния':'Нарушения токенов','HORIZONTAL',1368);row.itemSpacing=24;}
  const card=stack(row,c.id+' · '+c.styleType+(c.negative?' · без токена':' · контроль'),'VERTICAL',440);card.paddingTop=24;card.paddingRight=24;card.paddingBottom=24;card.paddingLeft=24;card.fills=[paint(variables.surface)];
  const caption=await text(card,c.id+' · '+c.styleType,'card');
  const parameterText='Desktop · '+(c.family==='promo'?'Promo':'Legacy')+'\nPosition='+c.position+'\nType='+c.styleType+' · Skeleton=False\nBackgroundColor='+c.backgroundColor;
  const parameters=await text(card,parameterText);
  const host=stack(card,'Контекст поверхности · '+c.id,'VERTICAL',392);host.paddingTop=16;host.paddingRight=16;host.paddingBottom=16;host.paddingLeft=16;host.fills=[paint(variables.canvas)];
  const root=mains.get(c.componentKey).createInstance();host.appendChild(root);root.name=(c.family==='promo'?'[D][Promo] BackgroundPlate':'[D] BackgroundPlate')+' · '+c.id;
  const surfaces=root.children.filter(n=>n.type==='INSTANCE'&&Object.prototype.hasOwnProperty.call(n.componentProperties,'Type'));
  if(surfaces.length!==1)throw Error('Exactly one immediate Style instance required');const surface=surfaces[0];
  surface.setProperties({Type:c.styleType,Skeleton:c.skeleton,BackgroundColor:c.backgroundColor});
  for(const [k,v]of Object.entries({Type:c.styleType,Skeleton:c.skeleton,BackgroundColor:c.backgroundColor}))if(surface.componentProperties[k]?.value!==v)throw Error('Style parameter mismatch: '+k);
  if(root.componentProperties.Position?.value!==c.position)throw Error('Root Position mismatch');
  const surfaceMain=await surface.getMainComponentAsync();if(!surfaceMain)throw Error('Style source identity unavailable');
  if(c.family==='legacy'){
    const expected=c.styleType==='Colored'?'86fe66bc39733dc333904e6428c2cb1698f3ad96':'dc4d6280389d1c6ba7d835b2cd693c113c6d79d1';
    if(surfaceMain.key!==expected)throw Error('Nested Style variant identity mismatch');
  }
  const before={fills:clean(surface.fills),strokes:clean(surface.strokes)};
  if(c.negative){
    const paints=surface[c.detachProperty];if(!Array.isArray(paints)||!paints.some(p=>p.type==='SOLID'&&p.visible!==false&&(p.opacity??1)>0&&p.boundVariables?.color))throw Error('Visible token-bound paint required before detach');
    surface[c.detachProperty]=paints.map(p=>p.type==='SOLID'?figma.variables.setBoundVariableForPaint(p,'color',null):p);
  }
  track(root);
  const expected='Ожидаем: '+c.expectedViolationCount+' нарушений.'+(c.negative?' Цвет '+(c.detachProperty==='fills'?'заливки':'обводки')+' отвязан от токена; RGB сохранён.':' Все параметры заданы штатным API.');
  const expectation=await text(card,expected);
  await text(card,(c.negative?'Нарушение RuleID:\n':'Должны исполниться без нарушения:\n')+(c.negative?c.expectedViolations:c.requiredCompliantRules).join('\n'),'small');
  await text(card,c.sourceNorms.map(n=>n.sourceRuleId+'\n'+n.ruleText).join('\n\n'),'small',392,'secondary');
  const {sourceNorms,...caseData}=c;
  cases.push({...caseData,nodeId:root.id,surfaceNodeId:surface.id,cardId:card.id,hostId:host.id,captionId:caption.id,parameterTextId:parameters.id,expectationTextId:expectation.id,surfaceComponentKey:surfaceMain.key,surfaceComponentSetKey:surfaceMain.parent?.type==='COMPONENT_SET'?surfaceMain.parent.key:null,actualRootProperties:clean(root.componentProperties),actualStyleProperties:clean(surface.componentProperties),before,after:{fills:clean(surface.fills),strokes:clean(surface.strokes)},dimensions:{width:root.width,height:root.height},url:'https://www.figma.com/design/'+input.fileKey+'/?node-id='+root.id.replace(':','-')});
}
section.resizeWithoutConstraints(1496,board.height+112);
return {status:'DEDICATED_FIXTURES_COMPOSED',sectionId:section.id,boardId:board.id,cases,createdNodeIds:[...new Set(created)],mutatedNodeIds:[],preExistingCanvasWrites:0,bounds:{x:section.x,y:section.y,width:section.width,height:section.height},styles:Object.fromEntries(Object.entries(styles).map(([k,s])=>[k,{id:s.id,key:s.key}])),variables:Object.fromEntries(Object.entries(variables).map(([k,v])=>[k,{id:v.id,key:v.key}])),loadedFonts,EditorValidation:'NOT_RUN_USER_ONLY'};
