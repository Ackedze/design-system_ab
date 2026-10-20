from pathlib import Path
import copy
import hashlib
import json
import re

W = Path('/Users/alexkukhta/Desktop/workplace')
S = W / 'shared/design-system_ab'
H = W / 'ds-ai-hub'
R = Path(__file__).parent
B = R.parent / 'owner-scope-2026-10-16'
changes = []

def pin(path):
    data = path.read_bytes()
    return dict(path=str(path), sha256=hashlib.sha256(data).hexdigest(), bytes=len(data))

def read(path):
    return json.loads(path.read_text())

def emit(root, relative, text):
    actual = root / relative
    destination = R / 'payload' / root.name / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(text.rstrip() + '\n')
    changes.append(dict(target=str(actual), before=pin(actual) if actual.exists() else None,
                        payload=pin(destination)))

def emit_json(root, relative, data):
    emit(root, relative, json.dumps(data, ensure_ascii=False, indent=2))

def blocks(text):
    return re.findall(r'### Rule \d+:[\s\S]*?(?=### Rule \d+:|## Section |\Z)', text)

def rule_id(block):
    return re.search(r'^- ruleId: (.+)$', block, re.M).group(1)

def renumber(text):
    counter = iter(range(1, 1000))
    return re.sub(r'### Rule \d+:', lambda _: f'### Rule {next(counter)}:', text)

def header(title, identity, kind):
    return f'''# Pattern: {title}

- documentType: pattern
- patternType: {kind}
- patternId: ptrn:{identity}
- patternKey: {identity}
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Design System
- status: draft
- updatedAt: 2026-10-16
- sourceType: owner-decision
- tags: backgroundplate, composition, contracts
- figmaLink: none
- sections: 10
'''

def pattern(title, identity, kind, definition, usage, rules, valid, invalid, machine):
    text = header(title, identity, kind)
    bodies = [definition, usage, 'Не применяйте норму вне указанного контекста или без доказанных входных данных.',
              'Каждая норма имеет одного владельца. Контракт компонента хранит ссылку на внешнюю норму, а не её копию.',
              'Контекст проверки задаётся отдельно от свойств проверяемого экземпляра. Отсутствующий факт не заменяется предположением.',
              '\n\n'.join(rules), valid, valid, invalid,
              '### Детерминированные проверки\n\n' + machine +
              '\n\n### Словарные проверки\n\nИмя слоя или совпадение названия токена не доказывают identity.\n\n' +
              '### LLM-проверки\n\nУточняют применимый сценарий по предоставленному контексту.\n\n' +
              '### Не проверяется автоматически\n\nНеполный контекст, недоступный registry или неподтверждённый mapping дают UNKNOWN либо ручную проверку. Этот документ не заявляет готовность runtime.\n\n' +
              '### Автоисправления\n\nАвтоматическое исправление не предусмотрено.']
    titles = ['Определение', 'Когда использовать', 'Когда не использовать', 'Принципы', 'Структура текста',
              'Правила', 'Шаблоны', 'Примеры', 'Антипримеры', 'Машинная обработка']
    return text + ''.join(f'\n## Section {i}: {title}\n\n{body}\n' for i, (title, body) in enumerate(zip(titles, bodies), 1))

def norm(number, title, identity, body, correct, incorrect, why, check='deterministic', scope='screen'):
    return f'''### Rule {number}: {title}

- ruleId: {identity}
- severity: error
- appliesTo: {scope}
- checkType: {check}
- autofix: no

{body}

#### Правильно

{correct}

#### Неправильно

{incorrect}

#### Почему

{why}'''

def hub(text, identity, target):
    return f'''---
id: ptrn:{identity}
layer: product
product: ab
platforms: [web]
targets: [{target}]
status: draft
lastReviewed: 2026-10-16
---

''' + text

