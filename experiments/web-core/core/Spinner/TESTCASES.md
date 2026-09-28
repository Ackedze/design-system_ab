# Spinner — тесты в Figma

## Текущий пакет r8: повтор L01–L06 не требуется

Editor0.2.33, manual r8: финальный review изменил только статусы двух правил,
без изменения checks. 1008 результатов архивных r7 отчётов сохранены под r8
по verdict/trace/coverage/details, готовность правил теперь Ready. Проверено
`spinner-final-review.test.js`; итог `qa/final-review.2026-09-27.json`.
Следующие новые live-тесты понадобятся для Button→Spinner composition, не для
повтора текущей standalone-матрицы. Если проверяете вручную, импортируйте текущий
ZIP/r8 после сохранения сессионных правок; ожидания L01–L06 ниже остаются прежними.

## P0 padding/alignment — Editor 0.2.33 / manual r7

**Статус: 6/6 приняты по JSON 10:52:42–10:53:30 UTC, 2026-09-27.**
[Блок L01–L06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13015-63344)
на прежней странице и в той же секции Spinner, ниже G01–G04. Старые кейсы не изменены.

Результат полностью совпал с ожиданиями ниже: 0/0/0/2/1/1 atomic findings,
0/0/0/1/1/1 UI-карточек. Все1008 evaluations, Editor coverage и details
воспроизводятся точно; 6/6 mapped, complete=true, нет warnings/unknown/excluded.
Размер L04 остался48×48. [SHA256 и приёмка](qa/layout-live-acceptance.2026-09-27.json).
11 regression tests читают точные оригинальные байты из `qa/fixtures/layout-r7/`.
Повторять эти шесть кейсов без изменения источников/пакета не требуется.
Manual остаётся r7 /Draft до отдельного review двух правил.

Инструкция ниже сохранена для повторного прогона при изменениях:

1. Перезапустить development-плагин Editor **0.2.33**.
2. Сохранить текущие сессионные правки, затем импортировать `editor/Spinner.editor-input.zip`.
3. Убедиться, что загружен **manual r7**. Compiled вручную не редактировать.
4. Выделять именно экземпляр Spinner внутри каждой карточки; «Проверить инстанс».
5. Скачать шесть новых JSON-отчётов и передать их для сверки.

| Кейс | Реальное изменение | Ожидание |
|---|---|---|
| L01 | Нет | 0 нарушений |
| L02 | Fixer, NONE: padding top/right/bottom/left =12/16/20/24 | 0 нарушений; эти сравнения «Не применяется» |
| L03 | Fixer, NONE: обе оси MIN→MAX | 0 нарушений; эти сравнения «Не применяется» |
| L04 | Корень, HORIZONTAL: paddingTop0→12 | Padding violation; 2 atomic правила объединяются в1 карточку |
| L05 | Корень: primaryAxisAlignItems MIN→MAX | 1 нарушение выравнивания |
| L06 | Корень: counterAxisAlignItems MIN→MAX | 1 нарушение выравнивания |

Во всех: 6/6 mapped, complete=true, warnings/notExecuted/inconclusive/excluded=0.
На контрольном controller-capture r7: **168 evaluations, 68 not-applicable**
вместо прежних138/18. Это явная проверка применимости на всех узлах, включая
геометрические узлы, без молчаливого выбрасывания их selector-ом; новых source rules нет.
На момент подготовки L04 сохранил48×48. Если Figma изменит геометрию при live-расчёте,
её intrinsic findings не скрываем и сверяем по фактическим размерам отчёта.

Смена layoutMode на Spinner и его Fixer через Figma не сохранилась; GRID Fixer
отклонён API. Неверные L07–L09 заготовки удалены, никаких detached замен не создано.
Переходы actual/reference (включение/отключение), неизвестная применимость,
GRID-различия и отсутствие фактов проверяются автоматическими controller/unit
тестами — это не live-приёмка невозможной настройки Spinner.
ID, независимый reference и фактические deltas: `qa/figma-layout-test-cases.2026-09-27.json`.

## Историческая приёмка r5 — 2026-09-27

Статус на 2026-09-27: **24/24 кейса приняты, матрица закрыта**.
Все 24 предоставленных JSON точно воспроизводятся в engine / coverage / details.
Manual и compiled совпадают с canonical r5. [Результаты и SHA256](qa/live-acceptance.2026-09-27.json).

- A01–A11: 11/11 исходных вариантов, 0 нарушений.
- B01–B11: 11/11 Scale-кейсов, только width/height, по 2 нарушения.
- C01–C02: 2/2, отвязка токена при сохранённом цвете/opacity найдена; по 2 срабатывания.
- [B04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63345)
  принят отчётом 06:44:09 UTC: Size16 / Static=False / Inverted=False, Scale 16→24,
  только width/height. Матрицу повторять не нужно, если пакет/макет не изменились.

