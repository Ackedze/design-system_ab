# NEXT-02: авторитетная упаковка и типизированные кодовые паспорта

Упаковочный blocker закрыт. Технические source/API поля применены к трём главным manual и рабочим ZIP. Прежние Figma нормы/исполняемые проверки и область приёмки сохранены. Девять context Draft правил ButtonsGroup остаются непринятыми; accepted code profiles не добавлены.

## Проверенная реализация

Editor **0.2.91**, shared core **0.1.10**, v4 profile **0.4.0**. Перед экспортом четыре фактических v4 build hashes совпали с `GENERATION_CODE_EVIDENCE.md`:

- runtime.cjs: `980ad3288b2b707b9b3bacefccee06736bf578f7e2e53f60b48b9bd7ad5997a4`.

- build-inputs.json: `ebefc13209102e2f8578f96e989bace3e87a01d7745ea5665c4630f5472d444d`.

- code.js: `5bd9a5be5e5c49e3e96a640306d7e43c3e175610d202167ae125671f3f30b034`.

- ui.html: `5276890c506b60b040b5be0deae731d31235cf9405ce017d3294f6cc29fda552`.



Это проверка доставленных сборок и authoring sources. Новых frontend/browser/native/live/release запусков или публикаций в этой задаче нет.

## Button и Spinner: точный re-export

Использован штатный путь: главные manual + полный исходный read-only JSON inventory/facts → `buildExportBundle(...,{projection:ownCanonicalProjection})` → повторная компиляция и сравнение полного derived contract hash → `buildAuthoringZip` → запись/reopen фактического ZIP → действующий v4 loader. Историческая проекция используется только как проверяемый вход producer stamp; cached predicates не стали входом compiler. Tampered projection отклонена `EXPORT_PROJECTION_MISMATCH`.

| Компонент | Старый ZIP SHA256 | Новый ZIP SHA256 | Сохранённый compiled hash |
| --- | --- | --- | --- |
| Spinner r8 | `f8eb8af5fce11b04f983151a2764a30fd4ba0419310c10171d02d731ab2dab46` | `8c38d4d3faa9014d7d2ed16e745b0150e9996d576ede807bd87019f441bdbc0f` | `909113967175c1ae618d2857d96855a3d3f53cdfe0b38cf923ce10b56e553221` |
| Button r31 | `56aaa478ad4e4deb4d8b6f1973a382c8cdd99757759b6d997c5d84645d3a72f3` | `cd363081f2c8f5cf53d05fa674490e6ba719d46faebc4a7f513130a0f1676330` | `6136013045fbcab513f8e7cbcd0ce968903ef81851c927dd7426e218438f5f8b` |



**Spinner**: [главный manual](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-core/core/Spinner/contract.manual.json), [рабочий ZIP](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/Spinner.component-contract.zip), [history](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-core/core/Spinner/history/r8-before-next-02-packaging-2026-10-05).

ManualSourceHash `f364e2bfc0a42a09e6656d0510905d11c793ea63324c8fba0a52e3b873ae6f95`; полный facts hash `757afcba3b10bda8520c09f70c43203ec18d59e586a7327c8494d7ed99c0a597`; producer `component-contract-editor@0.2.33`. Manual/rules/targets/dependency pins, весь facts и read-only inventory сохранены. Archive bytes и manual-entry byte SHA изменились из-за новой упаковки; semantic manual/compiled pins прежние.



**Button**: [главный manual](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-core/core/Button/contract.manual.json), [рабочий ZIP](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/Button.component-contract.zip), [history](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-core/core/Button/history/r31-before-next-02-packaging-2026-10-05).

ManualSourceHash `0177a9b6cd3fc60c8ebafbf962ec7da74538e13fd18b6b22cf77ac663feebc22`; полный facts hash `7c3b184d2bd9d676f0254b2d9d79ba8aa2e18039ce7ccd46f06fc63a8782c111`; producer `component-contract-editor@0.2.52`. Manual/rules/targets/dependency pins, весь facts и read-only inventory сохранены. Archive bytes и manual-entry byte SHA изменились из-за новой упаковки; semantic manual/compiled pins прежние.



Фактически установленные Button и Spinner ZIP загружаются в v4 как Ready с прежними compiled hashes. Их closure проходит `COMPONENT_DEPENDENCY_LINK`; ButtonsGroup после этого честно блокируется отдельно: `APOLLO_V4_CONTRACT_INCOMPATIBLE: Runtime requires an accepted ready contract`.

