const fs = require('node:fs');
const crypto = require('node:crypto');

// Delivery coverage check; does not replace replaying the pinned Core.
function checkAreaReport(report) {
  if (!report || !Array.isArray(report.selection?.components) || !Array.isArray(report.components)
    || !Array.isArray(report.governedComponents) || !Array.isArray(report.notChecked)) throw Error('FULL_AREA_REPORT_REQUIRED');
  const issues = [], discovered = new Set(report.selection.components.map(n => n.nodeId)), seen = new Set();
  if (report.selection.complete !== true || discovered.size !== report.selection.components.length) issues.push('SCAN_INCOMPLETE_OR_DUPLICATE');
  const account = id => {
    if (!discovered.has(id) || seen.has(id)) issues.push('INVALID_OR_DUPLICATE_ACCOUNT:' + id);
    seen.add(id);
  };
  const ownerMatches = (scopeId, contractId, pin) => typeof pin === 'string' && pin.length > 0
    && report.components.some(c => c.scopeId === scopeId && c.release?.contractId === contractId && c.release.manualSourceHash === pin);
  let unknown = 0, violations = 0, externalPayloads = 0;
  for (const c of report.components) {
    account(c.scopeId);
    const coverage = c.result?.coverage, evaluations = c.result?.engine?.evaluations;
    if (!coverage || coverage.executionComplete !== true || coverage.uncertain !== 0
      || coverage.captureIncomplete !== false) issues.push('AUDIT_INCOMPLETE:' + c.scopeId);
    if (!Array.isArray(evaluations)) { issues.push('EVALUATIONS_MISSING:' + c.scopeId); continue; }
    const uncertain = evaluations.filter(e => e.classification === 'human-review').length;
    unknown += uncertain;
    violations += evaluations.filter(e => e.classification === 'violation').length;
    if (uncertain) issues.push('UNKNOWN:' + c.scopeId);
    if (c.ownerContext && !report.components.some(p => p.scopeId === c.ownerContext.scopeId)) issues.push('OWNER_MISSING:' + c.scopeId);
  }
  for (const n of report.governedComponents) {
    account(n.nodeId);
    if (!n.ownerContractId || !n.manualSourceHash || !n.targetId || !n.snapshotNodeId
      || !ownerMatches(n.byScopeId, n.ownerContractId, n.manualSourceHash)) issues.push('OWNERSHIP_UNPROVEN:' + n.nodeId);
  }
  for (const n of report.notChecked) {
    account(n.nodeId);
    if (n.reason === 'permitted-external-content' && n.validationScope === 'boundary-only'
      && n.payloadValidation === 'unverified' && n.parentContractId && n.manualSourceHash && n.targetId && n.property
      && ownerMatches(n.byScopeId, n.parentContractId, n.manualSourceHash)) externalPayloads++;
    else issues.push('NOT_CHECKED:' + n.nodeId + ':' + n.reason);
  }
  for (const id of discovered) if (!seen.has(id)) issues.push('UNACCOUNTED:' + id);
  return {status: issues.length ? 'FAIL' : 'PASS_CHECKED_COMPONENT_SCOPE', discovered: discovered.size,
    audits: report.components.length, governed: report.governedComponents.length, externalPayloads,
    unknown, violations, issues, payloadInternalsVerified: externalPayloads === 0};
}

if (require.main === module) {
  const bytes = fs.readFileSync(process.argv[2]), result = checkAreaReport(JSON.parse(bytes));
  console.log(JSON.stringify({inputSha256: crypto.createHash('sha256').update(bytes).digest('hex'), ...result}, null, 2));
  if (result.status === 'FAIL') process.exitCode = 1;
}
module.exports = {checkAreaReport};
