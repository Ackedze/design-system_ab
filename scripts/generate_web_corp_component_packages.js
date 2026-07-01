#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const WEB_CORP_DIR = path.join(
  REPO_ROOT,
  'JSONS/web/components/web-corp',
);
const CONVERTER = path.join(
  REPO_ROOT,
  'scripts/convert_figma_catalogs_to_contracts.js',
);
const GENERATED_AT =
  process.env.APOLLO_CONTRACTS_GENERATED_AT || new Date().toISOString();

function main() {
  const rootCatalogs = collectRootCatalogs();
  const convertedBySource = buildGeneratedContracts(rootCatalogs);
  const summary = {
    rootCatalogCount: rootCatalogs.length,
    createdPackageCount: 0,
    updatedPackageCount: 0,
    skippedExistingPackageCount: 0,
  };

  for (const catalogInfo of rootCatalogs) {
    const packageName = getPackageName(catalogInfo.catalog, catalogInfo.fileName);
    const packageDir = path.join(WEB_CORP_DIR, packageName);
    const existed = fs.existsSync(packageDir);
    const converted = convertedBySource.get(catalogInfo.fileName);

    if (!converted) {
      throw new Error(`Missing generated contract for ${catalogInfo.fileName}`);
    }

    fs.mkdirSync(packageDir, { recursive: true });

    let changed = false;
    changed =
      writeIfMissing(
        path.join(packageDir, 'catalog.raw.json'),
        readText(catalogInfo.filePath),
      ) || changed;
    changed =
      writeIfMissing(
        path.join(packageDir, 'contract.generated.json'),
        readText(converted.compiledPath),
      ) || changed;
    changed =
      writeIfMissing(
        path.join(packageDir, 'contract.overrides.json'),
        jsonText(buildContractOverrides(packageName, catalogInfo.catalog)),
      ) || changed;
    changed =
      writeIfMissing(
        path.join(packageDir, 'composition-contract.json'),
        jsonText(buildCompositionContract(packageName, catalogInfo.catalog)),
      ) || changed;
    changed =
      writeIfMissing(
        path.join(packageDir, 'rules.json'),
        jsonText(buildRules(packageName, catalogInfo.catalog)),
      ) || changed;
    changed =
      writeIfMissing(
        path.join(packageDir, 'audit-mapping.json'),
        jsonText(buildAuditMapping(packageName)),
      ) || changed;
    changed =
      writeIfMissing(
        path.join(packageDir, 'examples.json'),
        jsonText(buildExamples(packageName)),
      ) || changed;
    changed =
      writeIfMissing(
        path.join(packageDir, 'agent-context.json'),
        jsonText(buildAgentContext(packageName, catalogInfo.catalog)),
      ) || changed;
    changed =
      writeIfMissing(
        path.join(packageDir, 'README.md'),
        buildReadme(packageName, catalogInfo.catalog, catalogInfo.fileName),
      ) || changed;

    if (!existed) {
      summary.createdPackageCount += 1;
    } else if (changed) {
      summary.updatedPackageCount += 1;
    } else {
      summary.skippedExistingPackageCount += 1;
    }
  }

  const packageInfos = collectPackageInfos();
  writeText(
    path.join(WEB_CORP_DIR, 'apollo-rules-registry.json'),
    jsonText(buildRulesRegistry(packageInfos)),
  );
  writeText(
    path.join(WEB_CORP_DIR, 'apollo-composition-registry.json'),
    jsonText(buildCompositionRegistry(packageInfos)),
  );

  console.log(JSON.stringify(summary, null, 2));
}

function collectRootCatalogs() {
  return fs
    .readdirSync(WEB_CORP_DIR)
    .filter((fileName) => fileName.endsWith('.json'))
    .filter((fileName) => fileName.indexOf('apollo-') !== 0)
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => {
      const filePath = path.join(WEB_CORP_DIR, fileName);
      const catalog = JSON.parse(readText(filePath));
      if (catalog.kind !== 'catalog') {
        throw new Error(`${fileName}: expected root Figma catalog`);
      }
      return { fileName, filePath, catalog };
    });
}

