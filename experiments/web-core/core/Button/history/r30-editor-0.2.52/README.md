# Button — контракт компонента

Входная точка для ревью изолированного пилота ComponentContract v2.
Контракт описывает **один семантический компонент** `core.web.button`: его
представления, возможности настройки, ограничения и зависимости.
Он не описывает построение страницы или паттерн группы кнопок.

## Актуальное состояние · 29 сентября 2026

- Ручной источник: **Button r30**, статус **Draft**.
- Плагин для проверки: **ComponentContract Editor 0.2.52**.
- Вложенный контракт: **Spinner r8**, закреплён ревизией и хешами.
- 22 собственных правила → 60 проверок Button в RuleIR; проверки Spinner выполняются отдельно.
- Четыре Figma-представления: desktop/mobile, обычные/inverted; три code-представления
  desktop/mobile/adaptive остаются `draft`.
- Пакет **не опубликован** в production runtime index. Это не завершённая миграция
  Apollo, Athena или ds-ai-hub.

Успешные тесты конкретного сценария не делают весь контракт Ready.
Актуальный статус сценариев — в [разделе приёмки](#что-проверено);
история эксперимента — в [CHANGELOG.md](CHANGELOG.md).

### Текущий шаг: ControlBlur проверен; финальное ревью готовности

**16/16 ControlBlur-кейсов подтверждены** по свежим отчётам Editor0.2.52
`06:08:18`–`06:10:06`:11 штатных экземпляров без нарушений, все5 намеренных ошибок
обнаружены. Включая radius80→40, local style с тем же radius80 и оба библиотечных
исключения M Inverted Primary72. Во всех сценариях `complete=true`,0 not-executed,
0 inconclusive;247/247 узлов сопоставлены, capture warnings отсутствуют.
4 482 engine evaluations, Editor report и details воспроизводятся точно.
[QA-приёмка и архив отчётов](qa/control-blur-r30-live-review.2026-09-29.json).

Функциональный P0 ControlBlur закрыт; **Button пока Draft**. В CB08/09/12 одна
правка эффекта выводится двумя карточками: общий запрет `appearance.effects` и
специальный `effectDetailsV1`. Это дубль диагностики, не ложное нарушение;
отдельный P1 — группировать карточки, сохраняя оба RuleID и severity.
Перед Ready нужны финальное ревью16 draft-правил и разбор прежнего
`TARGET_UNRESOLVED /targets/6` (`target.spinner`). Эти nonloading-кейсы не
подтверждают выполнение вложенного Spinner; его матрица принята отдельно.

Матрица Spinner принята владельцем 29.09: **«матрицу по спиннеру принимаем»**.
Повтор BI-кейсов сейчас не требуется. Новых JSON для этого решения не было;
покейсовое live-прохождение не заявляем. [Запись решения](qa/spinner-matrix-r30-owner-acceptance.2026-09-29.json).

29.09 владелец утвердил обе нормы. Изменены **два прежних RuleID**, без новых
параллельных правил. Общий compiler → единый Predicate Engine, без Button-specific
runtime. Архив r29 сохранён; Athena evidence и pinned Spinner r8 не изменены.

1. **Button_Inverted → Spinner:** Accent → True/True; Primary → False/False;
   Secondary/Outlined/Transparent/Text → True/False (`Inverted/Static`).
   D/M, размеры32–72, оба слота. Обычная матрица не менялась. Поверхность определяется
   по ключу представления, не по имени; неизвестные identity/View/surface не дают pass.
2. **ControlBlur:** по последнему уточнению владельца **библиотека верна**.
   Эталон — независимо полученный instance конкретного library componentKey.
   Secondary с blur во всех состояниях, Accent/Primary — в disabled;
   Outlined/Transparent/Text без blur. Два enabled M Button_Inverted Primary72
   также сохраняют библиотечный blur. Обобщение «все disabled кроме Text» отменено.
   Проверяются параметры эффекта, включая radius, и published style identity;
   произвольный local style с тем же внешним видом не равен ControlBlur.

ControlBlur теперь intrinsic predicate, а не context-only/specification mapping.
Code prop `allowBackdropBlur` остаётся справочным API mapping; он не даёт права
отключать библиотечный эффект. Front-adapter и production Hub ещё не мигрированы.
В старых снимках нет полных effect details: новый контракт покажет unknown;
старые compiled/reports сохраняют точный replay. Свежий прогон r30 проверен выше;
повтор ControlBlur сейчас не требуется.

Гейты: **438 Editor + 238 Button tests**, typecheck, JSON-схема, ZIP roundtrip,
архивный compile parity пройдены. Context-only правил больше нет; три policy-only
правила — разрешения, не пропуски проверок. Draft сохраняется до финального ревью.
Пакет: [editor/Button.editor-input.zip](editor/Button.editor-input.zip).
Порядок проверки: [TESTCASES.md](TESTCASES.md).
[Создан ControlBlur-борд в прежней секции Button](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13117-65262):
16 экземпляров CB01–CB15 (CB07A/CB07B), 11 ожидаемых pass и 5 нарушений.
Проверены ключи, параметры эффектов, подмена style identity и отсутствие переполнений
карточек; библиотека и прежние кейсы не изменены. Подготовка fixtures описана
[в манифесте с node IDs и ожиданиями](qa/control-blur-test-cases.2026-09-29.json),
последующая live-приёмка — в отдельном QA-отчёте выше.
Manual, compiled и ZIP не изменились: уже загруженный r30 подходит.

Дополнительно найдено: `Spinner.Static` переключает семейство токенов
Interface Dynamic / Interface Static. Формулировка «статичное кольцо» неполна;
уточнение записано отдельно, pinned Spinner r8 и его правила пока сохранены.
Продуктовые/канальные паттерны в эти P0 не входят. Библиотечные компоненты не менялись.
Исходная read-only сверка1056 вариантов сохранена в
[evidence](qa/final-blockers-evidence.2026-09-29.json); это исторический файл до решения владельца.

### Принято: условный nowrap

По подтверждению владельца `nowrap=false` разрешает перенос, но **не требует
FILL от каждой кнопки**. В r29 прежний RuleID
`component:web-core.button.nowrap-maps-to-figma-layout` исполняется в режиме
«По спецификации» через общий типизированный `configurationMapping`:

| Независимое ожидание | Требование к видимому тексту |
|---|---|
| nowrap=true | Button/Text/Label/Hint: HUG; текст: Auto width |
| nowrap=false, ограниченная ширина=true | Button/Text/Label/Hint: FILL; текст: Auto height; родитель: Auto Layout |
| nowrap=false, ограниченная ширина=false | Дополнительного требования FILL нет; проверяется обычный допустимый текстовый профиль |
| Нужный параметр не задан | Unknown / неполная проверка, не pass |

Контекст `constrainedWidth` объявлен отдельно в `manual.validationContext`.
Это не Figma-свойство и не code prop Button. Ожидания задаются для конкретной
проверки, не выводятся из actual и сбрасываются при смене instance/manual/package.
В Editor контекст редактируется в паспорте контракта, mapping — в редакторе правила.
Скрытые/подтверждённо отсутствующие Label и Hint не требуют этих входных данных
(Loading/SingleIcon); неизвестная видимость не считается скрытой. Аудит компонента
не требует спецификации. Padding, остальные baseline-проверки и Spinner независимы.

Изменён только1 прежний RuleID; Athena evidence и Spinner r8 сохранены.
r28/Editor0.2.49 архивирован. 432 Editor/233 Button tests, схемы, browser roundtrip
и18 layouts+18 dialogs пройдены. Это **offline**, не новая live-приёмка Figma.
29.09 владелец подтвердил приёмку: **«считай принято»**. P0 реализации закрыт;
новых JSON нет, поэтому покейсовое live-прохождение NW01–NW09 не заявляется.
[Запись приёмки](qa/nowrap-r29-owner-acceptance.2026-09-29.json).
Повтор сейчас не требуется. [NW01–NW09](TESTCASES.md) остаются регрессионной
инструкцией. [r29 ZIP](editor/Button.editor-input.zip) и Editor0.2.51 не менялись;
переимпортировать пакет ради этой записи не нужно. Новые Figma-узлы не создавались.
На этапе r29 blur ещё оставался context-only, а Button_Inverted палитра требовала
решения владельца; актуальное состояние r30 описано выше.
Clipping внешнего контейнера не добавлен как универсальное правило компонента:
контекстные рекомендации Hub остаются отдельной задачей проекции, drift открыт.

### История: baseline-исключение r28 принято

**Исправлено в Editor0.2.49; manual остаётся r28.** Общий compiler исключает
только ID доказанно сопоставленных текстовых целей. Отсутствие optional role
у другого слоя не блокирует baseline; неизвестная/неоднозначная цель не становится pass.
Тот же безопасный поиск целей применяется к самим профилям конфигурации.
410 Editor/210 Button tests пройдены. Все15 старых отчётов воспроизводятся точно;
новая компиляция меняет только2 ложных unknown у LeftAddon в Loading на compliant.
Реальные sizing overrides и проверки дочернего Spinner сохранены.
[QA патча](qa/configuration-exception-fix.2026-09-29.json) хранит offline-проверку.
**Live-приёмка TL10B завершена** по JSON `23:40:40` (спецификация, block=false)
и `23:40:55` (аудит): выбран нужный Loading instance `13100:90813`,18/18 matches
в каждом отчёте,0 capture warnings. LeftAddon без role: HUG/HUG → compliant.
Скрытые текстовые цели не проверяются; Spinner r8 выполняется:100 compliant,
68 not-applicable на каждый прогон, без нарушений и неизвестных результатов ребёнка.
708 engine evaluations и Editor/details воспроизводятся точно. С теми же новыми
снимками старый compiler даёт прежний LeftAddon unknown; это единственное отличие.
[Приёмка Loading и архив JSON](qa/loading-r28-editor-0.2.49-live-review.2026-09-29.json).
Вся проверка остаётся неполной по отдельным причинам: без снимка «до» нельзя
оценить сохранение ширины; в спецификации nowrap ещё context-only. Этот P0 закрыт,
но контракт остаётся Draft. Следующий P0 — nowrap и применимость к скрытому тексту,
без превращения контекстного рецепта узкого контейнера в универсальный Fill.
Полученные затем JSON `23:36:32` и `23:36:54` действительно зелёные, но оба относятся
к **TL10A SingleIcon**, узел `13100:90798`: 7/7 узлов, Spinner не активен.
Аудит и спецификация (`block=false`) полны для этого сценария: 0 нарушений/unknown;
310 engine evaluations и Editor/details воспроизводятся точно.
[Приёмка SingleIcon и архив двух JSON](qa/single-icon-r28-editor-0.2.49-live-review.2026-09-29.json).
Эти более ранние отчёты подтверждали только SingleIcon; Loading принят отдельно выше.
Manual, input ZIP, generated facts и Spinner неизменны; compiled пересобран.
Исходная компиляция0.2.48/ZIP/manual сохранена в history/r28-editor-0.2.48.
Ниже история исходной текстовой приёмки; её замечание compiler P0 исправлено,
live-ретест завершён; отдельные nowrap/blur gaps остаются открытыми.

### История текстовой приёмки до патча0.2.49

Владелец подтвердил точечное разрешение: Text, Label и видимый Hint могут использовать
согласованный Hug или Fill. При Fill текст имеет Auto height и Center; при Hug —
Auto width и alignment независимого baseline. Высота, padding, стили и остальные
внутренние области по-прежнему защищены. Ширина всей Button этим правилом не меняется.

Manual r28 содержит оба профиля и точную ссылку-исключение из внутреннего sizing.
Аудит проверяет допустимый профиль; режим «По спецификации» дополнительно принимает
независимое ожидание `textResizing=hug|fill`. Скрытая/подтверждённо отсутствующая цель
не создаёт ложного нарушения; неизвестные факты не считаются успешной проверкой.
Ожидание не выводится из actual. Нового runtime-интерпретатора нет.

Локальные гейты:408 Editor/206 Button tests, Chromium authoring roundtrip и
18 layouts+18 dialogs. Получены все15 live JSON [TL01–TL10](TESTCASES.md):
текстовые результаты соответствуют ожиданиям;2047 engine evaluations и Editor/details
воспроизводятся точно,226/226 узлов сопоставлены,0 capture warnings.
**Серию целиком пока не закрываем:** в обоих Loading-отчётах TL10B обнаружен лишний
`human-review` у LeftAddon. Compiler проверяет `semantic.role` даже вне разрешённых
текстовых целей; у вложенного instance роль отсутствует, хотя actual/baseline оба Hug.
Нужен P0: точное исключение по доказанной принадлежности к Text/Label/Hint без
ослабления baseline-проверок остальных узлов. Это ошибка компиляции исключения,
не новое разрешение контракта и не паттерн применения.
В спецификации TL10A/B также не задан block — два `human-review` ожидаемы;
для изолированного ретеста выбрать «Растягивать на ширину контейнера = Нет».
Loading без пары «до» ожидаемо не проверяет сохранение ширины. Nowrap остаётся gap,
в том числе его применимость к скрытому тексту Loading в режиме спецификации.
[Итог и архив15 отчётов с SHA](qa/text-layout-live-review.2026-09-29.json).
Текстовая приёмка не делает контракт Ready; manual/compiled/ZIP и код не менялись.
29.09 подготовлены [13 экземпляров в Figma](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13100-63800)
в прежней секции Button под BW. Проверены реальные ключи, настройки и компоновка;
сама подготовка тестовых данных не являлась live-приёмкой. Настройки проверки
и ссылки на экземпляры сохранены в [fixture manifest](qa/text-layout-test-cases.2026-09-29.json).
При подготовке исходной серии manual/compiled/ZIP не менялись. Теперь используйте
прежний input ZIP r28 с Editor0.2.49; compiled Button обновлён исправленным core.
Нормативные ID, generated facts и Spinner r8 сохранены; прежний r27 архивирован.
Остаются2 context-only mappings: nowrap и blur. Рецепт nowrap=false для узкого
контейнера нельзя превращать в обязательный Fill для всех кнопок. Паттерны применения
остаются отдельно; палитра Loading у Button_Inverted требует решения владельца.

## С чего начать ревью и что передать участнику

1. **[contract.manual.json](contract.manual.json)** — сначала прочитать нормативные
   решения, semantic API, targets и правила. Это основной документ для содержательного ревью.
2. **[compiled/component-contract.v2.json](compiled/component-contract.v2.json)** —
   проверить, во что эти требования превратились для потребителя и Predicate Engine.
3. **[editor/Button.editor-input.zip](editor/Button.editor-input.zip)** —
   готовый пакет для воспроизведения в Editor. Содержит тот же manual r29,
   восемь Athena evidence JSON, каталог ассетов и compiled-контракт Spinner r8.
   **Compiled-контракта самого Button в этом входном ZIP нет**: передавать файл
   из пункта 2 отдельно; Editor компилирует Button из manual и evidence.
4. Этот README и **[TESTCASES.md](TESTCASES.md)** — контекст, ограничения и сценарии.
5. Для анализа фактической проверки: [итог block-приёмки r26](qa/block-live-review.2026-09-28.json)
   и [исходный FIXED-отчёт, JSON.gz](qa/fixtures/block-r26/button.validation-report.2026-09-28T17-32-30-016Z.json.gz).
   После распаковки отчёт содержит снимок экземпляра, источники, проверяемый контракт
   и результаты; локальный replay проверен.

Для сверки полноты переноса знаний дополнительно передать
[снимок документов ds-ai-hub](sources/ds-ai-hub/core/web/components/button/)
и [rule-crosswalk](reports/rule-crosswalk.json). История версий и все промежуточные
отчёты для первого ревью не нужны.

Вопросы рецензенту: непротиворечивы ли разрешения и запреты; верны ли границы
Button/Spinner/продуктового паттерна; хватает ли фактов и условий для генерации
и проверки; не объявлены ли неподтверждённые сценарии готовыми?

## Какой документ главный

**`contract.manual.json` — единственный нормативный редактируемый источник
компонента Button.** Основной маршрут правок — Editor. Предложение рецензента должно
ссылаться на RuleID/target/semantic property; исправляется manual, затем выполняется сборка.

**`compiled/component-contract.v2.json` — производный публичный контракт для
потребителей, а не второй ручной источник.** В нём находятся нормализованные факты,
семантика, representations, generation profiles, политики, RuleIR и зависимости.
Исполняемые проверки оценивает единый Predicate Engine. Compiled JSON не редактируется.

README объясняет состояние пакета, но не вводит дополнительных нормативных правил.

| Файл или область | Назначение / владелец | Ручная правка |
|---|---|---|
| [contract.manual.json](contract.manual.json) | Семантика, targets, политики, constraints, conditions, delegation; авторы ДС через Editor | Да |
| [sources/design-system_ab-athena/](sources/design-system_ab-athena/) | Снимок автоматически полученных фактов о компонентах; вход компиляции | Нет |
| [sources/ds-ai-hub/](sources/ds-ai-hub/) | Снимок документации и bridge для сверки происхождения требований | Нет |
| [sources/component-contract-editor/](sources/component-contract-editor/) | Исторические export/docs; не актуальная инструкция плагина | Нет |
| [compiled/](compiled/) | Общий compiler core: Button, pinned child и каталог ассетов | Нет |
| [editor/Button.editor-input.zip](editor/Button.editor-input.zip) | Транспорт для импорта в Editor; не самостоятельный источник истины | Нет |
| [reports/](reports/) | Валидация сборки, coverage, ownership, источники, crosswalk и зависимости | Нет |
| [projections/](projections/) | Производные экспериментальные проекции для Athena и ds-ai-hub | Нет |
| [runtime/component-contract.index.json](runtime/component-contract.index.json) | Экспериментальная индексная запись, `published: false` | Нет |
| [qa/](qa/) | Приёмка и архив исходных отчётов с SHA; доказательства, не правила | Не изменять исходные отчёты |

Снимки `sources/` не являются актуальными живыми репозиториями.
Проекции в этой папке **не означают**, что production-документы ds-ai-hub уже
перегенерированы или нормативные дубли во всей системе устранены.

Схемы: [manual v2](../../../schemas/apollo-component-contract-manual-v2.schema.json)
и [compiled v2.1](../../../schemas/apollo-component-contract-v2.1.schema.json).
Имя файла `component-contract.v2.json` сохраняется для compiled-артефакта.

## Содержание и границы контракта

В manual есть единые component/family/contract ID и RuleID; семантика применения;
Figma/code representations; semantic API и bindings; semantic targets и control
ports; правила с областью действия, условиями, ограничениями и маршрутом исполнения;
примеры, generation profiles и решения по расхождениям источников.

Button задаёт требования к своей композиции и связи с вложенными компонентами.
[Spinner](compiled/dependencies/core.web.spinner/component-contract.v2.json)
сохраняет собственные правила и RuleID. Button подключает его через
`componentDependencies`, отдельно ограничивая размер и палитру в контексте кнопки.
Требования дочернего компонента не копируются и не отменяются неявно родительским override.
Неизвестные ключи, неверный pin или недоказанная топология не считаются успешной проверкой.

Правила применения и продуктовых сценариев физически вынесены в
[ручной источник будущего паттерна кнопок](../../../patterns/buttons-and-button-groups/README.md).
В Button нет их нормативных копий или pending-заглушек. Проверка компонента не
означает проверку его применения в продукте; паттерн пока не подключён.

Для генерации используются семантика, representations, semantic API, profiles,
допустимые настройки и ограничения. Рабочий generation profile не равен техническому
default-варианту Figma. Для проверки дополнительно нужны реальные observed facts,
независимый baseline, доступные зависимости и — для переходов — пара состояний.
Наличие React bindings пока не подтверждает готовность автоматической генерации
или проверки фронта: code-представления и контекстные mappings остаются Draft.

### Разделение компонента и правил применения · r25

В Button остаются **22 intrinsic правила** с ownership=component/core.web.button.
Пять прежних правил применения находятся только в
[rules.manual.json будущего паттерна](../../../patterns/buttons-and-button-groups/rules.manual.json):
три продуктовых, делегация группы кнопок и ссылка на общую редакционную политику.
Их прежние RuleID, условия, constraints, статусы и происхождение сохранены.
Два внешних порта и продуктовые решения также перенесены; в component manual,
compiled policy, RuleIR и pending-списке этих правил больше нет.

Это заготовка ручного источника паттерна, **не готовый PatternContract**. Его runtime
не подключён, и его файл нельзя импортировать в ComponentContract Editor.
Общий Predicate Engine и compiler не менялись. Префикс component: у старого ID
сохранён для трассировки, а не как признак принадлежности компоненту.
Неподтверждённые alfa-business scopes не нормализованы в ab и не стали reviewed.

[Реестр переноса](migrations/usage-rules-r25.json) фиксирует ID, нового владельца и
путь, без копирования правил. Сборка останавливается, если запись потеряна или
осталась сразу в двух активных manual sources. [Crosswalk](reports/rule-crosswalk.json)
учитывает Athena RuleID, перенесённые записи и SHA внешнего источника.
Снимки legacy rules в evidence и history остаются для происхождения и replay,
но импорт Editor не превращает их обратно в активные требования Button.

**Остаются компонентными:** SingleIcon, состав Loading и сохранение ширины при
переходе Loading, размер/палитра Spinner, допустимые размеры Hint, совместимость
слота с ассетом, API block/textResizing/nowrap и mapping allowBackdropBlur.
Зависимость от родительского layout или другого состояния того же экземпляра
сама по себе не делает правило паттерном.

**Coverage не подменяет область проверки:** usage=0 означает «нет проверок
применения», а не «все паттерны пройдены». Из восьми прежних gaps четыре ушли
вместе с внешним owner; из четырёх компонентных mappings в r26 реализован block,
textResizing реализован в r28; nowrap — в r29; blur пока не реализован.
Контракт остаётся Draft. В частности, видимый Hint при Product=ab больше не
даёт нарушения компонента, но политика Альфа-Бизнес сохранена у будущего паттерна.

**Live r25 TR01–TR03 принято, 28.09 15:01–15:02 UTC:** AB/AO на одном instance
дают одинаковые93 собственных результата и0 нарушений при видимом Hint.
В третьем отчёте opacity корня50% вместо100% обнаружено двумя assertions,
объединёнными в одну карточку; остальные91 результата неизменны.
Все48/48 baseline nodes сопоставлены, warnings/inconclusive=0.
279 engine evaluations,291 Editor evaluations и291 details воспроизводятся точно.
Три сценарных gaps и Draft сохранены; usage=not-evaluated, не pass.
[QA live r25](qa/usage-transfer-live-review.2026-09-28.json) и сжатые исходники
с SHA сохранены; повтор TR01–TR03 не нужен. Новые6 регрессий добавлены.
Историческая приёмка OW01/OW02 сохранена в
[QA r24](qa/rule-ownership-live-review.2026-09-28.json); r24 manual/compiled/ZIP —
в [history/r24-editor-0.2.45](history/r24-editor-0.2.45/).

### Аудит и спецификация · приёмка r27 (история)

**Аудит компонента** — режим по умолчанию. Проверяет реальные свойства по
intrinsic правилам. Не требует block/nowrap/textResizing, которых нет в Figma API
кнопки. **По спецификации** дополнительно проверяет согласованность с внешними
ожиданиями: например, code props.block=true требует Fill и Auto Layout-родителя.
Оба режима сохраняют проверки композиции, токенов, visual overrides и Spinner.

Все4 bridge mappings имеют в manual `applicability.validationMode=specification`.
Это область исполнения, не новый owner и не паттерн. Общий compiler добавляет
условия RuleIR, Predicate Engine не меняется. В Editor область редактируется
в Applicability. JSON содержит `snapshot.validationRequest` и
`scenarioCoverage.validationMode/specificationStatus`.
В аудите specificationStatus=not-requested, а не pass. В режиме спецификации
неизвестное ожидание остаётся unknown,2 текстовых context-only правила в обычном
тестовом Accent-варианте — not-executed. Три gaps всего пакета остаются открыты.

На5 прежних снимках аудит проходит без искусственного block gap, а спецификация
сохраняет0/1/1/2/0 block-нарушений. Все81 прочих engine evaluations каждого снимка
неизменны. Opacity50% выявляется в обоих режимах; truncated capture остаётся неполным.
405 Editor и192 Button regressions, import/compiler parity пройдены.
Chromium: режимы/download/reset/authoring scope,18 UI layouts и18 dialogs.
Реестр обновлён:34 ячейки подтверждены чтением,45 соседних и native metadata
неизменны; Predicate Draft,Ledger60 Найдено. [QA r27](qa/audit-specification.2026-09-28.json).
28.09.2026 пользователь подтвердил работу: «всё ок, работает». Разделение режимов
принято на уровне smoke-проверки; отдельные JSON AS01–AS06 не присланы, покейсовая
приёмка не заявляется. Контракт остаётся Draft: допустимые текстовые overrides
на момент r27 требовали согласования с baseline (Ledger60). Это исключение принято
и реализовано в r28; остальные gaps не закрыты.

### Независимое ожидание block · r26 (история)

Реализовано и проверено локально:398 Editor tests,184 Button tests, browser input/
download/ownership,18 размеров UI и18 диалогов.93 прежних intrinsic evaluations
сохранены, добавлены2 block assertions. BI01–BI05 приняты по5 отчётам17:31–17:33:
415 engine evaluations и Editor/details exact replay,18/18 узлов каждый раз.
BI06/07 не были присланы; текущая инструкция заменена серией AS01–AS06.
[QA r26](qa/block-expected-input.2026-09-28.json) фиксирует hashes, границы проверки
и readback реестра:30 изменённых ячеек,33 соседних без изменений, native formats
сохранены. Registry Predicate=Draft, Ledger56/60 остаются Найдено.

В `semanticApi.block.validationInput` manual описан ввод ожидания. В разделе
проверки Editor появился сворачиваемый блок **«Ожидаемые параметры»**. Значение
задаётся из спецификации отдельно от Figma-свойств; default=false не подставляется.
`expectedInput.block=true` активирует прежний RuleID `block-maps-to-fill`:
ширина Button должна быть FILL, parent.layout.mode — Auto Layout (horizontal,
vertical или grid). Известный родитель PAGE даёт NONE, недоступный — unknown.
`false` исключает это условное требование, не запрещая FILL и не требуя HUG.
«Не задано» даёт неизвестную применимость и неполную проверку, не pass.
В r27 это относится только к режиму «По спецификации».

Ожидание — **данные конкретной проверки, не нормативная правка manual**. JSON
содержит `snapshot.validationIntent` с явным origin, manual hash, page/root/key
identity и values; общий runtime заново вычисляет expectedInput и evidence.
Неверный pin/identity/type не исполняет ограничение как успешное. При смене instance,
пакета или manual UI сбрасывает ввод; сессия не сохраняет эти ожидания.
Ввод во время capture заблокирован. Старые пакеты/отчёты не включают новый materializer.

MVP input v1 поддерживает boolean-ожидания на корне; в r28 добавлен v2 для
конечного string enum, использованного textResizing. Это общий механизм, не код
специально для Button. Следующий этап — nowrap/allowBackdropBlur и их контекст,
не blanket-разрешение потомков.
Разработка и подключение
паттерна — отдельный этап с собственными coverage и приёмкой.

## Исполнимость и открытые пункты

[Coverage сборки](reports/coverage.json) различает маршруты:

| Маршрут | Правил | Что означает |
|---|---:|---|
| `predicate` | 18 | Компилируются в 59 проверок Button; применимость зависит от сценария |
| `policy-only` | 3 | Декларируют разрешения/маршрут настройки; не отдельные assert-проверки |
| `context-only` | 1 | Требование описано, но не подключено к автоматическому исполнению |

Остаётся context-only правило: `backdrop-blur-maps-to-control-blur`.
Здесь приведены суффиксы исходных RuleID;
полные ID и условия — в manual.

На уровне пакета остаётся **1 неисполняемое локально правило**.
На двух архивных non-loading снимках r24 повторный расчёт с r25 даёт 3 «Не выполнено»
вместо 6: внешние требования исключены из области компонента, а не пройдены.
Сценарный счётчик зависит от применимости; отсутствие пары состояний Loading может
добавить отдельный пробел. Ноль нарушений сам по себе не означает полную проверку.

Дополнительные ограничения:

- Остаётся [warning сборки](reports/validation-report.json)
  `TARGET_UNRESOLVED` у legacy target Spinner. Он не отменяет подтверждённое
  выполнение pinned child, но и не считается устранённым.
- Матрица палитры Spinner подтверждена для обычных [D]/[M] Button, размеров 32–72;
  Button_Inverted не включается в неё автоматически. В manual и compiled есть
  `decision:core.web.button.inverted-loading-palette`, status=needs-confirmation.
  Это компонентная зависимость, не продуктовый паттерн. Нормативная матрица не
  придумана: генерация inverted+Loading требует решения владельца. Проверка
  самого Spinner не доказывает верную палитру внутри инвертированной кнопки.
  Decision пока не является отдельным runtime coverage assertion; счётчик
  mapping gaps не исчерпывает все вопросы готовности пакета.
- Для перехода Loading нужны состояния одного instance и подтверждённые
  инварианты контекста. GRID-родитель пока не поддержан этим capture.
- Переименование Addon проверено по identity; неоднозначная топология и
  переименования не-instance слоёв не покрыты этим исправлением.
- Статусы `draft` и `needs-confirmation` в manual не повышаются автоматически
  после тестов. Editor может активировать draft-правила для проверки, сохраняя
  это отличие от опубликованного контракта в отчёте.

## Что проверено

| Область | Подтверждение и границы |
|---|---|
| Nowrap / r29 | 432 Editor/233 Button tests; схемы, independent scenario inputs, desktop/mobile, hidden/unknown, Spinner parity, authoring roundtrip. [Принято владельцем](qa/nowrap-r29-owner-acceptance.2026-09-29.json) без новых live JSON; [offline QA](qa/nowrap-r29.2026-09-29.json) |
| Текстовый layout / r28 | [QA r28](qa/text-layout.2026-09-28.json):408 Editor/206 Button tests; разрешённые и запрещённые профили, hidden/absent/unknown, enum intent, authoring/import/compiler parity. TL01–TL10 live pending |
| Физический перенос / r25 | [Сборка](qa/usage-transfer.2026-09-28.json) и [live TR01–TR03](qa/usage-transfer-live-review.2026-09-28.json): 22 правила/53 RuleIR; AB/AO без нарушений, opacity50% даёт одну карточку. 178 Button tests; исходники с SHA архивированы. Draft сохраняется |
| Ownership / r24 | [Локальные гейты и сверка реестра](qa/rule-ownership.2026-09-28.json): 22/5,4+4 gaps; неизменные правила и verdicts. Это не новая live-приёмка Figma |
| Product / видимый Hint / r24 | [Live OW01/OW02](qa/rule-ownership-live-review.2026-09-28.json): ao — запрет неприменим, ab — одно нарушение usage.93 component verdicts/trace одинаковы;16/16 matches,188 engine результатов replay exact;3+3 pending остаются |
| Loading-композиция | [Live review](qa/loading-composition-live-review.2026-09-28.json): только Spinner, проверены положительные и отрицательные сценарии |
| Настройка Hint ≠ фактическая видимость | [Live review](qa/effective-hint-visibility-live-review.2026-09-28.json): скрытый родителем Hint не создаёт ложный запрет, реальные нарушения сохраняются |
| Ширина до/после Loading | [BW01–BW06, r23](qa/root-sizing-live-review.2026-09-28.json): pass/fail/fail/pass/not-executed/not-executed; 2066 evaluations с точным replay |
| Высота корня и внутренний sizing | [Sizing-пробы](qa/sizing-probes-live-review.2026-09-28.json): неверные режимы высоты и ширины внутреннего frame обнаруживаются; первые пробы переименования в этой старой серии были заблокированы |
| Переименованный Addon и ширина HUG/FILL/FIXED | [Editor 0.2.44, четыре JSON](qa/instance-identity-live-review.2026-09-28.json): 18/18 узлов в каждом, 1404 evaluations суммарно, из них 672 Spinner; без нарушений, warnings и inconclusive |

Серия identity-приёмки содержит HUG, HUG, FILL, FIXED. Имя `🔩 Addon` сохранено;
имя самого Spinner в этих четырёх live-снимках не менялось.
Engine, Editor coverage и карточки результатов воспроизводятся точно.
Предыдущие JSON на Editor 0.2.43 не засчитываются как приёмка патча 0.2.44.

Исходные отчёты принятых серий сохранены в `qa/fixtures/` с SHA и ссылками из
review JSON. Их копии в `editor/` можно удалить. Артефакты предыдущих ревизий
и промежуточные pending-статусы в [CHANGELOG.md](CHANGELOG.md) — история, не текущая инструкция.

## Как редактировать и проверять

1. Сохранить изменения текущей сессии перед импортом: импорт заменяет её, а не
   объединяет правки.
2. Открыть Editor **0.2.51**, импортировать
   **[Button.editor-input.zip](editor/Button.editor-input.zip)**.
   Для этого шага нужен **r29**. Предыдущий пакет — в `history/r28-editor-0.2.49/`.
3. Править manual через режим «Заполнить каталог». Изменения текущей сессии
   используются при проверке; обязательные поля должны быть заполнены для `reviewed`.
4. В режиме «Проверить инстанс» выбрать Product и реальный instance.
   Представление определяется по ключу выбранного экземпляра, а не по варианту preview.
   По умолчанию используется «Аудит компонента». Для внешних ожиданий выбрать
   «По спецификации» → «Ожидаемые параметры»: «Растягивать на ширину контейнера»
   и «Ширина текстовой области», «Запретить перенос текста»,
   «Контекст: Ограниченная ширина контейнера».
   Это не редактирует Figma. Смена режима очищает ввод и прежние результаты.
   Для проверки перехода ширины предварительно записать состояние «до» этого же instance.
   После изменения manual hash нужна новая пара; старую пару нельзя переиспользовать в r29.
5. Скачать JSON проверки. Для передачи изменений экспортировать пакет Editor,
   проверить его `contract.manual.json` и обновить канонический manual в корне этой папки.
   Не подменять manual устаревшей копией из распакованного `editor/` или `history/`.
6. Пересобрать производные документы и выполнить релевантные регрессии/приёмку.
   Не исправлять результаты компиляции и findings вручную.

Нормативные правки также требуют синхронизации реестра правил и леджера по
[AGENTS.md репозитория](../../../../AGENTS.md). Существующий
`reports/knowledge-sync-pending.json` относится к **r22**, несмотря на статус
`synced-readback-verified`; он не является самостоятельным доказательством
синхронизации r23. Запись о выполненной сверке r23 находится в
[qa/root-sizing.2026-09-28.json](qa/root-sizing.2026-09-28.json), поле `registry`.
Для r24 обновлены и readback-проверены все27 строк правил, Core Predicate=Draft,
Леджер496 и новый drift61: [QA](qa/rule-ownership.2026-09-28.json).
Сверка переноса r25 и текущие источники записаны в [QA r25](qa/usage-transfer.2026-09-28.json).
В реестре dropdown «Тип» имеет только Компонент/Паттерн; внешние политики отнесены
к укрупнённой группе Паттерн, точный kind/ownerId записан отдельно в состоянии и
комментарии. Это не превращает продуктовую или редакционную политику в паттерн экрана.
Production ds-ai-hub не переписан; drift не закрыт.
Для r28 обновлены Правила1828/1839,Леджер60,Core Predicate Draft:26 изменённых
ячеек подтверждены чтением;88 соседних и native metadata114 ячеек сохранены.
Сверка и SHA — [QA r28](qa/text-layout.2026-09-28.json).
Для r29 обновлены Правила1829, Леджер60 и Core Predicate Draft:17 ячеек
подтверждены чтением,17 соседних и native metadata34 ячеек сохранены.
Леджер остаётся «Найдено» до проекции Hub и закрытия gaps; [QA r29](qa/nowrap-r29.2026-09-29.json).

## Пересборка для разработчика

Нужен workspace с Editor и Apollo Proxy: сборка Editor использует общий Predicate
Engine из `services/apollo-proxy`. Тест публичных схем использует read-only helper
`ds-ai-hub/tools/lib/json-schema-lite.mjs` из соседнего checkout (не runtime-зависимость).
Для ревью файлов запуск команд не требуется.

Из текущего локального workspace:

```bash
cd /Users/alexkukhta/Desktop/workplace/projects/ComponentContractEditor
npm run validate

cd /Users/alexkukhta/Desktop/workplace/shared/design-system_ab
node scripts/build_button_component_contract_v2_reference.js \
  --preserve-sources \
  --dependency experiments/web-core/core/Button/compiled/dependencies/core.web.spinner/component-contract.v2.json

node --test scripts/tests/button-*.test.js
```

`--dependency` явно передаёт закреплённый child-контракт: не заменять его произвольно
последней версией Spinner. `--preserve-sources` сохраняет и проверяет снимки evidence;
при этом каталог ассетов сборщик всё ещё читает из текущих Athena indexes.
Пересборка пишет `compiled/`, ZIP, `reports/`, `projections/` и `runtime/`,
но не перезаписывает manual, пользовательские отчёты или production-пакеты.
Перед публикацией сравнить source/pin hashes, coverage и результаты тестов;
при обновлении исходных фактов заново проверить drift и регрессии.

В compiled r29 поле `package.sourceExportVersion` равно `component-contract-editor@0.2.51`;
в архиве r23 оно остаётся `0.2.42`. Это версия производителя артефакта, не
обязательно версия запущенного Editor.
Версию выполнения смотреть в `editorVersion` свежего validation report.
