# Status Core r1 — Draft для проверки

Один актуальный публичный Status 349af184, 24 native variants. Старый scheduled 🔄Status и внутренние Label/Addon исключены из публичных корней. Две существующие нормы записаны как 3 уникальных authoring-правила: native API policy, 14 baseline IR и 9 text-metric IR. Новых числовых норм нет.

Пакет [Status.r1.draft.component-contract.zip](packages/Status.r1.draft.component-contract.zip), [manual](contract.manual.json), [eval](reports/authoring-r1-2026-10-23/eval.json). Compile и точный full-facts ZIP reopen прошли; native verdicts пока NOT_RUN_USER_ONLY.

## Проверка в Apollo

Восемь кейсов уже настроены в [заданной секции](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=13573-169065), борд [Status Core r1](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14351-70539). Платформа Desktop; выбирать по одному экземпляру. Все параметры и намеренные нарушения выставлены заранее. Штатные аддоны в этих кейсах содержат исходный пустой SLOT/fixer; произвольная вставка или замена ассетов не входит в эту матрицу.

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

[Точные ожидаемые RuleID и исходные значения для восстановления](reports/authoring-r1-2026-10-23/test-cases.json). Повторные RESET-тесты заранее не назначаются.

## Доставка и границы

После push main владельцем: «Проверить обновления → Обновить» в миниаппе Proxy. Готов dataId 537a7f283a68484551d14c20c3797a622f9c370705776804e74e3d14837ca39f, 15 контрактов; прежние 14 entries и generation pins сохранены. Runtime 6c6 не менялся, пересборка приложения/плагина не нужна.

Label/Addon — внутренние части этой family, self-dependency не создан. Собственные нормы внешних ассетов SLOT/Addon пока не заявлены: [dependency inventory](reports/authoring-r1-2026-10-23/dependency-inventory.json). Идентичность textStyle при неизменных метриках отдельно не проверяется. Draft и wholeReady=false сохраняются до содержательной приёмки.

## Контекстные файлы

- Каталоги: Web Core -- Status.json.
- Агентские файлы: Status/{agent-context.json,rules.json,composition-contract.json,contract.generated.json,contract.overrides.json,audit-mapping.json,contract.manual.json,variant-anatomy.source.json}.
- Паттерны: не использовались.
- Редполитика: не использовалась — синтетические подписи кейсов.

[Точные paths/SHA и созданные Figma IDs](reports/authoring-r1-2026-10-23/context-files.json).
