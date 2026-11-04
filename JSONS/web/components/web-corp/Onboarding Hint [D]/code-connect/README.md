# Onboarding Hint — Code Connect

Parserless [OnboardingHint.figma.ts](OnboardingHint.figma.ts) по структуре Core:
URL/source/component, selectedInstance, figma.code, literal id, imports/example/metadata.

| Figma set | Публичный import | Source |
| --- | --- | --- |
| [Onboarding Hint — 12 вариантов](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=67467-50172) | `import OnboardingHint from 'arui-private/onboarding-hint'` | `src/onboarding-hint/onboarding-hint.tsx` |

Исходная ссылка владельца ведёт на [страницу](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=12778-198991).
Page query не обнаружила published components; запрос к фактическому set подтвердил
main component. Это различие области запроса, а не доказательство отсутствия публикации.
Set key `cdb832111bbc0efc2c6d215db6b4eed1e1d02e51`.

## Соответствие

- Tail Direction описывает направление хвоста: ← → position=right, → → left,
  ↑ → bottom, ↓ → top. Tail Position Start/Center/End задаёт suffix
  -start / без suffix / -end. Покрыты все 12 сочетаний; nested Tail сверяется с root.
- Собственный видимый TEXT Title → `tooltipContent`. Строки сохраняются с escaping.
- Видимая `[D] Button` → `buttonText` и реальный `onButtonClick`. Source фиксирует
  Text/32, Rectangular, normal Label, enabled без Hint/addons; другие состояния
  отклоняются. Пустой label не подменяется: в source он скрывает кнопку.
- Source сам рисует Cross size 24. Его скрытие или несовместимый размер отклоняются.
- Приложение передаёт реальный `anchor: ReactElement`, `visible`, `onClose`,
  непустой `dataTestId`, при наличии кнопки — `onButtonClick`.
  Выдуманного якоря, Figma node IDs и фиктивных обработчиков в сниппете нет.

Это обычный OnboardingHint с Core TooltipDesktop. Координаты якоря, portal/scroll
policy, управление жизненным циклом и real DOM/ref остаются контекстом приложения.
Source ограничивает max-width значением 400px; библиотечное описание Figma указывает
420px. Автоматическая эквивалентность всех ручных размеров не заявлена.
Mobile execution отдельно не проверена, несмотря на universal classification raw.

## Проверки и публикация

13 native read-only previews: 12 вариантов и set; все непустые и точно совпали
с fixtures. 7 групп тестов: типы template, exhaustive placement, текст/visibility,
отрицательные controls, реальные source close/button handlers, native preview
и public API со всеми imports. Source 81.1.0, commit
`4bf38e2be8589da705f991b4dcac0d41975dff3d`.

API checker читает actual Hint source/barrel. Для Tooltip/Highlighter используются
точные AST props projections: полный strict-check общей implementation цепочки
с текущими host dependencies дал 13 диагностик в Highlighter/scroll-related code.
Первый результат сохранён; успешная сборка библиотеки/установленного SDK не заявлена.

[Receipt публикации](publication/2026-11-05.json),
[12 фактических MCP snippets и set query](publication/2026-11-05.snippets.json),
[fixture/provenance](figma-context.json), [тесты](Onboarding.test.cjs).
Diagnostic preview copies и отдельные Tail/Cross helpers не публикуются.

Тесты запускаются **из папки компонента**; CLI parse/publish — из корня
design-system_ab с компонентным `figma.config.json`, где `[D]` escaped как `[[]D]`.

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node --test code-connect/Onboarding.test.cjs
```

Browser rendering, позиционирование относительно реального anchor, accessibility
и полная visual parity не проверены. Contracts/raw/ZIP, Draft/Ready и historical
seals не изменены; arui-private/Apollo/Proxy source/build не изменены.