Legacy `Spinner/editor/spinner.component-contract.zip` оставлен без изменения: его manualSourceHash отличается от главного r8. Seed editor-input ZIP не обновлялись. Авторитетные рабочие архивы находятся в current-contract-packages.

Аудит упаковки: [next-02.authoritative-packaging.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.authoritative-packaging.2026-10-05.json).

## Три кодовых паспорта

| Источник | Версия | Новый manualSourceHash | Новый ZIP SHA256 |
| --- | --- | --- | --- |
| ButtonsGroup | r57 → r58 | `a5517e6141f0c373dea37fd8e133437bcc11bdd7adde9a2f193c5bca075a2548` | `c681b49ce0357d70644eed275c7b0e79c4ffc4d80419438cc9453ce859813d32` |
| CorporateContent | r12 → r13 | `6393e14c0369c4f9f409931a1d7d3725819a6f35de18283060e38e435b43f914` | `5848372939d4758635b41d92b4cee94815386507040002f7c2807fd1957955be` |
| CorporateContent/mobile-web | r7 → r8 | `722b98e830a58e18fb47d258f99db099d52a32cd413cde7f2571c5c765408452` | `78a0352a0a2a208f725c94d14ec7f1f4390417d6deaece8edc31592df553727e` |



### ButtonsGroup

Главный source: [contract.manual.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/contract.manual.json); пакет: [ButtonsGroup.component-contract.zip](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/ButtonsGroup.component-contract.zip); прежние source/ZIP/projection/proposal: [history](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/history/r57-before-next-02-typed-code-2026-10-05).

Старый manualSourceHash `5ba3bf8f2b92bc842f917c209eef2e5a98f939eb0403bb4e204c7154f2cbef6a`; старый ZIP SHA256 `214d9cc0c16a4b7c56e3a69e9151e0d5a36d3d9d05e947bf2122d0e53eb3743a`; compiled hash `a026c0a2e626e2c95bf57953ad21ef84875dafe899359ff97ee84d0c4ef199f1` → `40317d96a9a4ee32785f45a42af61eeeedfc0f7921c6b7a768d27d284c0b07f9`.

Для registry отдельно: новый ZIP manual-entry SHA256 `ab502e85d35fa08fb2b9a2014d60c7f039dc36ee0f950388889123719ea2e75d`; главный editable file SHA256 `d030788658198af746617e91e3978eebb82d8f3a771d3bca52063fd55b7163a7`; semantic manualSourceHash указан выше. Эти byte hashes не подменяют semantic source pin.

representationScopeHash `52ce3ef5899cb70f2ac787720bce33bbb597ba1d743dbfa255e45c2de9a3b086`; full sourceFactsHash `6c8f2d2fa7679923b36f5f005910b1475855aeae8a76559d040a0e8e4b8d97ca`.

Техническая запись: [next-02.typed-passport-application.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.typed-passport-application.2026-10-05.json). Адаптированная proposal/record: [next-02.code-fields.proposed.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.code-fields.proposed.2026-10-05.json).



### CorporateContent

Главный source: [contract.manual.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/CorporateContent/authoring/contract.manual.json); пакет: [CorporateContent.component-contract.zip](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/CorporateContent.component-contract.zip); прежние source/ZIP/projection/proposal: [history](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/CorporateContent/authoring/history/r12-before-next-02-typed-code-2026-10-05).

Старый manualSourceHash `babd61bace922b9ce4c46ddad751c8bf1ebd906fd7c8e828a7a0d02c82d1a408`; старый ZIP SHA256 `281159400f53164d58c4302b8f3fcecc32da3aff573bb8dd949e9072cd8bc8de`; compiled hash `287f3257d81bf8ac5232e65b1b8b82aa7a737b0e31f59fdcde730f6448637003` → `aa6a991cd4455f603f5d9f6cb4f857ae55f9ef89d1e330327b7a7c8bcf42b47f`.

Для registry отдельно: новый ZIP manual-entry SHA256 `463289543c3e982b7970bed65c9fb39dcc8be19de6261844116e5afed4877653`; главный editable file SHA256 `5beca421261eb283d862fc8576895218373f4e01b2369b4acf3d859b7d9d339d`; semantic manualSourceHash указан выше. Эти byte hashes не подменяют semantic source pin.

representationScopeHash `62e12fa1655d5c63ca410935e44e1c2f6ef0df30ec5ef08378b2123d94cd28be`; full sourceFactsHash `4297290da7c964dcc0744c5dafb131d16e7fb2dc398b2807cab7a58bc147379d`.

