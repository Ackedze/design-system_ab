# NEXT-05 — proposed desktop Size=56 recipes, v1

Рецепт реализован и проверен в настоящем Chrome на существующей selective source distribution arui-private 80.7.1. Два независимых профиля имеют статус **proposed-for-review**. Это handoff для Generation; принятие ширины, SOURCE_COMPILE, scoped Ready, Code Connect parity и выполнение через Apollo v4/Proxy остаются отдельными шагами.

Файлы: src/recipe.tsx — React-рецепт и guard; src/application.ts — typed DTO/command-bank adapter; src/probe.tsx — лаборатория; profile.v1.json — versioned descriptor; artifacts/browser-receipt.json — реальные измерения и callback logs; ../../../reports/NEXT-05-api-recipes.2026-10-05.json — сводка с SHA-256. Прежний NEXT-05-source-build и все его 67 pins сохранены.

| Профиль | Условие применения | Поведение |
|---|---|---|
| desktop-size56.baseline-no-overflow.v1 | Desktop, ровно 2 текстовых действия, Size=56, Figma Overflow=false | Без mapper/picker routing. Pass только при двух видимых кнопках высотой 56, отсутствии Picker и достаточной измеренной ширине |
| desktop-size56.opt-in-overflow-commands.v1 | Явный opt-in, desktop, 1–4 текстовых действия, Size=56 | Скрытые действия → реальные Picker options с key=action.id; onChange → initiator.key → business command |

Профиль с mapper не выбирается автоматически из Figma Overflow=false и не включён в frozen registry consumer. Он требует отдельного принятия владельцем и интеграции Generation.

## Структурный Body и ширина

CorporateContent получает обычный children-узел Body. Прозрачный Body wrapper имеет flex: 1 1 0%, minWidth: 0, display: flex, flexDirection: column, alignItems: stretch. Внутри него отдельный action allocation получает caller-provided inlineSize, maxInlineSize: 100%, minInlineSize: 0. Group располагается в этом allocation без подмены public API.

Это явное предложение по композиции Body. inlineSize не объявлен токеном, нормативным minimum или новым параметром CorporateContent. Вызывающая композиция выделяет ширину по своему контексту; рецепт измеряет фактическую ширину после layout и загрузки шрифта. Parent width, системная row-геометрия, padding и surface самого CorporateContent сохраняют Source поведение.

Guard сопоставляет source-pinned wrappers с action ID, измеряет ширину кнопок вместе с margins, проверяет видимость, clipping, высоту 56, наличие Picker и положение primary. Baseline блокируется при любом скрытом действии или Picker. Опциональный профиль требует видимого ведущего действия и целиком помещающегося Picker. Неизвестная DOM-структура блокируется. requiredInlineSize — сумма фактических текущих wrapper widths/margins; на узком layout текст может переноситься, поэтому это не универсальная intrinsic/minimum width.

До успешного измерения allocation inert. ResizeObserver и MutationObserver обновляют наблюдение; перед каждой командой выполняется повторное живое измерение. Если Source уже скрывает primary, профиль блокирует исполнение. Он не исправляет исчезновение primary и не выключает автоматический overflow библиотеки.

## Применение в Generation после принятия профиля

DTO передаёт профиль, platform, size, groupId, mode, inlineSize и упорядоченные actions с id, label, view, disabled, commandRef. src/application.ts превращает commandRef в реальную функцию из CommandBank, проверяет наличие команды и совместимость профиля. Это локальный DTO предложения, не изменение ScreenSpec, shared schemas или registry.

Пример вызова:
~~~tsx
const application = {
    profileId: 'desktop-size56.baseline-no-overflow.v1',
    groupId: 'feedback-actions',
    platform: 'desktop',
    size: 56,
    mode: 'baseline-no-overflow',
    inlineSize: allocatedWidth,
    actions: [
        {id: 'send', label: 'Отправить', view: 'primary', disabled: false, commandRef: 'feedback.send'},
        {id: 'cancel', label: 'Отменить', view: 'secondary', disabled: false, commandRef: 'feedback.cancel'},
    ],
} satisfies ProposalApplication;

const props = materializeProposal(application, {
    'feedback.send': invocation => submitFeedback(invocation.actionId),
    'feedback.cancel': invocation => cancelFeedback(invocation.actionId),
});
<ProposedDesktopActions {...props} onObservation={recordMeasurement} onRouting={recordRouting} />;
~~~

Идентификаторы должны быть уникальны внутри группы и сохраняться при смене подписи и порядка. Primary разрешён только в позиции 0; остальные — secondary. Действия должны быть текстовыми, массив и записи — неизменяемыми между обновлениями. Вложенный Picker, произвольный React children, иконки/addons, size вне 56 и mobile не входят в этот профиль.

