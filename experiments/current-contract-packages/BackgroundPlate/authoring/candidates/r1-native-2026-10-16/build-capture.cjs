const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const W = '/Users/alexkukhta/Desktop/workplace';
const pin = p => { const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}; };
const inputs=JSON.parse(fs.readFileSync(path.join(W,'.local/apollo-general-2026-10-16/mcp-pilot276/BACKGROUNDPLATE-C-PROTECTED-INPUTS.json')));
for(const p of [...inputs.runtimeInputs,inputs.core271,...inputs.rootPackages])assert.deepEqual(pin(p.path),p);
const esbuild=require(path.join(W,'projects/Apollo-v3/node_modules/esbuild'));
const root=path.join(W,'projects/Apollo-v3/packages/component-contract-core/src');
const result=esbuild.buildSync({stdin:{contents:`export {collectNodes} from './figma-capture'; export {captureVariantReference} from './variant-facts'; export {portableDeclaredTargetReferenceHash,configurationDeclaredTargetReferenceHash} from './declared-target-identity';`,resolveDir:root,sourcefile:'backgroundplate-native-capture-entry.ts',loader:'ts'},bundle:true,format:'cjs',platform:'browser',target:'es2020',minify:true,metafile:true,write:false});
const factory='(function(figma){const module={exports:{}};const exports=module.exports;'+result.outputFiles[0].text+';return module.exports;})';
assert(factory.length<47000,'Native capture factory exceeds transport budget');
fs.writeFileSync(path.join(__dirname,'capture-factory.js'),factory);
const actualInputs=Object.keys(result.metafile.inputs).filter(p=>!p.includes('backgroundplate-native-capture-entry')).map(p=>pin(path.resolve(p)));
for(const p of actualInputs){const accepted=inputs.runtimeInputs.find(v=>v.path===p.path);if(accepted)assert.deepEqual(p,accepted);}
fs.writeFileSync(path.join(__dirname,'capture-toolchain.json'),JSON.stringify({status:'EXISTING_COLLECTNODES_PRIVATE_BUNDLE_NO_SOURCE_EDITS',inputs:actualInputs,bundle:pin(path.join(__dirname,'capture-factory.js')),core:inputs.core271,transportLimit:50000})+'\n');
for(const p of [...inputs.runtimeInputs,inputs.core271,...inputs.rootPackages])assert.deepEqual(pin(p.path),p);
console.log(JSON.stringify({factoryBytes:Buffer.byteLength(factory),sourceInputs:actualInputs.length,protectedRuntimeInputs:inputs.runtimeInputs.length,packages:inputs.rootPackages.length}));
