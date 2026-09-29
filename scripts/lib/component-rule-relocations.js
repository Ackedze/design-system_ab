// Build-time ownership accounting only. Never compiles or executes pattern rules.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');

function collectRuleRelocations({repoRoot, componentId, manualRules, manifest, readFile = p => fs.readFileSync(p, 'utf8')}) {
  const unique = (rules, label) => {
    const seen = new Set();
    for (const r of rules) {
      if (!r.id || seen.has(r.id)) throw Error(`Duplicate or missing rule ID in ${label}: ${r.id}`);
      seen.add(r.id);
    }
    return seen;
  };
  const localIds = unique(manualRules, 'component manual');
  if (!manifest) return [];
  if (manifest.schemaVersion !== 'apollo.rule-ownership-transfer.v1' || manifest.fromComponentId !== componentId) throw Error('Invalid rule relocation manifest');
  const seen = new Set(), sources = new Map();
  return manifest.transfers.map(transfer => {
    const {ruleId, destination, ownership} = transfer;
    if (!ruleId || seen.has(ruleId) || localIds.has(ruleId)) throw Error(`Rule has multiple owners: ${ruleId}`);
    seen.add(ruleId);
    if (!destination || path.isAbsolute(destination) || !ownership?.ownerId || !['pattern','product-policy','editorial-policy'].includes(ownership.kind)) throw Error(`Invalid external owner: ${ruleId}`);
    const absolute = path.resolve(repoRoot, destination), relative = path.relative(repoRoot, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw Error(`Relocation outside repository: ${destination}`);
    if (!sources.has(destination)) {
      const bytes = readFile(absolute), source = JSON.parse(bytes);
      if (source.schemaVersion !== 'apollo.pattern-rule-handoff.v1' || source.patternId !== manifest.toPatternId || source.componentBinding?.componentId !== componentId || source.runtime?.status !== 'not-connected') throw Error(`Invalid pattern handoff: ${destination}`);
      unique(source.rules, destination);
      for (const r of source.rules) if (localIds.has(r.id)) throw Error(`Rule has multiple owners: ${r.id}`);
      sources.set(destination, {source, sourceSha: crypto.createHash('sha256').update(bytes).digest('hex')});
    }
    const {source, sourceSha} = sources.get(destination), rule = source.rules.find(r => r.id === ruleId);
    if (!rule) throw Error(`Relocated rule is missing: ${ruleId}`);
    if (rule.ownership?.kind !== ownership.kind || rule.ownership?.ownerId !== ownership.ownerId) throw Error(`Relocated ownership mismatch: ${ruleId}`);
    return {ruleId, ownership, destination, sourceSha, patternId:source.patternId, runtimeStatus:source.runtime.status, route:rule.execution?.route || 'auto', status:rule.status, scopeStatus:rule.applicability?.scopeStatus || 'confirmed', sourceRefs:rule.sourceRefs || []};
  });
}

function missingSourceRuleIds(sourceIds, manualRules, relocations) {
  const accounted = new Set([...manualRules.map(r => r.id), ...relocations.map(r => r.ruleId)]);
  return sourceIds.filter(id => !accounted.has(id));
}
module.exports = {collectRuleRelocations, missingSourceRuleIds};
