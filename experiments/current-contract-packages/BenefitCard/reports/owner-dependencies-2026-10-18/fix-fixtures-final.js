
const page=await figma.getNodeByIdAsync("8701:32684");if(!page||page.type!=="PAGE")throw new Error("Lab missing");await figma.setCurrentPageAsync(page);
const board=await figma.getNodeByIdAsync("14134:68884");if(!board||board.type!=="FRAME")throw new Error("Own board missing");
const specs=[["14134:68892",false],["14134:68949",false],["14136:68971",true],["14136:69023",true],["14136:69064",false],["14136:69201",false],["14136:69379",false],["14136:69419",false]];
const ids=new Set(),done=[];
function walk(n,f){f(n);if("children"in n)for(const c of n.children)walk(c,f);}
function track(n){walk(n,x=>ids.add(x.id));}
function at(n,p){for(const s of p.split(" / ")){if(!("children"in n))throw new Error("Bad path");const c=n.children.filter(x=>x.name===s);if(c.length!==1)throw new Error("Missing/ambiguous "+p);n=c[0];}return n;}
try{
 const nodes=await Promise.all(specs.map(s=>figma.getNodeByIdAsync(s[0]))),fonts=new Map();
 for(const n of nodes){if(!n||n.type!=="INSTANCE"||!n.parent||n.parent.parent.parent.parent!==board)throw new Error("Own instance scope mismatch");walk(n.parent,x=>{if(x.type==="TEXT")for(const s of x.getStyledTextSegments(["fontName"]))fonts.set(JSON.stringify(s.fontName),s.fontName);});}
 await Promise.all([...fonts.values()].map(f=>figma.loadFontAsync(f)));
 for(let i=0;i<nodes.length;i++){
  const n=nodes[i],negative=specs[i][1];track(n);
  const link=at(n,"ContentWrapper / Content / Bottom / Link");if(link.type!=="INSTANCE")throw new Error("Link missing");
  const before={height:n.layoutSizingVertical,rightAddon:link.componentProperties["Right Addon#60204:4"].value};
  link.setProperties({"Right Addon#60204:4":!negative});n.layoutSizingVertical="HUG";track(n);
  if(n.layoutSizingVertical!=="HUG"||link.componentProperties["Right Addon#60204:4"].value!==!negative)throw new Error("Property readback failed");
  const texts=n.parent.children.filter(x=>x.type==="TEXT");if(texts.length!==2)throw new Error("Caption scope mismatch");
  if(i<4){texts[1].characters=negative?"RightAddon=false · изменён эталон Link\nРодительские правила: 1 нарушение":"Link · Подробнее · RightAddon=true (эталон)\nРодительские правила: 0 нарушений";ids.add(texts[1].id);if(negative){texts[0].characters=(i===2?"D":"M")+" · Link: изменение RightAddon";ids.add(texts[0].id);}}else{const title=n.name.includes("ICON")?"Публичная конфигурация IconView":"BackgroundPlate.Type=Secondary";texts[1].characters=title+"\nРодительские правила: 0 нарушений";ids.add(texts[1].id);}
  done.push({id:n.id,name:n.name,before,after:{height:n.layoutSizingVertical,rightAddon:link.componentProperties["Right Addon#60204:4"].value},expectedViolations:negative?1:0});
 }
 return {status:"FIXTURE_CONFIGURATION_CORRECTED",cases:done,mutatedNodeIds:[...ids],createdNodeIds:[],removedNodeIds:[],Ready:false,validation:"PROPERTY_READBACK_ONLY_NOT_ENGINE_RUN"};
}catch(e){return {status:"STOP_PRESERVED_NO_RETRY",error:String(e&&e.message||e),cases:done,mutatedNodeIds:[...ids],createdNodeIds:[],removedNodeIds:[],Ready:false};}

