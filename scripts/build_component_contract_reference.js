#!/usr/bin/env node
// Generic isolated authoring package builder. Never creates/rewrites manual source.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname, '..');
const workspace = path.resolve(repo, '../..');
const core = require(path.join(workspace, 'projects/ComponentContractEditor/dist/core.cjs'));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const evidenceNames = ['agent-context.json', 'audit-mapping.json', 'composition-contract.json', 'contract.generated.json', 'contract.overrides.json', 'examples.json', 'rules.json'];
const converter = require('./convert_figma_catalogs_to_contracts');
const {collectRuleRelocations, collectRuleRetirements, missingSourceRuleIds} = require('./lib/component-rule-relocations');

// Derived QA is not another normative source; changed manual/facts invalidate it.
function matchingAcceptance(acceptance, compiled) {
  return Boolean(acceptance && acceptance.schemaVersion === 'apollo.component-contract.acceptance.v1' &&
    acceptance.status === 'accepted' && acceptance.scope === 'figma-component' &&
    acceptance.componentId === compiled.package.componentId &&
    acceptance.manualSourceHash === compiled.package.manualSourceHash &&
    acceptance.compiledHash === core.stableHash(compiled) &&
    acceptance.generatedFactsHash === compiled.package.generatedFactsHash);
}

function build(relativePackage, preserve = true, allowNewSources = false) {
  const root = path.resolve(repo, relativePackage);
  if (!root.startsWith(path.join(repo, 'experiments') + path.sep)) throw new Error('Only isolated experiments are supported.');
  const manualFile = path.join(root, 'contract.manual.json');
  const bytes = fs.readFileSync(manualFile), manual = JSON.parse(bytes);
  const previousFile = path.join(root, 'reports/source-inventory.json');
  const previous = preserve && fs.existsSync(previousFile) ? JSON.parse(fs.readFileSync(previousFile)).sources : [];
  const sources = manual.source.importedFiles.slice().sort().map(file => {
    const [repository, ...parts] = file.split('/');
    if (!['design-system_ab', 'ds-ai-hub'].includes(repository) || parts.includes('..') || !parts.length) throw new Error(`Invalid source path: ${file}`);
    const destination = path.join(root, 'sources', file);
    const old = previous.find(s => s.path === file);
    if (preserve && previous.length && !old && !allowNewSources) throw new Error(`New source requires explicit --add-sources: ${file}`);
    const data = preserve && old ? fs.readFileSync(destination) : fs.readFileSync(path.join(repository === 'design-system_ab' ? repo : path.join(workspace, 'ds-ai-hub'), ...parts));
    if (old && sha(data) !== old.sha256) throw new Error(`Preserved source changed: ${file}`);
    return {path:file,sha256:sha(data),bytes:data.length,data,destination};
  });
  const sourceHash = sha(sources.map(s => `${s.path}\0${s.sha256}`).join('\n'));
  if (sourceHash !== manual.source.sourceHash) throw new Error('Source evidence hash differs from manual. Review the refreshed sources before updating manual sourceHash.');
  const athena = sources.filter(s => s.path.startsWith('design-system_ab/') && evidenceNames.includes(path.basename(s.path)));
  const inputFiles = [{name:'contract.manual.json',text:bytes.toString()}, ...athena.map(s=>({name:`evidence/${path.basename(s.path)}`,text:s.data.toString()}))];
  for (const source of sources.filter(s => s.path.startsWith('design-system_ab/JSONS/styles/') && s.path.endsWith('.json'))) {
    inputFiles.push({name:`evidence/styles/${path.basename(source.path)}`,text:source.data.toString()});
  }
  const raw = sources.filter(s=>s.path.endsWith('.json') && s.path.startsWith('design-system_ab/') && JSON.parse(s.data).kind==='catalog');
  if (raw.length !== 1) throw new Error('Expected one explicit pinned Athena raw catalog.');
  const catalog = JSON.parse(raw[0].data);
  converter.validateCatalog(catalog,raw[0].path);
  const generated = converter.convertCatalog(catalog,raw[0].path).file;
  const generatedInput = inputFiles.find(f=>f.name==='evidence/contract.generated.json');
  if (!generatedInput) throw new Error('Generated contract source is required.');
  generatedInput.text = JSON.stringify(generated);
  // Dependencies are pinned generated inputs, never another editable manual source.
  const dependencyContracts=sources.filter(s=>s.path.endsWith('/compiled/component-contract.v2.json')).map(s=>JSON.parse(s.data));
  for (const contract of dependencyContracts) {
    if (!(manual.componentDependencies || []).some(d=>d.componentId===contract.package?.componentId)) throw new Error('Unrequested dependency source.');
    inputFiles.push({name:`dependencies/${contract.package.componentId}/component-contract.v2.json`,text:JSON.stringify(contract)});
  }
  const imported = core.importWorkspace(inputFiles);
  if (!imported.variantEvidence?.variants.length) throw new Error('Athena variant evidence is missing.');
  const expected = generated.contracts.flatMap(c=>c.figma.variants.variantKeys.map(v=>({componentKey:v.key,componentSetKey:c.componentKey})));
  const absent = expected.filter(v=>!imported.variantEvidence.variants.some(e=>e.componentKey===v.componentKey&&e.componentSetKey===v.componentSetKey));
  // Draft packages may expose gaps, never fill them with another variant's anatomy.
  const factsCoverage = {catalogVariants:expected.length,verifiedVariantStructures:imported.variantEvidence.variants.length,missingVariants:absent,complete:absent.length===0};
  const bundle = core.buildExportBundle(manual, imported.variantEvidence, dependencyContracts);
  if (!bundle.validation.valid) throw new Error(JSON.stringify(bundle.validation.issues));
  const athenaRules = athena.filter(s=>path.basename(s.path)==='rules.json').flatMap(s=>{
    const d=JSON.parse(s.data);return [...(d.generated?.rules||[]),...(d.manual?.rules||[])];
  });
  const relocationPath = path.join(root, 'migrations/usage-rules.json');
  const relocatedRules = collectRuleRelocations({repoRoot:repo, componentId:manual.component.componentId,
    manualRules:manual.rules, manifest:fs.existsSync(relocationPath) ? JSON.parse(fs.readFileSync(relocationPath)) : undefined});
  const retiredRules = collectRuleRetirements(athenaRules.map(r=>r.ruleId),manual.rules,relocatedRules,manual.decisions);
  const missing = missingSourceRuleIds(athenaRules.map(r=>r.ruleId),manual.rules,relocatedRules,retiredRules);
  if (missing.length) throw new Error(`Lost Athena RuleIDs: ${missing.join(', ')}`);
  // Resolve references before touching derived outputs.
  for (const doc of manual.documentation) if (!sources.some(s=>`sources/${s.path}`===doc.path)) throw new Error(`Missing document: ${doc.path}`);
  const write = (name, value) => { const p=path.join(root,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,ArrayBuffer.isView(value)?Buffer.from(value.buffer,value.byteOffset,value.byteLength):JSON.stringify(value,null,2)+'\n'); };
  for (const source of sources) {fs.mkdirSync(path.dirname(source.destination),{recursive:true});fs.writeFileSync(source.destination,source.data);}
  write('compiled/component-contract.v2.json',bundle.compiled);
  if (manual.componentDependencies?.length) {
    write('reports/dependencies.json',{ownership:'generated-read-only',dependencies:bundle.compiled.componentDependencies.map(({contract,...d})=>({...d,linked:Boolean(contract)}))});
    for (const d of bundle.compiled.componentDependencies) if(d.contract) write(`compiled/dependencies/${d.componentId}/component-contract.v2.json`,d.contract);
  }
  write('evidence/contract.generated.json',generated);
  write('reports/generated-facts.json',{componentId:manual.component.componentId,rawSource:raw[0].path,rawSha256:raw[0].sha256,converter:'scripts/convert_figma_catalogs_to_contracts.js',converterSha256:sha(fs.readFileSync(path.join(__dirname,'convert_figma_catalogs_to_contracts.js'))),...factsCoverage,productionSourcesModified:false});
  write('reports/coverage.json',bundle.coverage);
  write('reports/validation-report.json',bundle.validation);
  const readiness=core.buildContractReadiness(core.compileManualSource(manual,imported.variantEvidence,dependencyContracts),manual);
  const acceptancePath = path.join(root, 'reports/acceptance.json');
  const acceptance = fs.existsSync(acceptancePath) ? JSON.parse(fs.readFileSync(acceptancePath)) : null;
  const accepted = matchingAcceptance(acceptance, bundle.compiled);
  write('reports/readiness.json',{...readiness,status:absent.length?'draft':readiness.status,generatedFactsCoverage:factsCoverage,
    liveAcceptance:accepted?acceptance.liveAcceptance:'pending',acceptanceReport:accepted?'reports/acceptance.json':null});
  write('reports/source-inventory.json',{schemaVersion:'apollo.component-contract.source-inventory.v1',componentId:manual.component.componentId,sourceBundleHash:sourceHash,inSyncWithManual:true,ownership:'generated-read-only',sources:sources.map(({data,destination,...s})=>s)});
  write('reports/rule-crosswalk.json',{componentId:manual.component.componentId,missingAthenaRuleIds:[],relocatedRules,...(retiredRules.length?{retiredRules}:{}),entries:manual.rules.map(r=>({ruleId:r.id,athenaRuleId:athenaRules.find(a=>a.ruleId===r.id)?.ruleId,sourceRefs:r.sourceRefs,hubEvidence:(r.sourceRefs||[]).filter(id=>id.startsWith('hub.')).map(id=>{
    const doc=manual.documentation.find(d=>d.id===id),source=sources.find(s=>`sources/${s.path}`===doc.path);
    const heading=source.data.toString().match(/^# (.+)$/m)?.[1];
    if (!heading) throw new Error(`Missing hub document heading: ${doc.path}`);
    return {kind:'section',path:doc.path,heading,relation:'supports',evidenceSha256:source.sha256};
  }),route:r.execution.route,status:r.status}))});
  write('reports/ownership.json',{normativeEditable:['contract.manual.json'],generatedReadOnly:['compiled/','evidence/','input/','history/','reports/','sources/','projections/','runtime/','editor/*.zip'],published:false});
  write('projections/ds-ai-hub/component.json',{componentId:manual.component.componentId,semantics:manual.semantics,semanticApi:manual.semanticApi,representations:manual.representations,decisions:manual.decisions,generation:manual.generation});
  write('projections/athena/manual-overlay.json',{componentId:manual.component.componentId,targets:manual.targets,rules:manual.rules,examples:manual.examples});
  write('runtime/component-contract.index.json',{componentId:manual.component.componentId,contractId:manual.component.contractId,compiledPath:'../compiled/component-contract.v2.json',manualSourceHash:bundle.compiled.package.manualSourceHash,compiledHash:sha(JSON.stringify(bundle.compiled)),representationKeys:manual.representations.filter(r=>r.kind==='figma').map(r=>r.locator.componentKey),published:false,status:accepted&&!absent.length?readiness.status:'draft'});
  write(`editor/${manual.component.family}.editor-input.zip`,core.createZip(inputFiles.map(f=>core.textZipEntry(f.name,JSON.parse(f.text)))));
  if (!fs.readFileSync(manualFile).equals(bytes)) throw new Error('Manual unexpectedly changed.');
  return {root,sourceHash,manualHash:core.stableHash(manual),factsCoverage,coverage:bundle.coverage,issues:bundle.validation.issues};
}
module.exports={build,matchingAcceptance};
if (require.main===module) {
  const destination=process.argv[2];if (!destination) throw new Error('Usage: node scripts/build_component_contract_reference.js experiments/... [--refresh-sources]');
  console.log(JSON.stringify(build(destination,!process.argv.includes('--refresh-sources'),process.argv.includes('--add-sources')),null,2));
}
