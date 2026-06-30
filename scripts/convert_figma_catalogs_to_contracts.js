#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_INPUT_DIRS = [
  'JSONS/web/components/web-core/core',
  'JSONS/web/components/web-corp',
];
const DEFAULT_OUTPUT_ROOT = 'CONTRACTS/web/components';
const GENERATED_AT = process.env.APOLLO_CONTRACTS_GENERATED_AT || new Date().toISOString();
const VALID_PLATFORMS = new Set(['desktop', 'mobile-web', 'universal']);
const IMPORTANT_NODE_NAMES = new Set([
  'Content',
  'ContentWrapper',
  'Graphic',
  'GraphicContainer',
  'Title',
  'Subtitle',
  'Bottom',
  'BackgroundPlate',
  'Stopper',
  'Isle',
  'Body',
]);
const ANATOMY_TYPES = new Set([
  'COMPONENT',
  'INSTANCE',
  'SLOT',
  'FRAME',
  'TEXT',
  'BOOLEAN_OPERATION',
  'RECTANGLE',
  'VECTOR',
]);
const PLACEHOLDER_NAMES = [
  'SwapMe',
  'DetachMe',
  'Placeholder',
  '_Placeholder',
  'Custom',
  'Fixer',
  'PaintMe',
];
const TEXT_PLACEHOLDER_PATTERN = /^(Label|Title 22-26|Subtitle 16-24|Custom)$/;

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  const options = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const inputDirs = options.inputDirs.length ? options.inputDirs : DEFAULT_INPUT_DIRS;
  const outputRoot = path.resolve(repoRoot, options.outputRoot || DEFAULT_OUTPUT_ROOT);
  const compiledRoot = path.join(outputRoot, 'compiled');

  const inputFiles = inputDirs
    .map((inputDir) => path.resolve(repoRoot, inputDir))
    .flatMap((inputDir) => collectJsonFiles(inputDir))
    .sort((left, right) => left.localeCompare(right));

  if (!inputFiles.length) {
    throw new Error('No JSON catalog files found.');
  }

  fs.rmSync(compiledRoot, { recursive: true, force: true });
  fs.mkdirSync(compiledRoot, { recursive: true });

  const manifestEntries = [];
  const summary = createSummary();
  const usedCompiledFiles = new Set();

  for (const filePath of inputFiles) {
    const rawSize = fs.statSync(filePath).size;
    const catalog = readCatalog(filePath);
    const groupId = getInputGroupId(filePath, inputDirs, repoRoot);
    const compiledDir = path.join(compiledRoot, groupId);
    fs.mkdirSync(compiledDir, { recursive: true });

    const converted = convertCatalog(catalog, filePath);
    const compiledFileName = createCompiledFileName(filePath, usedCompiledFiles);
    const compiledFilePath = path.join(compiledDir, compiledFileName);
    writeJson(compiledFilePath, converted.file);

    const outputSize = fs.statSync(compiledFilePath).size;
    updateSummary(summary, converted.file, converted.warningCount, rawSize, outputSize);

    manifestEntries.push(
      buildManifestEntry({
        catalog,
        filePath,
        compiledFilePath,
        outputRoot,
        groupId,
        compiledFileName,
        contractsFile: converted.file,
      }),
    );
  }

  const manifest = {
    schemaVersion: 'apollo.catalog-manifest.v1',
    generatedAt: GENERATED_AT,
    catalogs: manifestEntries.sort((left, right) => left.id.localeCompare(right.id)),
  };

  writeJson(path.join(outputRoot, 'manifest.json'), manifest);

  const summaryWithRatio = Object.assign({}, summary, {
    inputDirectories: inputDirs,
    outputRoot: path.relative(repoRoot, outputRoot),
    compressionRatio:
      summary.inputBytes > 0
        ? Number((summary.outputBytes / summary.inputBytes).toFixed(4))
        : 0,
  });
  writeJson(path.join(outputRoot, 'conversion-summary.json'), summaryWithRatio);
  printSummary(summaryWithRatio);
}

function parseArgs(args) {
  const inputDirs = [];
  let outputRoot = '';

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--out') {
      outputRoot = args[index + 1] || '';
      index += 1;
      continue;
    }
    inputDirs.push(arg);
  }

  return { inputDirs, outputRoot };
}

