# Button — контракт компонента

## Статус · 29 сентября 2026

**Button r31 — Ready для компонентных проверок в Figma.**
Редактор: ComponentContract Editor **0.2.52**. Вложенный Spinner **r8** закреплён
ревизией и хешами. Четыре Figma-представления: desktop/mobile, ordinary/inverted.

22 правила reviewed: 19 исполняемых требований →60 RuleIR и3 policy-only разрешения.
Ошибок, предупреждений, исключённых правил и неразрешённых целей компилятора нет.
Статус получен по итогам отдельного ревью каждого правила, не одного зелёного прогона.

**Это не production-релиз и не готовность проверки фронта.** Code-представления
desktop/mobile/adaptive остаются draft. Пакет не добавлен в production runtime index.
Паттерны применения, продукты, каналы и редакционная политика не входят в Button.

## Какие файлы использовать

| Задача | Файл |
|---|---|
| Посмотреть или изменить норму | [contract.manual.json](contract.manual.json) — единственный ручной source of truth |
| Открыть и проверить в Editor | [editor/Button.editor-input.zip](editor/Button.editor-input.zip) — готовый входной пакет r31 |
| Подключить потребителя контракта | [compiled/component-contract.v2.json](compiled/component-contract.v2.json) — read-only результат общего compiler core |
| Проверить происхождение и полноту | [reports/rule-crosswalk.json](reports/rule-crosswalk.json), [reports/coverage.json](reports/coverage.json), [reports/ownership.json](reports/ownership.json) |
| Проверить основания Ready | [qa/final-readiness-r31.2026-09-29.json](qa/final-readiness-r31.2026-09-29.json) |
| Повторить регрессию вручную | [TESTCASES.md](TESTCASES.md) |
| Изучить историю решений | [CHANGELOG.md](CHANGELOG.md), [history/](history/) |

Для коллеги достаточно этой папки либо manual + compiled + README + TESTCASES +
финального QA. Для работы в Editor дополнительно передать ZIP.
В ZIP лежат manual, восемь Athena evidence JSON, каталог ассетов и compiled Spinner.
**Compiled Button во входном ZIP нет:** Editor собирает его из источников.

Папки sources/ — read-only снимки Athena и ds-ai-hub, не параллельные нормативные
источники. projections/athena и projections/ds-ai-hub — производные документы.
runtime/component-contract.index.json — только экспериментальная запись,
published=false. Production-репозитории автоматически не мигрированы.

## Что именно завершено

- У каждого правила сохранён прежний RuleID и компонентный владелец core.web.button.
- Доказаны представления и выбор instance по ключу, а не по текущей вкладке/имени.
- Проверяются допустимые настройки, анатомия, layout, текст, baseline-стили,
  addon/иконки, Loading, сохранение ширины при переходе, палитра Spinner и ControlBlur.
- Spinner подключён через componentDependencies и два слота left/right.
  Button ограничивает размер/палитру композиции; собственные правила Spinner
  выполняются из закреплённого дочернего контракта, не копируются в Button.
- Старый неиспользуемый target.spinner удалён: ни одно правило/порт его не ссылало.
  Настоящие dependency bindings и Spinner r8 сохранены, missing не подменялся resolved.
- Generated facts, ограничения, условия и исполняемые предикаты не изменились.
  r31 фиксирует приёмку16 draft-правил и уточняет устаревшие пояснения.
- r30 сохранён в [неизменяемом архиве](history/r30-editor-0.2.52/manifest.json).

Рабочие профили генерации описывают настройки одного компонента. Их наличие не
обещает готовый генератор экранов или проверенную генерацию React-кода.

### Граница компонента и паттерна

Пять правил применения с прежними ID находятся только в
[источнике будущего паттерна кнопок](../../../patterns/buttons-and-button-groups/rules.manual.json).
Его исполнение ещё не подключено. В Button нет нормативных копий, делегированных
заглушек и ложного обещания проверки продуктового применения.

### Два режима проверки

**Аудит компонента:** собственные ограничения проверяются без внешней спецификации.

**По спецификации:** дополнительно задаются независимые ожидания block, textResizing,
nowrap и контекст constrainedWidth. Это входы сценария, не вымышленные Figma props.
Значения не выводятся из actual. Для Loading width нужна пара «до/после» того же
instance при неизменных внешних условиях.

Ready — готовность контракта, а не обещание полной проверки любого снимка.
Без необходимых фактов/ожиданий/пары результат остаётся unknown или «Не выполнено»,
проверка неполна. Policy-only разрешения — не пропущенные проверки.

### Ключевые согласованные нормы

