# Spinner — самостоятельный ComponentContract, r8 / Figma predicates Ready

Пакет изолирован: production Apollo, исходные Athena-каталоги, ds-ai-hub и Button
не переписаны. Решение о границах: [COMPONENT_OWNERSHIP.md](../COMPONENT_OWNERSHIP.md).

## Текущий этап: Editor 0.2.33 / manual r8

**Финальное ревью завершено:6/6 правил Reviewed.** Auto-layout и effective baseline
приняты в границах объявленных capabilities. r8 меняет только два review status и
revision/date; RuleID,31 predicates, все conditions/constraints/gates неизменны.
Все1008 результатов L01–L06 сохраняются при r8: verdict, trace, coverage, details
(кроме revision-derived IDs). Повторный ручной прогон ради статусов не нужен.
**264 Editor +27 package tests**, typecheck пройдены; ZIP/projections/compiled
пересобраны общим core. r7 сохранён в `history/r7-editor-0.2.33/`.

[Загрузить пакет r8](editor/Spinner.editor-input.zip) в Editor0.2.33, предварительно
экспортировав сессионные изменения. Переустановка/пересборка плагина не требуется.
[Протокол](qa/final-review.2026-09-27.json), [ревью и границы](REVIEW.md).

Ready относится к **описанным Figma-проверкам**, не ко всему будущему контракту:
code mapping/generation остаются Draft; runtime index — draft/unpublished,
production/Button не включены. `reports/readiness.json` вычисляет rule readiness;
его `liveAcceptance=pending` — отсутствие прямого r8 capture. Статусная миграция
доказана отдельной semantic parity, generated reports вручную не редактируются.
Реестр Predicate Ready обновлён и прочитан обратно; production/Hub drift в леджере
не закрыт. Следующий этап — dependency Button→Spinner, без копирования правил.

## История: Editor 0.2.33 / manual r7

**Последний выявленный P0 принят по L01–L06 (2026-09-27 10:53 UTC).** Padding/alignment
получили явные per-property условия в manual: проверять, если свойство активно
хотя бы в экземпляре или независимом эталоне. Оба неактивны → «Не применяется»;
не хватает фактов → неполная проверка. Layout mode, sizing и intrinsic bounds
остаются под проверкой. Условия редактируются в Editor; compiler/Predicate Engine
общие, без Spinner-specific исключений. 6 RuleID и31 predicates сохранены.

**264 Editor +19 scoped package tests пройдены; typecheck — на этапе реализации.** Generated facts12/12
не менялись; Button не подключён. Старые manual/compiled сохранены в
`history/r6-editor-0.2.32/`. **4 reviewed /2 draft; пакет Draft.**