function collectJsonFiles(inputDir) {
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }

  const entries = fs.readdirSync(inputDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(inputDir, entry.name);
    if (entry.isDirectory()) {
      files.push.apply(files, collectJsonFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(entryPath);
    }
  }

  return files;
}

function readCatalog(filePath) {
  const catalog = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  validateCatalog(catalog, filePath);
  return catalog;
}

function validateCatalog(catalog, filePath) {
  if (!catalog || typeof catalog !== 'object') {
    throw new Error(`${filePath}: catalog must be an object`);
  }
  if (catalog.kind !== 'catalog') {
    throw new Error(`${filePath}: kind must be "catalog"`);
  }
  if (!catalog.source || typeof catalog.source.library !== 'string') {
    throw new Error(`${filePath}: source.library is required`);
  }
  if (!Array.isArray(catalog.components)) {
    throw new Error(`${filePath}: components must be an array`);
  }

  const componentKeys = new Set();
  for (const component of catalog.components) {
    if (!component || typeof component !== 'object') {
      throw new Error(`${filePath}: component must be an object`);
    }
    if (!component.key) {
      throw new Error(`${filePath}: component.key is required`);
    }
    if (!component.name) {
      throw new Error(`${filePath}: component.name is required`);
    }
    if (componentKeys.has(component.key)) {
      throw new Error(`${filePath}: duplicate component key ${component.key}`);
    }
    componentKeys.add(component.key);
  }
}

function convertCatalog(catalog, filePath) {
  const usedIds = new Map();
  const contracts = catalog.components.map((component) =>
    convertComponent(component, catalog, usedIds),
  );
  const statuses = countStatuses(contracts);
  const warningCount = contracts.reduce(
    (total, contract) => total + contract.meta.warnings.length,
    0,
  );

  if (!contracts.length) {
    throw new Error(`${filePath}: empty contracts output`);
  }

  return {
    warningCount,
    file: {
      schemaVersion: 'apollo.ds-contracts.v1',
      source: {
        library: catalog.source.library,
        file: catalog.source.file,
        generatedAt: catalog.source.generatedAt,
        exportVersion: catalog.source.exportVersion,
      },
      stats: {
        componentCount: catalog.components.length,
        contractCount: contracts.length,
        activeCount: statuses.active || 0,
        deprecatedCount: statuses.deprecated || 0,
        scheduledCount: statuses.scheduled || 0,
      },
      contracts,
    },
  };
}

function convertComponent(component, catalog, usedIds) {
  const warnings = [];
  const platform = normalizePlatform(component.platform, warnings);
  const normalizedName = normalizeComponentName(component.name);
  const baseId = `${normalizedName}.${platform || 'unknown'}`;
  const id = ensureUniqueId(baseId, component.key, usedIds, warnings);
  const parsedVariants = parseVariants(component.variants || [], warnings);
  const tokens = extractTokens(component.structure || []);
  const structureSignature = buildStructureSignature(component.structure || []);
  const variantStructureRules = buildVariantStructureRules(component, warnings);
  const anatomy = buildAnatomy(component.structure || [], warnings);
  const qualityRules = buildQualityRules(component, warnings);

  addComponentWarnings(component, warnings);

  return {
    id,
    name: component.name,
    normalizedName,
    componentKey: component.key,
    source: {
      library: catalog.source.library,
      file: catalog.source.file,
      generatedAt: catalog.source.generatedAt,
      exportVersion: catalog.source.exportVersion,
    },
    status: component.status || 'unknown',
    role: component.role || '',
    platform: platform || component.platform || '',
    figma: {
      defaultVariantKey: component.defaultVariant || undefined,
      variants: parsedVariants,
      anatomy,
      tokens,
      structureSignature,
      variantStructures: buildRuntimeVariantStructures(component.variantStructures || {}),
      variantStructureRules,
    },
    qualityRules,
    docs: {
      description: component.description || '',
      useWhen: [],
      doNotUseWhen: [],
      knownLimitations: [],
    },
    meta: {
      generated: true,
      needsOverlay: true,
      warnings: Array.from(new Set(warnings)).sort(),
    },
  };
}

