# TabsView — Code Connect Desktop и Mobile Web

Два parserless `.figma.ts` по структуре Core: URL/source/component,
selectedInstance, figma.code, imports/example/id/metadata.

| Платформа | Figma component set | Шаблон |
| --- | --- | --- |
| Desktop | [[D] TabsView](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=102669-84577) | [TabsViewDesktop.figma.ts](TabsViewDesktop.figma.ts) |
| Mobile Web | [[M] TabsView](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=102669-97044) | [TabsViewMobile.figma.ts](../mobile-web/code-connect/TabsViewMobile.figma.ts) |

Обе платформы используют публичный `import { TabsView } from 'arui-private/tabs-view'`.
Source 81.1.0, commit `4bf38e2be8589da705f991b4dcac0d41975dff3d`.
В source responsive-компонент выбирает Desktop/Mobile по breakpoint 768;
приватные TabsViewDesktop/TabsViewMobile из barrel не экспортируются.

## Соответствие

- Покрыты оба значения `Skeleton`: false и true на каждой платформе.
  Desktop BOOLEAN `TabsSecondary`, Mobile BOOLEAN `Secondary` управляют вторым рядом.
- Обычный вариант читает видимые собственные TabsPrimary/TabPrimary и вторичные
  `[D] TabsSecondary` / `[M] TabsSecondary`, сохраняет тексты, disabled,
  выбранные индексы и right addons. Items вторичного ряда — настоящий SLOT;
  его элементы декодируются в типизированные данные, поскольку API принимает
  `TabsState[]`, а не произвольный JSX SLOT.
- Secondary source использует filled tags size xs, соответствующий Tag40.
  Невыразимые состояния (например LeftAddon, иной размер/вид/shape Tag)
  отклоняются. Slider отмечается как контекст: source всегда scrollable,
  а наличие overflow зависит от ширины приложения.
- Приложение передаёт устойчивые непустые уникальные бизнес-ID primary/secondary,
  dataTestId, реальные callbacks, при необходимости right addons. ID Figma
  и заглушки обработчиков не выдаются как бизнес-данные.
- Видимая secondary-группа принадлежит только выбранной primary-вкладке.
  Данные остальных групп приложение может передать через secondaryByPrimary;
  видимый ряд не копируется автоматически во все группы.
- Skeleton не раскрывает реальные подписи и бизнес-ID. Приложение передаёт
  реальные tabs и начальные выбранные ID; showSkeleton передаётся через
  настоящие additionalMainTabsWrapperProps/additionalSecondaryTabsWrapperProps.

**INITIAL_SELECTION_SOURCE_GAP:** source использует activePrimaryTab и
activeSecondaryTabId для начального state; последующие изменения этих props
не синхронизируются. Этот факт сохранён в snippets/metadata и отдельно в
техническом backlog. Поведение исходника здесь не исправлялось.

## Проверка и публикация 05.11.2026

- Official CLI 1.4.9: parse ровно двух canonical templates, стандартная
  validation и upload PASS. Preview-копии не публиковались.
- 6 native read-only previews: четыре варианта и два component set,
  каждый set использовал свой normal default. Выдача точно совпадает с fixtures.
- 4 прямых MCP variant readbacks: hasTemplate=true, TabsView, правильные source
  и публичные imports; snippets точно совпадают с native preview.
  Desktop ранее имел source-link без template и fallback `<DTabsView />`;
  теперь прямой readback подтверждает настоящий шаблон.
- Оба set-level MCP lookup дважды вернули timeout и `{}`. Это не доказательство
  отсутствия подключения; отдельный set-level snippet в MCP не подтверждён.
  На variants результаты получены. CLI публикация адресована component sets.
- 8 групп тестов: strict template types, D/M и ownership, Skeleton/visibility,
  escaping/addons/selection, отрицательные controls/ID, реальные source handlers
  с изолированными React hooks, точное сравнение native и типы опубликованного кода.
- API check использует actual public responsive source/barrel/typings и точную
  AST props projection приватного Base. Полный strict-check implementation
  с текущим host дал одну существующую strict-null диагностику в Base;
  первый результат сохранён. Успешная сборка установленного SDK не заявлена.

[Fixture и provenance](figma-context.json), [тесты](TabsView.test.cjs),
[receipt](publication/2026-11-05.json),
[фактические snippets и set lookup](publication/2026-11-05.snippets.json).
Диагностические материалы: `.local/tabs-view-code-connect-2026-11-05/` workspace.
Browser и полная визуальная эквивалентность отдельно не проверены.

Повтор локальных тестов из каталога TabsView с имеющимися зависимостями:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
node --test code-connect/TabsView.test.cjs
```

Нормы, контракты, raw, Draft/Ready, arui-private и runtime Apollo не изменялись.
