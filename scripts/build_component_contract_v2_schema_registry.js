#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPERIMENT_ROOT = path.join(REPO_ROOT, 'JSONS/experiments/component-contract-v2');
const MATRIX_PATH = path.join(EXPERIMENT_ROOT, 'capability-matrix.json');
const SCHEMA_DIR = path.join(EXPERIMENT_ROOT, 'schemas');
const REGISTRY_PATH = path.join(SCHEMA_DIR, 'capability-registry.v1.json');
const SCHEMA_PATH = path.join(SCHEMA_DIR, 'apollo-component-contract-v2.schema.json');

function main() {
  const matrix = readJson(MATRIX_PATH);
  const contracts = findFiles(EXPERIMENT_ROOT, 'component-contract.v2.json').map(readJson);
  const registry = buildRegistry(matrix, contracts);
  const schema = buildSchema(registry);
  validateContracts(contracts, registry);
  writeJson(REGISTRY_PATH, registry);
  writeJson(SCHEMA_PATH, schema);
  console.log(JSON.stringify({
    registry: path.relative(REPO_ROOT, REGISTRY_PATH),
    schema: path.relative(REPO_ROOT, SCHEMA_PATH),
    contracts: contracts.length,
    executableOperators: registry.operators.filter((entry) => entry.status === 'experimental-executable').length,
    candidateOperators: registry.operators.filter((entry) => entry.status === 'candidate').length,
    conditionOperators: registry.conditionOperators.length,
  }, null, 2));
}

function validateContracts(contracts, registry) {
  const executable = Object.fromEntries(['selectors', 'facts', 'operators', 'remediations'].map((dimension) => [
    dimension,
    new Set(registry[dimension]
      .filter((entry) => entry.status === 'experimental-executable')
      .map((entry) => entry.id)),
  ]));
  const conditionOperators = new Set(registry.conditionOperators.map((entry) => entry.id));
  for (const contract of contracts) {
    const ids = new Set();
    for (const dimension of ['selectors', 'facts', 'operators', 'remediations']) {
      for (const id of contract.capabilities[dimension] || []) {
        if (!executable[dimension].has(id)) {
          throw new Error(`${contract.package.id}: undeclared executable ${dimension} capability ${id}`);
        }
      }
    }
    for (const rule of contract.rules || []) {
      if (ids.has(rule.id)) throw new Error(`${contract.package.id}: duplicate rule id ${rule.id}`);
      ids.add(rule.id);
      for (const op of operatorIds(rule.assert)) {
        if (!executable.operators.has(op)) {
          throw new Error(`${rule.id}: assertion uses candidate or unknown operator ${op}`);
        }
        if (!(rule.capabilities.operators || []).includes(op)) {
          throw new Error(`${rule.id}: assertion operator ${op} is missing from rule capabilities`);
        }
      }
      for (const op of operatorIds(rule.when)) {
        if (!conditionOperators.has(op)) throw new Error(`${rule.id}: unknown condition operator ${op}`);
      }
      for (const dimension of ['selectors', 'facts', 'operators', 'remediations']) {
        for (const id of (rule.capabilities && rule.capabilities[dimension]) || []) {
          if (!executable[dimension].has(id)) {
            throw new Error(`${rule.id}: rule declares candidate or unknown ${dimension} capability ${id}`);
          }
        }
      }
    }
  }
}

