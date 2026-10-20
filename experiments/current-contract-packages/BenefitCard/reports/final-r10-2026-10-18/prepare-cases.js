const page=await figma.getNodeByIdAsync("8701:32684");await figma.setCurrentPageAsync(page);
const board=await figma.getNodeByIdAsync("14134:68884");
const plan=[
["14134:68892","desktop","S (14-20)",false,0,"Link S14"],
["14134:68949","mobile-web","S (14-20) (Size-20 icons)",false,0,"Link S14 / icons20"],
["14136:68971","desktop","M (16-24)",false,1,"Link M — запрещён"],
["14136:69023","mobile-web","L (18-24)",false,1,"Link L — запрещён"],
["14136:69064","desktop","S (14-20) (Size-20 icons)",true,0,"IconView + Link S20"],
["14136:69201","mobile-web","S (14-20)",true,0,"IconView + Link S14"],
["14136:69379","desktop","S (14-20)",false,0,"BG Secondary + Link S14"],
["14136:69419","mobile-web","S (14-20) (Size-20 icons)",false,0,"BG Secondary + Link S20"]];
const at=(r,p)=>p.split(" / ").reduce((n,s)=>n&&"children" in n?n.children.find(c=>c.name===s):null,r);
const ids=new Set(),fonts=new Set(),done=[];
const track=n=>{ids.add(n.id);if("findAll" in n)for(const c of n.findAll(()=>true))ids.add(c.id);};
const load=async n=>{const ts=n.type==="TEXT"?[n]:n.findAllWithCriteria({types:["TEXT"]});for(const t of ts)for(const s of t.getStyledTextSegments(["fontName"])){const k=JSON.stringify(s.fontName);if(!fonts.has(k)){await figma.loadFontAsync(s.fontName);fonts.add(k);}}};
let failure=null;
try{
await load(board);
for(let i=0;i<plan.length;i++){
const [id,platform,size,rightAddon,expected,label]=plan[i],n=await figma.getNodeByIdAsync(id);
if(!n||n.type!=="INSTANCE"||n.parent.parent.parent.parent!==board)throw Error("Scope mismatch "+id);
track(n);await load(n);
const content=at(n,"ContentWrapper / Content"),bottom=at(n,"ContentWrapper / Content / Bottom");
if(!content||!bottom||bottom.componentProperties.Presets.value!=="Link"||content.componentProperties["Bottom#1110:27"].value!==true)throw Error("Bottom drift "+id);
let link=at(bottom,"Link");const main=await link.getMainComponentAsync(),owner=main.parent.type==="COMPONENT_SET"?main.parent:main;
if(!owner.componentPropertyDefinitions.Size.variantOptions.includes(size))throw Error("Size unsupported "+size);
if(link.componentProperties.Size.value!==size)link.setProperties({Size:size});
await load(n);link=at(bottom,"Link");
link.setProperties({"Right Addon#60204:4":rightAddon,"Left Addon#60204:0":false,"✎ Label#493:29":"Подробнее"});
await load(n);
const icon=n.findAllWithCriteria({types:["INSTANCE"]}).find(x=>x.name==="IconView");
if(i===4||i===5){if(!icon)throw Error("IconView missing "+id);icon.setProperties({"Shape#88323:0":true,"BgColor#70274:0":false});}
const style=n.findAllWithCriteria({types:["INSTANCE"]}).find(x=>x.name.includes("Style Level 1"));
if(i===6||i===7){if(!style||style.componentProperties.Type.value!=="Secondary")throw Error("BG Type drift "+id);}
n.layoutSizingVertical="HUG";n.name="BC10-"+String(i+1).padStart(2,"0")+"-"+platform;
const captions=n.parent.children.filter(x=>x.type==="TEXT");if(captions.length!==2)throw Error("Caption count "+id);
for(const t of captions){await load(t);ids.add(t.id);}
captions[0].characters=String(i+1).padStart(2,"0")+" · "+(platform==="desktop"?"D":"M")+" · "+label;
captions[1].characters=(i===4||i===5?"Shape=true · BgColor=false · ":"")+"RightAddon="+rightAddon+"\nРодительские правила: "+expected+" нарушений";
for(const p of [n.parent,n.parent.parent,n.parent.parent.parent])ids.add(p.id);
track(n);
const actual=at(n,"ContentWrapper / Content / Bottom / Link");
if(actual.componentProperties.Size.value!==size||actual.componentProperties["Right Addon#60204:4"].value!==rightAddon||n.layoutSizingVertical!=="HUG")throw Error("Readback mismatch "+id);
done.push({id,name:n.name,platform,size:actual.componentProperties.Size.value,rightAddon:actual.componentProperties["Right Addon#60204:4"].value,hug:n.layoutSizingVertical,expectedParentViolations:expected,icon:icon?{shape:icon.componentProperties["Shape#88323:0"].value,bgColor:icon.componentProperties["BgColor#70274:0"].value}:null,surfaceType:style?style.componentProperties.Type.value:null,width:n.width,height:n.height});
}
const title=await figma.getNodeByIdAsync("14134:68885"),instruction=await figma.getNodeByIdAsync("14134:68886");await load(title);await load(instruction);
title.characters="BenefitCard r10 · финальные 8 проверок";
instruction.characters="Выбирайте экземпляр карточки. Канал D/M · CardPlacement=single. Ожидания — по правилам BenefitCard.";
ids.add(title.id);ids.add(instruction.id);ids.add(board.id);board.name="BenefitCard r10 · финальные 8 проверок";
}catch(e){failure=String(e);}
const segments=[],index=new Map();const paths=[...ids].map(id=>id.split(";").map(s=>{if(!index.has(s)){index.set(s,segments.length);segments.push(s);}return index.get(s);}));
return {status:failure?"FAILED_PRESERVED":"PREPARED_NOT_RUN_USER_ONLY",failure,completed:done,createdRootIds:[],explicitlyRemovedIds:[],affectedIds:{segments,paths},affectedCount:ids.size,board:{id:board.id,name:board.name,width:board.width,height:board.height}};
