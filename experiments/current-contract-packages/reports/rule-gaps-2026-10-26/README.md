# Исполнение контрактов · 26.10.2026

Исправлены пять рабочих пакетов: Tag / FilterTag / Skeleton / TagGroup **r3**, Status & Property **r6**.

- Геометрия читает `bounds.height/width`, условия правил сохранены.
- TagGroup сравнивает Size динамических Tag в открытом native SLOT существующим `propertyMapping`.
- Скрытый Label даёт нарушение обязательности; его detail checks не выдаются за непроверенные.
- Empty TEXT захватывает разрешённые значения связанных fontFamily/tracking; типографика не освобождается от проверки.

Повтор 79 сохранённых снимков: **67 → 0** неопределённых проверок. TGR-03 теперь даёт одно ожидаемое нарушение. Это replay, не свежая приёмка Figma.

[Eval и pins](eval.json). Совместимые runtime/data/main опубликованы и установлены локально. Прежний default Git index сохранён для старого runtime; новый runtime использует собственный обычный production index. Статус — **INSTALLED_NATIVE_PENDING**. Проверка новых данных до установки прошла; после установки штатный configured Git-check получил сетевой ECONNRESET на github.com до TLS. Это отдельный незакрытый transport check.

## Короткая ручная проверка установленной пары

Перезапустите Apollo в Figma, чтобы загрузить обновлённый код чтения. Платформа Desktop, контракты из Proxy. Ссылки ведут на проверяемые экземпляры. RESET не требуется.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [TAG-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14494-72133) | Desktop; Size=40, Shape=Rectangular, штатные Label/аддоны. | 0 нарушений |
| [FT-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14494-111197) | Desktop; Size=40, Shape=Rectangular, штатные Label/Value. | 0 нарушений |
| [TGR-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14494-112162) | Size=40 у группы и всех Tag. | 0 нарушений |
| [TGR-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14494-112485) | Size группы=40; Size одного Tag=32. | 1 нарушений · `component:web-core.tag-group.nested-tag-size-matches-group` |
| [SK-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14487-72550) | TextStyle=16_24; Length=56. | 0 нарушений |
| [SP-09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71377) | Label скрыт. | 1 нарушений · `component:web-corp.status-property.label-is-required` |
| [SP-10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14371-71385) | Label видим, текст пустой; исходный текстовый стиль и режим переменных. | 1 нарушений · `component:web-corp.status-property.label-is-required.nonempty` |

В SP-10 не ожидаем ошибок fontName/letterSpacing. Свежий захват должен учитывать связанные переменные.