function ensureUniqueId(baseId, componentKey, usedIds, warnings) {
  if (!usedIds.has(baseId)) {
    usedIds.set(baseId, componentKey);
    return baseId;
  }

  const suffix = shortHash(componentKey);
  const candidate = `${baseId}.${suffix}`;
  if (!usedIds.has(candidate)) {
    usedIds.set(candidate, componentKey);
    warnings.push(`generated id collision for ${baseId}; appended key suffix ${suffix}`);
    return candidate;
  }

  throw new Error(`Duplicate generated id after suffix resolution: ${candidate}`);
}

function normalizeComponentName(name) {
  const cleaned = String(name || '')
    .replace(/\[[DMT]\]/gi, ' ')
    .replace(/^[DMT]\]\s*/i, ' ')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[❌🔄✅⚠️🚧💊👽]/gu, ' ');
  return slugify(cleaned) || 'component';
}

function normalizePlatform(platform, warnings) {
  const raw = String(platform || '').trim();
  if (!raw) {
    warnings.push('unknown platform: empty');
    return '';
  }

  const normalized = raw.toLowerCase();
  if (VALID_PLATFORMS.has(normalized)) {
    return normalized;
  }

  warnings.push(`unknown platform: ${raw}`);
  return raw;
}

function parseVariants(variants, warnings) {
  const properties = {};
  const allowedCombinations = [];
  const variantKeys = [];

  for (const variant of variants) {
    const parsed = parseVariantName(variant.name || '', warnings);
    allowedCombinations.push(parsed);
    variantKeys.push({
      key: variant.key,
      id: variant.id,
      name: variant.name,
      properties: parsed,
    });

    for (const key of Object.keys(parsed)) {
      if (!properties[key]) {
        properties[key] = new Set();
      }
      properties[key].add(parsed[key]);
    }
  }

  const sortedProperties = {};
  for (const key of Object.keys(properties).sort()) {
    sortedProperties[key] = Array.from(properties[key]).sort();
  }

  return {
    properties: sortedProperties,
    allowedCombinations,
    variantKeys,
  };
}

function parseVariantName(name, warnings) {
  const result = {};
  const source = String(name || '').trim();
  if (!source) {
    return result;
  }

  const segments = source.split(',');
  for (const rawSegment of segments) {
    const segment = rawSegment.trim();
    if (!segment) {
      continue;
    }

    const separatorIndex = segment.indexOf('=');
    if (separatorIndex === -1) {
      warnings.push(`variant name cannot be fully parsed: ${source}`);
      result.raw = source;
      return result;
    }

    const key = segment.slice(0, separatorIndex).trim();
    const value = segment.slice(separatorIndex + 1).trim();
    if (!key || !value) {
      warnings.push(`variant name cannot be fully parsed: ${source}`);
      result.raw = source;
      return result;
    }

    result[key] = value;
  }

  return result;
}

function extractTokens(nodes) {
  const tokens = {
    padding: new Set(),
    spacing: new Set(),
    fills: new Set(),
    strokes: new Set(),
    typography: new Set(),
  };

  for (const node of nodes) {
    const paddingTokens = node.layout && node.layout.paddingTokens;
    if (paddingTokens && typeof paddingTokens === 'object') {
      for (const value of Object.values(paddingTokens)) {
        addToken(tokens.padding, value);
      }
    }
    addToken(tokens.spacing, node.layout && node.layout.itemSpacingToken);
    addToken(tokens.fills, node.fillToken);
    addToken(tokens.strokes, node.strokeToken);
    addToken(tokens.typography, node.typographyToken);

    for (const fill of Array.isArray(node.fills) ? node.fills : []) {
      addToken(tokens.fills, fill && fill.tokenKey);
    }
    for (const stroke of Array.isArray(node.strokes) ? node.strokes : []) {
      addToken(tokens.strokes, stroke && stroke.tokenKey);
    }
  }

  return {
    padding: sortedSet(tokens.padding),
    spacing: sortedSet(tokens.spacing),
    fills: sortedSet(tokens.fills),
    strokes: sortedSet(tokens.strokes),
    typography: sortedSet(tokens.typography),
  };
}