Техническая запись: [next-02.typed-passport-application.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/CorporateContent/authoring/reports/next-02.typed-passport-application.2026-10-05.json). Адаптированная proposal/record: [next-02.code-fields.proposed.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/CorporateContent/authoring/reports/next-02.code-fields.proposed.2026-10-05.json).



### CorporateContent/mobile-web

Главный source: [contract.manual.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/CorporateContent/mobile-web/authoring/contract.manual.json); пакет: [CorporateContent.mobile-web.component-contract.zip](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/current-contract-packages/CorporateContent.mobile-web.component-contract.zip); прежние source/ZIP/projection/proposal: [history](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/CorporateContent/mobile-web/authoring/history/r7-before-next-02-typed-code-2026-10-05).

Старый manualSourceHash `e64c6fff24a1d16f87cf42f5c506599556323c61b36b93b17e20c4307c335d79`; старый ZIP SHA256 `7bcabd8ec7659bf1992720b312f42c5e93bfd3c1ee936c445cf916c70f2e6925`; compiled hash `bc58918d210bc304fbc3ba3a414124bddd15b433e90ed9e7e6ef989e31d15c7c` → `abbf345813f4589b9a37ec923afcddf69d7a7c2ed59d0fca3543fbb5c23328d3`.

Для registry отдельно: новый ZIP manual-entry SHA256 `811597a9d5b5d5c1b47aed5782bc4284db7f8e9b12df4dc825dbbc240d96e9e0`; главный editable file SHA256 `fb4fa7a41a45103d18608e1d2f678f146ae41e93d590ebaa4fd1d710d9c77bc0`; semantic manualSourceHash указан выше. Эти byte hashes не подменяют semantic source pin.

representationScopeHash `ca583197eea958c65fdd31327b3a1a8dee281e1282c292c25be487c553949d6b`; full sourceFactsHash `4297290da7c964dcc0744c5dafb131d16e7fb2dc398b2807cab7a58bc147379d`.

Техническая запись: [next-02.typed-passport-application.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/CorporateContent/mobile-web/authoring/reports/next-02.typed-passport-application.2026-10-05.json). Адаптированная proposal/record: [next-02.code-fields.proposed.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/CorporateContent/mobile-web/authoring/reports/next-02.code-fields.proposed.2026-10-05.json).



Все три code representations — **Draft**. `codeEvidence.version=1`: availability=`confirmed-source-api`, parity=`not-confirmed`, acceptance=`not-run`, publication=`not-confirmed`. Evidence refs взяты только из immutable producer manifest и сверены по фактическим bytes. Code pin: arui-private **80.7.1**, commit `c037d0c322ea9774a9c251400d76d41222819b87`, basis registry digest `bf7834d4f4b89b187476dc80dd84c93c9130562e88c552073a3343e53e2abad0`. Это immutable basis, а не заявление свежести текущего registry.

ButtonsGroup Size использует закрытый `codeTransform.version=1`, total `enum-map`: строки 32/40/48/56 → числа. Overflow не сопоставлен с выдуманным boolean prop. Три source API поля label/disabled/View имеют по четыре `ownedOccurrence.version=1` bindings на существующие exact targets/direct-child dependencies. Resolver требует trusted native capture, captured effective visibility и source order; addresses для Size56 false/true сохранены. Индексы и primaryFirst выводятся только после identity/visibility/order proof. Handlers и бизнес-приоритеты не выводятся из labels/View/ordinal.

CorporateContent сохраняет Body slot/content API и получает `nativeSlotBinding.version=1` к `props.children`: desktop `[D] Body#135096:3`, mobile `[M] Body#135096:2`, существующий target.body и external slot-api port, preserve-ordered-content, trusted-native-capture proof. Это декларация требуемой привязки, а не native write capability или выполненный capture. Официальные typings не предоставляют SLOT writer; generic append не заменяет принятую host recipe.

Свободные строки transform из прежних proposals заменены закрытыми typed fields. Новых accepted code generation profiles, receipt refs, реальных actions/handlers, native writes или live доказательств не добавлено.

## Раздельные статусы

