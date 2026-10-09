const path=require('path'),fs=require('fs');
const workspace=path.resolve(__dirname,'../../../../../../..');
const esbuild=require(path.join(workspace,'projects/ComponentContractEditor/node_modules/esbuild'));
const core=path.join(workspace,'projects/Apollo-v3/packages/component-contract-core/src');
esbuild.build({stdin:{contents:`export {collectNodes} from ${JSON.stringify(path.join(core,'figma-capture.ts'))}; export {captureVariantReference} from ${JSON.stringify(path.join(core,'variant-facts.ts'))}; export {portableDeclaredTargetReferenceHash} from ${JSON.stringify(path.join(core,'declared-target-identity.ts'))}; export {stableHash} from ${JSON.stringify(path.join(core,'stable.ts'))};`,resolveDir:workspace,loader:'ts'},bundle:true,format:'iife',globalName:'PortableCapture',platform:'browser',target:'es2020',minify:true,outfile:path.join(__dirname,'native-portable-capture.js')}).catch(e=>{console.error(e);process.exitCode=1;});