function addToken(target, value) {
  if (typeof value === 'string' && value.trim()) {
    target.add(value);
  }
}

function buildStructureSignature(nodes) {
  return nodes.map((node) => {
    const signature = {
      nodeId: node.id,
      parentId: node.parentId,
      type: node.type,
      name: node.name,
      path: node.path,
      visible: node.visible !== false,
    };
    const tokenRefs = collectNodeTokenRefs(node);
    if (tokenRefs.length) {
      signature.tokenRefs = tokenRefs;
    }
    if (node.componentInstance && node.componentInstance.variantProperties) {
      signature.variantProperties = node.componentInstance.variantProperties;
    }
    addRuntimeNodeFields(signature, node);
    return signature;
  });
}

function buildRuntimeVariantStructures(variantStructures) {
  const result = {};

  for (const [variantKey, operations] of Object.entries(variantStructures || {})) {
    const runtimeOperations = [];

    for (const operation of Array.isArray(operations) ? operations : []) {
      if (operation.op === 'remove' && typeof operation.id === 'number') {
        runtimeOperations.push({
          op: 'remove',
          id: operation.id,
        });
        continue;
      }

      if (
        operation.op !== 'update' ||
        typeof operation.id !== 'number' ||
        !operation.value ||
        typeof operation.value !== 'object'
      ) {
        continue;
      }

      const value = cloneRuntimeNodePatch(operation.value);
      if (!hasRuntimeComparisonFields(value)) {
        continue;
      }

      runtimeOperations.push({
        op: 'update',
        id: operation.id,
        value,
      });
    }

    if (runtimeOperations.length) {
      result[variantKey] = runtimeOperations;
    }
  }

  return result;
}

function cloneRuntimeCatalogNode(node) {
  const runtimeNode = {
    id: node.id,
    parentId: node.parentId,
    path: node.path,
    type: node.type,
    name: node.name,
    visible: node.visible !== false,
  };

  addRuntimeNodeFields(runtimeNode, node);
  return runtimeNode;
}

function cloneRuntimeNodePatch(node) {
  const patch = {};

  for (const key of ['id', 'parentId', 'path', 'type', 'name']) {
    if (Object.prototype.hasOwnProperty.call(node, key)) {
      patch[key] = node[key];
    }
  }
  if (Object.prototype.hasOwnProperty.call(node, 'visible')) {
    patch.visible = node.visible !== false;
  }

  addRuntimeNodeFields(patch, node);
  return patch;
}

