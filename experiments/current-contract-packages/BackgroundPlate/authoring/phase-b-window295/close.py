from pathlib import Path
import difflib, hashlib, json, zipfile

W = Path('/Users/alexkukhta/Desktop/workplace')
O = Path(__file__).parent
C = W / 'projects/Apollo-v3/packages/component-contract-core'
E = W / 'projects/ComponentContractEditor'
V = W / 'projects/Apollo-v3/apps/apollo-v4'

def read(p): return json.loads(Path(p).read_text())
def pin(p):
    p = Path(p); b = p.read_bytes()
    return dict(path=str(p), sha256=hashlib.sha256(b).hexdigest(), bytes=len(b))
def check(p): assert pin(p['path']) == p, p['path']
def save(n, d): (O / n).write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

assert not (O / 'SEAL.json').exists(), 'Closed outputs are immutable'
grantPath = W / '.local/apollo-general-2026-10-16/backgroundplate-phase-b295/SOURCE-WRITER-GRANT.json'
extensionPath = grantPath.parent / 'version-extension/SOURCE-WRITER-EXTENSION.json'
assert pin(grantPath)['sha256'] == 'd7a3cad5b2bdd0236fb04c62cc809842cf68e9ceff5d75023721e3d4d4f8711a'
assert pin(extensionPath)['sha256'] == 'f57c1c3d104f83c4a3c35223b0bcbb9e6900544047ebe2f9ea24c769ea58eb0e'
g, x = read(grantPath), read(extensionPath)
applied, extra = read(O / 'APPLIED.json'), read(O / 'EXTENSION-APPLIED.json')
sources = applied['outputs'] + extra['outputs']
assert len(sources) == 11 and {p['path'] for p in sources} == {t['writePath'] for t in g['targets'] + x['targets']}
for p in sources: check(p)
for t in g['targets'][:3] + x['targets']:
    p = pin(t['writePath']); assert p['sha256'] == t['payload']['sha256'] and p['bytes'] == t['payload']['bytes']
for p in read(O / 'PREFLIGHT.json')['protected']: check(p)
for p in read(O / 'CORE-PASS-REUSE-PINS.json')['pins']: check(p)
check(extra['firstFailure']); check(extra['firstLog']); check(x['protectedProducer'])
validation = read(O / 'VALIDATION.json'); assert validation['status'] == 'PASS_ALL_CONFIGURED_GATES'
for row in validation['checks']: check(row['log'])
check(validation['releaseManifest']); check(validation['buildInputs'])
buildInputs = read(V / 'dist/build-inputs.json')
assert buildInputs['agentNativeScopeInput'] is None and buildInputs['runtimeVersion'] == '0.1.18'
assert read(C / 'package.json')['version'] == '0.1.18'
assert read(E / 'package.json')['version'] == read(E / 'package-lock.json')['version'] == read(E / 'package-lock.json')['packages']['']['version'] == '0.2.105'
assert 'component-contract-editor@0.2.105' in (E / 'src/version.ts').read_text()
assert '<span class="build-version">v0.2.105</span>' in (E / 'src/ui.html').read_text()
for p in [E / 'docs/BACKLOG.ru.md', W / 'projects/Apollo-v3/docs/ARCHITECTURE_BACKLOG.md']:
    assert p.read_text().count('## CC-BLEND-MODE-001 — blend mode и effective baseline') == 1

builds = [pin(p) for root in g['buildOutputRoots'] for p in sorted(Path(root).rglob('*')) if p.is_file()]
beforeBuilds = read(g['buildBefore']['path'])['pins']
assert {p['path'] for p in builds} == {p['path'] for p in beforeBuilds}
assert len(builds) == 51
vInputs = []
for item in buildInputs['inputs']:
    p = pin(W / 'projects/Apollo-v3' / item['path']); assert p['sha256'] == item['sha256']; vInputs.append(p)
editorInputs = [pin(p) for p in sorted((E / 'src').rglob('*')) if p.is_file()]
editorInputs += [pin(E / n) for n in ['build.js', 'package.json', 'package-lock.json', 'tsconfig.json', 'manifest.json']]
inventory = dict(status='EXACT_FINAL_PHASE_B295_SOURCE_BUILD', editedSource=sources,
    coreSourceAndValidationInputs=[p for p in read(O / 'CORE-PASS-REUSE-PINS.json')['pins'] if not str(Path(p['path']).parent).endswith('/dist')],
    EditorSourceInputs=editorInputs, ApolloBuildInputs=vInputs, buildOutputs=builds,
    configuredRelease=validation['releaseManifest'], nativeScopeInput=None,
    runtimeMembership='NOT_REFRESHED; regression test remains validation input, no automatic512 expansion')
