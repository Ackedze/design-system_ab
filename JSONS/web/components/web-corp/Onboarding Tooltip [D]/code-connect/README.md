# Onboarding Tooltip — Code Connect

Parserless [OnboardingTooltip.figma.ts](OnboardingTooltip.figma.ts) по структуре Core.

| Figma set | Публичный import | Source |
| --- | --- | --- |
| [Onboarding Tooltip — 12 вариантов](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=31961-32462) | `import { OnboardingTooltip } from 'arui-private/onboarding-tooltip'` | `src/onboarding-tooltip/onboarding-tooltip.tsx` |

Исходная ссылка ведёт на [страницу](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=9817-123425).
Main set key `c9a8db25e3fb6bc7907464f81547a6295816c59b` подтверждён отдельным
запросом после page discovery. Текстовый layout, Pips и Footer соответствуют
OnboardingTooltip; graphics wrapper onboarding-tooltip-new не нужен этому семейству.

## Соответствие и контекст

- Tail Direction инвертируется в placement пузыря: ← → right, → → left,
  ↑ → bottom, ↓ → top. Start/Center/End задаёт suffix -start / пусто / -end.
  Все 12 сочетаний покрыты; nested TooltipTail должен соответствовать root.
- Собственные TEXT Text content → `title`, `subhead`, `description`.
  Boolean Subhead/Subtitle управляют наличием текста; вложенные button labels
  не попадают в body. Identity Text content и Onboarding footer проверяется.
- Видимые Pips и Selected → `totalSlides` и **нулевой** `currentSlide`.
  Должна быть ровно одна выбранная точка. Снимок текущего шага не заменяет
  управление всей последовательностью в приложении.
- Primary/Secondary labels → nextButtonText/prevButtonText. Source фиксирует
  size=40 и роли. Поддерживаются реальный nextButtonRightAddon и prevButtonLeftAddon;
  disabled/Hint/другая Shape/неподдержанная сторона addon отклоняются.
- Приложение передаёт настоящий anchor ReactElement, visible, onClose,
  onClickNext, при наличии Previous — onClickPrev, для Pips — onClickPips,
  а также реальные ReactNode addons. Заглушки обработчиков и anchor не создаются.

## Подтверждённое ограничение source

Во всех текущих masters выбран первый pip (currentSlide=0), но Previous видим.
Source OnboardingFooter показывает Previous только при currentSlide>0.
Сниппет сохраняет индекс 0 и label; `PREVIOUS_BUTTON_SOURCE_GAP` явно предупреждает,
что исходник скроет Previous. Индекс и семантика шага не подменяются ради видимости.
Source также скрывает Pips при totalSlides=1: одиночная видимая точка даёт warning.
Библиотека не исправляется этой задачей.

Source использует TooltipDesktop и Highlighter с автоматическим scroll.
Настройка geometry/portal/scroll, управление переходами и accessibility требуют
проверки в приложении. Mobile execution отдельно не подтверждена.

## Проверки и публикация

13 native read-only previews: 12 вариантов и set, точное совпадение с fixture.
7 групп тестов: placement, тексты/Boolean state, 4 выбранных индекса и одиночный pip,
addons, отказ для неизвестных/неподдержанных states, реальные source handlers,
Previous visibility, native и public API types со всеми возвращёнными imports.

Source API проверяется через точные AST props projections OnboardingTooltip и
Highlighter с реальными public barrels и остальными type dependencies. Первый
полный strict-check implementation цепочки дал 13 диагностик в текущем host;
результат сохранён. Это API check, не успешная сборка всего SDK 81.1.0.
Source commit `4bf38e2be8589da705f991b4dcac0d41975dff3d`.

[Receipt](publication/2026-11-05.json),
[12 фактических MCP snippets и set query](publication/2026-11-05.snippets.json),
[fixture/provenance](figma-context.json), [тесты](Onboarding.test.cjs).
Отдельные Tail/Pips/Text content/Close/Footer helpers не публикуются.

Тесты — из папки компонента с теми же переменными ARUI_SOURCE_ROOT,
ARUI_SDK_NODE_MODULES и NODE_PATH, что описаны в
[Onboarding Hint](../../Onboarding%20Hint%20%5BD%5D/code-connect/README.md).
CLI parse/publish — из корня design-system_ab; scoped includes escape `[D]`.

Contracts/raw/ZIP, Draft/Ready и прежние seals не меняются.
Browser/установленный SDK, полное визуальное соответствие, real anchor/scroll
и accessibility отдельно не проверены. Source/build arui-private/Apollo/Proxy не меняются.
