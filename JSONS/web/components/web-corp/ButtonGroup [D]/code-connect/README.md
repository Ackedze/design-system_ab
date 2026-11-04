# ButtonsGroup — Code Connect

Опубликовано и проверено через Figma MCP 04.11.2026. Два parserless `.figma.ts`
следуют структуре Core: URL/source/component, `figma.selectedInstance`,
`figma.code`, default export с id/imports/example/metadata.

| Платформа | Файл | Figma set |
| --- | --- | --- |
| Desktop | [ButtonsGroupDesktop.figma.ts](ButtonsGroupDesktop.figma.ts) | [62786:48893](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=62786-48893) |
| Mobile Web | [ButtonsGroupMobile.figma.ts](../mobile-web/code-connect/ButtonsGroupMobile.figma.ts) | [133812:11630](https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD?node-id=133812-11630) |

Обе платформы используют **`ButtonGroup` из `arui-private/button-group`**.
Публичных ButtonsGroupDesktop/Mobile нет; исходник выбирает платформу на 768 px.
Source API 81.1.0 проверен на commit `4bf38e2be8589da705f991b4dcac0d41975dff3d`.
Старый `arui-private/tools/code-connect/ButtonsGroup.figma.ts` с custom bridge
не использован и не изменён.

## Соответствие и контекст приложения

| Figma | React |
| --- | --- |
| Size 32 / 40 / 48 / 56 | числовой `size` |
| Видимые обычные кнопки | упорядоченный `elements`, текст Label → строковый `children` |
| View первой кнопки | `primaryFirst`; Primary после первой позиции отклоняется |
| DisabledState | `disabled` соответствующего элемента |
| LeftAddon / RightAddon | типизированные addon values приложения; выключенные явно сбрасываются |
| Overflow=true | последний SingleIcon — picker-контрол; реальные скрытые действия передаются в `hiddenElements` |
| Число видимых slots | `maxVisibleButtons`; учитывает место под overflow-контрол |

Шаблон читает видимые прямые Button instances через стандартный `findLayers`
с `traverseInstances:false`. Он сохраняет порядок, в том числе при скрытой кнопке
в середине, и не забирает вложенные кнопки из addons. ResultSection не превращаются
в строки. Неизвестные состояния, Hint, скрытый Label, другой Shape и SingleIcon
у бизнес-действия требуют отдельного проверенного рецепта и явно отклоняются.
Сохранённые поля addon/Hint последнего SingleIcon не трактуются как бизнес-действие:
представлением overflow управляет PickerButton из реализации ButtonGroup.

Приложение передаёт:

- `hostWidth`: настоящую ширину контейнера композиции, через внешний `div`;
  одноимённого prop у ButtonGroup нет. Ширина не выбирает платформу — её выбирает viewport.
- `actions`: реальные обработчики и активные addons для видимых действий, в том же
  порядке. Тексты/disabled задаёт Figma; фиктивные callbacks и href не добавляются.
- `hiddenElements` при Overflow=true: непустой полный список скрытых бизнес-действий,
  без выдуманной дополнительной кнопки для принудительного overflow.
- `overflowBindings`: доступную подпись picker, `pickerButtonProps.onChange` и
  `mapElementToPickerOption`. Они должны использовать общие стабильные keys и
  вызывать реальные действия. Повторяющийся Label не является идентификатором.

Даже при Overflow=false bindings нужны, поскольку изменение ширины может скрыть
кнопки. Шаблон согласует picker с breakpoint группы: `breakpoint:768` вместо Core
default 1024; `footer:undefined` сохраняет отсутствие дополнительного footer.
Core mobile picker закрывается после выбора; фактическое поведение, доступность
подписи и dispatch обработчиков проверяются в приложении.

## Подтверждённые ограничения исходника

**Mobile Web, Overflow=false:** в Figma видны две кнопки, но
`calculateHiddenElements` всегда скрывает на mobile все после первой. Сниппет
сохраняет оба действия и содержит `MOBILE_TWO_VISIBLE_SOURCE_GAP`; он не обещает
визуальную эквивалентность. Устранить расхождение без изменения библиотеки нельзя.

**Desktop, Overflow=true:** публичного prop `overflow` нет. Если всего четыре
действия и они помещаются по ширине, `maxVisibleButtons=4` не включает picker.
При пяти действиях он резервирует один из четырёх slots и показывает три обычные
кнопки. Нужны настоящий полный список и правильная ширина, а не фиктивное действие.

**Действия в picker:** default `getPickerButtonOptions` не переносит `onClick`
и addons обычной кнопки, а key берёт из children. Поэтому шаблон требует явный
mapper и onChange со стабильными keys; автоматическая бизнес-семантика из Label
не выводится. Перенос иконок и callbacks остаётся ответственностью приложения.

Это source API mapping. Установленный SDK 81.1.0, browser rendering, поведение
overflow в браузере и полная визуальная эквивалентность не проверены. Contracts,
ZIP, исторические mappings/seals и Draft/Ready не изменены.

## Проверки и повторный запуск

- CLI 1.4.9: ровно два canonical templates, native preview 16/16 вариантов и 2/2
  default set previews; обычные validation/upload PASS. Диагностические копии
  не публиковались.
- После публикации MCP вернул 16/16 собственных непустых ButtonGroup snippets.
  Два запроса set вернули каждый все восемь дочерних компонентов с теми же
  сниппетами. Это проверка subtree set; собственного snippet у COMPONENT_SET
  она не утверждает. Два первоначальных пустых ответа сохранены и перечитаны.
- 10 тестов PASS: native fixtures, 11 допустимых desktop visibility masks,
  порядок/escaping/disabled/addons, отрицательные states/API props и реальные
  source functions, воспроизводящие ограничения выше.
- Все 18 native previews и 16 фактических MCP snippets со всеми imports проходят
  strict source API projection на реальных forwardRef props/barrel/types.

[Финальный receipt](publication/2026-11-04.json),
[фактические MCP snippets/imports и set readbacks](publication/2026-11-04.snippets.json),
[тесты](ButtonsGroup.test.cjs), [source API checker](check-source-api.cjs).
[Контекст](figma-context.json) хранит provenance и проверенные идентичности/состояния;
существующий raw `structure`/`variantStructures` остаётся источником Apollo.

В названии каталога есть квадратные скобки. CLI запускать **из корня
design-system_ab** с [компонентным config](../figma.config.json), содержащим escaped
include glob; запуск из каталога компонента может успешно вернуть пустой parse.
Обязательная проверка перед публикацией — parse обнаружил ровно два файла:

```sh
cd /Users/alexkukhta/Desktop/workplace/shared/design-system_ab
/usr/local/bin/node /Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules/@figma/code-connect/bin/figma \
  connect parse --dir . --config 'JSONS/web/components/web-corp/ButtonGroup [D]/figma.config.json' \
  --outFile /tmp/buttons-group-code-connect-parsed.json --skip-update-check
python3 -c 'import json; assert len(json.load(open("/tmp/buttons-group-code-connect-parsed.json"))) == 2'
```

Node 22 тоже раскрывает glob у аргумента `--test`. Запускать тест напрямую:

```sh
NODE_PATH=/Users/alexkukhta/Desktop/workplace/projects/Apollo/node_modules \
ARUI_SOURCE_ROOT=/Users/alexkukhta/Desktop/workplace/.local/front-code-connect-landing-2026-11-04/library-source-81.1.0 \
ARUI_SDK_NODE_MODULES=/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/frontend-host/node_modules \
/usr/local/bin/node '/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/JSONS/web/components/web-corp/ButtonGroup [D]/code-connect/ButtonsGroup.test.cjs'
```
