const test=require('node:test'),assert=require('node:assert/strict');
const {buildRuntimeVariantStructures}=require('./convert_figma_catalogs_to_contracts');
const base=[{id:1,parentId:null},{id:2,parentId:1},{id:3,parentId:2}],
 operations=[{op:'add',node:{id:2,parentId:1,type:'INSTANCE',name:'New'}},{op:'add',node:{id:3,parentId:2,type:'VECTOR',name:'Icon'}},{op:'remove',id:2},{op:'remove',id:3}];
test('known legacy addition namespace is rebased independently from base removes without changing source',()=>{
 const before=JSON.stringify({base,operations}),warnings=[];
 const result=buildRuntimeVariantStructures({variant:operations},base,{legacyAddIdNamespace:true,warnings}).variant;
 assert.deepEqual(result.map(o=>[o.op,o.id]),[['add',4],['add',5],['remove',2],['remove',3]]);
 assert.equal(result[1].value.parentId,4);assert.equal(result[0].value.parentId,1);
 assert.equal(JSON.stringify({base,operations}),before);assert.equal(warnings.length,1);
 assert.deepEqual(buildRuntimeVariantStructures({variant:operations},base,{legacyAddIdNamespace:true}).variant,result);
});
for(const [label,ops,tree,options]of[
 ['current format collisions',operations,base,{}],
 ['collision without explicit old removal',operations.slice(0,2),base,{legacyAddIdNamespace:true}],
 ['duplicate additions',[operations[0],operations[0]],base,{legacyAddIdNamespace:true}],
 ['ambiguous update',[...operations,{op:'update',id:2,value:{visible:false}}],base,{legacyAddIdNamespace:true}],
 ['duplicate base',operations,[...base,base[1]],{legacyAddIdNamespace:true}],
 ['missing parent',[{op:'add',node:{id:4,parentId:99,type:'FRAME'}}],base,{}],
 ['cycle',[{op:'update',id:1,value:{parentId:3}}],base,{}],
])test('malformed or ambiguous catalog fails: '+label,()=>assert.throws(()=>buildRuntimeVariantStructures({variant:ops},tree,options)));
