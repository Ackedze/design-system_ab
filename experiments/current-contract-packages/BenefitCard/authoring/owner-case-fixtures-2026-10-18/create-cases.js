
const page=await figma.getNodeByIdAsync("8701:32684");
if(!page||page.type!=="PAGE")throw new Error("Missing lab");
await figma.setCurrentPageAsync(page);
const boardName="BenefitCard r9 · 8 проверок зависимостей";
if(page.children.some(n=>n.name===boardName))throw new Error("Board already exists; no automatic retry");
const seen=new Set(), completed=[];
let board=null, stage="prepare";
function walk(n,fn){fn(n);if("children"in n)for(const c of n.children)walk(c,fn);}
function track(n){walk(n,x=>seen.add(x.id));}
function at(n,path){for(const part of path.split(" / ")){if(!("children"in n))throw new Error("No children: "+part);const a=n.children.filter(c=>c.name===part);if(a.length!==1)throw new Error("Path not unique/missing: "+path+" at "+part);n=a[0];}return n;}
function inst(n){if(n.type!=="INSTANCE")throw new Error("Expected INSTANCE "+n.name);return n;}
function prop(n,key,value){inst(n);if(!(key in n.componentProperties))throw new Error("Missing property "+key+" on "+n.name);n.setProperties({[key]:value});}
function compactProps(n){const o={};for(const [k,p]of Object.entries(inst(n).componentProperties))if(p.type!=="INSTANCE_SWAP")o[k]=p.value;return o;}
function encode(ids){const segments=[],dict=new Map();const paths=ids.map(id=>id.split(";").map(s=>{if(!dict.has(s)){dict.set(s,segments.length);segments.push(s);}return dict.get(s);}));return {format:"Join each path's indexed segments with ';' to recover every exact affected node ID",segments,paths};}
try{
 const keys=["f4bf880ba158305302c367965268c48643719697","6561ac087a33424016baae244032f60fa2dd6cfc","45fab9c74986fadb8af330a70c6503f1a0815aaa","73d7406d6e7fce569983edd4466eb52485d5e416","ab10ed1a861289d5c037c0e594405e75c200acec","e7835a1d48a04c344bbb49eac964afd82b3b8cfd"];
 const mains=await Promise.all(keys.map(k=>figma.importComponentByKeyAsync(k)));
 const fonts=new Map();
 for(const m of mains)walk(m,n=>{if(n.type==="TEXT")for(const s of n.getStyledTextSegments(["fontName"]))fonts.set(JSON.stringify(s.fontName),s.fontName);});
 for(const f of [{family:"Inter",style:"Regular"},{family:"Inter",style:"Bold"}])fonts.set(JSON.stringify(f),f);
 await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
 const right=page.children.reduce((x,n)=>Math.max(x,n.x+n.width),0);
 function frame(name,dir,parent,pad,gap){const f=figma.createAutoLayout(dir);seen.add(f.id);f.name=name;f.paddingTop=f.paddingBottom=pad;f.paddingLeft=f.paddingRight=pad;f.itemSpacing=gap;f.fills=[];f.clipsContent=false;if(parent)parent.appendChild(f);return f;}
 function textNode(parent,value,size,bold,width){const t=figma.createText();seen.add(t.id);t.fontName={family:"Inter",style:bold?"Bold":"Regular"};t.fontSize=size;t.lineHeight={unit:"PERCENT",value:140};t.characters=value;t.fills=[{type:"SOLID",color:{r:0.12,g:0.12,b:0.12}}];t.textAutoResize="HEIGHT";t.resize(width,Math.max(24,size*1.4));parent.appendChild(t);return t;}
 stage="board";
 board=frame(boardName,"VERTICAL",page,32,24);board.x=right+512;board.y=0;board.fills=[{type:"SOLID",color:{r:0.95,g:0.95,b:0.95}}];
 textNode(board,"BenefitCard r9 · зависимости",28,true,928);
 textNode(board,"Desktop слева · Mobile справа. Параметры уже настроены. В Editor: CardPlacement=single. Проверяйте сам экземпляр BenefitCard.",16,false,928);
 const grid=frame("8 cases","VERTICAL",board,0,24);
 const specs=[
  {n:1,kind:"LINK",label:"Link: допустимый текст",expected:0},
  {n:2,kind:"LINK-USAGE",label:"Link: запрещённый RightAddon",expected:1},
  {n:3,kind:"ICON-DELEGATION",label:"IconView: допустимый BgColor",expected:0},
  {n:4,kind:"BG-DELEGATION",label:"BackgroundPlate: Type=Secondary",expected:0}
 ];
 for(const spec of specs){
  const row=frame("Пара "+spec.n,"HORIZONTAL",grid,0,24);
  for(let p=0;p<2;p++){
   const platform=p?"mobile-web":"desktop",tag=p?"M":"D";
   const caseId="BC9-"+spec.kind+"-"+platform;
   stage=caseId;
   const card=frame(caseId,"VERTICAL",row,24,16);card.fills=[{type:"SOLID",color:{r:1,g:1,b:1}}];card.cornerRadius=16;
   textNode(card,tag+" · "+spec.label,18,true,400);
   const desc=spec.kind==="LINK"?"Bottom=true · Presets=Link · Label=Подробнее · оба Addon=false":spec.kind==="LINK-USAGE"?"Bottom=true · Presets=Link · RightAddon=true":spec.kind==="ICON-DELEGATION"?"Graphic=IconView · Shape=true · BgColor=false":"Background=True · вложенный Type=Secondary";
   textNode(card,desc+"\nОжидаем: "+spec.expected+" "+(spec.expected?"нарушение":"нарушений"),14,false,400);
   const root=mains[p].createInstance();track(root);card.appendChild(root);root.name=caseId;
   const content=inst(at(root,"ContentWrapper / Content"));
   prop(content,"Bottom#1110:27",true);track(root);
   const bottom=inst(at(root,"ContentWrapper / Content / Bottom"));
   prop(bottom,"Presets","Link");track(root);
   const link=inst(at(bottom,"Link"));
   prop(link,"✎ Label#493:29","Подробнее");
   prop(link,"Left Addon#60204:0",false);
   prop(link,"Right Addon#60204:4",spec.kind==="LINK-USAGE");track(root);
   let icon=null,surface=null;
   if(spec.kind==="ICON-DELEGATION"){
    const graphic=inst(at(root,"GraphicContainer / ["+tag+"] Graphic"));
    prop(graphic,"Presets","IconView");track(root);
    icon=inst(at(graphic,"IconView"));
    prop(icon,"Shape#88323:0",true);prop(icon,"BgColor#70274:0",false);track(root);
   }
   if(spec.kind==="BG-DELEGATION"){
    surface=inst(at(root,"BackgroundPlate / ["+tag+"][Promo] BackgroundPlate / ["+tag+"][Promo] Style Level 1"));
    prop(surface,"Type","Secondary");track(root);
   }
   if(link.componentProperties["Right Addon#60204:4"].value!==(spec.kind==="LINK-USAGE"))throw new Error("Link property readback failed");
   if(icon&&(icon.componentProperties["Shape#88323:0"].value!==true||icon.componentProperties["BgColor#70274:0"].value!==false))throw new Error("Icon property readback failed");
   if(surface&&surface.componentProperties.Type.value!=="Secondary")throw new Error("Background property readback failed");
   completed.push({caseId,componentId:root.id,platform,expectedViolations:spec.expected,url:"https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id="+root.id.replace(":","-"),root:compactProps(root),content:compactProps(content),bottom:compactProps(bottom),link:compactProps(link),icon:icon?compactProps(icon):null,surface:surface?compactProps(surface):null,bounds:{width:root.width,height:root.height},status:"CONFIGURED_NOT_RUN"});
  }
 }
 track(board);
 const ids=[...seen],retained=new Set();walk(board,n=>retained.add(n.id));
 return {status:"CREATED_8_CONFIGURED_CASES",boardId:board.id,boardBounds:{x:board.x,y:board.y,width:board.width,height:board.height},cases:completed,affectedNodeIds:encode(ids),retainedIndices:ids.map((id,i)=>retained.has(id)?i:-1).filter(i=>i>=0),count:{affected:ids.length,retained:retained.size,explicitRemovals:0},oldFixturesUntouched:["14131:69499","14131:69561"],Ready:false};
}catch(e){
 if(board)track(board);
 return {status:"STOP_PRESERVED_PARTIAL_NO_RETRY",stage,error:String(e&&e.message||e),boardId:board&&board.id,cases:completed,affectedNodeIds:encode([...seen]),explicitRemovals:0,Ready:false};
}

