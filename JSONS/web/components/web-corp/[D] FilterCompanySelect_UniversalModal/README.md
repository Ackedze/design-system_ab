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

## Источники

- raw: `../Web _ Corp Components -- [D] FilterCompanySelect_UniversalModal.json`;
- Figma: `https://www.figma.com/file/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=133860-60776`;
- связанный package: `../FilterCompanySelect/`;
- pattern: `patterns/p_holding-company-selection.md`.

## Статус

**Draft**. Назначение, lifecycle, single-selection, Open, anatomy, search, sizing и делегирование состояний подтверждены владельцем AB-слоя 2026-08-14. Точная зона размещения внутри `UniversalModal`, visual policy, audit severity и runtime evidence ещё уточняются.