[Открыть тестовую матрицу](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63247).
Та же страница «Лаборатория», та же секция Spinner (`12994:64316`).
Прежние четыре экземпляра сохранены без изменений выше нового блока.
Использованы настоящие библиотечные варианты, не нарисованные копии/локальные masters.

## Перед началом

- Editor **0.2.31**, пакет `editor/Spinner.editor-input.zip`, manual **r5**.
- Перед повторным импортом сохранить более новые сессионные правки.
- Product: **Альфа-Бизнес** (`ab`). Новые mode overrides в тестах не заданы.
- Выбирать **сам экземпляр Spinner** по ссылке/через слои, не внешнюю карточку.
- Ожидаемые результаты закреплены для canonical r5; при изменении manual ожидания пересмотреть.

## Исходный порядок прогона и ожидаемый результат

1. Сначала **A01**, затем **B01**: приоритетный Size24 / Static=True / Inverted=False.
2. Остальные **A02–A11**: исходные экземпляры, **0 нарушений**.
3. Остальные **B02–B11**: Scale ×1,5, **2 нарушения — width и height**.
4. **C01, C02**: отвязан цветовой токен только у Ellipse 1; **1 реальное изменение,
   2 срабатывания** пересекающихся baseline/visual-style правил.
5. После каждого кейса скачать JSON в `editor/`. Имена файлов можно оставить
   автоматически сгенерированными: кейс сопоставляется по `snapshot.source.rootNodeId`
   с [машиночитаемым планом](qa/figma-test-cases.2026-09-27.json).

Для всех кейсов: 6/6 matched baseline nodes, warnings=[], `notExecuted=0`,
`inconclusive=0`, `excludedRules=0`, `scenarioCoverage.complete=true`.
Применимость неактивных strokeWeight/gap должна дать «Не применяется» с причиной,
а не нарушение/unknown. В эталонном r5 ожидается 18 таких evaluations.
Даже при полной проверке сценария контракт сохраняет Draft до отдельного review правил.

## Матрица оставшихся 11 вариантов

| № | Size | Static | Inverted | Исходный: 0 | Scale ×1,5: 2 |
|---|---:|---|---|---|---|
| 01 | 24 | True | False | [A01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63263) | [B01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63273) · 24→36 |
| 02 | 16 | True | False | [A02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63287) | [B02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63297) · 16→24 |
| 03 | 48 | True | False | [A03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63311) | [B03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63321) · 48→72 |
| 04 | 16 | False | False | [A04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63335) | [B04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63345) · 16→24 |
| 05 | 24 | False | False | [A05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63359) | [B05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63369) · 24→36 |
| 06 | 16 | False | True | [A06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63383) | [B06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63393) · 16→24 |
| 07 | 24 | False | True | [A07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63407) | [B07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63417) · 24→36 |
| 08 | 48 | False | True | [A08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63431) | [B08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63441) · 48→72 |
| 09 | 16 | True | True | [A09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63455) | [B09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63465) · 16→24 |
| 10 | 24 | True | True | [A10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63479) | [B10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63489) · 24→36 |
| 11 | 48 | True | True | [A11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63503) | [B11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63513) · 48→72 |

Size48 / Static=False / Inverted=False уже принят четырьмя прежними отчётами;
в этой матрице намеренно не дублируется.

## Контроль токенов

- [C01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63527):
  Size24 / Static=True / Inverted=False.
- [C02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13005-63537):
  Size24 / Static=True / Inverted=True.

У обоих отвязана только `Ellipse 1.fills[0].color`; исходные RGB и opacity сохранены.
Head остаётся привязан к переменной. Размеры и sizing не менялись.
Ожидается обнаружение утраты binding даже при визуально неизменном цвете.

## Выполненная подготовительная проверка

24/24 экземпляра: main component key и variant properties соответствуют плану,
6 узлов, ожидаемые размеры, HUG/HUG сохранён; цвет и opacity соответствуют источнику.
Bindings сохранены у A/B и отвязаны только в C. Наложений и выхода текста за карточки нет.
Inverted=True показан на тёмной подложке карточки без изменения fills самого Spinner.
Увеличены только границы существующей секции; её прежние экземпляры не перемещены.

Manual, compiled contract, Editor, Button и production-каталоги этой задачей не менялись.
После разбора отчётов 06:24–06:44 UTC — **24 passed / 0 pending**, 3312 evaluations.
Во всех принятых кейсах 6/6 matched, 138 evaluations, 18 обоснованных not-applicable,
нет warnings, compiler errors, notExecuted, inconclusive или excluded rules.
Size/Static/Inverted и semantic API соответствуют плану, независимый эталон согласован
с каталогом. Вместе с прежним Size48/False/False проверены все 12 исходных вариантов.
Это не автоматический review всего контракта: 5 правил ещё unreviewed, Spinner остаётся Draft.

