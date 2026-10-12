import hashlib
import json
import re
import shutil
from pathlib import Path

root = Path(__file__).resolve().parent
workspace = root.parents[5]
run = root.parent / 'reports/skill-evals/link-r1-2026-10-10'
skill = workspace / '.codex/skills/apollo-contract-authoring'
prefix = 'component:web-core.link.'
assert not (run / 'seal.json').exists(), 'Do not reopen a sealed eval; use a new run directory'

def read(p):
    return json.loads(p.read_text())

def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

manual = read(root / 'contract.manual.json')
compiled = read(root / 'compiled/component-contract.v2.json')
checks = read(root / 'reports/package-checks.r1.json')
inventory = read(root / 'reports/source-inventory.json')
drift = read(root / 'reports/source-drift.json')
board = read(root.parent / 'reports/figma-board-final-readback.r1.json')
board['cards'][14]['name'] = 'LINK-15 · Чистый контроль M'
write(root.parent / 'reports/figma-board-final-readback.r1.json', board)
targets = {t['id']: t for t in manual['targets']}
entries = []
for r in manual['rules']:
    ir = [i['ruleId'] for i in compiled['rules'] if i['source']['anchor'] == r['id']]
    entries.append({
        'sourceRuleId': r['id'], 'kind': 'authoring-claim', 'fullNorm': r['rationale'],
        'sourceRefs': r['sourceRefs'], 'route': r['execution']['route'],
        'semanticTarget': r['targetId'], 'targetScope': r['targetScope'],
        'representation': 'core.web.link.figma.universal', 'variants': 'all four native Size',
        'nativeBindings': targets[r['targetId']]['identityBindingsV1'],
        'ownership': r['ownership'], 'conditions': r['applicability'],
        'parameters': {'constraints': r['constraints'], 'controlPaths': r['controlPaths'],
                       'propertyApplicability': r.get('propertyApplicability', {})},
        'dependencies': [], 'compiledRuleIds': ir,
        'policyIds': [p['id'] for p in compiled['customizationPolicy'] if p['id'] == r['id']],
        'openQuestions': ['Draft; installed Editor live acceptance pending'] +
            (r.get('execution', {}).get('missingFacts', [])),
        'sourceRelation': 'Native domain/default is observed API, not a newly approved normative decision'
            if r['id'] == prefix + 'size-domain' else 'See original source entries below',
    })

rules_path = root / 'sources/design-system_ab/JSONS/web/components/web-core/core/Link/rules.json'
athena = read(rules_path)
for r in athena['generated']['rules']:
    support = [r['ruleId']]
    if r['ruleId'].endswith('layer-properties-use-effective-baseline'):
        support += [prefix + x for x in ['label-typography', 'root-fill-baseline', 'content-fill-baseline']]
    entries.append({'sourceRuleId': r['ruleId'], 'kind': 'original-rule', 'fullNorm': r['ruleText'],
        'originalRule': r, 'source': {'path': str(rules_path.relative_to(root)), 'sha256': sha(rules_path)},
        'manualRuleIds': support, 'compiledRuleIds': [i['ruleId'] for i in compiled['rules'] if i['source']['anchor'] in support],
        'route': 'component-policy/predicate-partial', 'openQuestions': [
            'Exact public View token/color mapping remains unresolved; full original baseline norm is not fully executable',
            'Source generated authority active does not approve new Draft projection or new public exceptions']
            if len(support) > 1 else ['Public-property policy does not create executable IR']})

def sections(text):
    # Preserve every source byte in a section, including tables, exceptions and examples.
    matches = list(re.finditer(r'^#{1,3} .+$', text, re.M))
    result = [('frontmatter', text[:matches[0].start()] if matches else text)]
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        result.append((m.group(), text[m.start():end]))
    assert ''.join(s for _, s in result) == text
    return result

