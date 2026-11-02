# NEXT-03 · static content producer · 06.10.2026

**Готова отдельная Draft source/API-проекция и JSON emit для ревью. Подключение к Generation и оба target executor остаются not-supported.**

Проверки: **62/62** (43 прежних + 19 static), оба TypeScript check — pass. Проверены frozen source/mapping/current-input pins, 66 consumer-файлов, отдельный proxy-файл и 95 build inputs. Дополнительно подтверждены прежние 67 source/artifact, 26 recipe, 115 selective-dist и 486 installed-manifest pins. Это проверка байтов и API; полного хеша installed payload и нового live/parity/profile прогона нет.

Публичный API позволяет передать два label, явный disabled и loading:false без callback. CC Body связывается с children; BG Size "56" становится числом 56. Primary доступен только первой отображаемой обычной кнопке через primaryFirst. Primary у последующей кнопки и конфликт явных displayOrder/priorityOrder возвращают not-supported с сохранением запрошенных значений. Business priority хранится отдельно; API не имеет такого prop. Overflow=false остаётся запросом: maxVisibleButtons не доказывает фактическую ширину и видимость.

Конкретный блокер реального загрузчика: `SOURCE_COMPILE: Cannot verify web-corp.buttons-group: Runtime requires an accepted ready contract`. BG r59 остаётся Draft с девятью nonExecutable context rules. Helper сохранил отказ, без relaxed runtime и без подстановки compiled cache. Producer review plan имеет собственную версию; **generationPlanHash=null**. Source/API expressibility не принимает статический профиль, native/scoped proof или parity.

Продуктовый input остался байт-в-байт прежним и отклоняется из-за незаполненных полей. View, disabled, явный Loading=false, business priority, высота viewport и фактическая ширина BG не заполнены из proposal. Примеры используют синтетические значения.

Файлы для ревью:

- [Machine handoff](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/reports/NEXT-03-static-content-producer.2026-10-06.json) — SHA256 `74c3e05a8b33a28a66f5768ddddcd9246a832dba9c6de0a031fe679477766aeb`.
- [Producer manifest](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/v1-draft/producer.v1-draft.json) — file SHA256 `bfe8a28f4344eb015e84dadb50ee39403e842ebad7530f24921480107bbfab07`; canonical artifact digest `b73d5c4264b34e60a9585847d9f6442b505347b274a7692725a18a24aa533b48`.
- [Helper и границы API](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/v1-draft/README.md).
- [Запрос consumer review](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/v1-draft/CONSUMER_REVIEW_REQUEST.md) — определить отдельное чтение Draft только для ревью, сохранив Ready gate исполнения. Shared consumer/schema не изменены.
- [synthetic.supported.review.json](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/v1-draft/synthetic.supported.review.json) — bounded-content-expressible; SHA256 `a8ec281534e1c56e437152e60f0d7f04e25903b94d13283fabc1b48fe4af3f38`.
- [synthetic.unsupported-view.review.json](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/v1-draft/synthetic.unsupported-view.review.json) — not-supported; SHA256 `b6b42223353a7912ae7d3beb0189a3d2013d5bedab6c6f18a662eafbc1e7430a`.
- [synthetic.unsupported-priority.review.json](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/static-content/v1-draft/synthetic.unsupported-priority.review.json) — not-supported; SHA256 `51887c86bb55de80d0f456da656cf803ce7e59299df57d2621a02545320e0b77`.

Frozen registry file SHA256 `349073c8922f8c4437451a086714f08d63dbfd1164218d600610afdfb9eec1a8`; lock file SHA256 `31304cb886f5371cf8200179911352685a1a4889a8c3e31490383b46771fcd2e`. Current registry digest `4540c8e955a24f7be6ce70dc43e1729a887d4fa4b065ad24ba91ef0f5ef874eb`; currentInputs `cf9cc8c43198f40d34998aabc1b7a368385705e5bd48ca355cc8c03e218616a2`. Полный CC desktop13 / mobile8 / BG59 / Button31 / Spinner8 closure и immutable passport basis сохранены.

No registry/lock/source/DS/compiler/ZIP/shared schema edits; no JSX/native target writer, handlers/no-op scenarios, Figma/browser/live runs, install/publication or profile/provider/Ready activation.