## Целевая приёмка Editor 0.2.32: градиенты

**Кейсы приняты по четырём отчётам 2026-09-27, 09:37 UTC: 4 passed /0 pending.**
Editor0.2.32 /manual r6; исходный — 0 нарушений, каждый негативный — 2 atomic
violations → 1 карточка с двумя RuleID. Все 6/6 matched, 138 evaluations,
18 обоснованных not-applicable для gap/strokeWeight, полный сценарий,
warnings/notExecuted/inconclusive/excluded=0. Всего **552 evaluations**,
engine/Editor/details replay exact; manual/compiled совпадают с canonical.
Приняты только заявленные сценарии Size48/False/False и захваченные modes,
не всё множество paint-типов/режимов и не весь контракт.
Итог с SHA256: `qa/gradient-live-acceptance.2026-09-27.json`.
[Открыть блок G01–G04 в Figma](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13010-63367).
Та же страница «Лаборатория», та же секция Spinner. Старые экземпляры и матрица
сохранены; увеличена только высота секции. План с ID и фактическими изменениями:
`qa/figma-gradient-test-cases.2026-09-27.json`.
Перезапустить Editor, проверить версию **0.2.32**, сохранить сессионные изменения
и загрузить `editor/Spinner.editor-input.zip` (manual **r6**).
Product `ab`; не менять modes. Повтор всей старой матрицы ради этого патча не нужен.

Уже созданы четыре свежих библиотечных инстанса **Size=48, Static=False,
Inverted=False**, каждый 48×48, HUG/HUG. Самостоятельно менять их не нужно.
В этом варианте градиент находится у **ELLIPSE `Fixer / Mask / Mask`**:
выбирать именно внутренний ellipse, не одноимённый внешний frame.
Проверять целый экземпляр Spinner, не выбранный ellipse.

| Кейс | Единственное изменение | Ожидается |
|---|---|---|
| [G01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13010-63378) | Нет изменений | 0 нарушений, полный сценарий; stops/transform присутствуют в actual и reference. |
| [G02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13010-63391) | Alpha последней точки angular gradient: 1 → 0,45. Opacity слоя и paint остались 1 | Изменение fill: 2 atomic violations пересекающихся правил → 1 карточка с обоими RuleID. |
| [G03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13010-63404) | Только `gradientTransform[0][2]`: 1,035714… → 1,215714… (сдвиг +0,18), без изменения размеров слоя | Изменение fill/gradientTransform: 2 atomic violations → 1 карточка. |
| [G04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/?node-id=13010-63417) | У `Ellipse 1` отвязан цветовой токен, RGB/opacity сохранены | Утрата binding: 2 atomic violations → 1 карточка, как в прежнем контроле. |

Структурная и визуальная проверка подготовки пройдена: 4/4 исходят из одного
библиотечного component key, по 6 узлов, без посторонних изменений и переполнений.
У G04 Figma также пересчитала производные `boundVariables.fills` и
`resolvedVariableModes`: это следствие удаления одной привязки; explicit modes
не менялись. Эти производные изменения отдельно записаны в QA-плане.
Подготовительная проверка дополнена точным replay четырёх live-отчётов.
В G04 единственное нарушение — утраченный token binding; лишних mode/layout
findings нет. Тесты на локально изменённых копиях новых снимков подтверждают:
потеря actual/reference gradient facts даёт incomplete, восстановленный paint
убирает нарушение. Это не проверка автоматического Figma reset UI.

После каждого кейса скачать JSON в `editor/`. У всех четырёх ожидаются 6/6 matched,
без warnings, excluded/notExecuted/inconclusive; `scenarioCoverage.complete=true`.
Детали должны показывать различие градиента/токена, не `undefined` или пустой объект.
Если Figma недоступны нужные reference facts, честный результат — incomplete
с путём недостающего поля; такой кейс не считается принятой положительной проверкой.

Дополнительный контроль: вернуть изменённый stop/transform к исходному состоянию
или заново создать чистый экземпляр — нарушение должно исчезнуть. Это проверка
восстановленного состояния, не обещание автоматического reset в Editor.

Прежние результаты r5/0.2.31 выше сохраняются как история. При проверке старого
snapshot новым compiled ожидается unknown для потерянных gradient facts, а не
ложный pass. Полная проверка одного сценария не переводит весь контракт в Ready:
manual r6 остаётся 4 reviewed /2 draft до отдельного ревью и следующего P0.