Invocation — discriminated union. source=button содержит настоящий React MouseEvent<HTMLButtonElement>; source=picker содержит groupId/actionId и не имеет event. Общая business command должна уметь работать без DOM event. Handler, которому необходим Button MouseEvent, нельзя переносить в Picker без адаптации бизнес-контракта. selected/value/label/index не используются как ID.

Импорты generator/recipe ограничены arui-private/button-group, arui-private/corporate-content и React. Standalone Core Button импорт не нужен. Mapper и PickerChange выводятся из настоящего ButtonGroupProps; type escapes, fabricated events, mock components и fabricated declarations отсутствуют.

## Браузерные доказательства

Chrome 154.0.8037.95, viewport 1600×1100, React 19.2.7, TypeScript 5.3.3, Core 50.26.1-alfasans. CDP подтверждает system font Alfa Interface Sans / AlfaInterfaceSans-Medium; файл шрифта не bundled и не закреплён по SHA. Consumer должен повторять измерение в своём font environment.

- Короткие 2 действия: allocation 640, измеренная сумма 287, обе кнопки 56, gap 16, реальный Button MouseEvent с currentTarget=BUTTON.
- Длинные разные подписи: allocation 1000, сумма 810, disabled pointer не вызывает команду, enabled вызывает.
- Длинные подписи при 220: blocked, перенос меняет высоту, появляется source Picker, команда не вызывается. Расширение до 1100 восстанавливает pass; сужение снова блокирует.
- 4 действия при 240: primary видим, скрытые options идут в исходном порядке approve/defer/cancel; disabled defer не вызывается. approve можно выбрать повторно — одна команда на выбор.
- После одинаковых подписей и изменения исходного порядка cancel/defer/approve вызовы сохраняют action ID. Label и position не участвуют в маршрутизации.
- 2 действия при 220: длинное secondary исполняет edit через Picker.
- При 64 Source скрывает primary и clipping затрагивает Picker; guard блокирует. В этом Source открытое меню закрывается при resize. Исполнение из сохранившегося stale portal **не проверено**: в реальном кейсе такого portal уже нет. Повторное измерение перед dispatch реализовано, но это ограничение browser proof сохранено.

Девять записанных наблюдений, без page exceptions, failed requests или console warnings/errors. Typecheck и production build проходят. react-doctor 0.9.17: full scan новых пяти файлов — 100/100; changed scope пропускает untracked файлы, поэтому отдельно выполнен full scan. JS chunk около 578 kB остаётся выше Vite warning threshold 500 kB.

## Пределы public API и предложения владельцу implementation

| Предел | Реальный repro | Предлагаемое решение владельца |
|---|---|---|
| Picker onChange не содержит Button MouseEvent | Реальные edit/approve/cancel callbacks имеют source=picker и только action identity | Принять общий command contract; при необходимости добавить keyed onActionSelect с документированным контекстом. Event кнопки не синтезировать |
| Primary может исчезнуть на узком allocation | routing-two, width=64: PRIMARY_HIDDEN / LEADING_ACTION_HIDDEN / PICKER_CLIPPED | Зарезервировать primary в source algorithm либо вернуть официальный minimum/refusal outcome |
| Mapper не управляет порядком всего скрытого списка | Source getPickerButtonOptions обходит hiddenIndexes по возрастанию | Для отдельного порядка меню нужна public hidden-list/order API. Текущий рецепт сохраняет порядок входа; нормативный порядок не объявлен согласованным |
| Нет public visibility/measurement receipt | Guard вынужден читать source DOM с закреплённой структурой | Добавить documented onOverflowChange/measurement result или controlled visibility API |

Ни одно предложенное изменение implementation здесь не внесено. Защищённые geometry/padding/surface и все прежние parity gaps сохранены. Полная private distribution/root Yarn topology не воспроизведены; используется genuine build двух Source closures. Declared peer conflict bem-react-classname 1.3.2 → React 16.* при React 19.2.7 остаётся открытым. В renderer используется собственный native observer guard, без замены Source hook.

## Повторить проверку в текущем закреплённом окружении

Из этой папки, сохраняя уже принятые родительские receipts:
~~~sh
node ../../node_modules/typescript/bin/tsc -p tsconfig.json
node ../../node_modules/vite/bin/vite.js build --config vite.config.mjs
node browser-check.cjs
npx react-doctor@latest --verbose --scope changed
npx react-doctor@latest --verbose --scope full
node handoff.cjs
~~~

handoff.cjs проверяет source/registry/contracts, 67 прежних artifact/source/output hashes, 115 selective distribution files и 486 installed manifest pins. Он пишет только descriptor/receipts этого предложения и собственный NEXT-05-api-recipes report. Смена любой закреплённой версии требует нового review и browser run.

Перед включением в реальный v4 executor Generation должна принять внешний profile port, validate DTO/command bank, применить только явно одобренный профиль, собрать actual host и сохранить measurement/command receipts. Эти интеграционные шаги здесь не выполнены.