decisions = read(B / 'owner-decisions.json')
source = S / 'JSONS/web/components/web-corp/BackgroundPlate'
source_rules = read(source / 'rules.json')['manual']['rules']
by_suffix = {r['ruleId'].split('.')[-1]: r for r in source_rules}
ids = decisions['decisions'][0]['ruleIds']
specs = [
    ('Размещай Level 2 поверх Level 1', 'level-2-requires-level-1', ids[0],
     'Level 1 — абсолютная подложка перед Auto-веткой Level 2 в общем Auto Layout; покрывает её область.',
     'Самостоятельный Level 2 либо подложка после контента или без покрытия.', 'Вложенная поверхность зависит от реальной композиции, а не от одного значения Position.'),
    ('Ограничивай уровни внутри Slot', 'slot-content-levels', ids[1],
     'Обычный контент напрямую в Slot; отдельный Level 2 добавлен только при необходимости.',
     'Вложенный BackgroundPlate Level 0 или Level 1.', 'Обычному контенту не требуется обязательная обёртка Level 2.'),
    ('Назначай Level 0 главной поверхности', 'root-surface-requires-level-0', ids[2],
     'Level-0 (base) назначен главной поверхности страницы или модальной сущности.',
     'Level 0 назначен самому BackgroundPlate либо отсутствует у главной поверхности.', 'Родительский variable context определяет исходный уровень вложенной подложки.'),
    ('Выбирай BackgroundColor по контексту поверхности', 'background-color-by-surface-context', ids[3],
     'Page gray → base-bg-alt (gray); page white → base-bg (white); modal gray → modal-bg-alt (gray); modal white → modal-bg (white).',
     'Контекст modal проверяется как page или gray выбирается для white без основания.', 'Фон определяется конкретной родительской поверхностью. Требования единого BackgroundColor для всех подложек нет.')
]
assembly_rules = [norm(i, title, identity, by_suffix[suffix]['ruleText'], good, bad, why)
                  for i, (title, suffix, identity, good, bad, why) in enumerate(specs, 1)]
assembly = pattern('Сборка поверхностей страницы', 'layout.surface-composition', 'layout',
    'Правила композиции BackgroundPlate на странице и в модальной сущности.',
    'При сборке главной поверхности, вложенных подложек и содержимого BackgroundPlateSlot.', assembly_rules,
    '```text\nPage / Modal: Level 0\nОбщий Auto Layout:\n  Level 1: ABSOLUTE, перед контентом, покрывает Level 2\n  Контентная Auto-ветка: Level 2\n```',
    '```text\nLevel 2 размещён самостоятельно, без подложки Level 1.\n```',
    'Полный captured graph, порядок sibling-узлов, positioning, bounds, canonical component identity, modes главной поверхности и явный page/modal × gray/white context. Четыре нормы проверяются раздельно.')
global_rules = [
    norm(1, 'Используй токены разрешённых библиотек', 'rule:system.library-tokens-only',
         'Каждый используемый токен должен принадлежать разрешённой опубликованной библиотеке дизайн-системы. Локальные и кастомные токены запрещены. Обязательность token binding конкретного свойства задаётся его отдельным контрактом; это правило проверяет принадлежность уже выбранного токена.',
         'Canonical token key найден в принятом registry разрешённой библиотеки.',
         'Локальный или кастомный токен, включая копию с тем же именем и значением.',
         'Имя, RGB, remote=true или просто наличие binding не доказывают принадлежность разрешённой библиотеке.', scope='component'),
    norm(2, 'Сопоставляй компонент с выбранным каналом', 'rule:system.component-channel-match',
         'Desktop/mobile-web версия компонента должна соответствовать каналу, выбранному пользователем в интерфейсе плагина. Expected channel поступает из переключателя UI независимо от проверяемого компонента; actual platform определяется по canonical component identity.',
         'UI desktop и desktop-компонент; UI mobile-web и mobile-web компонент.',
         'UI mobile-web и desktop-компонент. Вывод expected channel из самого экземпляра также недопустим.',
         'Иначе проверка сравнивает компонент с ним самим и пропускает неправильную версию.', scope='component')
]
global_pattern = pattern('Общие правила использования дизайн-системы', 'system.design-system-usage', 'visual',
    'Общие нормы выбора токенов и версии компонента для канала.',
    'При проверке компонентов независимо от их семейства.', global_rules,
    '```text\nUI channel: mobile-web\nComponent identity: mobile-web\nApplied token key: approved published library\n```',
    '```text\nUI channel: desktop\nComponent identity: mobile-web\nToken: local copy\n```',
    'Проверять canonical token identity по принятому registry и независимый UI channel. Missing registry или UI context → UNKNOWN, известное несовпадение → error. Не дублировать component binding checks.')
