# CorporateContent — Code Connect

Подготовлено 03.11.2026 для Desktop и Mobile Web. **Опубликовано и проверено
через Figma MCP 04.11.2026.** Официальный CLI установил оба шаблона; оба root
возвращают `hasTemplate=true`, public import и рабочий пример Body → `children`.
[Receipt публикации и фактический readback](publication/2026-11-04.json).

| Платформа | Шаблон | Опубликованный Figma key | Body property identity |
| --- | --- | --- | --- |
| Desktop | [CorporateContentDesktop.figma.ts](CorporateContentDesktop.figma.ts) | `a8d13cb6e1ae67a7296709f669238f41971c7197` | `[D] Body#135096:3` |
| Mobile Web | [CorporateContentMobile.figma.ts](../mobile-web/code-connect/CorporateContentMobile.figma.ts) | `11ae074b596a6b3dfb6696f51531439723c0225b` | `[M] Body#135096:2` |

Оба шаблона используют настоящий адаптивный export:

```tsx
import { CorporateContent } from 'arui-private/corporate-content';
```

Сопоставление: Body SLOT → `props.children`. `getSlot()` принимает короткое
публичное имя `[D] Body` / `[M] Body`; полная identity с `#...` сохранена выше
и подтверждена свежим [ответом Figma MCP](figma-context.json). Слоты не читаются
как TEXT или INSTANCE_SWAP. Mobile TopMargin/BottomMargin — внутренние части;
они не добавляются в `children` и не превращаются в вымышленные props.

## Формат и контент

