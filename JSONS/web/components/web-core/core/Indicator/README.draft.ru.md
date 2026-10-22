# Indicator r2 · Draft для Apollo

Существующий Web _ Core Indicator; 3 authoring-правила, 23 IR, 36 вариантов. Engine/core/Editor/Proxy не менялись.

В r2 исправлены источник условия Size для Count и структура Size=8. На сохранённых native-снимках: **0 / 0 / 0 / 1 / 1 / 1 / 1 / 0**, неопределённых проверок нет. Свежий прогон установленного r2 ещё предстоит. [Разбор и evidence](reports/applicability-r2-2026-10-23/eval.json).

## Проверка

Выбрать конкретный экземпляр по ссылке. Мутации уже подготовлены. Платформа Apollo — Desktop; компонент универсален.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [IND-01 · Библиотечный вариант](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14338-70498) | Size=24, View=Red, Border=False; Value=1 | 0 |
| [IND-02 · Публичные параметры и текст](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14338-70501) | Size=16, View=Gray, Border=True; Value=12 | 0 |
| [IND-03 · Size 8 без Count](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14338-70504) | Size=8, View=Red, Border=True; Value=1 | 0 |
| [IND-04 · Изменена прозрачность](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14338-70507) | Size=24, View=Red, Border=False; opacity: 1 → 0.5 | 1 · `component:web-core.indicator.layer-properties-use-effective-baseline.1.13` |
| [IND-05 · Изменён отступ слева](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14338-70510) | Size=24, View=Red, Border=False; paddingLeft: 4 → 8 | 1 · `component:web-core.indicator.layer-properties-use-effective-baseline.1.5` |
| [IND-06 · Изменён размер шрифта](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14338-70513) | Size=24, View=Red, Border=False; fontSize: 14 → 15 | 1 · `component:web-core.indicator.count-typography-baseline.1.2` |
| [IND-07 · Изменён цвет Count](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14338-70516) | Size=24, View=Red, Border=False; countFill: token-bound → raw magenta | 1 · `component:web-core.indicator.layer-properties-use-effective-baseline.1.11` |
| [IND-08 · Другой Size и View](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14338-70519) | Size=32, View=White, Border=True; Value=7 | 0 |

## Обновление

Пушить canonical shared/design-system_ab/main; затем в миниаппе Proxy «Проверить обновления → Обновить». dataId: `4bced87b58eaa1e6e5752aa698618354ccad8d2a250d145ed6e4493ec4fbca50`. В пакете 13 контрактов. Сам автор ничего не пушил и не устанавливал.

## Границы Draft

Числовой формат/максимум счётчика и контекст выбора View не добавлены: их нет в исходных нормах. Сравниваются параметры типографики; отдельная проверка detach стиля с неизменными метриками не заявлена. Свежие verdicts Apollo выполняет владелец.

После пробы: Switch → Status Core → Status & Property AB.