- Root width: Hug / Fill / Fixed; height: Hug. Внутренняя геометрия защищена.
- Text/Label/видимый Hint: согласованный Hug либо Fill. Fill → Auto height + Center;
  Hug → Auto width и baseline alignment. Остальные свойства не разблокируются.
- nowrap=false требует Fill только при явно ограниченной ширине контейнера.
  Отсутствие контекста не превращается в разрешение.
- Hint проверяется по эффективной видимости, а не только BOOLEAN. Видимый Hint:
  Size56/64/72. Loading содержит только один Spinner нужного размера.
- Button32/40 → Spinner16; Button48/56/64/72 → Spinner24. Size и Scale независимы.
- Палитра Spinner (Inverted/Static), D/M32–72, оба слота:

| View | Ordinary Button | Button_Inverted |
|---|---|---|
| Accent | True / True | True / True |
| Primary | True / False | False / False |
| Secondary, Outlined, Transparent, Text | False / False | True / False |

- ControlBlur сравнивается с независимым библиотечным baseline конкретного
  componentKey, включая параметры эффекта и published style identity.
  Общая формула «все disabled кроме Text» не является нормой; сохраняются реальные
  библиотечные исключения. Code prop allowBackdropBlur не разрешает Figma override.

## Проверки и основания приёмки

- 438 тестов Editor, typecheck;244 теста Button, включая6 тестов финализации.
- Схемы manual/compiled, ZIP import →compile parity, производные projections.
-115 архивных снимков:32 062 результата r30/r31 совпадают, включая нарушения,
  неизвестные факты и выполнение дочернего контракта. Это offline parity,
  не115 новых запусков плагина.
- ControlBlur:16 свежих live-отчётов,11 штатных кейсов и5 найденных ошибок,
  247/247 сопоставленных узлов,0 capture warnings;4 482 результата точного replay.
- Spinner matrix и nowrap приняты владельцем отдельно. Для этих решений новых
  покейсовых live JSON не было; финализация не приписывает им такие свидетельства.

Карта «RuleID → основание → regression» и хеши находятся в
[финальном QA](qa/final-readiness-r31.2026-09-29.json).
Результаты гейтов и [сверка реестра](qa/final-release-r31.2026-09-29.json):
22 строки правил обновлены, Predicate Ready сохранён;167 изменённых и475 соседних
ячеек прочитаны обратно, native metadata642 ячеек сохранены. Hub drift не закрыт.
Оригинальные JSON с SHA сохранены в qa/fixtures/*.json.gz.
Копии отчётов из editor/ можно удалять, архивы QA и history нужно сохранять.

## Как открыть финальную версию

1. Сохранить незавершённые изменения текущей сессии отдельным экспортом.
2. В Editor0.2.52 импортировать **Button.editor-input.zip r31**.
3. Проверить в заголовке manual r31 и статус контракта Ready.
4. Для проверки выбрать сам Button в Figma. Product не меняет собственные правила.
5. После переимпорта заново задать нужные ожидания и записать пару состояний:
   прежние вводы и пара привязаны к старому manual hash.
6. Для изменения нормы редактировать manual через Editor; compiled не править.
   После нормативной правки заново проверить затронутые правила и пересобрать пакет.

Повторять всю ручную приёмку ради смены статуса не требуется: нормы не изменены.

## Что остаётся отдельными задачами

- **P1 UI:** CB08/CB09/CB12 выводят две карточки одной правки эффекта.
  Нужно объединить отображение, сохранив оба RuleID, severity и engine evidence.
- Перегенерировать production ds-ai-hub по manual и шаблонам. Drift в реестре
  остаётся «Найдено»; наличие Ready у Figma Predicate не закрывает расхождения prose.
- Отдельно уточнить документацию Spinner.Static; pinned r8 здесь не менялся.
- Реализовать/проверить фронтовый адаптер, генерацию, паттерны и production-доставку.

Эти пункты не маскируются статусом Ready компонентного Figma-контракта.

## Пересборка

Из workspace с соседними ComponentContractEditor и services/apollo-proxy:

```bash
cd /Users/alexkukhta/Desktop/workplace/projects/ComponentContractEditor
npm run validate

cd /Users/alexkukhta/Desktop/workplace/shared/design-system_ab
node scripts/build_button_component_contract_v2_reference.js \
  --preserve-sources \
  --dependency experiments/web-core/core/Button/compiled/dependencies/core.web.spinner/component-contract.v2.json
node --test scripts/tests/button-*.test.js
node scripts/review_button_control_blur_reports.js
node scripts/review_button_finalization.js
```

Скрипты review по умолчанию read-only; --record обновляет только QA-свидетельства.
Реестр правил/Predicate и леджер синхронизируются по
[AGENTS.md](../../../../AGENTS.md), с обязательным чтением после записи.
