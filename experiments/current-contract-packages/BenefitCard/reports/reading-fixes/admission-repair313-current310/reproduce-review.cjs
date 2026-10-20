const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {root,guard,pin}=require('./guard.cjs');
const before=guard('before-frozen312-reproductions'),checks=[];
for(const [name,file,expected]of [['settings','before-settings-probe.cjs',1],['owned','before-owned-probe.cjs',0]]){
 const script=pin(root+'/'+file),r=cp.spawnSync('/usr/local/bin/node',[script.path],{encoding:'utf8',env:{...process.env,
  ARTIFACTS_DIR:root+'/workspace/before-settings',TMPDIR:root+'/workspace/tmp',CHROME_PATH:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  PLAYWRIGHT_MODULE:'/Users/alexkukhta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'}});
 fs.writeFileSync(root+'/BEFORE-'+name+'.log',r.stdout+r.stderr,{flag:'wx'});assert.equal(r.status,expected,r.stdout+r.stderr);assert.deepEqual(pin(script.path),script);
 checks.push({name,script,exit:r.status,log:pin(root+'/BEFORE-'+name+'.log')});
}
const ui=JSON.parse(fs.readFileSync(root+'/workspace/before-settings/SETTINGS-PROBE.json'));
assert.deepEqual(ui.errorsBefore,[]);assert.deepEqual(ui.errorsAfter,['COMPONENT_DEPENDENCY_RUNTIME_UNSUPPORTED']);assert.equal(ui.dialogOpen,false);
const owned=JSON.parse(fs.readFileSync(root+'/OWNED-COLLECTION-PROBE.json'));
assert.equal(owned.baselineElements,4);assert.deepEqual(owned.newCompilerErrors,[]);assert.equal(owned.version,2);assert.equal(owned.prepared,true);assert.equal(owned.error,'OWNED_CODE_COLLECTION_UNPROVEN: schema');
fs.writeFileSync(root+'/REPRODUCED-313.json',JSON.stringify({status:'BOTH_REVIEW_FAILURES_REPRODUCED',before,after:guard('after-frozen312-reproductions'),checks,ui,owned,Ready:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({reviewFailuresReproduced:2,sharedWrites:0}));
