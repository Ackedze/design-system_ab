# Link r2 — ручная проверка в Editor

Пакет Draft. Используй режим проверки authoring; обычный runtime не исполняет Draft. Выбирай сам INSTANCE Link внутри карточки кейса.

Сначала LINK-03 (эталон M), затем LINK-09 и LINK-12. После каждого отрицательного прогона восстанови тот же экземпляр и выгрузи отдельный отчёт. LINK-15 — отдельный чистый контроль, он не заменяет RESET.

Три отчёта r1 от 10.10.2026 не приняты: 31 проверка inconclusive из-за `reference-pin-stale`. Пять новых отчётов r2 подтвердили LINK-03, LINK-09 + RESET и LINK-12 + RESET: 0/1/0/1/0, inconclusive=0, оба RESET на тех же экземплярах. Следующая партия: LINK-01, LINK-02, LINK-04, LINK-05 и LINK-06. [Сохранённая приёмка](../reports/live-review.r2.2026-10-10T08-54-55Z.json).

| Кейс | Параметры | Мутация / проверка | Ожидание | Восстановление |
| --- | --- | --- | --- | --- |
| [LINK-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67850) | Size=S (14-20); Left/Right=true/true; Line=Solid | Эталон S | 0 intrinsic violations; context/policy scope отдельно | — |
| [LINK-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67870) | Size=S (14-20) (Size-20 icons); Left/Right=true/true; Line=Solid | Эталон S + иконки 20 | 0 intrinsic violations; context/policy scope отдельно | — |
| [LINK-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67888) | Size=M (16-24); Left/Right=true/true; Line=Solid | Эталон M | 0 intrinsic violations; context/policy scope отдельно | — |
| [LINK-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67908) | Size=L (18-24); Left/Right=true/true; Line=Solid | Эталон L | 0 intrinsic violations; context/policy scope отдельно | — |
| [LINK-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67928) | Size=M (16-24); Left/Right=true/true; Line=Solid | Публичный Label | 0 intrinsic violations; context/policy scope отдельно | — |
| [LINK-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67948) | Size=M (16-24); Left/Right=false/false; Line=Solid | Аддоны отключены через API | 0 intrinsic violations; context/policy scope отдельно | — |
| [LINK-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67968) | Size=M (16-24); Left/Right=true/true; Line=Pseudo | Line=Pseudo через вложенный API | 0 intrinsic violations; context/policy scope отдельно | — |
| [LINK-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-67989) | Size=M (16-24); Left/Right=true/true; Line=None | Line=None · синяя, вне абзаца | 0 intrinsic violations; context/policy scope отдельно | — |
| [LINK-09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68009) | Size=M (16-24); Left/Right=true/true; Line=Solid | Нарушение · gap 8 → 11 | `component:web-core.link.layer-properties-use-effective-baseline.1.6` → violation | gap=8 |
| [LINK-10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68029) | Size=M (16-24); Left/Right=true/true; Line=Solid | Нарушение · padding left 0 → 7 | `component:web-core.link.layer-properties-use-effective-baseline.1.5` → violation | paddingLeft=0 |
| [LINK-11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68049) | Size=M (16-24); Left/Right=true/true; Line=Solid | Нарушение · opacity 1 → 0.5 | `component:web-core.link.layer-properties-use-effective-baseline.1.12` → violation | opacity=1 |
| [LINK-12](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68069) | Size=M (16-24); Left/Right=true/true; Line=Solid | Нарушение · fontSize 16 → 18 | `component:web-core.link.label-typography.1.2` → violation | Label fontSize=16 |
| [LINK-13](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68089) | Size=M (16-24); Left/Right=true/true; Line=Solid | Высота иконки >24 · fixture pending | **Пока не запускать**: fixture не подготовлен; ожидаемое нарушение >24 сохраняется | icon height=24 |
| [LINK-14](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68109) | Size=M (16-24); Left/Right=true/true; Line=Solid | Нарушение · заливка корня | `component:web-core.link.root-fill-baseline.1.1` → violation | root fill invisible |
| [LINK-15](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | Size=M (16-24); Left/Right=true/true; Line=Solid | Чистый контроль M | 0 intrinsic violations; context/policy scope отдельно | — |
| [LINK-16](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68149) | Size=M (16-24); Left/Right=true/true; Line=Solid | Нарушение · tracking → 0 | `component:web-core.link.label-typography.1.4` → violation | Label tracking=-0.24px |

LINK-03, LINK-09 + RESET и LINK-12 + RESET приняты в указанной области на установленном Editor r2. Остальные live-кейсы ещё NOT_RUN_USER_ONLY; LINK-13 — FIXTURE_NOT_PREPARED. Локальные 32 проверки используют native captures и явно заданные counterfactual mutations; они отдельно от результатов пользователя.

Нужно отдельно проверить публичные swaps, BOOL active/inactive, остальные baseline-факты и UNKNOWN. Полная карта: [coverage-map.json](coverage-map.json).
