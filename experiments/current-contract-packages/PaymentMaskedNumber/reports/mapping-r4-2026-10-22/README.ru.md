# PaymentMaskedNumber r4 — mapping candidate

Подготовлено по поручению «подготовь маппинг для PaymentMaskedNumber» от 22.10.2026.
Контракт: `web-corp.payment-masked-number`, revision **4**, platform **universal**
(desktop и mobile-web), статус **Draft**. Mapping status: **CLOSED_WITH_GAPS**.
Это закрытый пакет кандидата; независимая приёмка и подключение к runtime не выполнены.

## Файлы

- `payment-masked-number.figma-mapping.json` — существующий consumer format:
  semantic / typed / profiles / targets / manuals / ruleLinks / denials.
- `payment-masked-number.frontend-mapping.json` — существующий frontend descriptor;
  внешний Draft proposal code representation, отсутствующей в manual.
- `bindings.ts` — только доказанное преобразование строкового Mask Number в boolean.
- `PUBLIC-API-EVIDENCE.json`, `DISTRIBUTION-RESOLUTION.json` — исходный API и фактическое
  отсутствие public subpath в выбранной installed distribution.
- `rule-links.json` — четыре полные compiled нормы с точными источниками;
  `coverage-map.json` — все 12 source норм, без повышения их исполнимости.
- `CAPABILITY-GAPS.json` — девять открытых ограничений с владельцами.
- `CHECKS.json`, `TYPECHECK.json`, `EVAL.json` — фактические результаты;
  `INPUT-PINS.json`, `TYPECHECK-INPUT-PINS.json` — прочитанные зависимости.
- `HANDOFF.json`, `FINAL-SEAL.json` — граница передачи и финальные хеши.

## Соответствие

| Порт контракта | Figma | Frontend |
| --- | --- | --- |
| addonVisible | BOOLEAN `RightAddon#22225:1`, public root | При отсутствии `rightAddon` addon скрыт; автоматический boolean → ReactNode не объявлен |
| maskNumber | VARIANT `Mask Number` у Major; строки False/True | `props.hideNumber`: False→false, True→true |
| major | TEXT `✎ Major#26906:0` у Major, только для False | Отдельного prop нет; библиотека вычисляет начало из полного `props.number` |
| minor | TEXT `✎ Minor#26906:4` у Minor | Отдельного prop нет; библиотека вычисляет последние четыре из `props.number` |
| addonPreset | VARIANT `Presets` у Addon/RightAddon | `props.rightAddon` принимает ReactNode; renderer пресетов не придуман |

Публичный Figma root — standalone COMPONENT с key
`bd25bbd83bfc28176b42284659f21c8a7cd8e97b`; COMPONENT_SET key = null.
Major/Minor/RightAddon и их COMPONENT_SET keys остаются внутренними частями.
Свежие два read-only запроса подтвердили обе маски и шесть Addon presets.
Public root default: addon скрыт, но вложенный preset **StatusBadge**; default
отдельного RightAddon set **SwapMe** не подменяет default публичной композиции.

Masked Major содержит фиксированный литерал U+00B7 U+00B7 U+2009 и **не имеет**
characters property reference. После переключения варианта нужно заново
разрешить targets; arbitrary Major write в masked profile должен отказать.
SwapMe — служебная часть; candidate запрещает его как финальный Addon. Нового
SLOT/INSTANCE_SWAP или права заменить placeholder этот mapping не создаёт.

## Публичный код и ограничения

Источник arui-private **80.7.1**, commit
`c037d0c322ea9774a9c251400d76d41222819b87`:

```tsx
import { PaymentMaskedNumber } from 'arui-private/payment-masked-number';
```

Это подтверждённый source entrypoint и предложение public subpath по правилам
сборки пакета. В выбранной физической локальной distribution этого subpath нет:
фактический Node resolution возвращает MODULE_NOT_FOUND.

Коду обязательны `type: 'card' | 'account'` и полный `number: string`.
Скрытый Major не позволяет восстановить номер; manual не содержит независимых
raw-number/type semantic ports. Их предоставляет вызывающий сценарий.
Mapping не собирает номер по догадке и не добавляет такие порты в контракт.

Контракт требует **6 px** до Addon. Source CSS задаёт
`margin-left: var(--gap-2xs)`, а закреплённый установленный token равен **4 px**.
Это доказанное source/token расхождение; browser override не проверялся.
Typography/color, высота Addon и узкий overflow не получили новой нормативной
приёмки. Formatter библиотеки не валидирует цифровой формат/длину номера.

## Проверки и границы

**37/37 PASS**, включая existing Figma adapter selection/resolution,
frontend projection/admission, отрицательные типы/платформу/ancestry/stale archive,
отказ custom Major в masked profile и реальные source formatter cases.
Figma runtime проверки — **synthetic fixture replay** на свежих source facts,
не создание/изменение native instances.

TypeScript **5.3.3**: реальный исходный entrypoint проверен с двумя допустимыми
примерами и пятью `@ts-expect-error` на неверный API. Использованы явные aliases
к исходнику компонента и установленным декларациям React/bem-react-classname;
**84** прочитанных compiler inputs закреплены. Это source typecheck;
distribution typecheck, браузер, native generation и runtime adoption не выполнены.

Выбранный для изучения workspace data index и файлы consumer сохранены в pins.
Consumer code проверялся как frozen private snapshot; новый запуск работающего
Apollo/Proxy не выполнялся. Этот пакет не меняет contracts/core/registry,
исходники библиотек, общие config/build или активный data package.

Во время подготовки r3 manifest сменился на r4. Первая ветка остановилась до
проекции; `../mapping-r3-2026-10-22/FIRST-INPUT-DRIFT.json` сохранён.
r4 взят из нового CLOSED authoring handoff: восемь pins перепроверены;
изменились только revision и тестовый префикс сообщения, нормы и native bindings
сохранены. Прежние seals не перепривязаны.

Подготовительные ошибки fixture/type resolution сохранены отдельно; исправлены
только private harness и aliases, проверки consumer не ослаблены.

Повторная работа выполняется в новой папке. Скрипты `prepare.py` и `verify.cjs`
после появления `FINAL-SEAL.json` отказывают, чтобы не переписать закрытые результаты.