function hasRuntimeComparisonFields(value) {
  return [
    'visible',
    'layout',
    'opacity',
    'radius',
    'fills',
    'fillToken',
    'strokes',
    'strokeToken',
    'typographyToken',
    'componentInstance',
    'text',
    'styles',
  ].some((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function addRuntimeNodeFields(target, node) {
  const layout = cloneRuntimeLayout(node.layout);
  if (layout) target.layout = layout;
  if (typeof node.opacity === 'number' && node.opacity !== 1) target.opacity = node.opacity;
  if (typeof node.radius === 'number' && node.radius !== 0) target.radius = node.radius;
  if (Array.isArray(node.fills)) target.fills = cloneRuntimePaints(node.fills);
  if (typeof node.fillToken === 'string') target.fillToken = node.fillToken;
  if (Array.isArray(node.strokes)) target.strokes = cloneRuntimePaints(node.strokes);
  if (typeof node.strokeToken === 'string') target.strokeToken = node.strokeToken;
  if (typeof node.typographyToken === 'string') target.typographyToken = node.typographyToken;
  if (node.componentInstance && node.componentInstance.variantProperties) {
    target.componentInstance = {
      variantProperties: Object.assign({}, node.componentInstance.variantProperties),
    };
  }
  const text = cloneRuntimeText(node.text);
  if (text) target.text = text;
  const styles = cloneRuntimeStyles(node.styles);
  if (styles) target.styles = styles;
}

function cloneRuntimeLayout(layout) {
  if (!layout || typeof layout !== 'object') {
    return null;
  }

  const result = {};
  if (layout.padding && typeof layout.padding === 'object') {
    const padding = {
      top: layout.padding.top,
      right: layout.padding.right,
      bottom: layout.padding.bottom,
      left: layout.padding.left,
    };
    const hasNonZeroPadding = Object.values(padding).some((value) => value !== 0);
    if (hasNonZeroPadding || layout.paddingTokens) {
      result.padding = padding;
    }
  }
  if (typeof layout.itemSpacing === 'number' && layout.itemSpacing !== 0) {
    result.itemSpacing = layout.itemSpacing;
  }
  if (typeof layout.itemSpacingToken === 'string') {
    result.itemSpacingToken = layout.itemSpacingToken;
  }
  if (layout.paddingTokens && typeof layout.paddingTokens === 'object') {
    result.paddingTokens = Object.assign({}, layout.paddingTokens);
  }

  return Object.keys(result).length ? result : null;
}

function cloneRuntimePaints(paints) {
  return paints.map((paint) => {
    if (!paint || typeof paint !== 'object') {
      return paint;
    }

    const result = {};
    for (const key of ['type', 'visible', 'opacity', 'tokenKey', 'colorHex']) {
      if (Object.prototype.hasOwnProperty.call(paint, key)) {
        result[key] = paint[key];
      }
    }
    return result;
  });
}

function cloneRuntimeText(text) {
  if (!text || typeof text !== 'object') {
    return null;
  }

  const result = {};
  for (const key of [
    'characters',
    'fontName',
    'fontSize',
    'lineHeight',
    'letterSpacing',
    'paragraphSpacing',
    'case',
  ]) {
    if (Object.prototype.hasOwnProperty.call(text, key)) {
      result[key] = text[key];
    }
  }

  return Object.keys(result).length ? result : null;
}

function cloneRuntimeStyles(styles) {
  if (!styles || typeof styles !== 'object') {
    return null;
  }

  const result = {};
  if (styles.text && typeof styles.text === 'object') {
    result.text = {};
    for (const key of ['styleKey', 'styleId']) {
      if (Object.prototype.hasOwnProperty.call(styles.text, key)) {
        result.text[key] = styles.text[key];
      }
    }
    if (!Object.keys(result.text).length) {
      delete result.text;
    }
  }

  return Object.keys(result).length ? result : null;
}

function collectNodeTokenRefs(node) {
  const refs = new Set();
  const paddingTokens = node.layout && node.layout.paddingTokens;
  if (paddingTokens && typeof paddingTokens === 'object') {
    for (const value of Object.values(paddingTokens)) {
      addToken(refs, value);
    }
  }
  addToken(refs, node.layout && node.layout.itemSpacingToken);
  addToken(refs, node.fillToken);
  addToken(refs, node.strokeToken);
  addToken(refs, node.typographyToken);

  for (const fill of Array.isArray(node.fills) ? node.fills : []) {
    addToken(refs, fill && fill.tokenKey);
  }
  for (const stroke of Array.isArray(node.strokes) ? node.strokes : []) {
    addToken(refs, stroke && stroke.tokenKey);
  }

  return sortedSet(refs);
}

function buildAnatomy(nodes, warnings) {
  const anatomy = [];

  for (const node of nodes) {
    if (!ANATOMY_TYPES.has(node.type)) {
      continue;
    }

    const basename = String(node.name || '').trim();
    const meaningful =
      node.parentId === null ||
      node.type === 'SLOT' ||
      node.type === 'TEXT' ||
      IMPORTANT_NODE_NAMES.has(basename);

    if (!meaningful) {
      continue;
    }

    anatomy.push({
      name: node.name,
      type: node.type,
      path: node.path,
      required: node.visible !== false && (node.parentId === null || IMPORTANT_NODE_NAMES.has(basename)),
      visible: node.visible !== false,
      nodeId: node.id,
    });
  }

  if (!anatomy.length && nodes.length) {
    warnings.push('anatomy generation produced no semantic nodes');
  }

  return anatomy;
}

function buildVariantStructureRules(component, warnings) {
  const variantsByKey = new Map((component.variants || []).map((variant) => [variant.key, variant]));
  const nodesById = new Map((component.structure || []).map((node) => [node.id, node]));
  const rules = [];

  for (const variantKey of Object.keys(component.variantStructures || {})) {
    const variant = variantsByKey.get(variantKey);
    const when = variant ? parseVariantName(variant.name || '', warnings) : {};
    const operations = (component.variantStructures[variantKey] || []).map((operation) => {
      const defaultNode = typeof operation.id === 'number' ? nodesById.get(operation.id) : null;
      const addedNode = operation.node || null;
      const summary = {
        op: operation.op,
      };

      if (typeof operation.id === 'number') {
        summary.nodeId = operation.id;
      }
      if (defaultNode || addedNode) {
        summary.nodeName = (addedNode || defaultNode).name;
        summary.nodePath = (addedNode || defaultNode).path;
      }
      const affects = inferAffects(operation);
      if (affects.length) {
        summary.affects = affects;
      }

      return summary;
    });

    rules.push({
      variantKey,
      when,
      operations,
    });
  }

  return rules;
}

function inferAffects(operation) {
  const affects = new Set();
  const value = operation.value || operation.node || {};

  if (operation.op === 'add' || operation.op === 'remove') affects.add('structure');
  if (value.layout) affects.add('layout');
  if (Object.prototype.hasOwnProperty.call(value, 'visible')) affects.add('visibility');
  if (value.fills || value.fillToken) {
    affects.add('fills');
    if (value.fillToken) affects.add('tokens');
  }
  if (value.strokes || value.strokeToken) {
    affects.add('strokes');
    if (value.strokeToken) affects.add('tokens');
  }
  if (value.text || value.typographyToken) affects.add('typography');
  if (Object.prototype.hasOwnProperty.call(value, 'radius')) affects.add('radius');
  if (!affects.size) affects.add('unknown');

  return Array.from(affects).sort();
}

function buildQualityRules(component, warnings) {
  const rules = [
    qualityRule('component-known-key', 'major', 'component key must exist in contract index', true),
    qualityRule('component-status-valid', 'major', 'component lifecycle status must be supported', true),
    qualityRule('component-platform-match', 'major', 'component platform must match target platform', true),
    qualityRule('component-valid-variant-combination', 'major', 'variant properties must match allowed combinations', true),
    qualityRule('component-no-visible-placeholder', 'major', 'visible placeholder layers should not remain in usage', true),
    qualityRule('component-token-consistency', 'minor', 'token references should stay consistent with contract', true),
  ];

  if (component.status === 'deprecated') {
    rules.push(qualityRule('component-deprecated', 'major', 'deprecated component should not be used in new designs', true));
  } else if (component.status === 'scheduled') {
    rules.push(qualityRule('component-scheduled', 'info', 'scheduled component usage should be confirmed', true));
  } else if (component.status && !['active', 'deprecated', 'scheduled'].includes(component.status)) {
    rules.push(qualityRule('component-unknown-status', 'minor', 'component has unknown lifecycle status', true));
    warnings.push(`unknown status: ${component.status}`);
  }

  if (Array.isArray(component.variants) && component.variants.length) {
    rules.push(qualityRule('component-valid-variant-values', 'major', 'variant properties must use allowed values', true));
  }

  if ((component.structure || []).some((node) => node.type === 'SLOT')) {
    rules.push(qualityRule('component-required-slots', 'major', 'required slots should be filled', true));
  }

  if (hasPlaceholderNodes(component.structure || [])) {
    rules.push(qualityRule('component-no-visible-placeholder', 'major', 'placeholder layers should be replaced', true));
  }

  return dedupeQualityRules(rules).sort((left, right) => left.id.localeCompare(right.id));
}

function qualityRule(id, severity, check, executable) {
  return { id, severity, check, executable };
}

function dedupeQualityRules(rules) {
  const byId = new Map();
  for (const rule of rules) {
    byId.set(rule.id, rule);
  }
  return Array.from(byId.values());
}

function addComponentWarnings(component, warnings) {
  if (!component.description) warnings.push('component has empty description');
  if (!Array.isArray(component.variants) || !component.variants.length) warnings.push('no variants found');
  if (!Array.isArray(component.structure) || !component.structure.length) warnings.push('no structure found');
  if (component.status === 'deprecated') warnings.push('deprecated component has no migration replacement');
  warnings.push('component has no code mapping');

  if (hasPlaceholderNodes(component.structure || [])) {
    warnings.push('component has placeholder nodes');
  }
  if (hasRawColorWithoutToken(component.structure || [])) {
    warnings.push('component uses raw color without token');
  }
  if (hasVisibleTextPlaceholder(component.structure || [])) {
    warnings.push('component has visible text placeholders');
  }
}

function hasPlaceholderNodes(nodes) {
  return nodes.some((node) => PLACEHOLDER_NAMES.some((name) => String(node.name || '').includes(name)));
}

function hasRawColorWithoutToken(nodes) {
  return nodes.some((node) => {
    const fills = Array.isArray(node.fills) ? node.fills : [];
    const strokes = Array.isArray(node.strokes) ? node.strokes : [];
    return fills.concat(strokes).some((paint) => {
      return paint && paint.colorHex && !paint.tokenKey;
    });
  });
}

function hasVisibleTextPlaceholder(nodes) {
  return nodes.some((node) => {
    const characters = node.text && node.text.characters;
    return node.visible !== false && typeof characters === 'string' && TEXT_PLACEHOLDER_PATTERN.test(characters);
  });
}

function buildManifestEntry(input) {
  const contracts = input.contractsFile.contracts;
  const platforms = Array.from(new Set(contracts.map((contract) => contract.platform))).sort();
  const statuses = countStatuses(contracts);
  const rawRelative = normalizePath(path.relative(input.outputRoot, input.filePath));
  const compiledRelative = normalizePath(path.join('compiled', input.groupId, input.compiledFileName));

  return {
    id: slugify(path.basename(input.filePath, '.json')),
    sourceFile: normalizePath(path.relative(process.cwd(), input.filePath)),
    compiledFile: compiledRelative,
    library: input.catalog.source.library,
    figmaFile: (input.catalog.source.files || []).join(', ') || input.catalog.source.file,
    componentCount: input.catalog.components.length,
    contractCount: contracts.length,
    platforms,
    statuses: sortObject(statuses),
  };
}

function countStatuses(contracts) {
  const statuses = {};
  for (const contract of contracts) {
    const status = contract.status || 'unknown';
    statuses[status] = (statuses[status] || 0) + 1;
  }
  return sortObject(statuses);
}

function createSummary() {
  return {
    processedFiles: 0,
    componentCount: 0,
    contractCount: 0,
    activeCount: 0,
    deprecatedCount: 0,
    scheduledCount: 0,
    warningsCount: 0,
    inputBytes: 0,
    outputBytes: 0,
  };
}

function updateSummary(summary, contractsFile, warningCount, inputBytes, outputBytes) {
  summary.processedFiles += 1;
  summary.componentCount += contractsFile.stats.componentCount;
  summary.contractCount += contractsFile.stats.contractCount;
  summary.activeCount += contractsFile.stats.activeCount;
  summary.deprecatedCount += contractsFile.stats.deprecatedCount;
  summary.scheduledCount += contractsFile.stats.scheduledCount;
  summary.warningsCount += warningCount;
  summary.inputBytes += inputBytes;
  summary.outputBytes += outputBytes;
}

function printSummary(summary) {
  console.log('Apollo DS contract conversion complete');
  console.log(`processed files: ${summary.processedFiles}`);
  console.log(`components: ${summary.componentCount}`);
  console.log(`contracts: ${summary.contractCount}`);
  console.log(`active/deprecated/scheduled: ${summary.activeCount}/${summary.deprecatedCount}/${summary.scheduledCount}`);
  console.log(`warnings: ${summary.warningsCount}`);
  console.log(`input bytes: ${summary.inputBytes}`);
  console.log(`output bytes: ${summary.outputBytes}`);
  console.log(`compression ratio: ${summary.compressionRatio}`);
  console.log(`output: ${summary.outputRoot}`);
}

function getInputGroupId(filePath, inputDirs, repoRoot) {
  const absoluteInputs = inputDirs
    .map((inputDir) => path.resolve(repoRoot, inputDir))
    .sort((left, right) => right.length - left.length);
  const owner = absoluteInputs.find((inputDir) => {
    const relative = path.relative(inputDir, filePath);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
  });
  if (!owner) {
    return 'catalogs';
  }

  const relative = path.relative(path.resolve(repoRoot, 'JSONS/web/components'), owner);
  return slugify(relative || path.basename(owner));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function createCompiledFileName(filePath, usedCompiledFiles) {
  const basename = slugify(path.basename(filePath, '.json')) || 'catalog';
  const primary = `${basename}.generated-contracts.json`;
  if (!usedCompiledFiles.has(primary)) {
    usedCompiledFiles.add(primary);
    return primary;
  }

  const fallback = `${basename}.${shortHash(filePath)}.generated-contracts.json`;
  if (usedCompiledFiles.has(fallback)) {
    throw new Error(`Duplicate compiled file name: ${fallback}`);
  }
  usedCompiledFiles.add(fallback);
  return fallback;
}

function sortedSet(set) {
  return Array.from(set).sort();
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function shortHash(value) {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 8);
}

function normalizePath(value) {
  return String(value || '').split(path.sep).join('/');
}

function runSelfTest() {
  const warnings = [];
  assertDeepEqual(parseVariantName('GraphicPosition=Left, CardAxis=Vertical, Background=True, Compact=False', warnings), {
    GraphicPosition: 'Left',
    CardAxis: 'Vertical',
    Background: 'True',
    Compact: 'False',
  });
  assertEqual(normalizeComponentName('[D] BenefitCard'), 'benefit-card');
  assertEqual(`${normalizeComponentName('❌ [D] TopMargin')}.desktop`, 'top-margin.desktop');
  assertDeepEqual(
    extractTokens([
      {
        layout: {
          paddingTokens: { top: 'VariableID:p', left: null },
          itemSpacingToken: 'VariableID:s',
        },
        fillToken: 'VariableID:f',
        strokeToken: 'VariableID:st',
        typographyToken: 'VariableID:t',
        fills: [{ tokenKey: 'VariableID:f2' }],
        strokes: [{ tokenKey: 'VariableID:st2' }],
      },
    ]),
    {
      padding: ['VariableID:p'],
      spacing: ['VariableID:s'],
      fills: ['VariableID:f', 'VariableID:f2'],
      strokes: ['VariableID:st', 'VariableID:st2'],
      typography: ['VariableID:t'],
    },
  );
  const signature = buildStructureSignature([
    {
      id: 1,
      parentId: null,
      type: 'TEXT',
      name: 'Title',
      path: 'Root / Title',
      visible: true,
      layout: { padding: { top: 1, right: 2, bottom: 3, left: 4 }, itemSpacing: 8 },
      radius: 12,
      text: { fontName: 'Inter Bold', fontSize: 20, lineHeight: 24, letterSpacing: 0 },
      styles: { text: { styleKey: 'S:test' } },
    },
  ]);
  assertEqual(signature[0].layout.padding.top, 1);
  assertEqual(signature[0].radius, 12);
  assertEqual(signature[0].text.fontSize, 20);
  assertEqual(signature[0].styles.text.styleKey, 'S:test');
  const runtimeVariantStructures = buildRuntimeVariantStructures({
    variantA: [
      { op: 'remove', id: 2 },
      { op: 'update', id: 3, value: { layout: { itemSpacing: 12 } } },
      { op: 'add', node: { id: 4, parentId: 1, type: 'FRAME', name: 'Added', path: 'Added' } },
    ],
  });
  assertDeepEqual(runtimeVariantStructures, {
    variantA: [
      { op: 'remove', id: 2 },
      { op: 'update', id: 3, value: { layout: { itemSpacing: 12 } } },
    ],
  });
  const deprecatedRules = buildQualityRules({ status: 'deprecated', variants: [], structure: [] }, []);
  if (!deprecatedRules.some((rule) => rule.id === 'component-deprecated')) {
    throw new Error('Self-test failed: missing component-deprecated');
  }
  console.log('self-test ok');
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}

function assertDeepEqual(actual, expected) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, got ${actualJson}`);
  }
}

main();
