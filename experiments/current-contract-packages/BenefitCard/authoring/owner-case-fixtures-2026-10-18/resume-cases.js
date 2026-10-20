
const page=await figma.getNodeByIdAsync("8701:32684");
if(!page||page.type!=="PAGE")throw new Error("Missing lab");
await figma.setCurrentPageAsync(page);
const boardName="BenefitCard r9 · 8 проверок зависимостей";
const existingBoard=await figma.getNodeByIdAsync("14134:68884");
if(!existingBoard||existingBoard.type!=="FRAME"||existingBoard.name!==boardName)throw new Error("Own board missing");
const seen=new Set(), completed=[{"caseId":"BC9-LINK-desktop","componentId":"14134:68892","platform":"desktop","expectedViolations":0,"url":"https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14134-68892","root":{"GraphicPosition":"Left","CardAxis":"Vertical","Background":"True","Compact":"False"},"content":{"Bottom#1110:27":true,"Subtitle#983:4":true,"Title":"Primary"},"bottom":{"Presets":"Link"},"link":{"Left Addon#60204:0":false,"✎ Label#493:29":"Подробнее","Right Addon#60204:4":false,"Size":"S (14-20)"},"icon":null,"surface":null,"bounds":{"width":400,"height":210},"status":"CONFIGURED_NOT_RUN"}];
let board=existingBoard, stage="prepare-resume";
function walk(n,fn){fn(n);if("children"in n)for(const c of n.children)walk(c,fn);}
function track(n){walk(n,x=>seen.add(x.id));}
function at(n,path){for(const part of path.split(" / ")){if(!("children"in n))throw new Error("No children: "+part);const a=n.children.filter(c=>c.name===part);if(a.length!==1)throw new Error("Path not unique/missing: "+path+" at "+part);n=a[0];}return n;}
function inst(n){if(n.type!=="INSTANCE")throw new Error("Expected INSTANCE "+n.name);return n;}
function prop(n,key,value){inst(n);if(!(key in n.componentProperties))throw new Error("Missing property "+key+" on "+n.name);n.setProperties({[key]:value});}
const loadedFonts=new Set();
async function loadCurrentFonts(n){const fonts=new Map();walk(n,x=>{if(x.type==="TEXT")for(const s of x.getStyledTextSegments(["fontName"]))fonts.set(JSON.stringify(s.fontName),s.fontName);});await Promise.all([...fonts.entries()].filter(([key])=>!loadedFonts.has(key)).map(async([key,font])=>{await figma.loadFontAsync(font);loadedFonts.add(key);}));}
function compactProps(n){const o={};for(const [k,p]of Object.entries(inst(n).componentProperties))if(p.type!=="INSTANCE_SWAP")o[k]=p.value;return o;}
function encode(ids){const segments=[],dict=new Map();const paths=ids.map(id=>id.split(";").map(s=>{if(!dict.has(s)){dict.set(s,segments.length);segments.push(s);}return dict.get(s);}));return {format:"Join each path's indexed segments with ';' to recover every exact affected node ID",segments,paths};}
try{
 const keys=["f4bf880ba158305302c367965268c48643719697","6561ac087a33424016baae244032f60fa2dd6cfc","45fab9c74986fadb8af330a70c6503f1a0815aaa","73d7406d6e7fce569983edd4466eb52485d5e416","ab10ed1a861289d5c037c0e594405e75c200acec","e7835a1d48a04c344bbb49eac964afd82b3b8cfd"];
 const mains=await Promise.all(keys.map(k=>figma.importComponentByKeyAsync(k)));
 const fonts=new Map();
 for(const m of mains)walk(m,n=>{if(n.type==="TEXT")for(const s of n.getStyledTextSegments(["fontName"]))fonts.set(JSON.stringify(s.fontName),s.fontName);});
 for(const f of [{family:"Inter",style:"Regular"},{family:"Inter",style:"Bold"}])fonts.set(JSON.stringify(f),f);
 await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
 function frame(name,dir,parent,pad,gap){const f=figma.createAutoLayout(dir);seen.add(f.id);f.name=name;f.paddingTop=f.paddingBottom=pad;f.paddingLeft=f.paddingRight=pad;f.itemSpacing=gap;f.fills=[];f.clipsContent=false;if(parent)parent.appendChild(f);return f;}
 function textNode(parent,value,size,bold,width){const t=figma.createText();seen.add(t.id);t.fontName={family:"Inter",style:bold?"Bold":"Regular"};t.fontSize=size;t.lineHeight={unit:"PERCENT",value:140};t.characters=value;t.fills=[{type:"SOLID",color:{r:0.12,g:0.12,b:0.12}}];t.textAutoResize="HEIGHT";t.resize(width,Math.max(24,size*1.4));parent.appendChild(t);return t;}

 await loadCurrentFonts(board);
 const partialMobile=await figma.getNodeByIdAsync("14134:68949");
 const partialCard=await figma.getNodeByIdAsync("14134:68946");
 const grid=await figma.getNodeByIdAsync("14134:68887");
 const firstRow=await figma.getNodeByIdAsync("14134:68888");
 if(!partialMobile||partialMobile.type!=="INSTANCE"||!partialCard||partialCard.type!=="FRAME"||!grid||grid.type!=="FRAME"||!firstRow||firstRow.type!=="FRAME")throw new Error("Partial nodes missing");
 await loadCurrentFonts(partialMobile);
 track(board);track(partialMobile);
 const specs=[
  {n:1,kind:"LINK",label:"Link: допустимый текст",expected:0},
  {n:2,kind:"LINK-USAGE",label:"Link: запрещённый RightAddon",expected:1},
  {n:3,kind:"ICON-DELEGATION",label:"IconView: допустимый BgColor",expected:0},
  {n:4,kind:"BG-DELEGATION",label:"BackgroundPlate: Type=Secondary",expected:0}
 ];
 for(const spec of specs){
  const row=spec.n===1?firstRow:frame("Пара "+spec.n,"HORIZONTAL",grid,0,24);
  for(let p=0;p<2;p++){
   if(spec.n===1&&p===0)continue;
   const reuse=spec.n===1&&p===1;
   const platform=p?"mobile-web":"desktop",tag=p?"M":"D";
   const caseId="BC9-"+spec.kind+"-"+platform;
   stage=caseId;
   const card=reuse?partialCard:frame(caseId,"VERTICAL",row,24,16);if(!reuse){card.fills=[{type:"SOLID",color:{r:1,g:1,b:1}}];card.cornerRadius=16;
   textNode(card,tag+" · "+spec.label,18,true,400);
   const desc=spec.kind==="LINK"?"Bottom=true · Presets=Link · Label=Подробнее · оба Addon=false":spec.kind==="LINK-USAGE"?"Bottom=true · Presets=Link · RightAddon=true":spec.kind==="ICON-DELEGATION"?"Graphic=IconView · Shape=true · BgColor=false":"Background=True · вложенный Type=Secondary";
   textNode(card,desc+"\nОжидаем: "+spec.expected+" "+(spec.expected?"нарушение":"нарушений"),14,false,400);
   }
   const root=reuse?partialMobile:mains[p].createInstance();track(root);await loadCurrentFonts(root);card.appendChild(root);root.name=caseId;
   const content=inst(at(root,"ContentWrapper / Content"));
   prop(content,"Bottom#1110:27",true);track(root);await loadCurrentFonts(root);
   const bottom=inst(at(root,"ContentWrapper / Content / Bottom"));
   prop(bottom,"Presets","Link");track(root);await loadCurrentFonts(root);
   const link=inst(at(bottom,"Link"));
   prop(link,"✎ Label#493:29","Подробнее");
   prop(link,"Left Addon#60204:0",false);
   prop(link,"Right Addon#60204:4",spec.kind==="LINK-USAGE");track(root);
   let icon=null,surface=null;
   if(spec.kind==="ICON-DELEGATION"){
    const graphic=inst(at(root,"GraphicContainer / ["+tag+"] Graphic"));
    prop(graphic,"Presets","IconView");track(root);await loadCurrentFonts(root);
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
 return {status:"COMPLETED_8_CONFIGURED_CASES_AFTER_FONT_CORRECTION",boardId:board.id,boardBounds:{x:board.x,y:board.y,width:board.width,height:board.height},cases:completed,affectedNodeIds:encode(ids),retainedIndices:ids.map((id,i)=>retained.has(id)?i:-1).filter(i=>i>=0),count:{affected:ids.length,retained:retained.size,explicitRemovals:0},oldFixturesUntouched:["14131:69499","14131:69561"],Ready:false};
}catch(e){
 if(board)track(board);
 return {status:"STOP_PRESERVED_PARTIAL_NO_RETRY",stage,error:String(e&&e.message||e),boardId:board&&board.id,cases:completed,affectedNodeIds:encode([...seen]),explicitRemovals:0,Ready:false};
}