[Шесть кейсов L01–L06 в Figma](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13015-63344)
пройдены в прежней секции. [Инструкция и ожидания](TESTCASES.md#p0-paddingalignment--editor-0233--manual-r7).
Переключение layoutMode у библиотечного Spinner/Fixer не сохранилось в Figma;
такие заготовки удалены, переходы проверены только автоматически. Нельзя выдавать
их за доступные настройки этого компонента. QA: `qa/layout-applicability.2026-09-27.json`.
L01–L03: 0 нарушений; L04: 2 atomic →1 карточка padding; L05/L06: по1 нарушению
alignment. Во всех 6/6 mapped, complete=true, warnings/notExecuted/inconclusive/
excluded=0. Все1008 evaluations, coverage и details replay exact. Новые11 regression
и8 base package tests пройдены; независимый reference, paints и bounds сохранены.
Итог: [протокол приёмки](qa/layout-live-acceptance.2026-09-27.json). Оригинальные
байты отчётов закреплены в `qa/fixtures/layout-r7/*.json.gz`, не в очищаемой папке
выгрузок. Старые 24-case и G01–G04 JSON сейчас отсутствуют: их suites не запускаются,
повторный исторический replay не заявляем. Нормативные документы/пакет/реестр статусов
не менялись. Дальше — review двух Draft правил и решение о готовности; затем Button.

## История предыдущего этапа

**Editor 0.2.32 — целевая приёмка P0 градиентов пройдена (2026-09-27, 09:37 UTC).** Общий capture
сохраняет stops (position/RGBA/bindings), transform и blend mode четырёх типов
градиентов у actual и независимого reference. Неполные данные — unknown с причиной,
а не успешная проверка. Manual r6 и generated facts не менялись; ZIP/compiled
пересобраны. **4 reviewed /2 draft; весь пакет Draft.** [G01–G04 приняты](TESTCASES.md#целевая-приёмка-editor-0232-градиенты):
0/2/2/2 atomic violations; три негативных кейса дают по одной карточке с двумя
RuleID. 6/6 matched, warnings/notExecuted/inconclusive/excluded=0, полный сценарий.
552 evaluations воспроизводятся точно (engine/coverage/details); independent
reference сохраняет исходный градиент. G04 не даёт ложных ошибок из-за modes.
Следующий P0 — применимость неактивных padding/alignment. Button пока не подключён.

На предыдущем этапе 24 исторических отчёта воспроизводились точно со своими compiled; r6/Editor0.2.31
сохраняет 3312 результатов с поправкой на revision-derived ID. Старый compiled
архивирован в `history/r6-editor-0.2.31/compiled/`. При новом compiled0.2.32 старым
capture закономерно не хватает gradient facts: это incomplete, не новая live-приёмка.
[Протокол ревью](REVIEW.md), `qa/rule-review.2026-09-27.json` — история до патча;
`qa/gradient-capture.2026-09-27.json` — результат текущей доработки.
Проверки этапа реализации: **255 Editor +17 package tests**, typecheck. Реестр синхронизирован
и проверен повторным чтением; Ready не выставлен.

**Подготовка приёмки 2026-09-27:** [G01–G04 созданы в Figma](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13010-63367)
в прежней секции Spinner. Проверены библиотечные identity, 48×48/HUG/HUG,
изолированность изменений и читаемость подписей; старые кейсы сохранены.
Четыре прогона приняты; ID/ожидания/фактические изменения сохранены в
`qa/figma-gradient-test-cases.2026-09-27.json`; manual/compiled/ZIP не изменены.
Итог и SHA256 новых отчётов: `qa/gradient-live-acceptance.2026-09-27.json`.
Новые 7 regression +8 base package tests пройдены. Старый review-suite сейчас
не запускается: прежние JSON предыдущей матрицы отсутствуют в `editor/`
(первый missing — `spinner.validation-report.2026-09-27T06-24-38-590Z.json`).
Историческая приёмка сохранена, но её replay в текущем checkout заново не подтверждён.

## Что загрузить

Для **ComponentContract Editor 0.2.33** загрузите **`editor/Spinner.editor-input.zip`**:
это r8, все шесть пользовательских правил r4 и свежие sources r2. Перед импортом
экспортируйте более новые сессионные изменения: импорт не объединяет пакеты.
Исходные manual r2/r4/r5 сохранены в `history/`; старые отчёты не переписаны.
Новые условия strokeWeight/gap хранятся в manual `propertyApplicability`.

- `contract.manual.json` — единственный ручной source of truth, редактируется в Editor.
- `sources/` — 18 активных снимков Athena/raw/ds-ai-hub с sha256 inventory.
- `input/athena-rest/` — свежий read-only ответ Figma, нормализованный каталог и
  capture provenance. Старые Athena-документы сохранены как исторические источники;
  текущие generated facts строятся именно из нового `catalog.json`.
- `history/r1/` — прежний manual и evidence, включая повреждённый каталог, для регрессии.
- `evidence/contract.generated.json` — факты, пересобранные существующим Athena
  converter из закреплённого raw, а не отредактированные вручную.
- `compiled/component-contract.v2.json` — результат общего compiler core.
- `reports/` — coverage, readiness, provenance и crosswalk; все read-only.
- `projections/` — экспериментальные JSON-проекции, ещё не опубликованные документы хаба.
- `runtime/` — локальный unpublished index; production не подключён.

## Собственные правила

`core.web.spinner`: один Figma component set, Size=16/24/48 × Inverted × Static.
Семантика, Figma/code representations, API bindings, примеры и generation profiles
находятся в manual. Code mapping пока Draft: Static не имеет code prop, а code
custom size/lineWidth не имеют точного Figma-аналога. Общий default Size не придуман.

6 source rules → 31 atomic predicate + одна policy-only запись:

- сохранённый Athena RuleID про публичный API — допустимо менять Size/Inverted/Static;
- сохранённый Athena RuleID про effective baseline — 13 явно перечисленных
  appearance/layout свойств корня и потомков, включая identity токена в paints;
- собственный intrinsic width/height текущего варианта, без ручного stretch;
- корень остаётся INSTANCE; дополнительно нужна доказанная библиотечная identity.
- пользовательские auto-layout-1 и visual-style-1 сохранены. Новая применимость
  gap возвращает auto-layout в draft; неизменённый visual-style остаётся reviewed.

Это **не утверждение о полном покрытии всех Figma-свойств**. Geometry/vector paths,
анимация и сценарии timeout/cancel не проверяются этим набором. Последние принадлежат
паттерну/кодовой проверке. Detach теряет identity: ожидается отказ сопоставления/
неполная проверка, а не обещание автоматически распознать любой detached frame.
Button-specific размеры/палитра и продуктовые запреты в Spinner не включены.

## P0 генератора исправлен: 12/12 структур

Исправлена потеря rename-only/empty patches и добавленных узлов в общем converter.
В r1 raw для **Size=24, Static=True, Inverted=False** содержал `add id=6`, затем
`remove id=6` при уже существующем id=6. Причина — независимая DFS-нумерация variants,
ошибочно использованная как namespace base. Исправлены Athena CLI и Figma-плагин:
новым узлам выдаются ID выше всех base ID, а parentId переводится в тот же namespace.
Дубликаты ID, отсутствующие родители, циклы и несколько корней отвергаются.

2026-09-26T17:51:18.088Z выполнено read-only чтение настоящего Spinner component set
из Figma REST. После нового экспорта topology **всех 12 вариантов** совпадает с
исходными деревьями REST. У проблемного варианта теперь `add id=7` / `remove id=6`.
См. `input/athena-rest/capture.json` и `reports/generated-facts.json`.
Правила, ограничения и семантика r1 не менялись; r2 обновляет sources/provenance.
Старый r1 остаётся ошибочным и тестируется как неполный — никакого угадывания repair.
Production-каталоги не перезаписаны: ранее опубликованные повреждённые выгрузки
потребуют нового экспорта. Структурная сверка источника не заменяет live-приёмку Editor.

Ещё одно расхождение источников: `figma-keys.json` хаба говорит «swap в Addon»,
а adapter/bridge требуют `Addon.Type=Spinner`, прямо «не swap glyph». При подключении
используем подтверждённый variant route; формулировка хаба требует отдельной сверки.

## Приёмка в Figma

**2026-09-27 06:24–06:44 UTC — 24/24 кейса приняты:** [матрица и результаты](TESTCASES.md).
A01–A11 — 0 нарушений; B01–B11 — только width/height после Scale ×1,5;
C01–C02 — утрата token binding при неизменных RGB/opacity, по два срабатывания.
Во всех 24: 6/6 matched, 138 evaluations, 18 not-applicable, warnings/неисполненные
проверки/неопределённые результаты/ошибки compiler отсутствуют. Engine, coverage,
details replay exact; manual/compiled равны canonical r5; variant/semantic API и
независимый reference согласованы с каталогом. Проблемный Static=True/Size24/False
прошёл A01/B01. С прежним Size48/False/False проверены все 12 исходных вариантов.
Последний **B04** принят отчётом 06:44:09 UTC: Size16/Static=False/Inverted=False,
Scale16→24, только width/height. Матрица закрыта; всего 3312 evaluations.
[Машиночитаемая приёмка](qa/live-acceptance.2026-09-27.json) содержит связь с файлами
и SHA256. Правила/статусы не изменялись: ещё 5 unreviewed, контракт остаётся Draft.

**2026-09-27 05:09 UTC — применимость r5 принята на Size48/False/False.**
В четырёх отчётах `editor/spinner.validation-report.2026-09-27T05-09-*.json`:
`09-857Z` — 0 срабатываний; `19-150Z` — 4 (root HUG→FIXED и token detach,
два правила на каждое); `27-838Z` — 7 (дополнительно width48→300 и Fixer FIXED→FILL);
`35-127Z` — только два нарушения width/height48→80. Лишние strokeWeight/gap исчезли.
138 evaluations, 18 явных not-applicable с объяснением; 6/6 matched, warnings=[],
полнота сценария true, notExecuted/inconclusive/excluded=0. Повторный расчёт
engine/coverage/details совпадает точно; manual и compiled равны canonical r5.
Все шесть RuleID сохранены, применены свежие r2 sources. Статусы правил не менялись.

На момент серии 05:09 оставшиеся 11 комбинаций ещё не были проверены live;
актуальная расширенная приёмка приведена выше. Spinner остаётся Draft; Button не подключён.
Локальная регрессия: 233 Editor tests + 8 package tests, Chrome JSON/ZIP roundtrip,
сохранение 13 явных baseline constraints. Ниже — история предыдущей приёмки.

**Актуально — 2026-09-26 18:52 UTC: P0 размеров принят на Size48/False/False.**
Четыре отчёта `editor/spinner.validation-report.2026-09-26T18-52-*.json`, Editor0.2.30:

| Окончание имени | Сценарий | Atomic violations |
|---|---|---:|
| `14-865Z` | Исходный 48×48, все проверки compliant | 0 |
| `25-332Z` | HUG→FIXED и отвязанный токен Ellipse1; по два правила на изменение | 4 |
| `32-826Z` | 300×48: ширина48→300 найдена; дополнительно Fixer FIXED→FILL | 7 |
| `39-004Z` | Scale80×80: ширина и высота48→80 + прежние strokeWeight/gap | 10 |

Во всех отчётах независимый baseline48×48, 6/6 matched, warnings=[], 132 evaluations,
scenario complete=true, notExecuted/inconclusive/excluded=0. Engine, Editor coverage
и serialized details воспроизводятся точно; старые findings не потеряны.
Третий макет отличается от прошлого resize-кейса ещё и настройкой Fixer: это
два дополнительных срабатывания, а не регрессия патча. Manual r4 и его hash
не изменились, source evidence по-прежнему исторический r1.

Это приёмка размерного P0, не всего контракта. Применимость неактивных strokeWeight/gap,
пересечения правил и остальные варианты (особенно Static=True/24/False со свежими
sources) остаются открытыми. Canonical r2 и Button не изменялись; Spinner остаётся Draft.

### История диагностики и исправления

**Результат 2026-09-26 18:17–18:18 UTC: частичная приёмка, P0 в Editor.**
Три отчёта `editor/spinner.validation-report.2026-09-26T18-*.json` проверяют
Size48/Static=False/Inverted=False. 6/6 узлов сопоставлены, warnings нет;
engine/coverage/details воспроизводятся точно. Отвязка токена Ellipse1 при том же
цвете обнаружена. Однако baseline теряет width/height: даже при actual width300
intrinsic-size остаётся «Не выполнено». Надпись «Целевой слой не найден» неточна:
найденный root не имеет размеров независимого эталона. Контракт остаётся Draft.

В отчётах manual r4: четыре исходных правила сохранены, добавлены auto-layout и
visual-style. Их пересечение с прежним правилом даёт четыре atomic violations на
два фактических изменения (HUG→FIXED и token detach). Источники этой сессии ещё
соответствуют r1, не свежему r2; два пользовательских правила нельзя потерять при
обновлении ZIP. Они сохранены в `sources.manual` самих отчётов; canonical manual
этой папки не перезаписан. Static=True/24/False пока не проверен пользователем.

**Исправление Editor0.2.30:** общий capture/materialization теперь сохраняет размеры
независимого reference. Preview, selected-instance и новые nested captures получают
width/height без координат временной страницы; размеры actual не становятся эталоном.
Missing reference width/height даёт явную причину с fact path и неполную проверку,
а не «Целевой слой не найден». Нормативный manual и его revision не менялись;
compiled/reports/ZIP пересобраны общим compiler core.

**Дополнительный Scale-прогон 18:22:13 UTC:** Size остаётся48, actual80×80;
все шесть узлов выросли в5/3 раза, заливки и токены сохранены. Exact replay пройден,
но intrinsic-size снова не выполнен. 8 atomic violations — шесть strokeWeight
при пустых strokes и два gap у корня с одним ребёнком. Это подтверждает P0 bounds
и необходимость уточнить применимость проверок неактивных свойств. Scale добавлен
в обязательные сценарии приёмки бэклога. P0 размеров исправлен локально; полная
live-приёмка и уточнение применимости неактивных свойств ещё впереди.

Четыре исходных отчёта0.2.29 воспроизводятся точно. В новой Plugin API simulation
реальный bundled controller использует раздельные actual/reference из тех же captures:
48×48 — без size violations; 300×48 — width48→300; 80×80 — оба размера48→80.
Прежние findings сохранены (итого 0/4/5/10 atomic violations), manual r4 неизменён.
Ни strokeWeight без stroke, ни gap с одним ребёнком молча не исключались:
для этого нужна отдельная явная политика применимости, зафиксированная в бэклоге.

1. Выделить настоящий Spinner, начать с Size=16/24/48, Static=False, Inverted=False.
   Ожидание: нет нарушений собственного контракта; затем проверить Inverted=True.
2. На копии вручную изменить width; на другой применить Scale, не меняя Size.
   В обоих случаях ожидается нарушение intrinsic-size по независимому reference.
3. На другой копии отвязать переменную заливки внутреннего слоя, сохранив цвет;
   ожидается style/token violation. Вернуть токен — нарушение исчезает.
4. Проверить прежний проблемный Static=True/24/False: при доступном независимом
   baseline ожидается полная проверка без нарушений, как у остальных вариантов.
5. Скачать JSON-отчёты правильного и изменённого instance. Только после приёмки
   подключать собственный контракт Spinner к Button, не копируя его правила.

Локальные гейты: 8 regression tests Spinner (12 вариантов, сравнение с реальным REST,
width/token, unknown, отказ старого r1, ZIP/manual roundtrip и source hashes),
78 тестов CLI и 56 parity/topology сценариев CLI ↔ плагин, включая sanitized export.
222 теста Editor и converter self-test проходят. Проверяемый instance
в локальных тестах синтетический; live-приёмка размеров отдельно подтверждена выше,
полная приёмка Spinner ещё не выполнена.
CLI/Editor typecheck проходит. Athena plugin build/regression проходит, но полный
tsc имеет 32 прежние ошибки (0 новых относительно HEAD затронутых TS); долг
отмечен в README плагина и бэклоге Editor.
Chrome UI0.2.30: импорт пользовательского r4, четыре capture-сценария, missing width,
проверка с Product, скачивание JSON, экспорт/повторный импорт и точное browser/Node
parity пройдены. Все шесть правил r4 сохраняются. Это не новая live-приёмка в Figma.

Реестр синхронизирован с проверкой чтением: Правила 1716/1717/1833/1834,
Леджер 53/54, Core components Predicate AF61:AH61 — Draft / 2026-09-26.

Пересборка из закреплённых sources (manual не переписывается):

```sh
node scripts/build_component_contract_reference.js experiments/web-core/core/Spinner
node --test scripts/tests/spinner-contract.test.js
```

При обновлении источников сначала review, затем обновление sourceHash в manual;
`--refresh-sources` проверяет hash и не разрешает незаметно заменить evidence.
