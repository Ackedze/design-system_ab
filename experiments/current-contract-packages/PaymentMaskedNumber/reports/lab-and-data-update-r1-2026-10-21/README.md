# PaymentMaskedNumber r1: лаборатория и данные

Draft r1; 4 уникальных authoring-правила, 6 IR. Нового runtime и сборки проекта нет.

Борд: https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14285-70803

Экземпляры уже настроены. В Apollo выбирайте сам INSTANCE, платформа Desktop. Universal root тот же для mobile-web. Таблица относится только к новому набору r1; прежний сентябрьский борд не используется.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [PMN-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14285-70808) | Библиотечный эталон, RightAddon=false | 0 нарушений |
| [PMN-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14285-70822) | Один text/negative для Major и Minor; RightAddon=true, отступ 6 px | 0 нарушений |
| [PMN-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14285-70836) | У Major снята привязка цвета | 1 · parts-share-color-token.1.2 |
| [PMN-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14285-70850) | У Major отключён Text Style, fontSize=15 | 1 · typography-follows-effective-pair.1.1 |
| [PMN-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14285-70864) | Mask Number=True; U+00B7 U+00B7 U+2009 | 0 нарушений |
| [PMN-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14285-70879) | Mask Number=True; вместо маски `.. ` | 1 · mask-format.1.1 |
| [PMN-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14285-70894) | RightAddon=true; paddingLeft=4 px | 1 · addon-geometry.1.1 |
| [PMN-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14285-70908) | RightAddon=true; paddingTop/Bottom=6 px, высота Addon=28 px при line-height=20 | 1 · addon-geometry.1.2 |

Проверены actual component keys, нативные параметры и мутации без detach, screenshot/readback. Это подготовка fixtures, не выполненная проверка Apollo. Новые RESET не назначены: механизм общий, нарушения изолированы отдельными экземплярами.

Проверка формата открытого Major и четырёх цифр Minor остаётся явным пробелом r1. Общий токен проверяется; принадлежность произвольного токена библиотеке относится к общей политике. Количество IR не означает полноту исходных 12 норм.

## Каталоги

- `JSONS/web/components/web-corp/Web _ Corp Components -- PaymentMaskedNumber.json`
- `JSONS/styles/Web _ Typography.json`
- `JSONS/tokens/001 _ Interface Dynamic Colors.json`

## Агентские файлы

В `JSONS/web/components/web-corp/PaymentMaskedNumber/`: `agent-context.json`, `rules.json`, `composition-contract.json`, `contract.overrides.json`, `contract.manual.json`. Canonical root: текущий main checkout design-system_ab. Все экземпляры импортированы по активному ключу `bd25bbd83bfc28176b42284659f21c8a7cd8e97b`. Подписи используют библиотечный текстовый стиль, текстовый токен text/primary; фон neutral/0. Raw цвет и типографика оставлены только как заданные отрицательные мутации.

## Паттерны

Не использовались: это локальная техническая матрица, не продуктовая страница. Сборка page shell не требуется.

## Редполитика

Не использовалась: технические подписи кейсов.
