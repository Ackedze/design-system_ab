const test=require('node:test'),assert=require('node:assert/strict');
const {collectRuleRetirements,missingSourceRuleIds}=require('../lib/component-rule-relocations');
test('owner retirement accounts for source IDs without restoring rules',()=>{
 const d={id:'remove',status:'accepted',rationale:'Owner cancellation',retiredRuleIds:['a']};
 const rs=collectRuleRetirements(['a'],[],[],[d]);assert.deepEqual(missingSourceRuleIds(['a'],[],[],rs),[]);
 for(const [rules,relocations,decisions] of [[[{id:'a'}],[],[d]],[[],[{ruleId:'a'}],[d]],[[],[],[d,d]],[[],[],[{...d,status:'needs-confirmation'}]],[[],[],[{...d,rationale:''}]]])assert.throws(()=>collectRuleRetirements(['a'],rules,relocations,decisions));
 assert.throws(()=>collectRuleRetirements(['b'],[],[],[d]));assert.deepEqual(missingSourceRuleIds(['a'],[],[]),['a']);
});