Применён parserless `.figma.ts` формат
[Core PR #2280](https://github.com/core-ds/core-components/pull/2280)
на head `0250cce31906f9ca4307a4a3f0f3470884fdbc05`:
`url/source/component`, `figma.selectedInstance`, `id/imports/example/metadata`.
Обработка непрозрачного содержимого основана на `Underlay`/`List` этого PR.

- Готовые секции и вложенные imports сохраняются в исходном порядке.
- SLOT, instance без результата или комментарий «no Code Connect template
  found» требуют явного `children: ReactNode`. Для нескольких отдельных
  непрозрачных регионов используется `ReactNode[]` с сохранением их позиций.
- Контекстный результат выдаётся функцией `Example`, `metadata.nestable=false`.
  Готовый JSX без такого параметра имеет `nestable=true`. Это характеристика
  кодового примера, а не разрешение вкладывать CorporateContent в себя.
- Отсутствующий обязательный слот и ERROR секции завершают выполнение ошибкой.
  Замены на SwapMe, выдуманный текст или пустой успешный результат нет.

Helpers повторены в двух файлах, поскольку CLI не собирает локальные runtime
imports. Тест проверяет идентичность helpers; общего исполняемого модуля нет.

## Реализация и предел соответствия

Исходник: `arui-private/src/corporate-content/{index.ts,types.ts,
corporate-content.tsx,constants.ts,utils.ts}` и `corporate-content.css`.
Просмотрен HEAD `4bf38e2be8589da705f991b4dcac0d41975dff3d`, версия 81.1.0;
source URL шаблонов указывает на этот commit. Корень адаптивен через
`useMatchMedia('(min-width: 768px)')`, отдельных Desktop/Mobile exports нет.

Figma предоставляет только Body SLOT. Остальные React props, в том числе
`theme`, `verticalPaddings`, `className` и `id`, из Figma автоматически не выводятся.
Фон, Grid & Cols modes, размеры и layout вложенного содержимого требуют
применимых контрактов, системных стилей и контекста приложения. Их полное
визуальное соответствие этот шаблон не доказывает.

Контракты Desktop r13 и Mobile Web r8 и прежние historical seals не изменены.
Новые шаблоны не перепривязывают старые `sourcePin` и не повышают Draft/Ready.
Старые файлы в `arui-private/tools/code-connect/` оставлены как исторический
материал; [конфиг этой папки компонента](../figma.config.json) выбирает только
два новых файла, поэтому нельзя публиковать оба набора одновременно.

## Проверки

На 03.11.2026:

| Проверка | Результат |
| --- | --- |
| Fresh Figma MCP: identities и SLOT definitions D/M | PASS; snapshot рядом |
| Официальный CLI 1.4.9 parse | PASS, ровно 2 parserless шаблона, React/tsx |
| Строгие типы шаблонов, TypeScript 5.9.3 / официальные figma-types | PASS |
| Поведенческие, template typecheck и API тесты | 15 PASS / 0 FAIL / 0 SKIP; 6 сгенерированных JSX примеров и 4 отрицательных props |
| API выбранного локального distribution 80.7.1 | PASS, публичный `arui-private/corporate-content`, без подмены деклараций |
| Опубликованный пакет 81.1.0 | Не проверен: внутренний registry `binary.moscow.alfaintra.net` недоступен (DNS); public npm не предоставил эту версию |
| Исполнение новых шаблонов в Figma/MCP, browser/визуальная эквивалентность | NOT_RUN |
| Публикация Code Connect | NOT_RUN |

04.11.2026 опубликованы те же два шаблона через официальный CLI 1.4.9
`publish --force` с узким конфигом компонента. Server validation PASS,
загрузка 2 шаблонов PASS. Fresh Figma MCP возвращает для каждого root:

```tsx
import { CorporateContent } from 'arui-private/corporate-content';
import type { ReactNode } from 'react';

function Example({ children }: { children: ReactNode }) {
    return <CorporateContent>{children}</CorporateContent>;
}
```

У обоих root `hasTemplate=true`, label `React`, source URL совпадает с
подготовленным шаблоном. Возвращённые MCP примеры отдельно прошли strict
typecheck через public import локального distribution 80.7.1: 2 PASS,
0 diagnostics. Публикация и исполнение Code Connect подтверждены; browser
и полное визуальное соответствие остаются NOT_RUN.

Первоначальная MCP-запись не установила шаблоны (`hasTemplate=false`);
причина не установлена. CLI `--force` заменил конфликтующие UI-created связи.
Исторические ответы и текущий результат сохранены отдельно в workspace
`.local/corporate-content-code-connect-publish-2026-11-04/`:
`BEFORE.json`, `ATTEMPT.json`, `cli-publish-input.json`, `publish.log`,
`AFTER-CLI.json`, `ACTUAL-SNIPPET-TYPES.json`. Файл токена не входит в receipt
или репозиторий.

Distribution 80.7.1 — существующая локальная селективная сборка
`arui-private/tools/code-connect/frontend-host/.work/source/dist`, а не новая
проверка опубликованного 81.1.0. Поставка данных Proxy/Apollo этой публикацией
не обновлялась.
При подготовке были исправлены параметры TypeScript-проверки:
`esModuleInterop=true` необходим для штатного `import figma from 'figma'`.

Для повторения нужен установленный `@figma/code-connect` 1.4.9 с
`figma-types.d.ts`, TypeScript и SDK с React/types. Из папки CorporateContent:

```sh
figma connect parse --dir . --config figma.config.json --skip-update-check --exit-on-unreadable-files
```

Из корня `design-system_ab`, указывая реальные каталоги зависимостей:

```sh
NODE_PATH=/path/to/code-connect-toolchain/node_modules \
ARUI_SDK_NODE_MODULES=/path/to/sdk/node_modules \
node --test JSONS/web/components/web-corp/CorporateContent/code-connect/CorporateContent.test.cjs
```

`NODE_PATH` нужен только тестовому runner для TypeScript. Сгенерированный JSX
разрешает настоящий public import в выбранном SDK через стандартный resolver.
Без `ARUI_SDK_NODE_MODULES` API-тест будет явно SKIP.

Проверка API на целевом опубликованном SDK 81.1.0 и browser/визуальная проверка
остаются отдельными открытыми задачами. Успешная публикация не изменяет
прежние contract source pins и Draft/Ready.
