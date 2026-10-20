const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const W='/Users/alexkukhta/Desktop/workplace',S=path.join(W,'shared/design-system_ab'),R=__dirname;
const read=n=>JSON.parse(fs.readFileSync(path.join(R,n),'utf8'));
const write=(n,v)=>fs.writeFileSync(path.join(R,n),JSON.stringify(v,null,2)+'\n');
const pin=p=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const verify=p=>assert.deepEqual(pin(p.path),p,p.path);
const request=read('SHARED-WINDOW-REQUEST.json'),evaluation=read('eval.json');
request.currentBasePins.forEach(verify);verify(request.sourcePatch);verify(evaluation.zip);verify(evaluation.core);
write('PROCESS-NOTE.json',{
  status:'PRIVATE_CORRECTION_VERIFIED_GENERAL_CLOSURE_PENDING',
  firstFailure:pin(path.join(W,'.local/apollo-general-2026-10-16/backgroundplate-window289/FIRST-INTAKE-FAILURE.json')),
  fact:'The initial PREPARED request was sent before completion of its source patch. Intake rejected a stale private pin before any grant.',
  cause:'Contract Creation extended the private patch after sending the initial request; revision2 followed separately. Preparation order error, not a guard defect or changed sealed/shared source.',
  consequence:'No source/Hub/rootZIP/manifest/core/dist/restart writes. Decision bookkeeping in Sheets had already completed before the broader freeze message; readback preserved.',
  repair:'Preserve the initial request and first failure. Issue a distinct CLOSED request after all payload files are complete and their exact pins are read back.',
  protection:'Finish payload, pin/readback, close/seal, then relay. After closure use a new revision/directory.',
  responsible:'Contract Creation; independent closure by General',
  verification:'Private source patch dry-run and direct pins pass; fresh General intake NOT_RUN.',
  centralJournal:'docs/APOLLO_PROCESS_LESSONS.md update awaits an authorized shared window.',
  helperChecks:['Normalize IR comparison through JSON serialization.','Source coverage JSON must have an object root.','Six public set admissions and eight auxiliary rejections verified; combined catalog UI choice deduplication is a separate limitation.']
});
write('FINAL-WINDOW-REQUEST.json',{
  status:'CLOSED_PRIVATE_REQUEST_NOT_GRANTED',writer:'Apollo CB :: Contract Creation',closedToFurtherWrites:true,
  decisionPacket:pin(path.join(R,'owner-decisions.json')),candidate:evaluation.zip,
  evaluation:pin(path.join(R,'eval.json')),sourcePatch:pin(path.join(R,'source-rules.patch.json')),
  scope:{
    existingFiles:request.currentBasePins,
    plannedNewFiles:[
      path.join(S,'patterns/p_surface-composition.md'),path.join(S,'patterns/p_design-system-usage.md'),
      path.join(S,'patterns/p_loading-states.md'),path.join(W,'ds-ai-hub/products/ab/patterns/surface-composition.md'),
      path.join(W,'ds-ai-hub/products/ab/patterns/design-system-usage.md'),path.join(W,'ds-ai-hub/products/ab/patterns/loading-states.md')
    ],
    additionalExistingFiles:[pin(path.join(W,'ds-ai-hub/products/ab/components/background-plate/instructions.md')),pin(path.join(S,'JSONS/web/components/web-corp/BackgroundPlate/contract.generated.json'))],
    sheets:{url:'https://docs.google.com/spreadsheets/d/1u3Y7lhO3udXAhGlf7hOk2_zYkWZ0-vgtd6KjtbnxLnk/edit',
      completedBookkeeping:pin(path.join(R,'sheets-readback.json')),
      completedScope:{rulesRows:read('sheets-readback.json').rulesRows,columns:['H','J','N','O'],ledgerRow:515,corpRange:'AF8:AH8'},
      futureScope:'Only these accepted norms and canonical global/pattern rows after actual source sync. New row addresses must be read before grant. Do not replay completed bookkeeping.'}
  },
  freeze:{reference:path.join(W,'.local/apollo-general-2026-10-16/backgroundplate-window289/QUEUE.json'),
    status:'WAIT_OWNER_FULL_GENERATION_RETEST',sourceHubRootManifestCoreDistRestartWrites:0,
    sheetsBookkeeping:'COMPLETED_BEFORE_FREEZE_MESSAGE_READBACK_PASS',rollback:'NOT_REQUESTED',noPilotExpansion:true},
  completionCondition:request.completionCondition,
  inputReadback:'All existing base pins and private ZIP/core verified immediately before closure.',requestOnly:true,Ready:false
});
const files=fs.readdirSync(R).filter(n=>n!=='SEAL.json'&&fs.statSync(path.join(R,n)).isFile()).sort().map(n=>pin(path.join(R,n)));
write('SEAL.json',{status:'CLOSED_PRIVATE_PREPARATION_SHARED_APPLICATION_PENDING',writesClosed:true,
  scope:'This private directory only; no source/Hub/root package promotion.',files,Ready:false});
read('SEAL.json').files.forEach(verify);
console.log(JSON.stringify({status:'CLOSED_PRIVATE_PACKET_PIN_READBACK_PASS',files:files.length,
  request:pin(path.join(R,'FINAL-WINDOW-REQUEST.json')),seal:pin(path.join(R,'SEAL.json')),candidate:evaluation.zip}));