function buildGeneratedContracts(rootCatalogs) {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'apollo-web-corp-packages-'),
  );
  const inputDir = path.join(tempRoot, 'input');
  const outputDir = path.join(tempRoot, 'output');
  fs.mkdirSync(inputDir, { recursive: true });

  for (const catalogInfo of rootCatalogs) {
    fs.copyFileSync(
      catalogInfo.filePath,
      path.join(inputDir, catalogInfo.fileName),
    );
  }

  childProcess.execFileSync(
    process.execPath,
    [CONVERTER, inputDir, '--out', outputDir],
    {
      cwd: REPO_ROOT,
      stdio: 'pipe',
      env: Object.assign({}, process.env, {
        APOLLO_CONTRACTS_GENERATED_AT: GENERATED_AT,
      }),
    },
  );

  const manifest = JSON.parse(readText(path.join(outputDir, 'manifest.json')));
  const bySource = new Map();
  for (const entry of manifest.catalogs || []) {
    const sourceFileName = path.basename(entry.sourceFile);
    bySource.set(sourceFileName, {
      compiledPath: path.join(outputDir, entry.compiledFile),
      manifestEntry: entry,
    });
  }
  return bySource;
}

function collectPackageInfos() {
  return fs
    .readdirSync(WEB_CORP_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const packageName = entry.name;
      const packageDir = path.join(WEB_CORP_DIR, packageName);
      const rulesPath = path.join(packageDir, 'rules.json');
      const compositionPath = path.join(packageDir, 'composition-contract.json');
      const contractPath = path.join(packageDir, 'contract.generated.json');
      const rules = fs.existsSync(rulesPath)
        ? JSON.parse(readText(rulesPath))
        : null;
      const composition = fs.existsSync(compositionPath)
        ? JSON.parse(readText(compositionPath))
        : null;
      const contract = fs.existsSync(contractPath)
        ? JSON.parse(readText(contractPath))
        : null;
      return {
        packageName,
        packageDir,
        rules,
        composition,
        contract,
        aliases: buildAliases(packageName, contract),
      };
    })
    .filter((info) => info.rules || info.composition)
    .sort((left, right) => left.packageName.localeCompare(right.packageName));
}

function getPackageName(catalog, fileName) {
  const sourceName =
    catalog.source &&
    Array.isArray(catalog.source.files) &&
    typeof catalog.source.files[0] === 'string'
      ? catalog.source.files[0]
      : fileName.replace(/^Web _ Corp Components -- /, '').replace(/\.json$/, '');
  return normalizePackageName(sourceName);
}