save('SOURCE-BUILD-INVENTORY.json', inventory)

patch = []
with zipfile.ZipFile(O / 'before-images.zip') as z, zipfile.ZipFile(O / 'extension-before-images.zip') as ez:
    for t in g['targets'] + x['targets']:
        p = Path(t['writePath']); relative = str(p.relative_to(W)); old = ''
        if t['before'] is not None:
            old = ez.read(t['payload']['entry']).decode() if t in x['targets'] else z.read(relative).decode()
        patch += difflib.unified_diff(old.splitlines(True), p.read_text().splitlines(True), fromfile='a/' + relative, tofile='b/' + relative)
(O / 'source.patch').write_text(''.join(patch))
authoring = read(O / 'authoring-check.json'); assert authoring['status'] == 'PASS_PRIVATE_R6_COMPILE_EXPORT_REOPEN'
assert authoring['IR'] == 25 and authoring['nonExecutable'] == 1 and authoring['old23IR'] == 'UNCHANGED'
check(authoring['zip'])
save('eval.json', dict(status='PASS_CONFIGURED_SOURCE_BUILD_AND_PRIVATE_R6', coreTests=353, EditorTests=852, ApolloTests=1084,
    firstEditorFailure='850pass2fail retained; exact two-path version extension then852pass',
    initialPreflight='Private missing historical filename, before shared writes; preserved and corrected to existing final request',
    sharedSourcePaths=11, buildFiles=51, ApolloBuildInputs=len(vInputs), privateRevision=6, IR=25, nonExecutable=1,
    importExportReopen='PASS', previous23IR='UNCHANGED', native='NOT_RUN_USER_ONLY', consumerRuntime='PENDING_GENERAL', rootPublication='NOT_DONE', Ready=False))
handoff = dict(status='CLOSED_PHASE_B295_SOURCE_BUILD_NOT_RELEASED', writesClosed=True,
    grant=pin(grantPath), extensionGrant=pin(extensionPath), sourceOutputs=sources, completeBuildOutputs=builds,
    inventory=pin(O / 'SOURCE-BUILD-INVENTORY.json'), validation=pin(O / 'VALIDATION.json'), eval=pin(O / 'eval.json'),
    sourcePatch=pin(O / 'source.patch'), privateCandidate=authoring['zip'], authoringCheck=pin(O / 'authoring-check.json'),
    firstFailure=pin(O / 'FIRST-EDITOR-VALIDATION-FAILURE.json'), firstEditorLog=pin(O / 'EDITOR-VALIDATE.log'),
    initialPreflightFailure=pin(O / 'FIRST-PREFLIGHT-FAILURE.log'), protectedProducer=x['protectedProducer'],
    configuredRelease=validation['releaseManifest'], nativeScopeInput=None,
    versions=dict(core='0.1.18', Editor='0.2.105', stableContractProducer='0.2.104', ApolloProfile='0.4.1'),
    gates=dict(core=353, Editor=852, configuredApollo=1084),
    remaining=['General independent source/build acceptance and fresh consumer/runtime.',
        'Separate rootZIP/manifest publication scope; private r6 is not the current root package.',
        'Fresh user-only Editor native root/surface blendMode acceptance and new Figma cases require separate scope.',
        'Adaptive32px padding remains a context warning; global/external patterns and historical source mirror drift remain separate.'],
    forbiddenActionsPerformed=dict(npmInstall=0, dependencies=0, registry=0, Hub=0, Sheets=0, rootZIP=0, manifest=0, proxy=0, consumer=0, model=0, native=0, Figma=0), Ready=False)
save('FINAL-HANDOFF.json', handoff)
files = [pin(p) for p in sorted(O.rglob('*')) if p.is_file() and p.name != 'SEAL.json']
save('SEAL.json', dict(status='CLOSED_PHASE_B295_SOURCE_BUILD_NOT_RELEASED', writesClosed=True, files=files,
    sourceOutputs=sources, completeBuildOutputs=builds, protectedInputs=read(O / 'PREFLIGHT.json')['protected'],
    grant=pin(grantPath), extensionGrant=pin(extensionPath), configuredRelease=validation['releaseManifest'], Ready=False))
seal = read(O / 'SEAL.json')
for p in seal['files'] + seal['sourceOutputs'] + seal['completeBuildOutputs'] + seal['protectedInputs']: check(p)
print(json.dumps(dict(status='CLOSED_PHASE_B295_FINAL_PHYSICAL_READBACK_PASS', handoff=pin(O / 'FINAL-HANDOFF.json'), seal=pin(O / 'SEAL.json'), sourcePaths=11, buildFiles=51, IR=25, Ready=False)))
