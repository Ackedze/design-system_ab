// Independently pinned caller configuration, never selected by imported JSON.
const fs=require('node:fs'),path=require('node:path');
const {digest}=require('../../registry/source-inventory.cjs');
const repo=path.resolve(__dirname,'../../../..'),workspace=path.dirname(repo),generation=path.join(workspace,'projects/Apollo-v3');
const current={producerRoot:repo,workspaceRoot:workspace,
    manifestPin:{path:path.join(__dirname,'producer.v1-draft.json'),sha256:'bf99a250fef8face3b79ea3d963e9bb587fe4b28644c755733254124370eb3fc'},
    reportPin:{path:path.join(__dirname,'review-report.v1-draft.json'),sha256:'585f42b09e21f2186026e7718008b17c1f1856ad56dcfacd8c693de5204e96f5'}};
const historical={producerRoot:repo,workspaceRoot:workspace,
    manifestPin:{path:path.join(__dirname,'../v1-draft/producer.v1-draft.json'),sha256:'bfe8a28f4344eb015e84dadb50ee39403e842ebad7530f24921480107bbfab07'},
    reportPin:{path:path.join(repo,'tools/code-connect/reports/NEXT-03-static-content-producer.2026-10-06.json'),sha256:'74c3e05a8b33a28a66f5768ddddcd9246a832dba9c6de0a031fe679477766aeb'}};
const reader=require(path.join(generation,'apps/apollo-v4/scripts/static-producer-review-inputs.cjs'));
function config(name='synthetic.supported.review.json',history=false){const c=history?historical:current;return {...c,reviewPath:path.join(path.dirname(c.manifestPin.path),name)};}
function basis(result,name='synthetic.supported.review.json'){
    const a=JSON.parse(fs.readFileSync(current.manifestPin.path)),report=JSON.parse(fs.readFileSync(current.reportPin.path));
    const registry=require('../../registry/consumer.cjs').loadRegistry();
    return {artifactDigest:a.artifactDigest,registryDigest:a.frozen.registryDigest,currentInputsDigest:a.frozen.currentInputsDigest,lockDigest:a.frozen.lockDigest,
        consumerFilesDigest:digest(a.consumerFiles),workspaceConsumerFilesDigest:digest(a.workspaceConsumerFiles),buildInputsDigest:digest(a.buildInputs),consumerVector:a.consumerVector,
        basisRegistryDigest:a.frozen.basisRegistryDigest,apiEvidenceDigest:digest(a.apiEvidenceFiles),inputPackages:a.frozen.inputPackages,
        mappings:registry.mappings.filter(m=>['arui-private.corporate-content.desktop','arui-private.buttons-group.desktop'].includes(m.id)).map(m=>({id:m.id,
            pin:{componentId:m.contract.componentId,contractId:m.contract.contractId,revision:m.contract.revision,manualSourceHash:m.contract.manualSourceHash,compiledHash:m.contract.compiledHash},
            representationId:m.code.proposedRepresentationId,sourceScopeHash:registry.currentInputs.packages.find(p=>p.componentId===m.contract.componentId).representationScopeHash||null})),
        historicalSourceRead:report.outputs.find(p=>path.basename(p.path)===name).generationSourceRead,sourceReview:result.inspection.sourceReview,consumerMismatches:[]};
}
module.exports={repo,workspace,generation,config,basis,read:reader.loadStaticProducerReview};
