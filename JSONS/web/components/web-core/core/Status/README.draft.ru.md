# Status Core r2 — Draft для проверки

Один актуальный публичный Status, 24 native-варианта. По решению владельца содержимое native SLOT произвольно; Status проверяет собственные слои и контейнер SLOT. Применён подход CorporateContent без изменений движка. Uppercase привязан к native API Label.

Пакет [Status.r2.draft.component-contract.zip](packages/Status.r2.draft.component-contract.zip), [manual](contract.manual.json), [решение владельца](owner-decisions.json), [eval](reports/slot-ownership-r2-2026-10-23/eval.json). Compile и точный ZIP/full-facts reopen прошли. На сохранённых восьми native-captures результат 0/0/0/0/1/1/1/1; UNKNOWN 36→0. Это replay, установленный r2 пока не проверен.

## Проверка в Apollo

Восемь кейсов уже настроены в [заданной секции](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=13573-169065), борд [Status Core r1](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14351-70539). Платформа Desktop; выбирать по одному экземпляру. Все параметры и намеренные нарушения выставлены заранее. Штатные аддоны содержат native SLOT с библиотечным placeholder. Его содержимое не сравнивается с эталоном Status; собственные нормы вставленного компонента относятся к его контракту. После обновления r2 достаточно повторить ST-02/ST-03/ST-08; остальные capture проверены повторным воспроизведением.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [ST-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14352-70628) | Size=20, Shape=Rectangular; оба аддона=False; изменён текст Label. | 0 нарушений |
| [ST-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14352-70633) | Size=24, Shape=Rounded, LeftAddon=True, RightAddon=False; вложенный Label: Uppercase=True. | 0 нарушений |
| [ST-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14352-70644) | Size=32, Shape=Rectangular, LeftAddon=False, RightAddon=True. | 0 нарушений |
| [ST-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14352-70654) | Size=40, Shape=Rounded; оба аддона=False; изменён текст Label. | 0 нарушений |
| [ST-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14353-70560) | Size=20, Shape=Rectangular, без аддонов; ручная пурпурная заливка корня. | 1 нарушений |
| [ST-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14353-70564) | Size=24, Shape=Rounded, без аддонов; opacity корня=50%. | 1 нарушений |
| [ST-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14353-70569) | Size=32, Shape=Rectangular, без аддонов; размер шрифта Label=15 вместо 14. | 1 нарушений |
| [ST-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14353-70574) | Size=40, Shape=Rounded, LeftAddon=True, RightAddon=False; padding top=11 вместо 10. | 1 нарушений |

[Точные ожидаемые RuleID и исходные значения для восстановления](reports/slot-ownership-r2-2026-10-23/test-cases.json). Повторные RESET-тесты заранее не назначаются.

## Доставка и границы

После push main владельцем: «Проверить обновления → Обновить» в миниаппе Proxy. Готов dataId 69b9795b089da663699ed5a27a97dc6969b61f137f44152a895fbbc954800109, 15 контрактов; прежние 14 entries и generation pins сохранены. Runtime 6c6 не менялся, пересборка приложения/плагина не нужна.

Label/Addon — внутренние части этой family, self-dependency не создан. Новый parent replay не подтверждает собственные нормы внешних ассетов SLOT/Addon: [dependency inventory](reports/authoring-r1-2026-10-23/dependency-inventory.json). Идентичность textStyle при неизменных метриках отдельно не проверяется. Draft и wholeReady=false сохраняются. В старом общем обходе вложенный Uppercase Label попал в notChecked; компонентный replay не подтверждает исправление этого отдельного area-governance результата. Generic boundary materializer для двух необязательных SLOT anchors не используется; проверяются явные собственные native-цели.

## Контекстные файлы

- Каталоги: Web Core -- Status.json.
- Агентские файлы: Status/{agent-context.json,rules.json,composition-contract.json,contract.generated.json,contract.overrides.json,audit-mapping.json,contract.manual.json,variant-anatomy.source.json}.
- Паттерны: не использовались.
- Редполитика: не использовалась — синтетические подписи кейсов.

[Точные paths/SHA и созданные Figma IDs](reports/authoring-r1-2026-10-23/context-files.json).
