# [M] ButtonsGroup — mobile-web r2

[ButtonsGroup.mobile-web.component-contract.zip](ButtonsGroup.mobile-web.component-contract.zip) — отдельный авторский пакет для Editor и подготовки источника Apollo v4. Статус **Draft**: 19 Figma-правил и 9 context-only правил поведения. Все 32 исходные нормы учтены в [crosswalk](reports/rule-crosswalk.json), включая отменённые и декларативные нормы.

Паспорт, Size/Overflow API, источники, решения владельца, примеры и инструкции генерации заполнены в [contract.manual.json](contract.manual.json). Code representation появится после подтверждения mobile API/import/platform в `arui-private`. Целевой consumer — `projects/Apollo-v3/apps/apollo-v4`.

## Мобильная область

- Два исходных Button, 1–2 видимые кнопки, только Primary/Secondary; Size всех видимых Button совпадает с группой.
- Primary необязателен, не более одного и первый. SingleIcon необязателен, не более одного и последний; он требует Overflow=true и две видимые кнопки. Сам Overflow=true также требует две видимые кнопки.
- Overflow использует BottomSheet только с действиями, без footer. Его взаимодействие требует фактов сценария и не доказывается снимком группы.
- HORIZONTAL, gap 8 и padding 0 сравниваются с выбранным библиотечным эталоном. Запрета изменения width/height или Hug/Hug нет.
- Иконку SingleIcon нельзя менять во всех Size при SingleIcon=True и Overflow=true. При Overflow=false групповой asset lock неприменим; отдельное правило обнаруживает недопустимый SingleIcon. У второй кнопки готовых Size 32/40 Overflow=true проверяется `LeftAddon / 🔩 Addon`; у первой кнопки во всех Size и второй в Size48/56 при Overflow=true — `LeftAddon / LeftAddon`. Активная иконка сравнивается с собственным эталоном выбранного Button. Эта единая норма имеет три технические проверки по слотам и root variants.
- Exact Button r31 с полным Spinner r8 closure сохранён. Membership и identity учитывают скрытые кнопки.

Компонент: `web-corp.buttons-group`, контракт: `buttons-group.mobile-web`. Representation: `web-corp.buttons-group.figma.mobile-web`; component set `3efdfaf64eddbcf48b183ce917b7a64c0c3d6062`, node `133812:11630`, Figma file `NrzEFUSTXgzOUmsfYym0xD`. Оба target имеют собственные точные source bindings для всех восьми сочетаний Size × Overflow.

## Источники и проверки

В [source/figma-readback.2026-10-05.json](source/figma-readback.2026-10-05.json) сохранено чтение Figma, включая скрытые слои. [source/contract.generated.json](source/contract.generated.json) содержит только производные факты текущего mobile эталона в существующем формате; это не нормативные правила. Августовская Athena-выгрузка имеет устаревшую структуру четырёх Overflow=true вариантов и сохранена по исходному пути, без изменений.

ZIP включает manual, compiled, coverage, validation и четыре исходных JSON. Дополнительно сверены порты 32 библиотечных SingleIcon-вариантов mobile Button для обоих View, четырёх Size, Shape и DisabledState: [source audit](source/button-single-icon-ports.2026-10-05.json). Повторный импорт восстанавливает одну публичную mobile representation, восемь вариантов и 33 узла анатомии начального варианта. Схема, компиляция, lossless reopen, повторная компиляция и parity с общим compiler прошли: [проверка пакета](reports/package-verification.2026-10-05.json).

[24 контрольных случая](reports/constraint-controls.2026-10-05.json) проверяют collection constraints на минимальных синтетических fixtures с наблюдёнными identity и typed properties. Это не live Figma capture, проверка дочерних контрактов или доказательство icon swap/reset. Runtime gate Apollo v4 отклоняет Draft. Пакет не добавлен в accepted/production manifest.

## Следующий шаг в Editor

1. Импортировать один `ButtonsGroup.mobile-web.component-contract.zip` из `current-contract-packages` и открыть live preview `[M] ButtonsGroup`.
2. Начать с Size=56, Overflow=false: исходный экземпляр, скрытие одной кнопки, скрытие обеих, изменение View, Size, gap и root appearance; каждый negative завершать reset.
3. Проверить Overflow=true с двумя видимыми кнопками, а затем SingleIcon/Overflow с одной видимой кнопкой и перестановку SingleIcon.
4. Для Size 32/40/48/56 проверить исходную SingleIcon, замену иконки/её варианта и reset, а также смену View/DisabledState/Shape у SingleIcon с сохранением wrapper path. Подтвердить полное исполнение pinned Button/Spinner с мобильным platform context.
5. Переводить конкретные Figma-правила в Reviewed после live проверки. Девять context-only правил остаются Draft до подключения scenario/runtime фактов; общий Ready не выводится из зелёного статического прогона.

Способ показа disabled reason на touch/mobile не определён исходной нормой hover/Tooltip. Возможность Loading у элементов BottomSheet также требует проверки code API. Эти вопросы сохраняются отдельно от допуска Loading на видимой Button. Для координации с Apollo v4 подготовлен [handoff](reports/apollo-v4-handoff.2026-10-05.json).

## Уточнение применимости · r2

Решение владельца 05.10.2026: при SingleIcon=True / Overflow=false ошибка режима не дополняется групповой ошибкой замены иконки. Ветка second-occurrence-no-overflow удалена; first-occurrence также ограничена Overflow=true. Проверки pinned Button остаются самостоятельными. [13 historical regression replays](reports/overflow-icon-applicability.2026-10-05.json) сохраняют negative/reset для Size40/56 при Overflow=true и остальные composition проверки. Пять unknown Button-проверок после замены на action-clock не скрываются. Fresh r2 live acceptance ещё требуется. История r1 сохранена в history/r1-editor-0.2.90.

Google registry sync r2 завершён после восстановления connector: 168 записанных cells повторно прочитаны; даты 2026-10-05, native validation и Predicate=Draft подтверждены. [Sync audit](reports/registry-sync.r2.completed.json).

Fresh r2 05.10.2026: [прогон 16:24:43 UTC](reports/live-r2-applicability.2026-10-05.json) подтверждает только gate Overflow=false / SingleIcon=True: одно нарушение режима, три icon locks not-applicable, точный replay совпал. Пять unknown pinned Button не скрыты; остальные r2 live/code/runtime gates открыты. Reviewed/Ready не выставлены автоматически.
