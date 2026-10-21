const root = await figma.getNodeByIdAsync("23266:258531");
if (!root || root.type !== "COMPONENT") throw new Error("PMN_SOURCE_ROOT_MISSING");
const rows = [], owners = [], seen = new Set();
async function visit(n, path, depth) {
 const row = {id:n.id,name:n.name,type:n.type,path,visible:n.visible,width:n.width,height:n.height};
 if (n.type==="INSTANCE") {
  row.componentProperties=n.componentProperties;
  const main=await n.getMainComponentAsync();
  if(main) {
   row.mainComponent={id:main.id,key:main.key,name:main.name,parentId:main.parent?.id,parentType:main.parent?.type};
   const owner=main.parent?.type==="COMPONENT_SET"?main.parent:main;
   if(!seen.has(owner.id)){seen.add(owner.id);owners.push({id:owner.id,key:owner.key,name:owner.name,type:owner.type,definitions:owner.componentPropertyDefinitions,variants:owner.type==="COMPONENT_SET"?owner.children.map(v=>({id:v.id,key:v.key,name:v.name})):null});}
  }
 }
 if(n.type==="TEXT"){row.characters=n.characters;row.componentPropertyReferences=n.componentPropertyReferences;row.textStyleId=n.textStyleId;row.lineHeight=n.lineHeight;row.fills=n.fills;row.boundVariables=n.boundVariables;}
 if("paddingLeft" in n){row.paddingLeft=n.paddingLeft;row.itemSpacing=n.itemSpacing;row.layoutMode=n.layoutMode;}
 rows.push(row);
 if(depth<4 && "children" in n)for(const c of n.children)await visit(c,path.concat(c.name),depth+1);
}
await visit(root,[root.name],0);
return {schemaVersion:"apollo.mapping-native-evidence.v1",fileKey:figma.fileKey,sourceRoot:{id:root.id,key:root.key,name:root.name,type:root.type,componentSetKey:root.parent?.type==="COMPONENT_SET"?root.parent.key:null,definitions:root.componentPropertyDefinitions},rows,owners,mutatedNodeIds:[],createdNodeIds:[]};
