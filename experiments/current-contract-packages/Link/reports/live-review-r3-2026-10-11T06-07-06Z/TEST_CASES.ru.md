Link r3 / Editor 0.2.100, режим «Проверить инстанс». Size=M (16-24), Line=Solid, оба Addon=true; native Label typography 16/24 и letter spacing −0.24 px. Выделяй корень Link. Каждый URL выбирает INSTANCE. После каждой строки отдельный JSON.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-05 · длинный текст](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | Через публичный Label поставить Открыть подробные условия обслуживания (38 символов); native typography сохранить | 0 intrinsic нарушений |
| [LINK-15 · иконки](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | Label=Label; через публичные Left icon 24 и Right icon 24 выбрать другие иконки DS размером 24, по одной с каждой стороны; сохранить исходный выбор для RESET | 0 intrinsic нарушений; оба icon targets найдены |
| [LINK-15 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | В обоих публичных полях вернуть исходные иконки на том же экземпляре | 0 intrinsic нарушений |

Source/policy RuleID: component:web-core.link.label-content, component:web-core.link.left-icon-swap, component:web-core.link.right-icon-swap. Это разрешённые публичные действия; собственного исполняемого IR у разрешающей policy нет. Ожидаем 8 targets resolved, 0 inconclusive, 3 известных context-only. Для свапа используй поля корневого Link. Содержимое выбранных иконок проверяется будущим сквозным контрактом и этим тестом не принимается. Новые шаги NOT_RUN_USER_ONLY; все остальные незапущенные области сохранены.
