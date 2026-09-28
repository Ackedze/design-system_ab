#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const componentsRoot = path.join(repositoryRoot, 'JSONS', 'web', 'components');

function fail(message) {
  throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listFiles(directory, fileName, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) listFiles(absolutePath, fileName, result);
    if (entry.isFile() && entry.name === fileName) result.push(absolutePath);
  }
  return result;
}

function normalizeSegment(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[🔩🔄🔒💊🚧]/gu, '')
    .replace(/\[\s*[dm]\s*\]/giu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('ru-RU');
}

function pathSegments(value) {
  return String(value || '')
    .split('/')
    .map(normalizeSegment)
    .filter(Boolean);
}

function suffixMatches(candidatePath, requestedPath) {
  const candidate = pathSegments(candidatePath);
  const requested = pathSegments(requestedPath);
  if (!requested.length || candidate.length < requested.length) return false;
  return requested.every((segment, index) =>
    candidate[candidate.length - requested.length + index] === segment
  );
}

function contractNodes(contract) {
  const nodes = Array.isArray(contract?.figma?.structureSignature)
    ? contract.figma.structureSignature
    : [];
  if (nodes.length) return nodes;
  return Array.isArray(contract?.figma?.anatomy) ? contract.figma.anatomy : [];
}

function validateSelector(filePath, contract, target, selector) {
  if (selector?.strategy !== 'path-suffix') {
    fail(`${filePath}: ${target.id} uses an unsupported selector strategy.`);
  }
  if (!Array.isArray(selector.nodeTypes) || !selector.nodeTypes.length) {
    fail(`${filePath}: ${target.id} must declare selector.nodeTypes.`);
  }
  if (!Number.isInteger(selector.occurrence) || selector.occurrence < 0) {
    fail(`${filePath}: ${target.id} has an invalid selector occurrence.`);
  }
  const matches = contractNodes(contract).filter((node) =>
    selector.nodeTypes.includes(node.type) && suffixMatches(node.path, selector.path)
  );
  if (matches.length <= selector.occurrence) {
    fail(
      `${filePath}: ${target.id} selector ${selector.path} occurrence ` +
      `${selector.occurrence} resolves to ${matches.length} contract nodes.`,
    );
  }
  if (target.kind === 'instance-property') {
    const selected = matches[selector.occurrence];
    const properties = selected.variantProperties || selected.componentInstance?.variantProperties || {};
    if (!Object.prototype.hasOwnProperty.call(properties, target.property)) {
      fail(
        `${filePath}: ${target.id} property ${target.property} is absent on ` +
        `${selected.path}.`,
      );
    }
  }
}

function validateAvailability(filePath, contract, target) {
  const conditions = Array.isArray(target.availableWhen) ? target.availableWhen : [];
  if (target.onUnavailable && !conditions.length) {
    fail(`${filePath}: ${target.id} declares onUnavailable without availableWhen.`);
  }
  for (const condition of conditions) {
    const domain = contract?.figma?.variants?.properties?.[condition?.property];
    if (!Array.isArray(domain)) {
      fail(`${filePath}: ${target.id} availability property ${condition?.property} is not public.`);
    }
    if (!Array.isArray(condition.values) || !condition.values.length) {
      fail(`${filePath}: ${target.id} availability condition has no values.`);
    }
    for (const value of condition.values) {
      if (!domain.includes(String(value))) {
        fail(`${filePath}: ${target.id} availability maps to unsupported value ${String(value)}.`);
      }
    }
  }
}

function validateEditContext(filePath, contract, profile, target) {
  for (const context of Array.isArray(target.editContext) ? target.editContext : []) {
    const dependency = (profile.targets || []).find((candidate) => candidate.id === context?.target);
    if (!dependency || dependency.supported !== true || dependency.kind !== 'instance-property') {
      fail(`${filePath}: ${target.id} editContext target ${context?.target} is not a supported instance-property.`);
    }
    const mappedValue = dependency.values?.[String(context.value)];
    if (mappedValue === undefined) {
      fail(`${filePath}: ${target.id} editContext value ${String(context.value)} is not mapped by ${dependency.id}.`);
    }
  }
}

function validateTarget(filePath, contract, profile, target) {
  if (!target || typeof target.id !== 'string' || typeof target.kind !== 'string') {
    fail(`${filePath}: target identity is invalid.`);
  }
  if (target.supported === false) {
    if (target.kind !== 'unsupported' || typeof target.reason !== 'string') {
      fail(`${filePath}: unsupported target ${target.id} must explain its reason.`);
    }
    return;
  }
  if (target.supported !== true || target.kind === 'unsupported') {
    fail(`${filePath}: supported state is inconsistent for ${target.id}.`);
  }
  validateAvailability(filePath, contract, target);
  validateEditContext(filePath, contract, profile, target);
  if (target.kind === 'variant-property') {
    const domain = contract?.figma?.variants?.properties?.[target.property];
    if (!Array.isArray(domain)) {
      fail(`${filePath}: ${target.id} property ${target.property} is not public.`);
    }
    for (const value of Object.values(target.values || {})) {
      if (!domain.includes(String(value))) {
        fail(`${filePath}: ${target.id} maps to unsupported value ${String(value)}.`);
      }
    }
    return;
  }
  if (!Array.isArray(target.selectors) || !target.selectors.length) {
    fail(`${filePath}: ${target.id} has no selectors.`);
  }
  for (const selector of target.selectors) {
    validateSelector(filePath, contract, target, selector);
  }
}

function validateMap(filePath) {
  const document = readJson(filePath);
  if (
    document.schemaVersion !== 1 ||
    document.documentType !== 'generation-semantic-target-map' ||
    document.sourceContract !== 'contract.generated.json' ||
    typeof document.componentId !== 'string' ||
    !Array.isArray(document.profiles) ||
    !document.profiles.length
  ) {
    fail(`${filePath}: invalid semantic target map envelope.`);
  }
  const contractPath = path.join(path.dirname(filePath), document.sourceContract);
  const source = readJson(contractPath);
  for (const profile of document.profiles) {
    const contract = source.contracts?.find((item) => item.id === profile.contractId);
    if (!contract) fail(`${filePath}: contract ${profile.contractId} is missing.`);
    if (contract.name !== profile.publicRoot || contract.platform !== profile.platform) {
      fail(`${filePath}: profile ${profile.id} does not match its public contract root.`);
    }
    if (
      profile.verification?.source !== 'contract.generated.json' ||
      typeof profile.verification?.liveInstanceVerified !== 'boolean'
    ) {
      fail(`${filePath}: profile ${profile.id} has invalid verification metadata.`);
    }
    const ids = new Set();
    for (const target of profile.targets || []) {
      if (ids.has(target.id)) fail(`${filePath}: duplicate target ${target.id}.`);
      ids.add(target.id);
      validateTarget(filePath, contract, profile, target);
    }
  }
  return document.profiles.reduce((count, profile) => count + profile.targets.length, 0);
}

const maps = listFiles(componentsRoot, 'semantic-targets.json').sort();
if (!maps.length) fail('No generation semantic target maps found.');
let targetCount = 0;
for (const filePath of maps) targetCount += validateMap(filePath);

console.log(
  `Generation semantic target maps validated: ${maps.length} maps, ${targetCount} targets.`,
);
