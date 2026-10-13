# BenefitCard r7 / Editor 0.2.104

Перезапусти плагин и загрузи `BenefitCard.r7.editor-candidate.component-contract.zip`.
Проверяй сам BenefitCard INSTANCE в режиме «Проверить инстанс». Отчёт должен содержать manualRevision=7 и editorVersion=component-contract-editor@0.2.104.

Общие настройки: GraphicPosition=Left, CardAxis=Vertical, Background=True, Compact=False; высота карточки Hug; Graphic.Presets=Image; Content.Bottom=true; Bottom.Presets=Link. У вложенного Link: Size=S (14–20), LeftAddon=false, RightAddon=true, Underline.Line=None. Остальные настройки сохраняются. В параметрах проверки: CardPlacement=single, ViewportClass по платформе строки. Вначале восстанови случайные изменения тестируемого экземпляра; затем выставь параметры выше.

Проверяются три parent RuleID:

- `component:web.benefit-card-bottom-link-text-only.1.1` — конфигурация, layout, стили и устройство Link; разрешён только Label.
- `component:web.benefit-card-link-content-limit.1.1` — не более 32 символов.
- `component:web.benefit-card-link-line-limit.1.1` — не более одной строки.

Начни с двух строк BASE. Ожидаем Compliant по всем трём новым правилам, без UNKNOWN по ним. Полный контракт и дочерний Link остаются Draft; это отдельный статус, не ошибка baseline. После каждой строки выгрузи отдельный JSON.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [D / BASE](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | ViewportClass=desktop; Link.Label=`Подробнее`, одна строка | Все три новые правила Compliant |
| [M / BASE](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | ViewportClass=mobile-web; Link.Label=`Подробнее`, одна строка | Все три новые правила Compliant |
| [D / 32](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | Label=`iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii` (32); одна строка | Все три Compliant |
| [D / 33](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | Добавь одну `i`: 33 символа, одна строка | Нарушение только link-content-limit.1.1 из новых правил |
| [D / RESET 32](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | Удали добавленную `i` | Нарушение длины исчезло |
| [M / 32](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | Label=`iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii` (32); одна строка | Все три Compliant |
| [M / 33](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | Добавь одну `i`: 33 символа, одна строка | Нарушение только link-content-limit.1.1 из новых правил |
| [M / RESET 32](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | Удали добавленную `i` | Нарушение длины исчезло |
| [D / 2 строки](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | Label: `12`, явный перенос строки, `34` | Нарушение только link-line-limit.1.1 из новых правил |
| [D / RESET строки](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | Label=`1234` | Нарушение строк исчезло |
| [M / 2 строки](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | Label: `12`, явный перенос строки, `34` | Нарушение только link-line-limit.1.1 из новых правил |
| [M / RESET строки](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | Label=`1234` | Нарушение строк исчезло |
| [D / настройка Link](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | Label=`Подробнее`; RightAddon=false | bottom-link-text-only.1.1 — violation; лимиты Compliant |
| [D / RESET настройки](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-100973) | RightAddon=true; Label сохраняется | Все три Compliant |
| [M / настройка Link](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | Label=`Подробнее`; RightAddon=false | bottom-link-text-only.1.1 — violation; лимиты Compliant |
| [M / RESET настройки](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13608-101030) | RightAddon=true; Label сохраняется | Все три Compliant |

Если текст 32/33 переносится из-за ширины существующего кейса, условие «одна строка» не выполнено: сохрани отчёт и фактический вид. Не изменяй expected verdict под результат и не меняй размеры карточки ради зелёного отчёта.

Статус всех новых native строк: NOT_RUN_USER_ONLY. Геометрические bounds после текстового reflow не сравниваются parent правилом; собственные нормы Link и его Draft authority сохранены. Оставшиеся зависимости: IconView, BackgroundPlate, token library и сквозная проверка иконок. Перенос reader в v4 — после приёмки работоспособности контракта и отдельного shared-write окна.
