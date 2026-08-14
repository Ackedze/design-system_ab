# FilterCompanySelect

Папка содержит сгенерированный слой component-contract для **Web _ Corp Components / FilterCompanySelect**.

The raw Figma catalog remains the source of truth:

`../Web _ Corp Components -- FilterCompanySelect.json`

## Файлы

- `catalog.raw.json` - preserved source catalog copy for this package.
- `contract.generated.json` - generated compact contract extracted from the raw Figma catalog.
- `contract.overrides.json` — сгенерированный placeholder для semantic overrides, которые заполняются вручную.
- `composition-contract.json` - generated internal instance ownership context.
- `rules.json` - generated component-level classification rules.
- `audit-mapping.json` - generated default Apollo grouping model.
- `examples.json` - generated placeholder for examples.
- `agent-context.json` - compact generated context for agent-side interpretation.

## Источник

- Библиотека: `Web _ Corp Components`
- Сгенерировано: `2026-06-05T16:07:39.725Z`
- Компонентов: `8`

## Подтверждённая область применения

- Компонент предназначен для работы с компаниями в режиме холдинга.
- Поддерживается только desktop.
- Публичные корни: `[D] FilterCompanySelect_Multi` и `[D] FilterCompanySelect_Single`.
- `Multi` выбирают для работы с одной или несколькими компаниями; `Single` — для выбора одной компании.
- У `Single`: `View=Select` используется в форме, `View=FilterTag` — в фильтрах, `View=Compact` — в `TitleView` или для переключения отдельного объекта, например виджета.
- `ShowFirstCompany` — legacy-параметр; в новых макетах и при генерации его запрещено включать.
- `[D] CompactTag`, `[D] DropdownList_MultiSelect`, `[D] DropdownList_SingleSelect` и их `🔄`-версии — внутренние либо устаревшие части; отдельно не вставляются.
- В `Multi` изменения выбора временные до нажатия «Применить»; закрытие списка отменяет их. «Сбросить» сразу применяет пустое значение.
- В `Single` выбор применяется сразу и закрывает список.
- `Open` и `Selected` — производные runtime-состояния, а не произвольные настройки дизайнера или генератора.
- Поиск в обоих roots работает по названию, ИНН или адресу. Placeholder фиксированы: «Название, ИНН или адрес» для `Multi`, «Поиск» для `Single`.
- В `Multi` действие «Выбрать все» выбирает весь текущий набор: все компании при полном списке или только результаты применённого поиска.
- В `Multi` одна выбранная компания показывается названием, несколько — счётчиком в формате «выбрано N»; предметная метка «Компания» сохраняется.
- В `Single` без выбора показывается «Выберите компанию», после выбора — название компании.
- Подписи «Компания», «Выбрать все», «Применить» и «Сбросить» фиксированы.
- Поиск показывается, только если в доступном списке больше 10 компаний.
- Очистка `Single` доступна только в `View=FilterTag` и сразу возвращает состояние без выбора.
- Системные состояния триггера наследуются от соответствующих `Select`/`FilterTag`; состояния списка — от `[D] OptionListCell`, `[D] OptionList`, `[D] OptionListHeader` и `[D] OptionListFooter`.
- Внутренняя геометрия наследуется от вложенных компонентов; ширину корня и dropdown разрешено менять вручную.
- Пустой выбор допустим в `Multi` и `Single/FilterTag`; в `Single/Select` обязательность определяется формой; в `Single/Compact` компания всегда выбрана.
- Оба публичных root остаются библиотечными instance: detach, замена внутренних списков и instance swap служебных частей запрещены.
- Названия компаний, ИНН и адреса являются runtime-данными; в макете допустимы реальные примеры, но они не становятся фиксированным контентом компонента.
- «Выбрать все» использует состояния `CheckboxLabel_24`: empty, indeterminate для части текущего набора и selected для всего текущего набора.
- Цвета, типографика, радиусы, тени, padding и gap следуют effective baseline вложенных компонентов. Кроме подтверждённой ширины, ручные визуальные overrides запрещены.
- `[D] FilterCompanySelect_UniversalModal` ведётся отдельным компонентным пакетом. Он относится к элементам режима холдинга, но применяется внутри `UniversalModal` и не входит в публичную границу текущего пакета.
- Empty/no-results, hover, focus, keyboard navigation и disabled не переопределяются: их поведение наследуется от вложенных `Select`, `FilterTag`, `CheckboxLabel_24` и `OptionList`-компонентов либо принадлежит продукту.
- `Multi` допускает от 0 до всех доступных компаний; `Single` — не более одной с уже описанной допустимостью пустого значения по `View`.

Полный паттерн режима холдинга опубликован в `patterns/p_holding-company-selection.md`. Компонент ссылается только на применимые exact rules; остальные сценарные правила не дублируются.

## Статус

**Ready**. Публичная граница, платформа, сценарии режима холдинга, anatomy, content, states, interaction, composition и ограничения подтверждены владельцем AB-слоя 2026-08-13. Package validator проходит без ошибок и предупреждений; Figma-контракт готов к использованию.
