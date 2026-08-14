# [D] FilterCompanySelect_UniversalModal

## Назначение

Desktop-only figma preset для выбора одной компании в режиме холдинга внутри `UniversalModal`. Компонент используется, когда действие или продукт требуют перейти от контекста группы компаний к одной конкретной компании.

Компонент ведётся отдельным package и не входит в public roots обычного `FilterCompanySelect`.

## Публичная граница

- public root: `🔒 [D] FilterCompanySelect_UniversalModal`;
- использование вне `UniversalModal` запрещено;
- вложенные `CompanyLogo`, `[D] CompactTag`, `DropdownList_SingleSelect`, `OptionListHeader` и `OptionListCell` принадлежат preset и не являются самостоятельными частями этого package;
- поддерживается только desktop;
- символ `🔒` означает figma-only preset.

## Подтверждённое поведение

- `Open=False` — стартовое состояние;
- `Open=true` разрешён в макете для демонстрации открытого списка;
- выбор строки сразу применяет одну компанию, закрывает список и обновляет значение в `CompactTag`;
- в одном `UniversalModal` допускается только один экземпляр preset;
- одна текущая компания всегда выбрана по бизнес-логике и отмечена checkmark в списке;
- обязательный `CompanyLogo` и название в `CompactTag` принадлежат runtime-данным выбранной компании;
- подпись `Компания` и разделитель в `CompactTag` остаются скрытыми;
- поиск показывается только при количестве доступных компаний больше 10, как в обычном `FilterCompanySelect`; при 10 компаниях или меньше скрывается весь `[D] OptionListHeader`;
- поиск работает по названию, ИНН и адресу; placeholder `Название, ИНН или адрес` фиксирован;
- строка результата показывает только название компании;
- вручную разрешено менять ширину trigger и dropdown; высота, padding, gap и внутренняя геометрия наследуются от вложенных компонентов;
- собственных loading, error, disabled, empty/no-results, hover, focus и keyboard-состояний нет;
- preset нельзя detach или пересобирать через instance swap внутренних частей.

## Сборка в UniversalModal

1. Используй `[D] UniversalModalHeader` с `Content=True`, `Custom=True`; `FilledBg` остаётся настройкой самой модалки.
2. В `🔩 [D] RightAddon` установи `Custom=False`, `Cross=True`.
3. В `🔩 [D] LeftAddon` установи `Custom=True`, `Back=False` и через swap component замени содержимое на `🔒 [D] FilterCompanySelect_UniversalModal`.
4. В `🔩 [D] MiddleSlot` установи `Custom=False`, `Empty=True`, `Title=False`, `BigTitle=False`.

В одном `UniversalModal` допускается только один такой preset. Весь trigger `CompanyLogo + CompactTag` открывает список как единая кликабельная зона; отдельного действия у логотипа нет. `CompactTag.SelectedState=True` сохраняется, а стрелка автоматически следует `Open`. Выбор компании закрывает только dropdown; `Cross` закрывает весь `UniversalModal`.

Длинное название выбранной компании занимает одну строку и сокращается через ellipsis без tooltip. Поведение строк списка наследуется от `OptionListCell`.

## Код

Preset figma-only и не имеет собственного аналога в коде или Code Connect. Маппинги вложенных Core-компонентов не подтверждают реализацию preset целиком.

## Источники

- raw: `../Web _ Corp Components -- [D] FilterCompanySelect_UniversalModal.json`;
- Figma: `https://www.figma.com/file/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=133860-60776`;
- связанный package: `../FilterCompanySelect/`;
- pattern: `patterns/p_holding-company-selection.md`.

## Статус

**Ready.** Назначение, lifecycle, composition-рецепт, single-selection, Open, anatomy, content, search, sizing, interaction, visual policy, severity и Code Connect status подтверждены владельцем AB-слоя 2026-08-14. Package validator и targeted Athena checks пройдены; компонент принят владельцем для включения в общий коммит.