def linked_claims(name, title, text):
    ids = []
    if 'Size' in text or 'Размер' in title:
        ids += ['size-domain', 'label-typography']
    if 'Label' in text or 'children' in text:
        ids += ['label-content']
    if 'Line' in text or 'подчёркиван' in title.lower():
        ids += ['underline-domain', 'underline-none-context']
    if 'view' in text.lower():
        ids += ['view-token-mapping']
    if 'addon' in text.lower() or 'Аддоны' in title or 'иконки' in title:
        ids += ['left-addon-visibility', 'right-addon-visibility', 'left-icon-swap',
                'right-icon-swap', 'left-icon-height', 'right-icon-height', 'inline-link-addons']
    if 'Формулировка' in title:
        ids += ['destination-label']
    if 'Свойства инстанса' in title or 'Стабильные свойства' in title:
        ids += ['component-properties-are-first-class']
    return sorted({prefix + x for x in ids})

hub = root / 'sources/ds-ai-hub/core/web/components/link'
for name in ['guidelines', 'adapter.figma', 'adapter.code', 'bridge', 'cookbook']:
    p = hub / (name + '.md')
    for n, (title, text) in enumerate(sections(p.read_text())):
        ids = linked_claims(name, title, text)
        route = 'documentation' if n < 2 else 'component-reference-plus-context/recipe'
        if name == 'adapter.code':
            route = 'delegated-code-contract/recipe'
        elif title in ['## Алгоритм выбора', '## Проверка перед ответом', '## Как применять',
                       '## Алгоритм lookup: Figma → Code', '## Алгоритм lookup: Code → Figma']:
            route = 'production-recipe'
        entries.append({'sourceRuleId': None, 'sourceSectionId': f'Link.{name}:section-{n}',
            'kind': 'source-section', 'heading': title, 'fullNorm': text,
            'source': {'path': str(p.relative_to(root)), 'sha256': sha(p)},
            'manualRuleIds': ids, 'compiledRuleIds': [i['ruleId'] for i in compiled['rules'] if i['source']['anchor'] in ids],
            'route': route, 'crosswalkKind': 'section-support, not RuleID equality',
            'contextScope': 'Navigation purpose, paragraph usage, parent typography and interaction are contextual/code inputs',
            'openQuestions': ['Custom/defaults conflicts preserved'] if 'Custom' in text or title == '### Defaults' else []})

pattern_path = root / 'sources/design-system_ab/patterns/p_link.md'
pattern_text = pattern_path.read_text()
pattern_ids = re.findall(r'^- ruleId: (.+)$', pattern_text, re.M)
for n, (title, text) in enumerate(sections(pattern_text)):
    rid = re.search(r'^- ruleId: (.+)$', text, re.M)
    entries.append({'sourceRuleId': rid.group(1) if rid else None,
        'sourceSectionId': f'ptrn:components.link:section-{n}', 'kind': 'pattern-source',
        'heading': title, 'fullNorm': text,
        'source': {'path': str(pattern_path.relative_to(root)), 'sha256': sha(pattern_path)},
        'scope': 'desktop product pattern; not a prohibition on universal native Link in mobile-web',
        'route': 'context/pattern/editorial/runtime-recipe', 'manualRuleIds': [], 'compiledRuleIds': [],
        'openQuestions': ['Hub/desktop pattern underline exception conflict']
            if rid and rid.group(1) == 'rule:components.link.no-underline-exception' else []})

coverage = {'schemaVersion': 'apollo.contract-authoring-coverage-map.v1', 'componentId': 'core.web.link',
    'revision': 1, 'manualSourceHash': checks['manualHash'], 'compiledHash': checks['compiledHash'],
    'sourceCoverage': {'athenaRules': 2, 'manualClaims': 18, 'compiledIR': 32,
        'patternRules': len(pattern_ids), 'hubDocuments': 5, 'allDocumentSectionsPreserved': True,
        'scope': 'Exact source preservation and section mapping; not all normative scope is executable'},
    'entries': entries, 'unresolved': drift['items'] + [{'id': 'link.view-token-mapping',
        'question': 'Confirm token IDs for default/primary/secondary and propagation across Label/Underline/addons.'}],
    'fullAcceptance': False}
