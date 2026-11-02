# NEXT-01/03 · exact static producer rebind · 06.10.2026

**Завершён локальный exact rebind к final Draft source-review consumer. Три новых JSON independently inspected; Generation execution и target gates остаются blocked.**

Проверки: **76/76 PASS** — 43 прежние interactive, 19 неизменённых static assertions с явным binding на новый snapshot, 14 новых inspection/freshness проверок. Оба TypeScript check прошли. Проверены все 188 requested files, 165 consumer files, proxy-файл и 95 build inputs. Полный CC desktop13/mobile8 / BG59 / Button31 / Spinner8 main/ZIP/compiled/dependency closure сохранён. Дополнительно подтверждены 67 source/artifact, 26 recipe, 115 selective-dist и 486 installed-manifest pins; это не full installed payload или live acceptance.

Новый snapshot расположен отдельно. Producer helper byte-identical прежнему; wire и семантика не менялись. Все 15 исторических source/artifact/report/test файлов сохранили хеши. Три исторических output по-прежнему возвращают stale с 13 unique consumer mismatches каждый; old observations не переименованы в current.

Текущие read-port результаты:

- synthetic.supported.review.json: inspected, bounded-content-expressible, consumer mismatches 0; strict probe SOURCE_COMPILE.
- synthetic.unsupported-view.review.json: inspected, not-supported, consumer mismatches 0; strict probe SOURCE_COMPILE.
- synthetic.unsupported-priority.review.json: inspected, not-supported, consumer mismatches 0; strict probe SOURCE_COMPILE.

Unsupported View и priority сохраняют исходные значения и apiIntent=null. Display order и independent business priority не выводятся друг из друга или View. Callback/handler/no-op сценарии не создаются. Изменённые intent/provenance/authority и отсутствующие source/dependency pins отклонены независимой реконструкцией. После async-чтений отдельно проверены отказы REVIEW_PRODUCER_STALE и REVIEW_READ_CHANGED через in-memory I/O faults, с нулём изменений защищённых файлов.

Source/API/review freshness подтверждена для этой exact сборки. Отдельный standard compiler reader сохранил BG59 Draft, девять nonExecutable context rules и исходные compiler issues. Strict runtime loader сохраняет SOURCE_COMPILE. reviewHash / producerPlanHash не являются Generation plan hash: **generationPlanHash=null, accepted=false, executionAllowed=false**, оба target gate blocked. Coverage — metadata, без predicate/scoped checker исполнения. Static profile/native/scoped/parity/live/release acceptance отсутствует; все пять общих целей не завершены.

Продуктовый input сохранён побайтно и остаётся schema-invalid: View, disabled, explicit Loading=false, independent priorityOrder и viewport height не заполнены из proposal. Фактическая ширина BG требует отдельного измерения. Реальных Figma/browser/frontend target прогонов, публикации или установки не было.

Точные review inputs:

- [Final machine handoff](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/reports/NEXT-03-static-content-rebind-final.2026-10-06.json) — SHA256 `259f84afa448e0e7682f65618f2ad481cf27a617c7f4bc1d304344c81ebc095e`.
- [Новый producer manifest](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/rebind-2026-10-06-final/producer.v1-draft.json) — SHA256 `bf99a250fef8face3b79ea3d963e9bb587fe4b28644c755733254124370eb3fc`; artifact digest `ace620602a60abc1d22a0857fa7b7b29bd080e132c10eb2ea91f2de87765a650`.
- [Independently pinned basis report](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/rebind-2026-10-06-final/review-report.v1-draft.json) — SHA256 `585f42b09e21f2186026e7718008b17c1f1856ad56dcfacd8c693de5204e96f5`.
- [Explicit caller config](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/rebind-2026-10-06-final/review-harness.cjs).
- [README / regression commands](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/rebind-2026-10-06-final/README.md).
- [Read-only probe receipt](/private/tmp/next03-static-rebind/reader-probes.json) — SHA256 `640e3f6437676b9d60efa701dd930ae8350265e10dd14afd18f0601b6b24a474`.
- [synthetic.supported.review.json](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/rebind-2026-10-06-final/synthetic.supported.review.json) — SHA256 `5d93d0f9efa584e0466f84d5a4717c4dfcc8e28d83ab56e14f80be5538d61463`.
- [synthetic.unsupported-view.review.json](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/rebind-2026-10-06-final/synthetic.unsupported-view.review.json) — SHA256 `8e125811ddd33fc9e9fa5eb6f839c07d28e1e98e8644d6fecf9fab0ca082acd2`.
- [synthetic.unsupported-priority.review.json](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/rebind-2026-10-06-final/synthetic.unsupported-priority.review.json) — SHA256 `34542e162a4b034dfe1a7c4be0cbf30c225da8199c60f1c3d9f795f6a921abc8`.

Final consumer hashes:

- runtime: `05e3b075529c66918a56cde6ae8bbc85fb9f8a4b343239b8f5cb96289cb852d6`.
- main: `f95988a823d8e0a798c2b776f446cc68516c0f3c1eb8d875e7627f98fc25dea5`.
- UI: `805ff3d40ab7ff225249bdc96e6608d3659e8af2bc334c3e825a72e85666794a`.
- build manifest: `ffec8bd8a0c7acad254090bb7d1d60727be2e96d0df18740b249ca693a37dd29`.
- vector: `cc4a90e4c49400f66ab018c2ef560b52c55c10390c7a99be1cf80490d477729c`.

Следующий конкретный технический шаг: General независимо вызывает loadStaticProducerReview для трёх новых outputs с manifestPin/reportPin из этого handoff и проверяет bounded correspondence. Затем нужны отдельные canonical CC Body/all-four BG occurrence/symbol crosswalk, actual width/font/Addon/Spinner readback, scoped receipts и точный static profile/native capability; продуктовые вопросы остаются в General. Этот rebind не разрешает target execution.

Frozen registry/lock/immutable basis, DS manual/rules/compiler/ZIP, исходные компоненты и shared Generation files не изменены. Исторические observations остаются отдельным snapshot.
