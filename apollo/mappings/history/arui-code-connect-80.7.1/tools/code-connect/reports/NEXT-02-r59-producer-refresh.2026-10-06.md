# NEXT-02 producer refresh: ButtonsGroup r59

Producer refresh завершён. `loadRegistry`, `verifyLock`, `verifySource`, source/API preflight и текущий Generation `verifyCodeConnectInputs` — PASS. Все **43 теста**, typecheck трёх parserless templates и реальных generated imports, CLI parse трёх templates и schema QA проходят. Повторная сборка producer даёт те же registry/lock bytes.

- [Registry](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/registry/arui-private-80.7.1.v1.json)
- [Full root/transitive lock](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/registry/lock.v1.json)
- [Machine handoff с полным pin vector, exact lock и результатами проверок](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/reports/NEXT-02-r59-producer-refresh.2026-10-06.json)
- [История r58 producer](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/registry/history/1.1.0-r58-before-owner-review-r59.2026-10-06/index.json)
- [Verifier этого refresh](/Users/alexkukhta/Desktop/workplace/arui-private/tools/code-connect/refresh/verify-r59.cjs)

Формат registry **1.1.0**, currentInputs version 1 и lock не изменён. Новая data revision — `2026-10-06-buttons-group-r59`. Generation уже принимает этот формат; новая схема или consumer migration не нужны. Два public imports, source API/defaults, mapping IDs и emit/prepare semantics прежние: arui-private 80.7.1, commit `c037d0c322ea9774a9c251400d76d41222819b87`.

| Digest / byte pin | Значение |
| --- | --- |
| Предыдущий r58 producer digest | `129d129ea3b5b3e4bb112b2cccd1414f59ff8d22cde00721dd58a3dea978fa90` |
| Immutable passport basis | `bf7834d4f4b89b187476dc80dd84c93c9130562e88c552073a3343e53e2abad0` |
| Текущий r59 producer digest | `4540c8e955a24f7be6ce70dc43e1729a887d4fa4b065ad24ba91ef0f5ef874eb` |
| currentInputs canonical digest | `cf9cc8c43198f40d34998aabc1b7a368385705e5bd48ca355cc8c03e218616a2` |
| Full lock canonical digest | `8dfe66f872d266a66949f9a56d2f1a2d092fc84af04ac72699919403d2a0eae1` |
| Registry file SHA-256 | `349073c8922f8c4437451a086714f08d63dbfd1164218d600610afdfb9eec1a8` |
| Lock file SHA-256 | `31304cb886f5371cf8200179911352685a1a4889a8c3e31490383b46771fcd2e` |
| Machine handoff file SHA-256 | `8182fe68ca815b666f4af66293079cec97e3c9d013009ca1e1e28bd1baa53ad6` |

CurrentInputs authority pair — current r59 machine handoff и стабильный NEXT-02 typed-passport summary. Supplemental packaging authority отдельно запинена в producer refresh metadata. Это сохраняет существующий закрытый wire format Generation. Actual editable manual, archive manual-entry, authoring compiled projection и canonical compiled/embedded hashes проверены. JSON manual в каждом ZIP равен главному source. Полный vector включает BG r59, Button r31, Spinner r8, CC desktop r13 и CC mobile-web r8; четыре остальных observations побайтно/семантически равны r58 producer.

| ButtonsGroup r59 pin | Значение |
| --- | --- |
| manualSourceHash | `ab69dff747b8d6b6f35618563203e44b6ba2134dc32ca66854b6431df6f3d98f` |
| compiledHash | `7de13ae7567ada098ddd6960011b5bc576bf00f037d776d44e98cc6365566404` |
| Archive SHA-256 | `d7112c61163bdbd4b2979c18b75bbf9c1a2980abb37a7f7724a4a0251fa1f95e` |
| Editable manual byte SHA-256 | `91514b045ac5b1644880be146fa6c3d7ecfcfb42a1ee2d27c58abd18f741b6dd` |
| ZIP manual-entry byte SHA-256 | `8055e9c2d0f8e851ff952eaaa30399ee4d3e9c81559b5c57b12b5c9cee367d80` |
| Representation scope hash | `c34dff3185ed78030eb57bf56701a0aa8e19e65c34121ab5a64ce25bf5aca981` |

Все **26 норм Reviewed**; девять context-only правил остаются nonExecutable и сохраняют canonical **Source Draft**. В BG template обновлены только source revision/review/execution metadata. Compiler/core/predicates/runtime facts/checkers не изменялись. Code representations остаются Draft, parity not-confirmed, acceptance not-run; ни профиль, ни native capability этим refresh не приняты.

Owner-confirmed pilot scope: desktop CC native Body → BG Size56 / Overflow=false / две text actions / content-only. Настоящие labels, handlers, priority/lifecycle/width и canonical Body/owned/payload correspondence receipts не заданы. Прежние Send/Cancel fixtures и mobile text служат только API/typecheck примерами; они не стали продуктовым сценарием.

Исторические reports/receipts и passport basis не перепривязаны. Сохранён прежний `STALE_CONTRACT_PIN` до refresh. Проверены 694 прежних source/artifact/dist/package-manifest пина, а также r58 producer history и файлы его machine report через сохранённые snapshots там, где producer/test code обновлён штатно.

Выявлен отдельный внешний дрейф Chrome: прежний 154.0.8037.95 / `affc6715a14a423f5207014ae4b86ddad028e70b04b13572d60d35d8ac728f91`, сейчас 154.0.8037.98 / `ccffd5c5fe77ba3212e07c2c69091f8048b73c396b4647ecaa150e1e01a04954`. Бинарник только прочитан; установка и browser/live replay не выполнялись. Старый runtime receipt остаётся историческим, без заявления о воспроизведении его браузерной среды.

Generation может последовательно пересобрать production consumer и обновить свои producer/current-input/recipe/build/lock observations по machine handoff. Existing consumer уже проверяет этот registry/full lock. r58 observations остаются историческими; новые plan-bound proofs должны ссылаться на текущий digest и r59 scope при неизменном passport basis. Source Draft gate, отсутствие product/native/profile evidence и отдельные publication/release gates сохраняются.

DS manuals/ZIP/compiled, v4/shared core, historical frontend host и private diagnostics/fixtures не редактировались. Новых Figma/live calls, publication, системной установки или сообщений в другие threads не было.