function operatorIds(value) {
  const result = [];
  if (Array.isArray(value)) {
    value.forEach((item) => result.push(...operatorIds(item)));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  if (typeof value.op === 'string') result.push(value.op);
  Object.values(value).forEach((nested) => result.push(...operatorIds(nested)));
  return result;
}

function buildRegistry(matrix, contracts) {
  const conditionObservations = new Map();
  const assertionObservations = new Map();
  for (const contract of contracts) {
    for (const rule of contract.rules || []) {
      collectOperatorNodes(rule.when, conditionObservations, rule.id);
      collectOperatorNodes(rule.assert, assertionObservations, rule.id);
    }
  }
  return {
    schemaVersion: 'apollo.capability-registry.v1-experimental',
    status: 'experimental',
    versions: {
      selector: 2,
      factModel: 1,
      ruleIr: 2,
      remediation: 1,
    },
    policies: {
      unknownCapability: 'unsupported-fail-closed',
      missingEvidence: 'unknown-never-violation',
      candidateCapability: 'not-valid-in-executable-contract',
      proseInference: 'forbidden',
    },
    selectors: buildEntries(matrix, 'selectors', {
      input: 'selector declaration plus immutable audit snapshot',
      output: 'ordered node set or unknown',
    }),
    facts: buildEntries(matrix, 'facts', {
      input: 'immutable audit snapshot plus selected node identity',
      output: 'typed value or unknown',
    }),
    operators: buildEntries(matrix, 'operators', {
      input: 'declared evidence facts plus typed assertion parameters',
      output: 'pass, fail or unknown',
    }).map((entry) => Object.assign(entry, {
      observedShapes: observations(assertionObservations.get(entry.id)),
    })),
    conditionOperators: Array.from(conditionObservations.entries())
      .map(([id, value]) => ({
        id,
        status: 'observed-unratified',
        contract: {
          input: 'rule evidence and condition parameters',
          output: 'true, false or unknown',
        },
        observedShapes: observations(value),
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    remediations: buildEntries(matrix, 'remediations', {
      input: 'finding evidence, target fingerprint and stale guard',
      output: 'applied, rejected or failed',
    }),
  };
}

function buildEntries(matrix, dimension, contract) {
  const required = new Map();
  const candidates = new Map();
  for (const item of matrix.packages || []) {
    for (const id of (item.required && item.required[dimension]) || []) {
      const packages = required.get(id) || new Set();
      packages.add(item.packageId);
      required.set(id, packages);
    }
    for (const id of (item.candidates && item.candidates[dimension]) || []) {
      const packages = candidates.get(id) || new Set();
      packages.add(item.packageId);
      candidates.set(id, packages);
    }
  }
  return Array.from(new Set(Array.from(required.keys()).concat(Array.from(candidates.keys()))))
    .sort()
    .map((id) => ({
      id,
      status: required.has(id) ? 'experimental-executable' : 'candidate',
      specificationStatus: required.has(id) ? 'observed-shape' : 'unresolved',
      requiredBy: Array.from(required.get(id) || []).sort(),
      candidateFor: Array.from(candidates.get(id) || []).sort(),
      contract,
    }));
}

function collectOperatorNodes(value, target, ruleId) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectOperatorNodes(item, target, ruleId));
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (typeof value.op === 'string') {
    const entry = target.get(value.op) || new Map();
    const parameterKeys = Object.keys(value).filter((key) => key !== 'op').sort();
    const signature = parameterKeys.join('+') || '(none)';
    const shape = entry.get(signature) || { parameterKeys, ruleIds: new Set() };
    shape.ruleIds.add(ruleId);
    entry.set(signature, shape);
    target.set(value.op, entry);
  }
  Object.values(value).forEach((nested) => collectOperatorNodes(nested, target, ruleId));
}

function observations(entries) {
  if (!entries) return [];
  return Array.from(entries.values())
    .map((entry) => ({
      parameterKeys: entry.parameterKeys,
      ruleCount: entry.ruleIds.size,
      exampleRuleIds: Array.from(entry.ruleIds).sort().slice(0, 8),
    }))
    .sort((left, right) => right.ruleCount - left.ruleCount
      || left.parameterKeys.join('+').localeCompare(right.parameterKeys.join('+')));
}

function buildSchema(registry) {
  const executable = (dimension) => registry[dimension]
    .filter((entry) => entry.status === 'experimental-executable')
    .map((entry) => entry.id);
  const conditionOperators = registry.conditionOperators.map((entry) => entry.id);
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://ackedze.github.io/design-system_ab/JSONS/experiments/component-contract-v2/schemas/apollo-component-contract-v2.schema.json',
    title: 'Apollo experimental component contract v2',
    type: 'object',
    additionalProperties: false,
    required: ['schemaVersion', 'documentType', 'status', 'runtimePolicy', 'package', 'capabilities', 'facts', 'rules', 'nonExecutableRules', 'coverage'],
    properties: {
      schemaVersion: { const: 'apollo.component-contract.v2-experimental' },
      documentType: { const: 'component-contract' },
      status: { enum: ['experimental', 'active', 'deprecated'] },
      runtimePolicy: { $ref: '#/$defs/runtimePolicy' },
      package: { $ref: '#/$defs/package' },
      capabilities: { $ref: '#/$defs/capabilities' },
      facts: { type: 'object' },
      rules: { type: 'array', items: { $ref: '#/$defs/rule' } },
      nonExecutableRules: { type: 'array', items: { $ref: '#/$defs/nonExecutableRule' } },
      coverage: { $ref: '#/$defs/coverage' },
    },
    $defs: {
      stringArray: { type: 'array', uniqueItems: true, items: { type: 'string', minLength: 1 } },
      runtimePolicy: {
        type: 'object',
        additionalProperties: false,
        required: ['consumedByApollo', 'publishedToRuntimeIndexes', 'purpose'],
        properties: {
          consumedByApollo: { type: 'boolean' },
          publishedToRuntimeIndexes: { type: 'boolean' },
          purpose: { type: 'string', minLength: 1 },
        },
      },
      package: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'family', 'library', 'sourcePath', 'sourceGeneratedAt', 'sourceExportVersion', 'sourceFiles'],
        properties: {
          id: { type: 'string', minLength: 1 },
          family: { type: 'string', minLength: 1 },
          library: { type: 'string', minLength: 1 },
          sourcePath: { type: 'string', minLength: 1 },
          sourceGeneratedAt: { type: ['string', 'null'] },
          sourceExportVersion: { type: ['string', 'number', 'null'] },
          sourceFiles: { type: 'array', items: { type: 'object' } },
        },
      },
      capabilities: {
        type: 'object',
        additionalProperties: false,
        required: ['selectorVersion', 'factModelVersion', 'ruleIrVersion', 'selectors', 'facts', 'operators', 'remediations', 'unknownCapabilityPolicy', 'missingEvidencePolicy'],
        properties: {
          selectorVersion: { const: 2 },
          factModelVersion: { const: 1 },
          ruleIrVersion: { const: 2 },
          selectors: { type: 'array', uniqueItems: true, items: { enum: executable('selectors') } },
          facts: { type: 'array', uniqueItems: true, items: { enum: executable('facts') } },
          operators: { type: 'array', uniqueItems: true, items: { enum: executable('operators') } },
          remediations: { type: 'array', uniqueItems: true, items: { enum: executable('remediations') } },
          unknownCapabilityPolicy: { const: 'unsupported-fail-closed' },
          missingEvidencePolicy: { const: 'unknown-never-violation' },
        },
      },
      rule: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'source', 'severity', 'enforcement', 'select', 'when', 'assert', 'verdict', 'evidence', 'remediation', 'presentation', 'capabilities'],
        properties: {
          id: { type: 'string', minLength: 1 },
          source: { type: 'object' },
          severity: { enum: ['info', 'warning', 'error'] },
          enforcement: { enum: ['enforced', 'classification'] },
          select: { type: 'object' },
          when: { $ref: '#/$defs/condition' },
          assert: { $ref: '#/$defs/assertion' },
          verdict: { type: 'object' },
          evidence: { $ref: '#/$defs/stringArray' },
          remediation: { type: ['object', 'null'] },
          presentation: { type: 'object' },
          capabilities: { $ref: '#/$defs/ruleCapabilities' },
        },
      },
      assertion: {
        type: 'object',
        required: ['op'],
        properties: { op: { enum: executable('operators') } },
      },
      condition: {
        type: 'object',
        required: ['op'],
        properties: { op: { enum: conditionOperators } },
      },
      ruleCapabilities: {
        type: 'object',
        additionalProperties: false,
        required: ['selectors', 'facts', 'operators', 'remediations'],
        properties: {
          selectors: { type: 'array', uniqueItems: true, items: { enum: executable('selectors') } },
          facts: { type: 'array', uniqueItems: true, items: { enum: executable('facts') } },
          operators: { type: 'array', uniqueItems: true, items: { enum: executable('operators') } },
          remediations: { type: 'array', uniqueItems: true, items: { enum: executable('remediations') } },
        },
      },
      nonExecutableRule: {
        type: 'object',
        required: ['sourceRuleId', 'status', 'reason'],
        properties: {
          sourceRuleId: { type: 'string', minLength: 1 },
          sourceCheckType: { type: 'string' },
          status: { enum: ['unsupported', 'manual', 'advisory', 'llm'] },
          reason: { type: 'string', minLength: 1 },
          candidateCapabilities: { type: 'object' },
          source: { type: 'string' },
        },
      },
      coverage: {
        type: 'object',
        required: ['summary', 'report'],
        properties: {
          summary: { type: 'object' },
          report: { type: 'string', minLength: 1 },
        },
      },
    },
  };
}

function findFiles(root, fileName) {
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...findFiles(fullPath, fileName));
    else if (entry.name === fileName) result.push(fullPath);
  }
  return result.sort();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

main();
