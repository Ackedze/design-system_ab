const ids=["23266:258524","23266:258526","74683:74736","23266:258521","74683:74762","74683:74784","74683:74788","74683:74849"];
const rows=[];
for(const id of ids){
 const n=await figma.getNodeByIdAsync(id);
 if(!n||n.type!=="COMPONENT")throw Error("PMN_PART_MISSING:"+id);
 const children=[];
 for(const c of n.children){
  const r={id:c.id,type:c.type,name:c.name,visible:c.visible,componentPropertyReferences:c.componentPropertyReferences};
  if(c.type==="TEXT"){r.characters=c.characters;r.textStyleId=c.textStyleId;r.lineHeight=c.lineHeight;}
  if(c.type==="INSTANCE"){const m=await c.getMainComponentAsync();r.mainComponent=m?{id:m.id,key:m.key,name:m.name}:null;r.componentProperties=c.componentProperties;}
  children.push(r);
 }
 rows.push({id:n.id,key:n.key,name:n.name,type:n.type,parentId:n.parent?.id,parentType:n.parent?.type,paddingLeft:n.paddingLeft,children});
}
return {fileKey:figma.fileKey,rows,mutatedNodeIds:[],createdNodeIds:[]};