| Область | Текущий результат |
| --- | --- |
| Source/Figma Predicate ButtonsGroup desktop r58 | Draft: прежние 17 Reviewed predicate rules + 9 context Draft; 30 checks |
| Source/Figma Predicate CorporateContent desktop r13 / mobile r8 | Ready в прежней области 6 source rules / 17 checks на платформу |
| Code availability | Только подтверждённые public source/API refs |
| Code parity | not-confirmed; gaps сохранены |
| Code/live acceptance | not-run; новых receipts нет |
| Generation profile authority | proposal-only; owner-решение ожидается |
| Publication/release | not-confirmed; общей публикации нет |



В памяти оба compiler bundle дали одинаковые проекции. JSON schema/typed validators прошли; опциональные runtime markers representationEvidenceVersion=1 и crossRepresentationBindingsVersion=1 присутствуют. Тела Figma RuleIR совпали после исключения только revision/source checksum provenance. Manual rules/targets/controlPorts/dependencies/generation/decisions/examples/semantics/documentation, Figma facts/customization policy/coverage сохранились.

После замены production ZIP повторно прочитаны именно их фактические bytes. Button/Spinner подтвердили exact compiled pins. Оба CorporateContent проходят source loader; ButtonsGroup доходит до независимого Draft gate. Source Ready CorporateContent не принимает его Draft code representation.

Runtime indexes и source metadata crosswalk приведены к новым revisions/hashes без изменения семантических entries; предыдущие файлы сохранены в history. Historical acceptance reports остались неизменными.

## Google-реестр

[Машиночитаемые компоненты](https://docs.google.com/spreadsheets/d/1u3Y7lhO3udXAhGlf7hOk2_zYkWZ0-vgtd6KjtbnxLnk/edit): Правила 572–603 и 1873–1884; Леджер 12 и 78–87; Corp components AF10:AH10 / AF17:AH17; Core components AF10:AH10 / AF61:AH61. Обновлены **244 ячейки** metadata/source pins/дат/комментариев. BG mobile r2 pin сохранён отдельно от desktop r58; mobile ButtonsGroup source не изменён. Rule/ledger statuses, validation и formats сохранены и прочитаны повторно без расхождений. Predicate Draft/Ready остаётся прежним и scoped.

Визуально проверены Corp/Core registers, Правила F1873 и Леджер F84. Пользовательский фильтр скрывает BG rule rows; их values/formats подтверждены API. Длинные component comments клиппируются при существующей фиксированной ширине; полное содержание подтверждено API/AX. Фильтры, ширины и размеры строк не менялись; временная вкладка закрыта.

Аудит: [next-02.technical-source-registry-sync.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.technical-source-registry-sync.2026-10-05.json).

## Передача registry / Generation lock owners

Старый registry теперь ожидаемо отклоняется `STALE_CONTRACT_PIN: buttons-group.desktop`. Registry, Code Connect files, locks и Generation receipts в этой задаче не переписывались. Последовательный refresh требуется владельцам:

1. Обновить exact root archive SHA, archive manual-entry byte SHA, semantic manualSourceHash, revision и compiled hash для BG desktop r58 / CC desktop r13 / CC mobile r8. Сохранить прежние Button r31 / Spinner r8 semantic dependency pins.

2. Обновить реальные Button/Spinner archive receipts и transitive source closure в Generation locks: archive bytes новые, compiled hashes прежние. Не брать diagnostic fixtures или старые cached projections вместо source compilation.

3. Заново получить свежие producer observations/preflight receipts для новых source archives и code scope hashes. `codeEvidence.sourcePin.registryDigest` и соответствующий locator остаются immutable basis; не менять их на новый свежий digest, создавая цикл archive→registry→archive.

4. Сохранить source Ready gate, Draft code/parity/acceptance/publication и owner review всех девяти context норм. Принятие профиля/host recipe/actions/width/lifecycle/live tests выполняется отдельно.

Машинная передача с exact current pins и final actual ZIP verification: [next-02.typed-passport-summary.2026-10-05.json](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.typed-passport-summary.2026-10-05.json).

## Девять норм: решение ещё ожидается

r58 меняет только технические поля; девять RuleID, полные тексты, applicability, routes, missing facts и Draft статусы совпадают с r57. Предыдущее ревью остаётся reviewable по смыслу; исторический r57 ZIP теперь находится в history. Текущие r58 pins/line anchors: [r58 supplement](/Users/alexkukhta/Desktop/workplace/shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.context-draft-review-r58-supplement.2026-10-05.json).

Вопрос владельцу остаётся прежним: принимать полный текущий desktop источник либо отдельно обсуждать ограниченный профиль с двумя реальными текстовыми действиями. Профиль не принят; реальные actions/priorities/handlers/lifecycle/widths/captures не выдуманы.