loading_rule = norm(1, 'Используй штатное состояние загрузки BackgroundPlate',
    'rule:components.background-plate.skeleton-variant', by_suffix['skeleton-is-component-property']['ruleText'],
    'Для обычной загрузки включён Skeleton=True; сложное исключение имеет ссылку на применимый паттерн.',
    'Штатная загрузка заменена ручными placeholder-слоями без подтверждённого исключения.',
    'Норма описывает выбор состояния в сценарии использования, а не запрет переключения публичного API.', check='manual', scope='flow')
loading = pattern('Использование состояний загрузки', 'ux.loading-states', 'ux',
    'Выбор штатного loading-состояния и явно описанных исключений.',
    'При проектировании загрузки BackgroundPlate или его содержимого. API других компонентов не предполагается автоматически.',
    [loading_rule], '```text\nBackgroundPlate\nSkeleton=True\n```',
    '```text\nОбычная загрузка собрана вручную при доступном Skeleton=True.\n```',
    'Само значение Skeleton читается из component API. Решение о необходимости loading и наличии сложного исключения требует контекста сценария; один static snapshot не доказывает весь сценарий.')
for filename, identity, text, target in [
    ('surface-composition', 'layout.surface-composition', assembly, 'figma'),
    ('design-system-usage', 'system.design-system-usage', global_pattern, 'figma'),
    ('loading-states', 'ux.loading-states', loading, 'figma, code')]:
    emit(S, f'patterns/p_{filename}.md', text)
    emit(H, f'products/ab/patterns/{filename}.md', hub(text, identity, target))

# Apply only to staged copies; source files remain frozen.
remove_ids = {identity for d in decisions['decisions']
              if d['action'] in ['move', 'delete', 'passport'] and d['destination'] != 'surface-usage-pattern'
              for identity in d['ruleIds']}
remove_ids.add('rule:components.background-plate.platform-version-must-match')
def component_pattern(text):
    for block in blocks(text):
        identity = rule_id(block)
        if identity in remove_ids:
            text = text.replace(block, '')
        elif identity == 'rule:components.background-plate.border-not-clickable':
            new = block.replace('- appliesTo: component', '- appliesTo: flow').replace('- checkType: llm', '- checkType: manual')
            new += 'Нормативный владелец — паттерн использования. Проверка по фактическому code mapping и поведению; интерактивный вложенный Link или Button допустим. Static Figma snapshot не доказывает кликабельность всей поверхности.\n\n'
            text = text.replace(block, new)
        elif identity == 'rule:components.background-plate.clickable-in-code-only':
            # Eligibility belongs to the preceding usage rule; this one covers implementation.
            old = 'Кликабельность всей поверхности `BackgroundPlate` допустима для `Primary`, `Secondary` и `Colored` и активируется только в коде компонента.'
            new = 'Кликабельность всей поверхности `BackgroundPlate` активируется через предусмотренную реализацию в коде компонента.'
            text = text.replace(block, block.replace(old, new).replace(' `Border` не может быть кликабельным.', ''))
    text = re.sub(r'(?m)^.*(?:сохранить единый фон подложек|фон подложек на одной странице выбирается|Значение `BackgroundColor` определяется один раз|К BackgroundPlate нельзя добавлять Drop shadow|Проверять, что все `BackgroundPlate` на странице используют один|Выставить единый `BackgroundColor` на странице).*(?:\n|$)', '', text)
    text = text.replace('Ручные Drop shadow и Inner shadow запрещены. ', '')
    text = text.replace('Не применяйте к blur правило, запрещающее `Drop shadow` и `Inner shadow`.\n', '')
    text = re.sub(r'(?m)^- (?:Проверять, что служебные `Style Level|Проверять совпадение версии|Проверять, что `Position=Level 2|Проверять соответствие `BackgroundColor`|Проверять, что `Type=Border` не помечен|Проверять, что loading-состояние|Включить `Skeleton=True` вместо).*(?:\n|$)', '', text)
    text = re.sub(r'### Антипример 2: смешанные фоны на странице\n[\s\S]*?(?=### Антипример 3:)', '', text)
    text = text.replace('- updatedAt: 2026-07-10', '- updatedAt: 2026-10-16')
    text = re.sub(r'(?m)^- updatedAt: .+$', '- updatedAt: 2026-10-16', text)
    text = text.replace('status: verified', 'status: draft')
    text = re.sub(r'(?m)^lastReviewed: .+$', 'lastReviewed: 2026-10-16', text)
    pointer = ('Сборка уровней и выбор page/modal BackgroundColor описаны в [паттерне поверхностей](surface-composition.md). '
               'Общие токены и канал — в [правилах дизайн-системы](design-system-usage.md); '
               'загрузка — в [паттерне загрузки](loading-states.md); Promo Radius — в [паттерне лендингов](landing-pages.md). '
               'Public/auxiliary определяется паспортом по canonical key.\n\n')
    text = text.replace('## Section 6: Правила\n\n', '## Section 6: Правила\n\n' + pointer)
    return renumber(text)