write(root / 'coverage-map.json', coverage)
questions = {'schemaVersion': 'link.owner-questions.v1', 'status': 'pending',
    'questions': coverage['unresolved'], 'dependencyPlan': [
        'Accept standalone Link scope before adding its pin/direct binding to BenefitCard',
        'Create IconView standalone contract, then BackgroundPlate',
        'Global icon asset policy is a separate dependency; Link public icon swap does not approve arbitrary asset edits'],
    'retainedParentNorm': 'BenefitCard owns its 32-character/one-line use requirement; no global Link limit added'}
write(root / 'reports/owner-questions.r1.json', questions)

rule_for = {
    'LINK-09': prefix + 'layer-properties-use-effective-baseline.1.6',
    'LINK-10': prefix + 'layer-properties-use-effective-baseline.1.5',
    'LINK-11': prefix + 'layer-properties-use-effective-baseline.1.12',
    'LINK-12': prefix + 'label-typography.1.2',
    'LINK-13': prefix + 'left-icon-height.1.1',
    'LINK-14': prefix + 'root-fill-baseline.1.1',
    'LINK-16': prefix + 'label-typography.1.4',
}
resets = {'LINK-09': 'gap=8', 'LINK-10': 'paddingLeft=0', 'LINK-11': 'opacity=1',
          'LINK-12': 'Label fontSize=16', 'LINK-13': 'icon height=24',
          'LINK-14': 'root fill invisible', 'LINK-16': 'Label tracking=-0.24px'}
cases = []
for c in board['cards']:
    cid = c['name'].split(' · ')[0]
    negative = cid in rule_for
    cases.append({'caseId': cid, 'frameId': c['frameId'], 'instanceId': c['instanceId'],
        'url': f'https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id={c["instanceId"].replace(":", "-")}',
        'conditions': {'representation': 'core.web.link.figma.universal', 'Size': c['size'],
            'Left Addon': c['leftAddon'], 'Right Addon': c['rightAddon'], 'Line': c['underline'],
            'modes': 'Captured native default; other variable modes NOT_RUN'},
        'fixtureReadback': c, 'expected': {'classification': 'violation' if negative else 'no intrinsic violation',
            'ruleId': rule_for.get(cid), 'qualification': 'Authoring-preview; context/policy-only separately; no fixed total error count'},
        'status': 'NOT_RUN_USER_ONLY' if cid != 'LINK-13' else 'FIXTURE_NOT_PREPARED',
        'reset': f'Restore {resets[cid]} on the SAME instance and verify target violation disappears' if negative else None,
        'gap': 'Plugin API geometry mutation stayed 24; desired >24 case remains unprepared' if cid == 'LINK-13' else None})
matrix = {'schemaVersion': 'link.case-matrix.v1', 'revision': 1, 'manualSourceHash': checks['manualHash'],
    'boardId': board['boardId'], 'cases': cases, 'liveAcceptance': False,
    'additionalRequiredCases': ['Both addon sides: active/inactive public BOOL + direct visibility override',
        'Public icon swap in every active 16/20/24 port with independent baseline',
        'Missing binding/identity must remain UNKNOWN', 'Label token/style-binding scope after owner token mapping decision'],
    'localCheckReceipt': 'reports/operator-checks.r1.json'}
write(root / 'case-matrix.json', matrix)
lines = ['# Link r1 — ручная проверка в Editor', '',
    'Пакет Draft. Используй режим проверки authoring; обычный runtime не исполняет Draft. Выбирай сам INSTANCE Link внутри карточки кейса.', '',
    'Сначала LINK-03 (эталон M), затем LINK-09 и LINK-12. После каждого отрицательного прогона восстанови тот же экземпляр и выгрузи отдельный отчёт. LINK-15 — отдельный чистый контроль, он не заменяет RESET.', '',
    '| Кейс | Параметры | Мутация / проверка | Ожидание | Восстановление |',
    '| --- | --- | --- | --- | --- |']
