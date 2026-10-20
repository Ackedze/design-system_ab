from pathlib import Path
import copy, hashlib, json, zipfile

W = Path('/Users/alexkukhta/Desktop/workplace')
O = Path(__file__).parent
G = W / '.local/apollo-general-2026-10-16/backgroundplate-phase-b295/SOURCE-WRITER-GRANT.json'

def pin(p):
    p = Path(p); b = p.read_bytes()
    return dict(path=str(p), sha256=hashlib.sha256(b).hexdigest(), bytes=len(b))

def check(p):
    assert pin(p['path']) == p, p['path']

def save(name, value):
    (O / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (O / 'SEAL.json').exists(), 'Closed output is immutable'
assert not (O / 'APPLIED.json').exists(), 'Apply must run only once'
assert pin(G) == dict(path=str(G), sha256='d7a3cad5b2bdd0236fb04c62cc809842cf68e9ceff5d75023721e3d4d4f8711a', bytes=12029)
g = json.loads(G.read_text())
assert g['soleWriter'] and g['authoringOutputRoot'] == str(O)
assert len(g['targets']) == 9
for key in ['phaseAAcceptance', 'coreCandidateAcceptance', 'proposal', 'coreHandoff', 'coreSeal', 'coordinationAcks', 'preflight', 'buildBefore']:
    check(g[key])
check(g['configuredValidation']['Apollo']['releaseManifest'])
builds = json.loads(Path(g['buildBefore']['path']).read_text())['pins']
for p in builds: check(p)
for t in g['targets']:
    if t['before'] is None: assert not Path(t['writePath']).exists()
    else: check(t['before'])
    if 'payload' in t:
        p = t['payload']
        with zipfile.ZipFile(p['path']) as z: b = z.read(p['entry'])
        assert hashlib.sha256(b).hexdigest() == p['sha256'] and len(b) == p['bytes']
old = json.loads((O.parent / 'blend-mode-2026-10-16/SOURCE-MANIFEST.json').read_text())
for p in old['sourceInputs']: check(p)
P = O.parents[2]
protected = [pin(p) for p in sorted(P.glob('*.zip'))] + [pin(P / 'manifest.json')]
for folder in ['owner-scope-2026-10-16', 'normative-sync-2026-10-16', 'blend-mode-2026-10-16', 'phase-a-window294']:
    handoff = 'FINAL-WINDOW-REQUEST.json' if folder == 'owner-scope-2026-10-16' else 'FINAL-HANDOFF.json'
    protected += [pin(O.parent / folder / n) for n in [handoff, 'SEAL.json']]
a = json.loads((O.parent / 'phase-a-window294/SEAL.json').read_text())
protected += a['normativeOutputs']
for p in protected: check(p)
save('PREFLIGHT.json', dict(status='PASS_EXACT_PHASE_B295_PREFLIGHT', grant=pin(G), sourceBefore=[t['before'] for t in g['targets']], buildBefore=builds, protected=protected, releaseManifest=g['configuredValidation']['Apollo']['releaseManifest']))
with zipfile.ZipFile(O / 'before-images.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for p in [t['before'] for t in g['targets'] if t['before']] + builds:
        z.write(p['path'], str(Path(p['path']).relative_to(W)))

for t in g['targets'][:3]:
    with zipfile.ZipFile(t['payload']['path']) as z: Path(t['writePath']).write_bytes(z.read(t['payload']['entry']))
for relative, oldversion, version in [
    ('projects/Apollo-v3/packages/component-contract-core/package.json', '0.1.17', '0.1.18'),
    ('projects/ComponentContractEditor/package.json', '0.2.104', '0.2.105'),
    ('projects/ComponentContractEditor/package-lock.json', '0.2.103', '0.2.105')]:
    p = W / relative; text = p.read_text(); before = json.loads(text); expected = copy.deepcopy(before)
    expected['version'] = version
    count = 1
    if p.name == 'package-lock.json': expected['packages']['']['version'] = version; count = 2
    needle = '"version": "' + oldversion + '"'
    assert text.count(needle) == count, relative
    after = text.replace(needle, '"version": "' + version + '"', count)
    assert json.loads(after) == expected
    p.write_text(after)
p = W / 'projects/ComponentContractEditor/src/version.ts'
text = p.read_text(); assert text.count('component-contract-editor@0.2.104') == 1
p.write_text(text.replace('component-contract-editor@0.2.104', 'component-contract-editor@0.2.105'))
common = '''16.10.2026. **SHARED_IMPLEMENTATION / CONSUMER_AND_NATIVE_PENDING**. Editor **0.2.105**, core **0.1.18**.
Общий capture сохраняет `appearance.blendMode` проверяемого узла и независимо
созданного effective baseline. `propertyForbidden` использует существующий
`matches-effective-baseline`; отсутствие actual или baseline даёт UNKNOWN /
human-review, без пустого selector и ложного compliant. Специальных условий
по имени BackgroundPlate, новых predicates и UI controls нет.
Изменение общих source/build pins переводит прежние зависимые receipts в historical.
Configured core/Editor/Apollo gates фиксируются в отдельной закрытой передаче;
они не заменяют свежую consumer/runtime приёмку General и native проверку Editor.
Критерий закрытия: принятые source/build/config pins, свежий actual consumer/reader,
native нарушения blend mode корня и вложенной поверхности, missing facts → UNKNOWN.
Границы generation pilot, нормы, schema/API и Draft/Ready gates сохранены.
'''
editor = W / 'projects/ComponentContractEditor/docs/BACKLOG.ru.md'
text = editor.read_text(); assert 'CC-BLEND-MODE-001' not in text
entry = '\n## CC-BLEND-MODE-001 — blend mode и effective baseline\n\n' + common + 'Парная запись: [CC-BLEND-MODE-001 в Apollo v4](../../Apollo-v3/docs/ARCHITECTURE_BACKLOG.md#cc-blend-mode-001--blend-mode-и-effective-baseline).\n\n'
editor.write_text(text.replace('# ComponentContract Editor — Backlog\n', '# ComponentContract Editor — Backlog\n' + entry, 1))
apollo = W / 'projects/Apollo-v3/docs/ARCHITECTURE_BACKLOG.md'
text = apollo.read_text(); assert 'CC-BLEND-MODE-001' not in text
heading = '## Apollo v4: совместимость с ComponentContract Editor\n'
assert text.count(heading) == 1
entry = '\n### CC-BLEND-MODE-001 — blend mode и effective baseline\n\n' + common + 'Влияние на Apollo/Proxy: пересобрать использующие общий core bundles и принять\nновый consumer/config/runtime; прохождение Editor tests эту приёмку не закрывает.\nПарная запись: [CC-BLEND-MODE-001 в Editor](../../ComponentContractEditor/docs/BACKLOG.ru.md#cc-blend-mode-001--blend-mode-и-effective-baseline).\n\n'
apollo.write_text(text.replace(heading, heading + entry, 1))
save('APPLIED.json', dict(status='PASS_EXACT_NINE_SOURCE_EDITS', grant=pin(G), outputs=[pin(t['writePath']) for t in g['targets']], versions=dict(core='0.1.18', Editor='0.2.105'), sharedWrites=9, Ready=False))
print(json.dumps(dict(status='APPLIED_PHASE_B295_SOURCE', sourcePaths=9, core='0.1.18', Editor='0.2.105')))