for root, relative in [(S, 'patterns/p_background-plate.md'), (H, 'products/ab/patterns/background-plate.md')]:
    text = component_pattern((root / relative).read_text())
    if root == S:
        for name in ['surface-composition', 'design-system-usage', 'loading-states', 'landing-pages']:
            text = text.replace(f']({name}.md)', f'](p_{name}.md)')
    emit(root, relative, text)

promo_rule = norm(1, 'Используй Promo Radius для BackgroundPlateSlot на лендинге',
    'rule:components.background-plate.promo-slot-radius-collection', by_suffix['promo-slot-radius-collection']['ruleText'],
    'BackgroundPlateSlot на promo-странице связан с [Promo] BackgroundPlate Radius.',
    'Обычная radius collection или ручной corner radius вместо promo collection.',
    'Это требование к сборке лендинга. Паспорт компонента содержит ссылку, а не второй активный запрет.', check='manual')
for root, relative in [(S, 'patterns/p_landing-pages.md'), (H, 'products/ab/patterns/landing-pages.md')]:
    text = (root / relative).read_text()
    assert 'rule:components.background-plate.promo-slot-radius-collection' not in text
    text = text.replace('## Section 7:', promo_rule + '\n\n## Section 7:', 1)
    text = re.sub(r'(?m)^- updatedAt: .+$', '- updatedAt: 2026-10-16', text)
    text = re.sub(r'(?m)^lastReviewed: .+$', 'lastReviewed: 2026-10-16', text).replace('status: verified', 'status: draft')
    emit(root, relative, renumber(text))

emit_json(S, 'JSONS/web/components/web-corp/BackgroundPlate/rules.json', read(B / 'source-rules.patch.json')['result'])

# Passport classifications keep native keys and generation admission flags intact.
override = read(source / 'contract.overrides.json')
for item in override['manual']['publicApi']['components']:
    item['exposure'] = 'auxiliary' if item['role'] == 'internal-style' else 'public'
    item['standaloneAllowed'] = item['exposure'] == 'public'
v = override['manual']['generationPolicy']['variableDrivenBehavior']
v.pop('shadowPolicy')
v['blurPolicy']['generationRule'] = 'Layer blur и Background blur разрешены по контексту композиции.'
v['levelPolicy'] = {key:value for key,value in v['levelPolicy'].items() if key in ['property','componentValues']}
v['levelPolicy']['patternRef'] = 'ptrn:layout.surface-composition'
for key in ['preferredLoadingImplementation','complexLoadingException']:
    v['skeletonPolicy'].pop(key, None)
