# Status r2: открытое содержимое native SLOT

Решение владельца и native-привязки сохранены в [owner-decisions.json](../../owner-decisions.json). Способ записи взят из CorporateContent: собственные цели проверяются явно, рекурсивная проверка не проходит в SLOT payload. Контейнер SLOT сохраняет baseline. Два native anchor 64/59 записаны как policy provenance; общий optional-slot boundary materializer не заявлен.

[Пакет r2](../../packages/Status.r2.draft.component-contract.zip) технически проверен: exact manual/compiled/full-facts ZIP reopen; 31 frozen runtime pin; восемь сохранённых owner captures. Результат 0/0/0/0/1/1/1/1, UNKNOWN36→0; четыре исходных нарушения сохранены. Synthetic: произвольные свойства/текст payload разрешены, padding самого SLOT нарушает baseline, FRAME с тем же именем и посторонний объект снаружи SLOT остаются UNKNOWN. Отсутствие slotContentId отдельно не проверяется; граница здесь задаётся подтверждённым native типом/структурой.

Точный [replay](replay.json), [coverage](coverage-map.json), [кейсы](test-cases.json), [проверяемый скрипт](verify.cjs), [eval](eval.json), [доставка](data-package.json), [реестр](sheet-sync.json). Старые r1 ZIP/seals/partial receipt сохранены. Прочие14 delivery entries и generation unchanged. Ни engine/build, ни working Proxy не изменялись; push/install выполняет владелец.

После Git-обновления Proxy перепроверить ST-02/ST-03/ST-08: 0/0/1 целевых нарушений, без неопределённых проверок самого Status. Старый notChecked вложенного Uppercase Label в selected-area не считается исправленным этим компонентным replay; нужен свежий area result. Draft/wholeReady=false сохранены.
