const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const {hash, digest, api, defaults, publicExport, imports, pinFiles} = require('./source-inventory.cjs');
const repo = path.resolve(__dirname, '../../..');
const workspace = path.dirname(repo);
const contractsDir = 'shared/design-system_ab/experiments/current-contract-packages';
const packageJson = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const head = cp.execFileSync('git', ['rev-parse', 'HEAD'], {cwd: repo, encoding: 'utf8'}).trim();
if (packageJson.version !== '80.7.1' || head !== 'c037d0c322ea9774a9c251400d76d41222819b87') throw new Error('Source version changed: explicit new registry revision required');
const inputs = [
    ['buttons-group.desktop', 'ButtonsGroup.component-contract.zip'],
    ['corporate-content.desktop', 'CorporateContent.component-contract.zip'],
    ['corporate-content.mobile-web', 'CorporateContent.mobile-web.component-contract.zip'],
];
function contract(name) {
    const archivePath = `${contractsDir}/${name}`;
    const filename = path.join(workspace, archivePath);
    const result = cp.spawnSync('python3', ['-c',
        'import zipfile,json,hashlib,sys\nz=zipfile.ZipFile(sys.argv[1]);raw=z.read("contract.manual.json");m=json.loads(raw);compiled=[n for n in z.namelist() if n.endswith("component-contract.v2.json") and not n.startswith("dependencies/")];p=json.loads(z.read(compiled[0])).get("package",{}) if compiled else {};print(json.dumps({"component":m["component"],"revision":m["metadata"]["revision"],"representations":m["representations"],"manualSha256":hashlib.sha256(raw).hexdigest(),"manualSourceHash":p.get("manualSourceHash"),"dependencies":m.get("componentDependencies",[])}))', filename], {encoding: 'utf8'});
    if (result.status) throw new Error(result.stderr);
    return {...JSON.parse(result.stdout), archivePath, archiveSha256: hash(fs.readFileSync(filename))};
}
const contracts = Object.fromEntries(inputs.map(([id, name]) => [id, contract(name)]));
const sourceFiles = ['package.json','rollup.config.mjs','tools/build/copy-package-json.mjs','tools/build/utils.mjs','tools/build/build-types.mjs',
    'src/button-group/index.ts','src/button-group/button-group.tsx','src/button-group/typings.ts','src/button-group/constants.ts',
    'src/button-group/hooks/index.ts','src/button-group/hooks/use-button-group.ts','src/button-group/utils/index.ts',
    'src/button-group/utils/calculate-hidden-elements.ts','src/button-group/utils/get-picker-button-options.ts',
    'src/button-group/button-group.module.css','src/button-group/button-group-skeleton.module.css',
    'src/corporate-content/index.ts','src/corporate-content/corporate-content.tsx','src/corporate-content/types.ts',
    'src/corporate-content/constants.ts','src/corporate-content/utils.ts','src/corporate-content/corporate-content.css',
    'src/cn/index.ts','src/cn/cn.ts','src/theme-provider/index.ts','src/theme-provider/theme-provider.tsx',
    'src/utils/use-corp-is-desktop.ts','src/hooks/use-resize-observer.ts','src/vars.css'];