v['skeletonPolicy']['patternRef'] = 'ptrn:ux.loading-states'
v['interactionPolicy'] = {'patternRuleRef':'rule:components.background-plate.border-not-clickable', 'verificationTarget':'code-behavior'}
for item in v['typePolicy']['values']:
    if item['value'] == 'Border':
        item['restrictions'] = [x for x in item['restrictions'] if 'кликабельн' not in x]
for key in ['allowedNestedBackgroundPlateLevels','disallowedNestedBackgroundPlateLevels','nestedLevel2Placement','generationRule']:
    v['slotContentPolicy'].pop(key, None)
v['slotContentPolicy']['compositionPatternRef'] = 'ptrn:layout.surface-composition'
v['modePolicy'] = 'Выбор контекста поверхности: ptrn:layout.surface-composition. API, collections и native modes сохраняются в этом паспорте.'
override['metadata']['status'] = 'draft'
override['metadata']['applicability']['updatedAt'] = '2026-10-16'
emit_json(S, 'JSONS/web/components/web-corp/BackgroundPlate/contract.overrides.json', override)

context = read(source / 'agent-context.json')
def clean_strings(value):
    if isinstance(value, dict):
        return {k:clean_strings(v) for k,v in value.items()}
    if isinstance(value, list):
        return [clean_strings(v) for v in value]
    if isinstance(value, str):
        return re.sub(r'Drop shadow и Inner shadow запрещены;\s*', '', value)
    return value
context['manual'] = clean_strings(context['manual'])
context['manual']['patternReferences'] = ['ptrn:components.background-plate', 'ptrn:layout.surface-composition', 'ptrn:system.design-system-usage', 'ptrn:ux.loading-states', 'ptrn:landing-pages.alfa-business']
context['metadata']['status'] = 'draft'
context['metadata']['applicability']['updatedAt'] = '2026-10-16'
emit_json(S, 'JSONS/web/components/web-corp/BackgroundPlate/agent-context.json', context)

for relative in ['products/ab/components/background-plate/instructions.md',
                 'products/ab/components/background-plate/cookbook/04-paint-and-layout.md',
                 'products/ab/components/background-plate/cookbook/05-verify.md']:
    text = (H / relative).read_text()
    text = re.sub(r'(?m)^.*(?:Требуется единый page/modal background context|Для разных подложек одной поверхности выбираются несогласованные|Все plates одной поверхности используют согласованный|Нет Drop shadow и Inner shadow|\| Drop shadow \||\| Inner shadow \|).*(?:\n|$)', '', text)
    text = text.replace('и используй один контекст для всех её подложек', '')
    text = text.replace('поверхности .', 'поверхности.')
    text = text.replace('Drop shadow и Inner shadow запрещены; ', '')
    text = text.replace('status: verified', 'status: draft')
    text = re.sub(r'(?m)^lastReviewed: .+$', 'lastReviewed: 2026-10-16', text)
    if relative.endswith('instructions.md'):
        text = text.replace('Полный нормативный набор правил —', 'Компонентные нормы и ссылки на внешние паттерны —')
        text = text.replace('## Уровни поверхности\n', '## Уровни поверхности\n\nНормативный владелец — [сборка поверхностей](../../patterns/surface-composition.md). Ниже приведён маршрут настройки.\n')
        text = text.replace('## Skeleton и интерактивность\n', '## Skeleton и интерактивность\n\nНормы сценария загрузки — [loading-states](../../patterns/loading-states.md); кликабельность Border — паттерн использования BackgroundPlate.\n')
        text = text.replace('## Desktop, mobile и promo\n', '## Desktop, mobile и promo\n\nКанал проверяется общим [правилом дизайн-системы](../../patterns/design-system-usage.md). Promo Radius относится к [паттерну лендингов](../../patterns/landing-pages.md).\n')
    emit(H, relative, text)

