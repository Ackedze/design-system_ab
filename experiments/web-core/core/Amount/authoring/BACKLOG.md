# Amount — backlog

## Закрыто: r5 / Editor 0.2.57 · 29.09.2026

- [x] Владелец принял компонентный контракт. 31 reviewed /47 IR,3 policy-only,
  0 excluded; Ready только для объявленного Figma scope, без production публикации.
- [x] Шесть live r4 JSON проверены: exact engine/editor/details replay, все complete.
  Major detach, разрешённый иной библиотечный стиль и outside-catalog различаются;
  token binding не смешивается с Text Style.
- [x] r4→r5:32 неизменяемых снимка /1 666 evaluations без изменения поведения.
  Generated facts, стабильные RuleID и границы владения не изменены.
- [x] Остаток r3/TS02 проверен автоматическими regressions и replay; не объявлен
  новыми live-тестами. Матрица свидетельств — reports/acceptance.json и TESTCASES.md.
- [x] TS04 убран из обязательной ручной приёмки: операция частичного detach в Amount
  не подтверждена. Защитный synthetic test общего runtime сохранён, правило не ослаблено.
- [x] Ревизия r4 и ZIP сохранены в history/r4-editor-0.2.57; шесть JSON заархивированы
  в reports/fixtures/r4-editor-0.2.57. Пользовательские exports можно удалять.
- [x] Manual-only authoring → общий compiler → Ready compiled/ZIP/projections.
  QA привязан к hashes; устаревшая приёмка не переносится на новый пакет.
- [x] README/TESTCASES обновлены; история стадий не переписана.
- [x] Финальные регрессии: 538/538 Editor и 285/285 package tests, typecheck/build.
- [x] Реестр синхронизирован и перечитан: 31 строка правил — «Исправлено»,
  Predicate — Ready, 7 записей Леджера остаются «Найдено». Сверены 210 изменённых
  ячеек; строки паттернов, оформление и выпадающие списки сохранены.

## После компонентного релиза (не блокеры r5)

- [ ] P1: перегенерировать и согласовать Hub-проекции по принятому manual.
  Леджер64–70 остаётся «Найдено»: Operation/Negative чужой анатомии, blanket policy,
  ownership AB Opacity, token-only цвета, open Addon, Custom any text и Text Style.
  Не копировать predicateContour и не закрывать drift без сверки.
- [ ] P1: локализовать A17 подмены Minor/Currency при сохранении fail-closed.
  Сейчас неоднозначное происхождение даёт incomplete, никогда полный pass.
- [ ] P1: code bridge — mapping/value/minority/formatting parity. Не заявлять
  frontend Ready по одному Figma контракту.
- [ ] P1: продуктовые/канальные правила оформить в отдельном паттерне Amount.
  Стабильные legacy RuleID уже вынесены в handoff; production ownership migration отдельно.
- [ ] P2: пояснять unmatched внешние узлы открытого Addon как границу владения;
  не скрывать настоящие correspondence warnings и не обещать проверку внутренностей.
- [ ] P2: компактный авторинг условного порядка через общий compiler вместо восьми
  однотипных записей, только после parity gate.
- [ ] Публикация и переключение legacy runtime-index — отдельная миграция.

История до приёмки (старые pending относятся к тем ревизиям, не к r5):
[r4](../history/r4-editor-0.2.57/BACKLOG.md),
[r3](../history/r3-editor-0.2.56/BACKLOG.md),
[r2](../history/r2-editor-0.2.55/BACKLOG.md).
