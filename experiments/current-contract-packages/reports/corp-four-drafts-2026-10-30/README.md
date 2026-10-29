# Четыре Corp-семейства · Draft r1

Проверка через Apollo пока **не запускалась**. Локальная поставка для runtime d058 ожидает публикации. Версия данных: `1.4.4-data.20261030.1`.

FilterCompanySelect имеет два точных проверочных контракта Single/Multi. TitleView, CorporateSystemMessage и ResultScreen включают desktop/mobile-web representations. Общий движок, Apollo и Proxy не изменялись.

Исполняемый scope Draft ограничен полями из manual. Не все компонентные нормы уже имеют native binding; конкретные пробелы перечислены в `coverage-map.json`. Положительный кейс означает отсутствие целевого локального нарушения, а не полноту всех проверок компонента.

**TV-05 пока не запускать.** В rules.json/README TitleStatus требует Status=true; ds-ai-hub допускает самостоятельный TitleStatus. Ограничение не активировано, вопрос владельцу и существующая строка Леджера вновь открыты.

Для каждого экземпляра выбирайте указанную платформу в Apollo. Во всех TitleView отключён Holding, чтобы отдельное расхождение источника M TitleView → D FilterCompanySelect не мешало целевому тесту. Мутации уже подготовлены. Для восстановления изменённого root opacity достаточно вернуть 100%; повторять все RESET не требуется.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [FCS-01 · Single Select · исходный вариант](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78137) | desktop; Open=False, Selected=False, View=Select, ShowFirstCompany=False; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [FCS-02 · Multi · исходный вариант](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78153) | desktop; Open=False, Selected=False, ShowFirstCompany=False; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [FCS-03 · Compact · компания выбрана](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78165) | desktop; Open=False, Selected=True, View=Compact, ShowFirstCompany=False; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [FCS-04 · Compact без выбранной компании · ошибка](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78178) | desktop; Open=False, Selected=False, View=Compact, ShowFirstCompany=False; подготовлено: selected | Нарушение `component:web-corp.filter-company-select.single-compact-selected-required.1.1` |
| [FCS-05 · ShowFirstCompany=True · ошибка](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78189) | desktop; Open=False, Selected=False, ShowFirstCompany=True; подготовлено: legacy | Нарушение `component:web-corp.filter-company-select-multi.show-first-company-forbidden.1.1` |
| [FCS-06 · Непрозрачность корня 55% · ошибка](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78201) | desktop; Open=False, Selected=False, View=Select, ShowFirstCompany=False; подготовлено: opacity | Нарушение `component:web-corp.filter-company-select.layer-properties-use-effective-baseline.1.11` |
| [TV-01 · Desktop xLarge · Holding выключен](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78218) | desktop; View=xLarge, Skeleton=False; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [TV-02 · Mobile xLarge · Holding выключен](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78273) | mobile-web; View=xLarge, Skeleton=False; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [TV-03 · Desktop Large · исходный вариант](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78315) | desktop; View=Large, Skeleton=False; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [TV-04 · Пустой Title · ошибка](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78325) | desktop; View=xLarge, Skeleton=False; подготовлено: empty | Нарушение `component:web-corp.title-view.title-required-non-empty.1.2` |
| [TV-05 · TitleStatus без Status · ожидает решения по норме](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78380) | desktop; View=xLarge, Skeleton=False; подготовлено: titleStatus | Пока не запускать: требуется решение по норме |
| [TV-06 · Непрозрачность корня 55% · ошибка](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78438) | mobile-web; View=Medium, Skeleton=False; подготовлено: opacity | Нарушение `component:web-corp.title-view.layer-properties-use-effective-baseline.1.11` |
| [CSM-01 · Desktop Base Large · исходный вариант](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78449) | desktop; View=Base, Size=Large, BG plate=False; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [CSM-02 · Mobile Base Large · исходный вариант](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78569) | mobile-web; View=Base, Size=Large, BG plate=False; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [CSM-03 · Small · Graphic и Description необязательны](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78615) | desktop; View=Base, Size=Small, BG plate=False; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [CSM-04 · Title скрыт · ошибка](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78648) | desktop; View=Base, Size=Large, BG plate=False; подготовлено: missingTitle | Нарушение `component:web-corp.corporate-system-message.title-required.1.1` |
| [CSM-05 · Graphic скрыт · ошибка](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78693) | mobile-web; View=Base, Size=Large, BG plate=False; подготовлено: missingGraphic | Нарушение `component:web-corp.corporate-system-message.large-graphic-required.1.1` |
| [CSM-06 · Изменён штатный заголовок Error · ошибка](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78739) | desktop; View=Error, Size=Large, BG plate=False; подготовлено: fixedTitle | Нарушение `component:web-corp.corporate-system-message.title-state-text-fixed.1.1` |
| [RS-01 · Desktop Success · исходный вариант](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-78866) | desktop; View=Success; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [RS-02 · Mobile Warning · исходный вариант](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-79017) | mobile-web; View=Warning; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [RS-03 · Desktop Error · исходный вариант](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-79178) | desktop; View=Error; исходный вариант | Без целевых нарушений в исполняемом scope Draft |
| [RS-04 · Непрозрачность корня 55% · ошибка](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14677-79293) | mobile-web; View=Success; подготовлено: opacity | Нарушение `component:web-corp.result-screen.layer-properties-use-effective-baseline.1.11` |

## Оставшиеся области

- FilterCompanySelect: внутренний dropdown, native Slot boundaries, фиксированные управляющие надписи и полная привязка зависимостей. Ширина корня и dropdown не ограничивается выдуманными min/max.
- TitleView: произвольный swap в предусмотренных слотах, статусы/размеры действий, порядок и условная структура; конфликт TitleStatus и desktop Holding внутри mobile source.
- CorporateSystemMessage: ограничения конфигурации вложенных кнопок, Graphic swap, часть Type-dependent настроек, защита структуры и точные dependency bindings.
- ResultScreen: ручные продуктовые нормы отсутствуют в исходном curated guidance. Есть опубликованный API и общий baseline, без выдуманных текстовых лимитов.

Подробности и source → authoring → IR связи находятся в component reports; статусы остаются Draft.
