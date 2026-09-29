// Run with Figma use_figma in I3MsagXR8Tz2eZcGtIgUk8. Fixtures only; no contract edits.
const page = await figma.getNodeByIdAsync('8701:32684');
await figma.setCurrentPageAsync(page);
figma.skipInvisibleInstanceChildren = false;
const sectionName = 'Amount · ComponentContract r2 · A02–A18';
const existing = page.children.find(n => n.name === sectionName);
if (existing) return { existingSectionId: existing.id, createdNodeIds: [], needsInspection: true };
const [component, majorComponent, alternateStyle] = await Promise.all([
  figma.importComponentByKeyAsync('fe3399f71c9e0971646821d935b64657e462c28e'),
  figma.importComponentByKeyAsync('a833c02e4fcb75fea1a89bf786912e108b8f93ba'),
  figma.importStyleByKeyAsync('b2633a0162f9359a941b9b6ffd702da6acbd02f3'),
]);
const fonts = [{family:'Inter',style:'Regular'},{family:'Inter',style:'Semi Bold'},alternateStyle.fontName];
for (const node of component.findAllWithCriteria({types:['TEXT']})) {
  fonts.push(...node.getStyledTextSegments(['fontName']).map(s=>s.fontName));
}
await Promise.all([...new Map(fonts.map(f=>[JSON.stringify(f),f])).values()].map(f=>figma.loadFontAsync(f)));
const created = [], removed = [], records = [], issues = [];
const track = n => { created.push(n.id); return n; };
const paint = (r,g,b) => [{type:'SOLID',color:{r,g,b}}];
const colors = { pass:[0.06,0.45,0.30], fail:[0.76,0.15,0.14], reject:[0.55,0.34,0.04] };
const section = track(figma.createSection()); section.name = sectionName;
page.appendChild(section); section.x = -3311; section.y = 36875;
section.fills = paint(.92,.93,.95);
const board = track(figma.createAutoLayout('VERTICAL')); board.name = 'Amount r2 · 20 cases · 14 PASS / 4 FAIL / 2 REJECT';
section.appendChild(board); board.x=32;board.y=32;board.resize(1288,400);
board.counterAxisSizingMode='FIXED';board.primaryAxisSizingMode='AUTO';board.itemSpacing=20;
board.paddingTop=24;board.paddingBottom=24;board.paddingLeft=24;board.paddingRight=24;
board.fills=paint(.937,.945,.961);board.cornerRadius=16;
function label(parent,content,size=14,bold=false,color=[.13,.15,.19],width=1240) {
  const t=track(figma.createText());parent.appendChild(t);t.fontName={family:'Inter',style:bold?'Semi Bold':'Regular'};
  t.fontSize=size;t.lineHeight={unit:'PERCENT',value:140};t.textAutoResize='HEIGHT';t.resize(width,24);
  t.characters=content;t.name=content.slice(0,90);t.fills=paint(...color);return t;
}
label(board,'Amount · ComponentContract r2 · приёмочная матрица',28,true);
label(board,'Editor 0.2.54+ · 20 кейсов · 14 корректных / 4 нарушения / 2 отказа',15,true);
label(board,'Импортируйте Amount.editor-input.zip r2. Проверяйте сам Amount внутри карточки, не карточку. Product — любой. Скачайте JSON каждого из первых 18 кейсов; A18A/B — отказ до запуска правил, достаточно сообщения. Цвет карточки — ожидание, не результат выполненного аудита.',14);
label(board,'A05 одновременно A01: нетронутый библиотечный Amount. Повтор не нужен. Тестируем только объявленные правила r2: зелёный результат не закрывает пробелы Addon, внутренних styles/tokens и Currency text policy.',13,false,[.36,.40,.47]);
function setNamed(instance,name,value) {
  const key=Object.keys(instance.componentProperties).find(k=>k.replace(/#[^#]+$/,'')===name);
  if(!key)throw Error('Missing public property '+name+' on '+instance.name);
  instance.setProperties({[key]:value});
}
const configs=[];
for(let mask=0;mask<8;mask++) {
  const id='A'+String(mask+2).padStart(2,'0');
  configs.push({id,title:mask===3?'Библиотечный Amount · A01':'Комбинация видимости',kind:'pass',
    detail:['Minor','Currency','Addon'].map((n,i)=>n+'='+Boolean(mask&(1<<i))).join(' · '),
    expected:'Нет нарушений. Выключенные части не дают «Не выполнено».',mask});
}
configs.push(
  {id:'A10',title:'Длинная сумма',kind:'pass',detail:'Major=123 456 789 · Minor=,99',expected:'Текст и ширина меняются штатно; нет запрета размера.',action:'text'},
  {id:'A11',title:'Другой библиотечный Text Style',kind:'pass',detail:'Major/Minor/Currency: Primary Large 18–24',expected:'Нет ложного запрета смены Text Style.',action:'style'},
  {id:'A12',title:'Opacity у Minor и Currency',kind:'pass',detail:'Оба вложенных Opacity=True',expected:'Нет продуктового AB-запрета в компонентном контракте.',action:'opacity'},
  {id:'A13',title:'Custom-валюта',kind:'pass',detail:'Currency.Type=Custom · текст «баллов»',expected:'Свой текст разрешён; это не тест стандартных валют.',action:'custom'},
  {id:'A14B',title:'Валюта USD',kind:'pass',detail:'Currency.Type=USD',expected:'Нет сравнения USD с дефолтным ₽.',action:'USD'},
  {id:'A14C',title:'Валюта CNY',kind:'pass',detail:'Currency.Type=CNY',expected:'Нет сравнения CNY с дефолтным ₽.',action:'CNY'},
  {id:'A15',title:'Ручной gap корня',kind:'fail',detail:'itemSpacing: 0 → 8 px',expected:'Нарушение layer-properties-use-effective-baseline.',action:'gap'},
  {id:'A16',title:'Скрыт обязательный Major',kind:'fail',detail:'Major.visible=False, корень видим',expected:'Нарушение major-required.',action:'hide-major'},
  {id:'A17A',title:'Подмена Minor',kind:'fail',detail:'Вместо Minor — Major, имя «Minor» сохранено',expected:'Нарушение identity / явная неполная проверка. Не полный pass.',action:'swap-minor'},
  {id:'A17B',title:'Подмена Currency',kind:'fail',detail:'Вместо Currency — Major, имя «Currency» сохранено',expected:'Нарушение identity / явная неполная проверка. Не полный pass.',action:'swap-currency'},
  {id:'A18A',title:'Detach Amount',kind:'reject',detail:'Копия Amount отсоединена от библиотеки',expected:'Отказ: выбран FRAME, не библиотечный instance. JSON может отсутствовать.',action:'detach'},
  {id:'A18B',title:'Чужой ключ под именем Amount',kind:'reject',detail:'Standalone Major переименован в «Amount»',expected:'Отказ: ключ не относится к загруженному контракту.',action:'foreign'}
);
let row;
for(let i=0;i<configs.length;i++) {
  const c=configs[i];
  if(i%4===0){row=track(figma.createAutoLayout('HORIZONTAL'));board.appendChild(row);row.name='Amount · ряд '+(i/4+1);row.itemSpacing=16;row.fills=[];row.counterAxisAlignItems='MIN';}
  const card=track(figma.createAutoLayout('VERTICAL'));row.appendChild(card);card.name=c.id+' · '+c.title;
  card.resize(298,300);card.counterAxisSizingMode='FIXED';card.primaryAxisSizingMode='AUTO';card.itemSpacing=12;
  card.paddingTop=18;card.paddingBottom=18;card.paddingLeft=18;card.paddingRight=18;card.fills=paint(1,1,1);card.cornerRadius=12;
  label(card,c.id+' · ОЖИДАЕТСЯ '+({pass:'ПРОЙДЕНО',fail:'НАРУШЕНИЕ',reject:'ОТКАЗ'}[c.kind]),13,true,colors[c.kind],262);
  label(card,c.title,18,true,undefined,262);label(card,c.detail,13,false,[.36,.40,.47],262);
  const stage=track(figma.createAutoLayout('HORIZONTAL'));card.appendChild(stage);stage.name='Выбрать объект внутри';
  stage.resize(262,72);stage.primaryAxisSizingMode='FIXED';stage.counterAxisSizingMode='FIXED';stage.primaryAxisAlignItems='CENTER';stage.counterAxisAlignItems='CENTER';stage.fills=paint(.98,.98,.98);stage.cornerRadius=8;
  let instance=(c.action==='foreign'?majorComponent:component).createInstance();stage.appendChild(instance);instance.name='Amount';
  const part=name=>instance.children.find(n=>n.type==='INSTANCE'&&n.name===name);
  const record={id:c.id,title:c.title,kind:c.kind,expected:c.expected,cardId:card.id,stageId:stage.id};
  try {
    if(c.mask!==undefined)for(const [j,name]of ['Minor','Currency','Addon'].entries())setNamed(instance,name,Boolean(c.mask&(1<<j)));
    if(c.action==='text'){setNamed(part('Major'),'✎ Major','123 456 789');setNamed(part('Minor'),'✎ Minor',',99');}
    if(c.action==='style')await Promise.all(['Major','Minor','Currency'].flatMap(name=>part(name).findAllWithCriteria({types:['TEXT']})).map(t=>t.setTextStyleIdAsync(alternateStyle.id)));
    if(c.action==='opacity'){setNamed(part('Minor'),'Opacity','True');setNamed(part('Currency'),'Opacity','True');}
    if(c.action==='custom'){setNamed(part('Currency'),'Type','Custom');setNamed(part('Currency'),'✎ Currency',' баллов');}
    if(['USD','CNY'].includes(c.action)){
      setNamed(part('Currency'),'Type',c.action);
      const currency=part('Currency');
      // Figma swap preservation can carry the old ₽ text into the new variant.
      // Use the exact selected main and clear those overrides, not a text imitation.
      currency.mainComponent=await currency.getMainComponentAsync();currency.name='Currency';
    }
    if(c.action==='gap')instance.itemSpacing=8;
    if(c.action==='hide-major')part('Major').visible=false;
    if(c.action==='swap-minor'||c.action==='swap-currency'){const name=c.action==='swap-minor'?'Minor':'Currency';const n=part(name);n.swapComponent(majorComponent);n.name=name;n.visible=true;}
    if(c.action==='detach'){removed.push(instance.id);instance=instance.detachInstance();instance.name='Amount · detached';}
    record.prepared=true;
  } catch(error) {record.prepared=false;record.preparationError=String(error);issues.push({caseId:c.id,error:String(error)});}
  record.nodeId=instance.id;record.nodeType=instance.type;
  if(instance.type==='INSTANCE') {
    const main=await instance.getMainComponentAsync();record.componentKey=main?.key;record.properties=instance.componentProperties;
    record.parts=await Promise.all(instance.children.filter(n=>n.type==='INSTANCE').map(async n=>{const m=await n.getMainComponentAsync();return {id:n.id,name:n.name,visible:n.visible,key:m?.key,setKey:m?.parent?.type==='COMPONENT_SET'?m.parent.key:null,properties:n.componentProperties,text:n.findAllWithCriteria({types:['TEXT']}).map(t=>({id:t.id,text:t.characters,styleId:t.textStyleId,fontSize:t.fontSize}))};}));
  }
  record.gap='itemSpacing'in instance?instance.itemSpacing:null;
  created.push(instance.id,...instance.findAll(()=>true).map(n=>n.id));
  label(card,record.prepared?c.expected:'НЕ ПОДГОТОВЛЕН: '+record.preparationError,13,false,record.prepared?colors[c.kind]:colors.reject,262);
  card.children.filter(n=>n.type==='TEXT').forEach((t,i)=>{t.textAutoResize='NONE';t.resize(262,[22,52,42,60][i]);});
  records.push(record);
}
section.resizeWithoutConstraints(board.width+64,board.height+64);
figma.viewport.scrollAndZoomIntoView([section]);
return {fileKey:figma.fileKey,pageId:page.id,sectionId:section.id,boardId:board.id,createdNodeIds:[...new Set(created)],removedNodeIds:removed,records:records.map(r=>({id:r.id,title:r.title,kind:r.kind,nodeId:r.nodeId,cardId:r.cardId,prepared:r.prepared,preparationError:r.preparationError,componentKey:r.componentKey,nodeType:r.nodeType,expected:r.expected})),issues,bounds:{x:section.x,y:section.y,width:section.width,height:section.height},textStyle:{id:alternateStyle.id,key:alternateStyle.key,name:alternateStyle.name},liveValidationPerformed:false};