for c in cases:
    cid = c['caseId']; native = c['fixtureReadback']
    conditions = f'Size={native["size"]}; Left/Right={str(native["leftAddon"]).lower()}/{str(native["rightAddon"]).lower()}; Line={native["underline"]}'
    expectation = f'`{rule_for[cid]}` → violation' if cid in rule_for else '0 intrinsic violations; context/policy scope отдельно'
    if cid == 'LINK-13': expectation = '**Пока не запускать**: fixture не подготовлен; ожидаемое нарушение >24 сохраняется'
    lines.append(f'| [{cid}]({c["url"]}) | {conditions} | {native["name"].split(" · ", 1)[1]} | {expectation} | {resets.get(cid, "—")} |')
lines += ['', 'Все live-кейсы ещё NOT_RUN_USER_ONLY. Локальные 32 проверки используют native captures и явно заданные counterfactual mutations; это не установленный Editor.', '',
    'Нужно отдельно проверить публичные swaps, BOOL active/inactive, остальные baseline-факты и UNKNOWN. Полная карта: [coverage-map.json](coverage-map.json).']
(root / 'TEST_CASES.ru.md').write_text('\n'.join(lines) + '\n')

run.mkdir(parents=True, exist_ok=True)
snapshot_pins = []
for name in ['SKILL.md', 'references/implementation.md', 'references/evals.md', 'scripts/check_contract.cjs', 'scripts/core.cjs']:
    dst = run / 'skill-snapshot' / name
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(skill / name, dst)
    snapshot_pins.append({'path': name, 'sha256': sha(dst)})
write(run / 'skill-snapshot/pins.json', {'version': '0.1.3', 'files': snapshot_pins,
    'ownerSkillSealSha256': '577514478631de7dc15c102f858585896ec636ae5f84f0a0323f88a000b85c8f'})
write(run / 'case.json', {'schemaVersion': 'apollo.contract-authoring-eval-case.v1',
    'caseId': 'link-r1-universal-native-api', 'runId': run.name, 'request': 'го: create standalone Link prerequisite for BenefitCard',
    'evaluationMode': 'retrospective candidate evaluation; skill first applied after initial authoring',
    'scope': ['Link Draft authoring', 'source crosswalk', 'native API capture', 'core roundtrip', 'lab fixtures'],
    'inputs': inventory['sources'], 'expected': ['Preserve two original RuleIDs and all source sections',
        'One native universal set/four Size; record contradictory Custom/defaults',
        'No invented global 32-character limit', 'Exact actual IR IDs, Draft gate, positive/negative/reset/UNKNOWN'],
    'parentPackageUnchangedSha256': 'd2d93913ac82a7dd08eb8870d35afa4eeeb514dc42aa5eb7d9390ddf76742bed'})
for source, name in [(root / 'contract.manual.json', 'contract.manual.json'),
                     (root / 'coverage-map.json', 'coverage-map.json'),
                     (root / 'case-matrix.json', 'case-matrix.json'),
                     (root / 'reports/owner-questions.r1.json', 'questions.json')]:
    dst = run / 'candidate' / name
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, dst)
write(run / 'candidate/diff.json', {'kind': 'new contract, no previous Link manual',
    'retainedSourceRuleIds': [r['ruleId'] for r in athena['generated']['rules']],
    'split': {'original baseline': ['recursive layout/visual except fill', 'label typography', 'root/content fills']},
    'unresolved': ['View tokens/full Label paint/style evidence', 'four source drifts', 'public permission live checks'],
    'unchanged': ['BenefitCard r5 ZIP/manual/compiled', 'Editor/core product source and installed dist', 'historical receipts']})
files = [root / 'contract.manual.json', root / 'compiled/component-contract.v2.json']
files += [root / s['path'] for s in inventory['sources'] if s['path'].endswith('.json')]
write(run / 'input-inventory.json', {'schemaVersion': 'apollo.contract-authoring-inputs.v1', 'contractId': 'core.web.link',
    'files': [{'name': str(p.relative_to(root)), 'path': str(p), 'sha256': sha(p)} for p in files]})
print(json.dumps({'coverageEntries': len(entries), 'patternRules': len(pattern_ids), 'cases': len(cases), 'run': str(run)}))
