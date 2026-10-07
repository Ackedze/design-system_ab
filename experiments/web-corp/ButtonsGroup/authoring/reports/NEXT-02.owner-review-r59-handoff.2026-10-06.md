# NEXT-02: Reviewed нормы и подтверждённый content-only пилот — r59

Прямое решение владельца 06.10.2026: «все правила переводим в reviewed, пилот подтверждаю». Все **26** действующих desktop правил теперь Reviewed: 17 существующих сохранены, ровно 9 context Draft переведены в Reviewed. Тексты/IDs/sourceRefs/applicability/owner/routes/constraints и 30 predicate bodies прежние.

**Canonical package остаётся Draft.** Штатный compiler сохраняет Draft при `nonExecutableRules.length > 0`; девять Reviewed context-only правил требуют прежних runtime facts/checker. Это отдельная неполнота исполнения. Статус не принудительно повышался; новые predicates или runtime evidence не добавлены. Evidence: [compiler.ts](/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/packages/component-contract-core/src/compiler.ts:878).

## Подтверждённый scope пилота

CorporateContent desktop → native Body `[D] Body#135096:3` → ButtonsGroup **Size56 / Overflow=false**, две обычные текстовые Button, content-only. Подтверждение не принимает product/code/native generation profile, source equivalence, parity, runtime mutation/live или release. Labels/handlers/priorities/loading/width/native receipts остаются незаданными; synthetic Send/Cancel не являются реальными фактами продукта. Existing `generation.profiles` не изменены.

## Точные r58 → r59 pins

| Pin | r58 (historical) | r59 (current) |
| --- | --- | --- |
| manualSourceHash | `a5517e6141f0c373dea37fd8e133437bcc11bdd7adde9a2f193c5bca075a2548` | `ab69dff747b8d6b6f35618563203e44b6ba2134dc32ca66854b6431df6f3d98f` |
| compiledHash | `40317d96a9a4ee32785f45a42af61eeeedfc0f7921c6b7a768d27d284c0b07f9` | `7de13ae7567ada098ddd6960011b5bc576bf00f037d776d44e98cc6365566404` |
| ZIP SHA256 | `c681b49ce0357d70644eed275c7b0e79c4ffc4d80419438cc9453ce859813d32` | `d7112c61163bdbd4b2979c18b75bbf9c1a2980abb37a7f7724a4a0251fa1f95e` |
| representationScopeHash | `52ce3ef5899cb70f2ac787720bce33bbb597ba1d743dbfa255e45c2de9a3b086` | `c34dff3185ed78030eb57bf56701a0aa8e19e65c34121ab5a64ce25bf5aca981` |

Editable manual byte SHA256: `91514b045ac5b1644880be146fa6c3d7ecfcfb42a1ee2d27c58abd18f741b6dd`; ZIP manual-entry byte SHA256: `8055e9c2d0f8e851ff952eaaa30399ee4d3e9c81559b5c57b12b5c9cee367d80`. Semantic hashes и byte SHA не взаимозаменяемы.

Source facts hash прежний: `6c8f2d2fa7679923b36f5f005910b1475855aeae8a76559d040a0e8e4b8d97ca`.

[Текущий manual](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/contract.manual.json), [authoritative ZIP](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/ButtonsGroup.component-contract.zip), [история r58](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/history/r58-before-owner-review-2026-10-06).

[Решение владельца](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/owner-decisions.2026-10-06.json), [audit применения](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/owner-review-application.2026-10-06.json).

## Другие источники и closure

| Source | Revision / canonical source status | manualSourceHash | compiledHash | archive SHA256 |
| --- | --- | --- | --- | --- |
| Button | r31 / ready | `0177a9b6cd3fc60c8ebafbf962ec7da74538e13fd18b6b22cf77ac663feebc22` | `6136013045fbcab513f8e7cbcd0ce968903ef81851c927dd7426e218438f5f8b` | `cd363081f2c8f5cf53d05fa674490e6ba719d46faebc4a7f513130a0f1676330` |
| Spinner | r8 / ready | `f364e2bfc0a42a09e6656d0510905d11c793ea63324c8fba0a52e3b873ae6f95` | `909113967175c1ae618d2857d96855a3d3f53cdfe0b38cf923ce10b56e553221` | `8c38d4d3faa9014d7d2ed16e745b0150e9996d576ede807bd87019f441bdbc0f` |
| CorporateContent | r13 / ready | `6393e14c0369c4f9f409931a1d7d3725819a6f35de18283060e38e435b43f914` | `aa6a991cd4455f603f5d9f6cb4f857ae55f9ef89d1e330327b7a7c8bcf42b47f` | `5848372939d4758635b41d92b4cee94815386507040002f7c2807fd1957955be` |
| CorporateContent/mobile-web | r8 / ready | `722b98e830a58e18fb47d258f99db099d52a32cd413cde7f2571c5c765408452` | `abbf345813f4589b9a37ec923afcddf69d7a7c2ed59d0fca3543fbb5c23328d3` | `78a0352a0a2a208f725c94d14ec7f1f4390417d6deaece8edc31592df553727e` |

