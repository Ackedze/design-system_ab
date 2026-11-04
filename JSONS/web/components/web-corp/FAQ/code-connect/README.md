# FAQ — Code Connect

Шесть parserless `.figma.ts` по структуре Core: URL/source/component,
`figma.selectedInstance`, `figma.code`, literal id, imports/example/metadata.
Публикация и MCP readback — [в финальном receipt](publication/2026-11-04.json).

| Figma | Файл | Identity |
| --- | --- | --- |
| FAQ, общий Desktop / Mobile Web | [FAQ.figma.ts](FAQ.figma.ts) | [75685:85376](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=75685-85376) |
| FAQItem, общий Desktop / Mobile Web | [FAQItem.figma.ts](FAQItem.figma.ts) | [75685:85154](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=75685-85154) |
| Promo FAQ Desktop | [FAQPromoDesktop.figma.ts](FAQPromoDesktop.figma.ts) | [103095:68636](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=103095-68636) |
| Promo FAQItem Desktop | [FAQItemPromoDesktop.figma.ts](FAQItemPromoDesktop.figma.ts) | [103095:68575](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=103095-68575) |
| Promo FAQ Mobile Web | [FAQPromoMobile.figma.ts](../mobile-web/code-connect/FAQPromoMobile.figma.ts) | [103095:68664](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=103095-68664) |
| Promo FAQItem Mobile Web | [FAQItemPromoMobile.figma.ts](../mobile-web/code-connect/FAQItemPromoMobile.figma.ts) | [103095:68596](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=103095-68596) |

Обычный FAQ в свежей Figma имеет одну общую identity для обеих платформ.
Отдельная фиктивная Mobile-связь для того же узла не создаётся. Все шесть
сниппетов используют публичный **`FAQ` из `arui-private/faq`**, responsive на
768 px. `FAQItem` является внутренней реализацией и из этого barrel не
экспортируется: standalone FAQItem представлен публичным FAQ с одним item.
Promo задаётся настоящими `promo` и `promoBackground`.

Source API 81.1.0 проверен на commit `4bf38e2be8589da705f991b4dcac0d41975dff3d`.
Это проверка исходников, а не установленного SDK 81.1.0 или браузерного результата.

## Соответствие

| Figma | React |
| --- | --- |
| Видимые FAQItem в исходном порядке | `items`; в каждом default root видимы 4 из 8 сохранённых instances |
| AccordionHeader / Text | `question`; текст читается динамически без зависимости от названия Title/Заголовок |
| Видимый AccordionBody / Text | `answer`; закрытый или сложный ответ требует данных приложения |
| Open True / False | `preExpanded` с реальными item IDs; только начальное раскрытие |
| Border BOOLEAN обычного FAQItem | `hideBorderForItems` по реальным IDs |
| Promo Style Level 1 Primary | `promoBackground`: base-bg / base-bg-alt; общий для всех items |
| Режим переключения | `isAccordion` приложения: один или несколько открытых пунктов |

Непустые уникальные ID передаются через `content` вместе с отсутствующими
ответами. Код проверяет ID; повторяющийся вопрос не становится идентификатором.
Видимые question/answer имеют строковый fallback из выбранного instance.
`content[i].question` и `content[i].answer` принимают настоящие ReactNode
overrides: ссылки, списки, компоненты и форматирование задаёт приложение.
TextHandle сообщает plain text; rich content не восстанавливается из этой строки.
Несколько текстовых фрагментов не склеиваются: требуется соответствующий ReactNode.
Текст ответа другого Open=True master не подставляется в закрытый пункт.

FAQ сам управляет раскрытием. `onItemClick` — необязательный реальный callback
приложения; фиктивного обработчика, prop expanded или отдельного Accordion
вместо FAQ шаблоны не создают. SLOT-свойств здесь нет; getSlot не вызывается.

## Вложенное исполнение и границы

Родитель требует подключённый FAQItem и сверяет его native `symbolId` с двумя
проверенными вариантами соответствующего семейства. Он вызывает executeTemplate;
доступная metadata проходит проверку формы и family. Ошибка дочернего шаблона
явно останавливает родителя.

В проверенном native context подключённые FAQItem возвращали `codeConnectId=null`
и INSTANCE-ссылку без metadata. Причина поведения сервиса не установлена;
literal id/nestable и передача всех шести шаблонов в preview его не изменили.
При отсутствии metadata используются те же typed properties дочернего instance
и полные пути от корня. Повторяющиеся имена слоёв, чужая identity, отсутствующая
связь и некорректная metadata отклоняются. Fixtures покрывают оба вида ответа.

Разные Promo background colors внутри одного FAQ отклоняются: публичный
`promoBackground` общий. Неизвестные Open, Preset, Position, Style Type или
BackgroundColor требуют нового проверенного рецепта; произвольные props
из названий Figma не придумываются.

**Известное расхождение:** в четырёх standalone Promo FAQItem master-вариантах
BackgroundPlate скрыт, но source `FAQ promo` всегда его рисует. Сниппеты содержат
`SOURCE_PROMO_PLATE_VISIBILITY_GAP`. В проверенных Promo FAQ roots плашки видимы;
Desktop использует base-bg-alt, Mobile Web — base-bg.

## Проверка и запуск

- 13 тестов: порядок/видимость, начальное раскрытие, Border, ReactNode overrides,
  escaping, ID, отрицательные identity/props/colors, отсутствие nested metadata
  и отказ при ошибке дочернего шаблона.
- Реальные source functions проверены: independent/accordion toggle,
  onItemClick, borders, ReactNode passthrough и Promo defaults.
- Native preview проверяет 3 roots, 6 item variants и 3 default set states.
  Диагностические копии используются только read-only и не публикуются.
- Результат публикации, actual snippets/imports и coverage MCP:
  [receipt](publication/2026-11-04.json), [readbacks](publication/2026-11-04.snippets.json).

При первой публикации сначала проверить/опубликовать три FAQItem через
`figma.items.config.json`, затем preview и публикацию корней через
`figma.roots.config.json`. Общий `figma.config.json` включает ровно шесть
canonical files. Перед publish обязательны непустой native preview и source
API types, после — собственный непустой snippet в MCP.

Локальные тесты из каталога компонента:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node --test code-connect/FAQ.test.cjs
```

Browser rendering, доступность и поведение в реальном приложении, установленный
SDK 81.1.0 и полная визуальная эквивалентность не проверены. Contracts, raw
каталог, исторические mappings/seals и Draft/Ready не изменены.
[Контекст Code Connect](figma-context.json) сохраняет provenance; существующие
raw structure/variantStructures остаются источником Apollo.
