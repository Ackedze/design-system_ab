const fs=require('node:fs'),cp=require('node:child_process');
const {root,guard,pin}=require('./guard.cjs');
const before=guard('before-portable-ui-adoption-boundary'),test=root+'/workspace/candidate/projects/ComponentContractEditor/tests/authoring-admission.browser.cjs';
const attempt=process.argv[2]||'01';if(!/^\d{2}$/.test(attempt))throw Error('Invalid attempt');
const r=cp.spawnSync('/usr/local/bin/node',[test],{encoding:'utf8',env:{...process.env,
 ARTIFACTS_DIR:root+'/workspace/portable-ui-'+attempt,TMPDIR:root+'/workspace/tmp',CHROME_PATH:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
 PLAYWRIGHT_MODULE:'/Users/alexkukhta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'}});
fs.writeFileSync(root+'/PORTABLE-UI-TESTS-'+attempt+'.log',r.stdout+r.stderr,{flag:'wx'});
fs.writeFileSync(root+'/PORTABLE-UI-TESTS-'+attempt+'.json',JSON.stringify({before,after:guard('after-portable-ui-adoption-boundary'),test:pin(test),status:r.status,signal:r.signal},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:r.status,signal:r.signal,output:r.stdout+r.stderr}));process.exitCode=r.status||0;
