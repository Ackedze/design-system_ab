# Актуальные контрактные пакеты

Одна папка для загрузки готовых ручных пакетов в ComponentContract Editor.
Это **побайтовые копии ZIP**, не новые нормативные источники.
Для проверки/редактирования импортируйте один ZIP выбранного компонента.
Нужные read-only Athena facts и закреплённые зависимости уже внутри.

| Компонент | Версия | ZIP | Принятая область |
|---|---|---|---|
| Button | r31 | [Button.component-contract.zip](Button.component-contract.zip) | Desktop/mobile, ordinary/inverted; Spinner r8 внутри |
| Spinner | r8 | [Spinner.component-contract.zip](Spinner.component-contract.zip) | Собственные заявленные Figma-проверки |
| Amount | r5 | [Amount.component-contract.zip](Amount.component-contract.zip) | Core Amount, не продуктовые паттерны |
| AmountStyles | r10 | [AmountStyles.component-contract.zip](AmountStyles.component-contract.zip) | Paragraph и D/M Headline; Core Amount r5 внутри |
| CorporateContent | r11 | [CorporateContent.component-contract.zip](CorporateContent.component-contract.zip) | Шесть desktop правил; не Section/mobile/паттерны |
| [M] CorporateContent | r6 | [CorporateContent.mobile-web.r6.component-contract.zip](CorporateContent.mobile-web.r6.component-contract.zip) | Шесть mobile-web Figma правил; native Body boundary, без external payload |

## Мобильный CorporateContent

`[M] CorporateContent` r6 — **Ready**, принят владельцем 01.10.2026 после live
negative/reset в Editor 0.2.73: 6/6 matches, 17 determinate checks. Контроль дал
17 compliant / 0 violations. Modal modes из входного r5 исправлены на page modes.

Подробности: [мобильный README](../web-corp/CorporateContent/mobile-web/authoring/README.md)
и [приёмка](../web-corp/CorporateContent/mobile-web/authoring/reports/acceptance.json).
Canonical copy r6 включён в `manifest.json`. Существующий owner export
[CorporateContent.mobile-web.component-contract.zip](CorporateContent.mobile-web.component-contract.zip)
имеет revision r7 и те же нормы; его bytes сохранены, metadata учитывается
отдельно в [draft-manifest.json](draft-manifest.json). Входной r5
`corporate-content.component-contract.zip` сохранён как история.

Готовность относится к согласованным **Figma-проверкам**, не к frontend parity
или production publication. Статус Code Connect не задаётся этой подборкой:
его текущую настройку смотрите в исходной папке CorporateContent.
Выполнение конкретной проверки требует необходимых фактов; Ready не превращает
unknown/«Не выполнено» в успех.

## Где источники

Единственный ручной source of truth каждого компонента остаётся на прежнем месте:

- [Button](../web-core/core/Button/README.md)
- [Spinner](../web-core/core/Spinner/README.md)
- [Amount](../web-core/core/Amount/authoring/README.md)
- [AmountStyles](../web-corp/AmountStyles/authoring/README.md)
- [CorporateContent](../web-corp/CorporateContent/authoring/README.md)
- [[M] CorporateContent](../web-corp/CorporateContent/mobile-web/authoring/README.md)

ZIP для Editor не обязательно содержит compiled самого host: Editor компилирует
его из manual и facts. Для runtime/review используйте исходный
`compiled/component-contract.v2.json`, а не архив как runtime API.
Все точные пути, revision, hashes и зависимости — в [manifest.json](manifest.json).

Ничего не переносится и не удаляется. Отчёты, history и старые generated
capability experiments сюда не входят. `section.component-contract.zip` и
прежние дубли exports не являются дополнительными принятыми контрактами.
Production не изменяется; Ready и область приёмки учитываются в реестре отдельно.

## Обновление подборки

### Рабочий ButtonsGroup

[ButtonsGroup.component-contract.zip](ButtonsGroup.component-contract.zip) —
desktop authoring **r57, Draft**: 17 Reviewed Figma-правил и девять Draft
context-only правил поведения. Паспорт и source crosswalk заполнены.
Канонический source находится в
[ButtonsGroup/authoring](../web-corp/ButtonsGroup/authoring/README.md);
рабочая копия учитывается в `draft-manifest.json`, не в accepted manifest.
Для anatomy необходим live preview или исходный Athena-пакет.

[ButtonsGroup.mobile-web.component-contract.zip](ButtonsGroup.mobile-web.component-contract.zip) —
отдельный mobile-web **r1, Draft**: 20 Figma-правил и девять context-only правил.
Паспорт заполнен; обе встроенные Button привязаны во всех восьми вариантах.
Свежие source facts включены в ZIP, anatomy восстанавливается при импорте.
Мобильная live приёмка, runtime и code mapping для Apollo v4 ещё открыты.
Канонический source: [mobile-web/authoring](../web-corp/ButtonsGroup/mobile-web/authoring/README.md).

После нового принятого экспорта обновить ZIP в его исходной папке, пересобрать
и принять контракт штатным маршрутом, затем из корня design-system_ab:

```sh
node scripts/collect_current_contract_packages.js
node scripts/collect_current_contract_packages.js --check
```

Сборщик не правит правила и не компилирует новый контракт. Он проверяет:
ZIP manual = current manual = acceptance hash/revision; compiled Ready;
закреплённые дочерние контракты совпадают с актуальными пакетами подборки.
При расхождении останавливается до копирования. Копии здесь вручную не редактировать:
сессионные изменения экспортировать обратно в исходную authoring/editor папку.
