# NEXT-02: восстановление main sources и упаковочный blocker

Primary-source reconciliation завершён. Упаковочная починка зависимостей блокируется существующим exporter; сохранён исполняемый repro. Новых норм и code fields нет.

## Главные источники CorporateContent

| Источник | Main до | Main теперь | manualSourceHash | SHA256 принятого ZIP |
| --- | --- | --- | --- | --- |
| Desktop | r11 | r12 | babd61bace922b9ce4c46ddad751c8bf1ebd906fd7c8e828a7a0d02c82d1a408 | 281159400f53164d58c4302b8f3fcecc32da3aff573bb8dd949e9072cd8bc8de |
| Mobile-web | r6 | r7 | e64c6fff24a1d16f87cf42f5c506599556323c61b36b93b17e20c4307c335d79 | 7bcabd8ec7659bf1992720b312f42c5e93bfd3c1ee936c445cf916c70f2e6925 |

Main manual побайтно восстановлены из закреплённых owner ZIP. Паспорт, native Body semantic API, Figma generation fields и metadata теперь совпадают. Шесть правил, targets, control ports, Figma facts, 17 Predicate выражений и customization policy не изменились. RuleIR revision/source.checksum следуют принятому source; это обновление provenance, а не нормы.

Прежние main, рабочие ZIP, проекции и README сохранены в:

- `CorporateContent/authoring/history/r11-primary-before-owner-r12-2026-10-05`
- `CorporateContent/mobile-web/authoring/history/r6-primary-before-owner-r7-2026-10-05`

Рабочие authoring ZIP и read-only проекции приведены к exact owner export. Принятые ZIP в current-contract-packages и их pins не изменились. Оригинальные acceptance reports r11/r6 сохранены. Оба compiler bundle воспроизвели принятую проекцию с проверенным historical exporter stamp; actual ZIP source load в v4 прошёл. Приёмка остаётся прежней: шесть Figma правил на платформу, без новой live/code/layout/payload/publication приёмки.

Аудиты:

- `CorporateContent/authoring/reports/next-02.primary-source-reconciliation.2026-10-05.json`
- `CorporateContent/mobile-web/authoring/reports/next-02.primary-source-reconciliation.2026-10-05.json`
- `ButtonsGroup/authoring/reports/next-02.primary-source-summary.2026-10-05.json`

Google Правила 1873–1884, Леджер 78–82 и Corp components AF17:AH17 синхронизированы. Все 77 изменённых ячеек прочитаны повторно; formats, validation и существующие rule/ledger статусы сохранены. Predicate остаётся scoped Ready. Аудит: `next-02.primary-source-registry-sync.2026-10-05.json`. Визуально проверены дата/Ready и оформление Леджера; текущий пользовательский фильтр скрывает CorporateContent в Правилах, поэтому fit этих строк подтверждён только metadata/readback. Фильтр и ширины не менялись.

## Воспроизводимый exporter blocker

Использован штатный путь без изменения core:

`importWorkspace → buildExportBundle → buildAuthoringZip → запись ZIP → чтение реального ZIP → sourceFromFiles/loadAuthoringSource`.

Spinner r8 сохраняет original manual/facts, но compiled hash меняется:

- принят: `909113967175c1ae618d2857d96855a3d3f53cdfe0b38cf923ce10b56e553221`, exporter `0.2.33`;
- штатный экспорт: `79426443bc21808f1e1066b4fcd61ee3d10e977c9e14ecccc38fc805b6bc1ccf`, exporter `0.2.37`;
- единственное различие проекции: `/package/sourceExportVersion`.

Button r31 при штатном экспорте сохраняет compiled hash `6136013045fbcab513f8e7cbcd0ce968903ef81851c927dd7426e218438f5f8b`. Но lossless authoring facts не сохраняются: исчезают две structures, меняются variants и пропадает libraryText. Его legacy `source.importedFiles` содержит описательные метки вместо имён JSON; штатный exporter не переносит исходные read-only JSON. Точный diff записан в repro. Это отдельная проблема сохранения authoring evidence; приёмка существующего compact Predicate не переписана.

Реальные диагностические ZIP дают Ready для нового Spinner, затем `COMPONENT_DEPENDENCY_LINK` для Button и ButtonsGroup: Button по-прежнему правильно закрепляет принятый исторический Spinner hash. Нормальные candidate ZIP сохранены только как private fixtures; ни один production/current dependency ZIP не заменён. Ручного добавления старой проекции или изменения stamp/pin для обхода проверки нет.

Repro/test: `next-02.exporter-packaging.repro.cjs`.

Запуск из workspace:

```sh
node shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.exporter-packaging.repro.cjs
```

Результат: `next-02.exporter-packaging.repro.2026-10-05.json`; actual ZIP fixtures — `fixtures/next-02-normal-export/`.

## Передача владельцу exporter / Generation

Нужен авторитетный export, который сохраняет проверенный historical exporter/anatomy stamp при точном воспроизведении исходных manual/facts. Cached predicates не должны становиться входом compiler. Несовпадение cache/manual/facts/stamp должно блокировать экспорт. Альтернатива — явно согласованная transitive recompile/repin, не guessed hash.

Также нужен lossless перенос исходного authoring evidence для legacy `importedFiles` с описательными метками. Критерий закрытия: реальные экспортированные Button/Spinner ZIP загружаются через v4 с прежними exact manual/compiled dependency pins; negative stale-cache/source проверки остаются fail-closed; original facts сохраняются при reopen.

Shared core, Code Connect registry и Generation inputs в этой задаче не исправлялись. Сейчас refresh Code Connect registry не нужен: все три закреплённых root ZIP неизменны, main источники лишь приведены к уже существующим pins. После будущего изменения dependency ZIP нужно обновить trusted Generation archive receipts/locks и отдельно проверить затронутые поля registry у его владельца.

Даже после исправления упаковки ButtonsGroup r57 сохраняет девять context Draft правил и отдельный SOURCE_COMPILE Ready gate. Предложенные code fields, CorporateContent geometry/padding/surface gaps и live/code acceptance остаются следующими этапами.