function normalizePackageName(value) {
  return String(value || '')
    .replace(/::/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getPackageKey(packageName) {
  return `web-corp.${slugify(packageName)}`;
}

function getCatalogComponents(catalog) {
  return Array.isArray(catalog.components) ? catalog.components : [];
}

function buildContractOverrides(packageName, catalog) {
  return {
    schemaVersion: 1,
    documentType: 'component-contract-overrides',
    componentKey: getPackageKey(packageName),
    status: 'generated-draft',
    note:
      'Generated placeholder overlay. Add semantic ownership, reset model and design-rule overrides manually when needed.',
    semanticComponents: getCatalogComponents(catalog).map((component) => ({
      name: component.name,
      key: component.key,
      role: component.role || '',
      platform: component.platform || '',
      publicProperties: getVariantPropertyNames(component).map(
        (property) => `variant.${property}`,
      ),
      semanticSlots: [],
    })),
  };
}

function buildCompositionContract(packageName, catalog) {
  return {
    schemaVersion: 1,
    documentType: 'composition-contract',
    componentKey: getPackageKey(packageName),
    status: 'generated-draft',
    component: {
      name: packageName,
      library:
        catalog.source && catalog.source.library
          ? catalog.source.library
          : 'Web _ Corp Components',
    },
    wraps: buildWraps(catalog),
    allowedOverrides: [],
    standaloneBaselines: [],
  };
}

function buildWraps(catalog) {
  const wraps = [];
  for (const component of getCatalogComponents(catalog)) {
    for (const node of Array.isArray(component.structure) ? component.structure : []) {
      if (!node.componentInstance) {
        continue;
      }
      wraps.push({
        hostComponentName: component.name,
        path: node.path,
        componentName: node.name,
        role: 'internal-instance',
        visible: node.visible !== false,
        variantProperties:
          node.componentInstance.variantProperties &&
          typeof node.componentInstance.variantProperties === 'object'
            ? node.componentInstance.variantProperties
            : undefined,
      });
    }
  }
  return wraps;
}

function buildRules(packageName, catalog) {
  const componentKey = getPackageKey(packageName);
  const aliases = buildAliasesFromCatalog(packageName, catalog);
  return {
    schemaVersion: 1,
    documentType: 'component-rules',
    componentKey,
    status: 'generated-draft',
    rules: [
      {
        ruleId: `component:${componentKey}.component-properties-are-first-class`,
        severity: 'info',
        source: 'component-contract',
        appliesTo: 'variant.*',
        checkType: 'deterministic',
        matchKind: 'exact_component_rule',
        target: {
          component: packageName,
          layers: aliases,
        },
        ruleText:
          'Variant/property changes on this component family are component-property customizations. Report them separately from derived visual layer changes.',
      },
      {
        ruleId: `component:${componentKey}.layer-properties-use-effective-baseline`,
        severity: 'warning',
        source: 'composition-contract',
        appliesTo: 'layout.*|styles.text|fill|stroke|radius|opacity',
        checkType: 'deterministic',
        matchKind: 'exact_component_rule',
        target: {
          component: packageName,
          layers: aliases,
        },
        ruleText:
          'Layer/style changes inside this component family should be compared against the effective baseline for the current component variant and nested owner context.',
      },
      {
        ruleId: `component:${componentKey}.lifecycle-context-is-informational`,
        severity: 'info',
        source: 'component-contract',
        appliesTo: 'component.status',
        checkType: 'manual',
        ruleText:
          'Component lifecycle status is context for the agent. Do not treat it as a design violation unless a separate pattern or exact design rule is matched.',
      },
    ],
  };
}

function buildAuditMapping(packageName) {
  return {
    schemaVersion: 1,
    documentType: 'component-audit-mapping',
    componentKey: getPackageKey(packageName),
    status: 'generated-draft',
    classification: [
      {
        match: { propertyPrefix: 'variant.' },
        scope: 'component-property',
        groupTitle: 'Параметры компонента',
        priority: 10,
        resetAction: 'reset-component-properties',
      },
      {
        match: { propertyPrefix: 'layout.' },
        scope: 'layer-property',
        groupTitle: 'Параметры слоя',
        priority: 20,
        resetAction: 'reset-layer-properties',
        effectiveBaseline: 'composition-contract',
      },
      {
        match: { property: 'styles.text' },
        scope: 'layer-property',
        groupTitle: 'Параметры слоя',
        displayName: 'Стиль текст',
        priority: 30,
        resetAction: 'reset-layer-properties',
        effectiveBaseline: 'composition-contract',
      },
      {
        match: { property: 'fill' },
        scope: 'layer-property',
        groupTitle: 'Параметры слоя',
        priority: 40,
        resetAction: 'reset-layer-properties',
        effectiveBaseline: 'composition-contract',
      },
      {
        match: { property: 'stroke' },
        scope: 'layer-property',
        groupTitle: 'Параметры слоя',
        priority: 50,
        resetAction: 'reset-layer-properties',
        effectiveBaseline: 'composition-contract',
      },
    ],
    groupingOrder: ['component-property', 'layer-property'],
    evidencePolicy: {
      showVariantBeforeDerivedVisuals: true,
      useChangedNodeAsAffectedTarget: true,
      keepLayerOverrideSeparateFromVariantChange: true,
      suppressWrapperOwnedDiffsWhenEqualToEffectiveBaseline: true,
    },
  };
}

function buildExamples(packageName) {
  return {
    schemaVersion: 1,
    documentType: 'component-examples',
    componentKey: getPackageKey(packageName),
    status: 'generated-draft',
    examples: [],
  };
}

function buildAgentContext(packageName, catalog) {
  return {
    schemaVersion: 1,
    documentType: 'component-agent-context',
    componentKey: getPackageKey(packageName),
    status: 'generated-draft',
    sourceFiles: [
      'catalog.raw.json',
      'contract.generated.json',
      'contract.overrides.json',
      'rules.json',
      'audit-mapping.json',
      'examples.json',
      'composition-contract.json',
    ],
    summary: {
      componentFamily: packageName,
      library:
        catalog.source && catalog.source.library
          ? catalog.source.library
          : 'Web _ Corp Components',
      purpose:
        'Generated component context. Use exact component rules and pattern rules for recommendations; do not infer design prohibitions from this generated context alone.',
    },
    includedComponents: getCatalogComponents(catalog).map((component) => ({
      name: component.name,
      key: component.key,
      status: component.status || '',
      role: component.role || '',
      platform: component.platform || '',
      variantProperties: getVariantProperties(component),
    })),
    auditInterpretation: {
      componentProperties: ['variant.*'],
      layerProperties: [
        'fill',
        'stroke',
        'styles.text',
        'layout.*',
        'radius',
        'opacity',
      ],
      baselinePolicy:
        'Compare layer changes against the effective component state baseline when host composition context is available.',
    },
  };
}

function buildReadme(packageName, catalog, fileName) {
  const library =
    catalog.source && catalog.source.library
      ? catalog.source.library
      : 'Web _ Corp Components';
  const generatedAt =
    catalog.source && catalog.source.generatedAt
      ? catalog.source.generatedAt
      : '';
  const componentCount = getCatalogComponents(catalog).length;
  return [
    `# ${packageName} component contract MVP`,
    '',
    `This folder contains a generated component-contract layer for **${library} / ${packageName}**.`,
    '',
    'The raw Figma catalog remains the source of truth:',
    '',
    `\`../${fileName}\``,
    '',
    '## Files',
    '',
    '- `catalog.raw.json` - preserved source catalog copy for this package.',
    '- `contract.generated.json` - generated compact contract extracted from the raw Figma catalog.',
    '- `contract.overrides.json` - generated placeholder for human-authored semantic overrides.',
    '- `composition-contract.json` - generated internal instance ownership context.',
    '- `rules.json` - generated component-level classification rules.',
    '- `audit-mapping.json` - generated default Apollo grouping model.',
    '- `examples.json` - generated placeholder for examples.',
    '- `agent-context.json` - compact generated context for agent-side interpretation.',
    '',
    '## Source',
    '',
    `- Library: \`${library}\``,
    `- Generated at: \`${generatedAt}\``,
    `- Components: \`${componentCount}\``,
    '',
    '## Current Scope',
    '',
    'This package is generated. Add manual rules only when there is an explicit component behavior or design rule to encode.',
    '',
  ].join('\n');
}

function buildRulesRegistry(packageInfos) {
  return {
    schemaVersion: 1,
    documentType: 'apollo-component-rules-registry',
    generatedAt: GENERATED_AT,
    entries: packageInfos
      .filter((info) => info.rules)
      .map((info) => ({
        componentKey: info.rules.componentKey || getPackageKey(info.packageName),
        packageName: info.packageName,
        aliases: info.aliases,
        rulesFile: `JSONS/web/components/web-corp/${info.packageName}/rules.json`,
        rules: Array.isArray(info.rules.rules) ? info.rules.rules : [],
      })),
  };
}

function buildCompositionRegistry(packageInfos) {
  return {
    schemaVersion: 1,
    documentType: 'apollo-composition-contract-registry',
    generatedAt: GENERATED_AT,
    entries: packageInfos
      .filter((info) => info.composition)
      .map((info) => ({
        componentKey:
          info.composition.componentKey || getPackageKey(info.packageName),
        packageName: info.packageName,
        aliases: info.aliases,
        contractFile: `JSONS/web/components/web-corp/${info.packageName}/composition-contract.json`,
        contract: info.composition,
      })),
  };
}

function buildAliases(packageName, contract) {
  const aliases = new Set([packageName]);
  if (contract && Array.isArray(contract.contracts)) {
    for (const item of contract.contracts) {
      addAlias(aliases, item.name);
      addAlias(aliases, removeLeadingMarkers(item.name));
    }
  }
  return Array.from(aliases).filter(Boolean).sort((left, right) =>
    left.localeCompare(right),
  );
}

function buildAliasesFromCatalog(packageName, catalog) {
  const aliases = new Set([packageName]);
  for (const component of getCatalogComponents(catalog)) {
    addAlias(aliases, component.name);
    addAlias(aliases, removeLeadingMarkers(component.name));
  }
  return Array.from(aliases).filter(Boolean).sort((left, right) =>
    left.localeCompare(right),
  );
}

function addAlias(aliases, value) {
  const normalized = String(value || '').trim();
  if (normalized) {
    aliases.add(normalized);
  }
}

function removeLeadingMarkers(value) {
  return String(value || '')
    .replace(/^[^\wА-Яа-яЁё\[]+\s*/u, '')
    .trim();
}

function getVariantPropertyNames(component) {
  return Object.keys(getVariantProperties(component)).sort();
}

function getVariantProperties(component) {
  const valuesByProperty = {};
  for (const variant of Array.isArray(component.variants) ? component.variants : []) {
    const parsed = parseVariantName(variant.name || '');
    for (const [property, value] of Object.entries(parsed)) {
      if (!valuesByProperty[property]) {
        valuesByProperty[property] = new Set();
      }
      valuesByProperty[property].add(value);
    }
  }
  const result = {};
  for (const property of Object.keys(valuesByProperty).sort()) {
    result[property] = Array.from(valuesByProperty[property]).sort();
  }
  return result;
}

function parseVariantName(name) {
  const result = {};
  for (const part of String(name || '').split(',')) {
    const segment = part.trim();
    const index = segment.indexOf('=');
    if (index <= 0) {
      continue;
    }
    const key = segment.slice(0, index).trim();
    const value = segment.slice(index + 1).trim();
    if (key && value) {
      result[key] = value;
    }
  }
  return result;
}

function slugify(value) {
  return String(value || '')
    .replace(/\[[DMT]\]/gi, ' ')
    .replace(/^[DMT]\]\s*/i, ' ')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^\wА-Яа-яЁё]+/g, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function writeIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) {
    return false;
  }
  writeText(filePath, content);
  return true;
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function jsonText(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

main();
