const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const script=path.resolve(__dirname,'../../.claude/skills/corp-component-authoring/scripts/validate-component-package.mjs');
function scenario(t,files){
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'legacy-package-scope-')));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 assert.equal(cp.spawnSync('git',['init','-q'],{cwd:root}).status,0);
 assert.equal(cp.spawnSync('git',['-c','user.name=Synthetic test','-c','user.email=test@example.invalid','commit','--allow-empty','-qm','Synthetic baseline'],{cwd:root}).status,0);
 for(const [file,text] of Object.entries(files)){const target=path.join(root,'JSONS/web/components/Synthetic',file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);}
 return cp.spawnSync(process.execPath,[script,'--changed'],{cwd:root,encoding:'utf8'});
}
test('support README files and manual-only mobile source do not require eight legacy documents',t=>{
 for(const dir of ['mapping','packages','tests','reports','history','contract-versions']){
  const result=scenario(t,{[dir+'/README.md']:'# Synthetic support'});assert.equal(result.status,0,result.stderr);
 }
 const mobile=scenario(t,{'mobile-web/contract.manual.json':'{}','mobile-web/README.md':'# Synthetic mobile source'});assert.equal(mobile.status,0,mobile.stderr);
});
test('incomplete legacy component root still fails required document validation',t=>{
 const result=scenario(t,{'README.md':'# Incomplete synthetic component'});assert.equal(result.status,2);assert.match(result.stdout+result.stderr,/agent-context.json/);
});
