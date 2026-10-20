const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const {root,pin,load,exact,guard}=require('./guard.cjs');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const previous=load(root+'/COMPACT-PREPARATION.json');for(const p of previous.pins)exact(p);
const pins=[...previous.pins,pin(__filename),pin(root+'/accept-compact.cjs')],before=guard('compact-r2-preparation-before');
for(let i=1;i<=16;i++){
 const batch='compact-'+String(i).padStart(2,'0'),old=fs.readFileSync(root+'/'+batch+'.js','utf8');assert.equal(old.split('failure,captures,').length,2);
 const code=old.replace('failure,captures,','failure:failure||null,captures,');new AsyncFunction(code);
 const output=root+'/'+batch+'.r2.js';fs.writeFileSync(output,code,{flag:'wx'});pins.push(pin(output));
 const tail=code.slice(code.lastIndexOf('return finishCompactReceipt('));assert.ok(tail.includes('failure:failure||null,captures,'));
}
const original=fs.readFileSync(root+'/compact-capture-batch.js','utf8');const tail=original.slice(original.lastIndexOf('return finishCompactReceipt(')).replace('failure,captures,','failure:failure||null,captures,');
const run=new Function('finishCompactReceipt','failure','foreign','extra','captures','request','removed','created','before','after','figma','page','roots','container',tail);
const context={encodeURIComponent};vm.createContext(context);vm.runInContext(fs.readFileSync(root+'/compact-receipt.js','utf8')+'\nthis.finish=finishCompactReceipt;',context);
const schema=load(root+'/compact-schema.json');
const checkEnvelope=x=>{const serialized=JSON.stringify(x),readback=JSON.parse(serialized);for(const k of schema.batchRequired)assert.ok(Object.hasOwn(readback,k),k);assert.equal(Buffer.byteLength(serialized),readback.inlineBytes);return readback;};
const x=checkEnvelope(run(context.finish,undefined,[],[],[],{variants:[],batchId:'SELF_CHECK'},new Set(),new Set(),[],[],{fileKey:'f'},{id:'p'},[],{id:'c'}));assert.equal(x.failure,null);
const failure={message:'retained'};assert.deepEqual(checkEnvelope(run(context.finish,failure,[],[],[],{variants:[],batchId:'SELF_CHECK'},new Set(),new Set(),[],[],{fileKey:'f'},{id:'p'},[],{id:'c'})).failure,failure);
const after=guard('compact-r2-preparation-after'),output=root+'/COMPACT-PREPARATION-r2.json';fs.writeFileSync(output,JSON.stringify({...previous,status:'PASS_EXACT_DRIVER_PREPARATION_R2_ONLY',previousPreparation:pin(root+'/COMPACT-PREPARATION.json'),pins,transportOnlyCorrection:'Successful undefined failure is serialized explicitly as null; actual failure object retained byte-for-field. No capture or norm change.',exactTailSerializationTests:2,before,after,nativeCalls:0})+'\n',{flag:'wx'});console.log(JSON.stringify({status:'PASS',preparation:pin(output),pins:pins.length,nativeCalls:0}));