meta = read(H / 'products/ab/components/background-plate/meta.json')
api = override['manual']['publicApi']['components']
meta['publicComponentKeys'] = [x['key'] for x in api if x['exposure'] == 'public']
meta['auxiliaryComponentKeys'] = [x['key'] for x in api if x['exposure'] == 'auxiliary']
meta['auxiliaryComponentRoots'] = [x['name'] for x in api if x['exposure'] == 'auxiliary']
meta['lastReviewed'] = '2026-10-16'
meta['status']['figma'] = 'draft'
emit_json(H, 'products/ab/components/background-plate/meta.json', meta)

# Active crosswalk uses existing human rules and preserves unrelated entries.
crosswalk = read(S / 'apollo/rule-crosswalk.json')
crosswalk['documents']['backgroundPlatePattern'] = {'path':'products/ab/patterns/background-plate.md'}
crosswalk['documents']['backgroundPlateInstructions'] = {'path':'products/ab/components/background-plate/instructions.md'}
crosswalk['documents']['backgroundPlatePaintCookbook'] = {'path':'products/ab/components/background-plate/cookbook/04-paint-and-layout.md'}
staged_hub = (R / 'payload/ds-ai-hub/products/ab/patterns/background-plate.md').read_text()
human = {rule_id(b):b.splitlines()[0].removeprefix('### ') for b in blocks(staged_hub)}
special = {
    'radius-is-fixed-by-component-baseline':['radius-fixed-by-component'],
    'padding-is-designer-controlled':['padding-is-designer-controlled'],
    'colored-and-border-use-color-tokens':['colored-fill-only','border-stroke-is-designer-controlled'],
    'border-stroke-is-designer-controlled':['border-stroke-is-designer-controlled']
}
proposed = read(B / 'source-rules.patch.json')['result']['manual']['rules']
added = []
for rule in proposed:
    suffix = rule['ruleId'].split('.')[-1]
    refs = [rule['patternRuleId']] if 'patternRuleId' in rule else [f'rule:components.background-plate.{x}' for x in special.get(suffix,[])]
    if refs:
        assert all(x in human for x in refs), refs
        evidence = [dict(kind='named-rule', document='backgroundPlatePattern',ruleId=x,heading=human[x]) for x in refs]
    elif suffix == 'background-plate-view-is-alias':
        evidence = [dict(kind='section',document='backgroundPlateInstructions',heading='Граница семейства')]
    elif suffix == 'layer-properties-use-effective-baseline':
        evidence = [dict(kind='section',document='backgroundPlatePaintCookbook',heading='Reset')]
    else:
        evidence = [dict(kind='technical-only',reason='Classification of public component properties; not an additional product restriction.')]
    added.append(dict(apolloRuleId=rule['ruleId'],apolloSource='JSONS/web/components/web-corp/BackgroundPlate/rules.json',
        relation='semantic-support',enforcementScope='BackgroundPlate component scope',hubEvidence=evidence,
        review=dict(status='draft',reviewedAt='2026-10-16',basis='Owner scope decisions; staged source/human correspondence. Shared application and runtime acceptance pending.')))
assert not any(e['apolloRuleId'].startswith('component:web-corp.background-plate.') for e in crosswalk['entries'])
crosswalk['entries'].extend(added)
emit_json(S, 'apollo/rule-crosswalk.json', crosswalk)

migration = []
for decision in decisions['decisions']:
    migration.append(dict(annotation=decision['annotation'],action=decision['action'],
        previousSourceRuleIds=['component:web-corp.background-plate.'+s for s in decision['sourceSuffixes']],
        currentOwner=decision['destination'],humanRuleIds=decision['ruleIds'],status='STAGED_NOT_APPLIED'))
(R/'norm-routing-crosswalk.json').write_text(json.dumps(dict(schemaVersion=1,entries=migration),ensure_ascii=False,indent=2)+'\n')

(R / 'CHANGE-MANIFEST.json').write_text(json.dumps(dict(status='PRIVATE_PREPARATION_NOT_APPLIED',
    ownerDecisions=pin(B/'owner-decisions.json'), priorSeal=pin(B/'SEAL.json'), changes=changes,
    generationPilotScope='UNCHANGED', sharedWrites=0, Ready=False), ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(status='PRIVATE_PAYLOAD_PREPARED', files=len(changes), sharedWrites=0)))
