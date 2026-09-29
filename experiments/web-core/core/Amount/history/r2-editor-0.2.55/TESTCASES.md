# Amount r2 — приёмочный стенд

[Открыть все20 кейсов в Figma](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64553).

Страница «Лаборатория» / секция «Amount · ComponentContract r2 · A02–A18» под Button.
Подготовлено29.09.2026:14 корректных конфигураций,4 намеренно ошибочных экземпляра,
2 проверки отказа. Первый прогон18 отчётов на0.2.54 выявил binding-дефекты.
Они исправлены в0.2.55 и проверены на сохранённых снимках; **новый live smoke
ещё не проведён**. Цвета и подписи карточек обозначают ожидания.

## Короткий повтор после исправления0.2.55

Тот же пакет r2, те же экземпляры. После перезапуска Editor проверьте и экспортируйте
**A02,A09,A12,A14B,A15,A16,A17A**. Первые четыре — полная проверка без нарушений;
A15 — gap; A16 — обязательный Major и состав/порядок; A17A — явная неполная
проверка, не зелёный результат. Все18 snapshots уже пройдены офлайн, повторять
полный набор ради этого патча не обязательно. A18A/B пока не подтверждены: если
проверяете их впервые, сообщите текст отказа (JSON не требуется).

## Как проверить

1. Перезапустить Editor0.2.55+ и импортировать тот же `editor/Amount.editor-input.zip` r2.
2. Выбрать «Проверить инстанс» / аудит компонента. Product — любой: продуктовых
   ограничений в этом контракте нет.
3. Выбирать **сам Amount внутри карточки**, затем «Проверить выделенный instance».
   Ссылки ниже ведут непосредственно к тестируемым объектам.
4. Для A02–A17B скачать18 JSON. A05 одновременно покрывает A01 и стандартный ₽:
   повтор не нужен. Не менять кейсы перед проверкой.
5. В A18A/B ожидается отказ до выполнения правил; отчёт может быть недоступен.
   Достаточно сообщить текст ошибки или приложить скриншот.

«Пройдено» означает отсутствие нарушений заявленных правил и отсутствие
необоснованного «Не выполнено». Выключенная часть может быть «Не применяется».
В A17A/B допустима явная неполная проверка, если подмена разрушает сопоставление;
полный зелёный результат недопустим. Точное число карточек не фиксируем: один дефект
может затронуть несколько связанных требований.

## Кейсы — слева направо, сверху вниз

| Объект | Сценарий | Ожидание r2 |
| --- | --- | --- |
| [A02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64565) | Minor=false, Currency=false, Addon=false | Нет нарушений. Выключенные части не дают «Не выполнено». |
| [A03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64580) | Minor=true, Currency=false, Addon=false | Нет нарушений. Выключенные части не дают «Не выполнено». |
| [A04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64595) | Minor=false, Currency=true, Addon=false | Нет нарушений. Выключенные части не дают «Не выполнено». |
| [A05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64610) | Библиотечный Amount (также A01 / A14A) | Нет нарушений. Выключенные части не дают «Не выполнено». |
| [A06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64626) | Minor=false, Currency=false, Addon=true | Нет нарушений. Выключенные части не дают «Не выполнено». |
| [A07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64641) | Minor=true, Currency=false, Addon=true | Нет нарушений. Выключенные части не дают «Не выполнено». |
| [A08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64656) | Minor=false, Currency=true, Addon=true | Нет нарушений. Выключенные части не дают «Не выполнено». |
| [A09](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64671) | Minor=true, Currency=true, Addon=true | Нет нарушений. Выключенные части не дают «Не выполнено». |
| [A10](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64687) | Длинная сумма | Текст и ширина меняются штатно; нет запрета размера. |
| [A11](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64702) | Text Style 18–24 на Major/Minor/Currency | Нет ложного запрета смены Text Style. |
| [A12](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64717) | Opacity=True у Minor/Currency | Нет продуктового AB-запрета в компонентном контракте. |
| [A13](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64734) | Type=Custom, текст «баллов» | Свой текст разрешён; это не тест стандартных валют. |
| [A14B](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64751) | Currency.Type=USD | Нет сравнения USD с дефолтным ₽. |
| [A14C](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64767) | Currency.Type=CNY | Нет сравнения CNY с дефолтным ₽. |
| [A15](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64783) | Gap корня: 0 → 8 | Нарушение layer-properties-use-effective-baseline. |
| [A16](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64798) | Скрыт Major | Нарушение major-required. |
| [A17A](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64814) | Minor заменён на Major | Нарушение identity / явная неполная проверка. Не полный pass. |
| [A17B](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64830) | Currency заменён на Major (видимый ₽ сохранён) | Нарушение identity / явная неполная проверка. Не полный pass. |
| [A18A](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64855) | Detached Amount (FRAME) | Отказ: выбран FRAME, не библиотечный instance. JSON может отсутствовать. |
| [A18B](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/AI?node-id=13129-64870) | Чужой Major под именем Amount | Отказ: ключ не относится к загруженному контракту. |

## Границы стенда

- A16/A17 созданы через доступные операции над вложенными instance без detach
  корневого Amount. Искусственные недостижимые состояния не добавлялись.
- A17B намеренно сохраняет видимый текст ₽ при чужом ключе: имя и внешний вид не
  должны подменять проверку библиотечной identity.
- При подготовке USD/CNY Figma сохранила старый текст ₽ после смены Type.
  В тестовых копиях очищены overrides назначением точного main component.
  В итоге и variant key, и фактический текст соответствуют USD/CNY.
- A11 использует настоящий библиотечный Paragraph/18–24 Primary Large,
  key=`b2633a0162f9359a941b9b6ffd702da6acbd02f3`, на трёх текстовых частях.
- A11/A13 не означают исчерпывающую проверку внутренних styles/tokens или запрета
  custom-текста у стандартной валюты. Addon allowlist, Currency text policy,
  code parity остаются в BACKLOG.
- Missing reference, truncated capture, unknown/ambiguous identity и недостижимые
  BOOLEAN/visible-конфликты остаются офлайн-regression: портить ради них Figma не нужно.

Manifest с ключами и фактическими значениями:
[`reports/testcases-r2.2026-09-29.json`](reports/testcases-r2.2026-09-29.json).
Скрипт создания с защитой от повторного стенда:
[`reports/testcases-r2.figma.js`](reports/testcases-r2.figma.js).

Manual r2, generated facts, compiled и input ZIP при создании стенда **не изменялись**.
Статус контракта остаётся Draft до отдельной приёмки.