Dependencies, четыре exact Button bindings, CC sources и code representations прежние. Code representations Draft; parity not-confirmed, acceptance not-run, publication not-confirmed.

## Проверки

Schema/validator valid без issues; два compiler bundle дают одинаковую проекцию. Нормативные поля всех 26 правил равны историческим после исключения только девяти статусов. 30 RuleIR bodies совпадают после исключения revision/source checksum provenance; coverage прежняя: 26 source rules, 17 predicate source rules / 30 checks, 9 nonExecutable context rules. Полные original facts сохранены; штатный ZIP повторно открыт и перекомпилирован.

Button/Spinner closure проходит. Действующий v4 при загрузке actual current ZIP даёт `APOLLO_V4_CONTRACT_INCOMPATIBLE: Runtime requires an accepted ready contract`; dependency link проходит. Это доказательство отдельного Draft execution gate, не обход его.

## Google readback

Обновлены **189 ячеек**: Правила A572:O603; Леджер A12:O12, A83:O87, новая native строка A92:O92; Corp components AF10:AH10. Девять норм → «Решение принято»; Predicate **Draft / 2026-10-06**. Mobile r2 и его source statuses сохранены. Ничего не переведено в «Проверено» только по owner review.

Written values совпали при readback; native formats/validation/chips и untouched values сохранены; строка 92 наследует native row metadata. На 100% визуально проверены Predicate/date и новая ledger decision. Пользовательский фильтр скрывает BG rows на Правила; values/metadata проверены API. Fixed comment width и фильтры не менялись; temporary QA tab закрыта.

[Google audit](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/owner-review-google-sync.2026-10-06.json).

## Privacy и Body identity

В DS `.gitignore` добавлен только `experiments/current-contract-packages/apollo-native-diagnostic-*.json`. Все три originals неизменны, untracked и теперь ignored; обычный git status их не показывает. Actual diagnostic/capture/node data не перенесены в source/docs/fixtures.

Offline Body review завершён в private /tmp. Exact native property/type/directness поддержаны независимыми observation guards; declaredSourceNodeId и canonicalSourceIdentity не подтверждены. Локальные remote definition IDs, нормализованные каталоговые номера, suffix/name/path не подставлялись в authored identity. Следующий input: owner source export/approved resolver receipt, связывающий exact source pins, representation/componentKey, полный native SLOT property и target.body; затем независимые payload/owned occurrence и freshness/mutation receipts. Это технический input, а не повторный вопрос о принятии норм или scope пилота.

## Последовательная передача producer owners

1. Code Connect owner: update exact ButtonsGroup root r59 archive, archive manual-entry, editable source, semantic manualSourceHash, compiledHash and new scope pins; preserve exact Button r31/Spinner r8 and CC r13/r8 source pins.
2. Generation owner: sequentially refresh producer observations, current registry/inputs/recipe/build/lock pins; previous r58 observations and receipts remain historical. Immutable codeEvidence basis registryDigest stays unchanged.
3. Keep hard source Draft gate caused by nine nonExecutable context rules; all 26 Reviewed is norm approval, not runtime evidence or permission to suppress missing facts. Any core readiness change belongs to its explicit owner/task.
4. Pilot scope is confirmed content-only. Actual product facts and canonical Body/owned occurrence/payload correspondence receipts remain separate. Do not promote synthetic Send/Cancel, current FRAME child or remote IDs into source/product facts.

Машинная передача: [NEXT-02.owner-review-r59-handoff.2026-10-06.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/NEXT-02.owner-review-r59-handoff.2026-10-06.json).

Registry/v4/Generation locks не редактировались. Commit/push/system install/publication не выполнялись.