const evidence = (file, symbols, note) => ({file, symbols, note});
const corporateApi = api(repo, 'src/corporate-content/types.ts', 'CorporateContentProps');
const groupApi = api(repo, 'src/button-group/typings.ts', 'ButtonGroupProps');
const gap = (id, description, sources) => ({id, description, sources});
const corporateGaps = [
    gap('CC-GEOMETRY', 'Figma root is vertical AutoLayout; code .corporate-content is row flex. Body→children is confirmed, composition geometry is not.', ['src/corporate-content/corporate-content.css']),
    gap('CC-PADDING', 'Figma desktop baseline 40/52/64/52 at 1600+ differs from code horizontal desktop-l padding 50. Code vertical defaults are gap3xl/gap5xl; Core tokens are not locally resolved.', ['src/corporate-content/corporate-content.css','src/corporate-content/constants.ts','src/vars.css']),
    gap('CC-SURFACE', 'Figma BackgroundPlate Color page modes have no direct prop. theme/context uses alfa-on-white/alfa-on-color/grey; do not equate them with white/grey page modes.', ['src/cn/cn.ts','src/theme-provider/theme-provider.tsx']),
];
const groupGaps = [
    gap('BG-AUTO-OVERFLOW', 'No overflow prop. Count and measured width can hide actions even when Figma Overflow=false; voluntary Figma overflow has no exact mapping.', ['src/button-group/button-group.tsx','src/button-group/utils/calculate-hidden-elements.ts']),
    gap('BG-OVERFLOW-ACTIONS', 'Default hidden options preserve children/disabled but do not forward onClick/action identity/icon/disabled reason. Explicit mapElementToPickerOption and picker event routing need a parity profile.', ['src/button-group/utils/get-picker-button-options.ts','src/button-group/typings.ts']),
    gap('BG-OVERFLOW-ORDER', 'Hidden indexes/options keep original ascending order; contract requests nearest-to-SingleIcon then right-to-left transfer. No automatic equivalence.', ['src/button-group/utils/calculate-hidden-elements.ts','src/button-group/utils/get-picker-button-options.ts']),
    gap('BG-MOBILE', 'Code supports runtime <768 but shows only the first action plus PickerButton; no mobile authoring contract in this input and no two-visible-action parity.', ['src/utils/use-corp-is-desktop.ts','src/button-group/utils/calculate-hidden-elements.ts']),
    gap('BG-SIZE-BINDINGS', 'Code/root Size supports 32/40/48/56. Accepted authoring evidence requires occurrence binding/live acceptance for non-56 variants; current mapping route covers 56.', [contracts['buttons-group.desktop'].archivePath]),
    gap('BG-VISIBILITY-PORT', 'Code Connect handle has no documented native visible property. Group template requires locked occurrence visibility and event inputs from NEXT-03; no guessing from names/order.', ['tools/code-connect/ButtonsGroup.figma.ts']),
];
function mapping(id, kind, contractKey, subpath, symbol, body) {
    const c = contracts[contractKey], exp = publicExport(repo, subpath, symbol);
    if (!exp) throw new Error(`No public source export: ${subpath}/${symbol}`);
    const representation = c.representations.find(r => r.kind === 'figma');
    const mobile = contractKey.endsWith('mobile-web');
    return {id, kind, contract: {
        componentId: c.component.componentId, familyId: c.component.familyId, contractId: c.component.contractId,
        revision: c.revision, archivePath: c.archivePath, archiveSha256: c.archiveSha256,
        manualSha256: c.manualSha256, manualSourceHash: c.manualSourceHash,
        dependencyPins: c.dependencies.map(d => ({componentId:d.componentId, revision:d.revision, manualSourceHash:d.manualSourceHash, compiledHash:d.compiledHash})),
    }, figma: {representationId: representation.id, componentKey: representation.locator.componentKey,
        componentSetKey: representation.locator.componentSetKey ?? null,
        fileKey: 'NrzEFUSTXgzOUmsfYym0xD', nodeId: kind === 'buttons-group' ? '62786:48893' : mobile ? '89653:28862' : '89622:29551',
        ...(body ? {bodyProperty: body.exact, bodyFriendlyName: body.friendly, bodyType: 'SLOT'} : {properties:{Size:{type:'VARIANT',domain:['32','40','48','56']},Overflow:{type:'VARIANT',domain:['false','true']}}}),
    }, code: {package: packageJson.name, version: packageJson.version, subpath:`arui-private/${subpath}`, export:symbol,
        source: exp, publicExportStatus:'confirmed-build-source', builtPackageStatus:'not-built-in-checkout',
        proposedRepresentationId: kind === 'buttons-group' ? 'web-corp.buttons-group.code.arui-private.desktop' : mobile ? 'corporate-content.mobile-web.code.arui-private' : 'web-corp.corporate-content.code.arui-private.desktop',
        representationStatus:'proposed-for-authoring', api:kind === 'buttons-group' ? groupApi : corporateApi,
        defaults:defaults(repo,exp.implementation,symbol),
        resolvedDefaults:kind==='buttons-group'?{size:56,maxVisibleButtons:4,primaryFirst:false,showSkeleton:false}
            :{disableVerticalInlinePaddings:false,theme:'context-default: alfa-on-white',desktopVerticalPaddings:['gap3xl','gap5xl'],mobileVerticalPaddings:['gapXl','gapXl']},
        boundTypeEvidence:kind==='buttons-group'?{Size:'Exclude<ButtonProps["size"], "l" | "xl" | 64 | 72>',ButtonElementProps:'Omit<ButtonProps, "view" | "size"> & ButtonHTMLAttributes<HTMLButtonElement>',PickerElementProps:'Omit<PickerButtonProps, "view" | "size">'}
            :{ThemeType:['alfa-on-color','alfa-on-white','grey'],VerticalPaddings:'Partial<Record<"mobile" | "desktop", [number | `${number}px`, number | `${number}px`]>>'},
        transitiveTypesStatus:'external-core-peer-not-installed',
        runtimePlatforms:['desktop','mobile-web'], runtimeBreakpoint:768,
    }, platforms:[mobile?'mobile-web':'desktop'],
    status:{apiMapping:'confirmed-source-api',fullContractParity:'not-confirmed',liveAcceptance:'not-run-for-NEXT-01',publication:'not-confirmed',release:'not-released'},
    propertyMappings: body ? [{from:body.exact,type:'SLOT',to:'children',transform:'preserve-ordered-content',source:evidence(exp.implementation,['children'],'React children are rendered directly')}]
        : [{from:'Size',type:'VARIANT',to:'size',transform:'numeric-enum',domain:['32','40','48','56'],source:evidence('src/button-group/constants.ts',['SIZE_TO_CLASSNAME_MAP'],'Numeric sizes implemented')},
           {from:'direct Button.✎ Label#16:294',to:'elements[].children',transform:'string',source:evidence(exp.implementation,['props.children'],'Normal Button content')},
           {from:'direct Button.DisabledState',to:'elements[].disabled',transform:'False/True→boolean',source:evidence('src/button-group/utils/get-picker-button-options.ts',['disabled'],'Runtime source forwards/preserves disabled')},
           {from:'first-visible Button.View',to:'primaryFirst',transform:'Primary→true, Secondary→false',source:evidence(exp.implementation,['primaryFirst','view'],'Other elements are forced secondary')},
           {from:'scenario.action.onClick.handlerRef',to:'elements[].onClick',transform:'bind-real-handler',source:evidence('src/button-group/typings.ts',['ButtonHTMLAttributes'],'Events are scenario input, not inferred from Figma')},
           {from:'Overflow',to:null,transform:'unsupported-direct-prop',gapId:'BG-AUTO-OVERFLOW'}],
    internalDependencies:imports(repo,exp.implementation),
    pilotProfile:body ? {content:'Body sequence of confirmed mappings or text',systemLayoutAdapter:'not-provided',acceptedCodeProps:['id','className','dataTestId']}
        : {platform:'desktop',figmaSize:'56',figmaOverflow:'false',visibleActions:[1,4],content:'text-only normal Button elements',runtimeWidthFitRequired:true,eventsRequired:true,addonsSupported:false,singleIconSupported:false},
    gaps:kind==='buttons-group'?groupGaps:corporateGaps,
    evidence:[c.archivePath,exp.index,exp.implementation,kind==='buttons-group'?'src/button-group/typings.ts':'src/corporate-content/types.ts','tools/build/copy-package-json.mjs','rollup.config.mjs'],
    };
}
const registry = {
    $schema:'./mapping-registry.schema.json',schemaVersion:'apollo.arui-private-mappings.v1',registryVersion:'1.0.0',generatedAt:'2026-10-05',
    owner:'Apollo CB :: Code Connect',targetProduct:'apollo-v4',targetPath:'projects/Apollo-v3/apps/apollo-v4',
    mappingArtifacts:pinFiles(repo,['tools/code-connect/CorporateContent.figma.ts','tools/code-connect/CorporateContentMobile.figma.ts','tools/code-connect/ButtonsGroup.figma.ts','tools/code-connect/registry/source-inventory.cjs','tools/code-connect/registry/consumer.cjs']),
    source:{package:packageJson.name,version:packageJson.version,commit:head,files:pinFiles(repo,sourceFiles),
        exportPolicy:{resolver:'build-generated ./* subpaths plus actual src/<subpath>/index.ts named export',rootPackageHasExports:false,
            wildcardAloneIsNotAvailability:true,dependenciesAreNotGeneratorExports:true},
        internalPackageVersions:{'@alfalab/core-components':packageJson.peerDependencies['@alfalab/core-components'],'@alfalab/icons-glyph-26':packageJson.dependencies['@alfalab/icons-glyph-26']},
        transitiveTypeDependenciesInstalled:false},
    mappings:[mapping('arui-private.buttons-group.desktop','buttons-group','buttons-group.desktop','button-group','ButtonGroup'),
        mapping('arui-private.corporate-content.desktop','corporate-content','corporate-content.desktop','corporate-content','CorporateContent',{exact:'[D] Body#135096:3',friendly:'[D] Body'}),
        mapping('arui-private.corporate-content.mobile-web','corporate-content','corporate-content.mobile-web','corporate-content','CorporateContent',{exact:'[M] Body#135096:2',friendly:'[M] Body'})],
    availabilityPolicy:{allowedImports:['arui-private/button-group','arui-private/corporate-content'],unknownComponents:'reject',unknownProps:'reject',unknownSlots:'reject',unknownPlatforms:'reject',stalePins:'reject',
        explicitlyUnavailable:['@alfalab/core-components/button','arui-private/button','arui-private/ButtonsGroup'],
        uiFramework:'React',fullUiParityMustBeCheckedSeparately:true},
    notes:['CorporateContent accepted ZIP r12 differs from authoring main r11; pinned accepted ZIP is used without editing either source.',
        'Proposed code representation IDs have not been added to authoring manuals by this task.',
        'Existing CorporateContent publication pointer did not prove persisted executable template in prior readback; NEXT-01 performs no publication.'],
};
registry.registryDigest=digest(registry);
const filename=path.join(__dirname,'arui-private-80.7.1.v1.json');
fs.writeFileSync(filename,JSON.stringify(registry,null,2)+'\n');
console.log(JSON.stringify({registry:filename,digest:registry.registryDigest,contracts:registry.mappings.map(m=>({id:m.id,revision:m.contract.revision,sha256:m.contract.archiveSha256})),api:registry.mappings.map(m=>({id:m.id,props:m.code.api.map(p=>p.name),defaults:m.code.defaults}))},null,2));
