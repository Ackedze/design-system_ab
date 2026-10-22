# PaymentMaskedNumber r4 — Figma mapping для Proxy

Рабочий источник находится рядом с manual и facts компонента:
`JSONS/web/components/web-corp/PaymentMaskedNumber/mapping/figma-mapping.json`.

Этот mapping включён в новый immutable пакет:
`apollo/data-packages/e08462d1600c7efe85d0dd2fc93a0edcb5e3cf50d0d44fae337c4c934c8938ce/contracts.tgz`.
Указатель доставки — `apollo/data-packages/current.json`.

- Предыдущий dataId: `4726ca79eb6bb35dd9bcc153793d35b8359b51d81990643656466f2c5e3c593e`.
- Новый dataId: `e08462d1600c7efe85d0dd2fc93a0edcb5e3cf50d0d44fae337c4c934c8938ce`.
- Runtime сохранён: `6c6bbc1c22f671875a206b14dc3abeb80ff8f863276151c4f565500e8d9b77bb`.
- Все 12 contract entries, revisions, RuleIR и checking pins сохранены.
- В catalog у PMN Figma меняется на connected. Все остальные 11 строк сохранены.
- Frontend остаётся отключён в portable profile; источники SDK в поставку не добавлены.
- Draft/Ready, ограничения custom Major и служебного SwapMe сохранены.
- 25/25 PASS: установленный importer на отдельной PMN delta, reader полного пакета,
  две платформы projection/admission/MCP target, typed authority пяти портов,
  неверные типы/SwapMe/checksum, упаковка/повторное чтение и неизменность runtime.

Полный повторный импорт исторического snapshot потребовал неиспользуемые legacy
provenance ZIP, которых portable reader не включает в closure. Первый отказ
сохранён в `FIRST-FAILURE.json`. Применён более узкий путь: существующий importer
проверяет PMN-only delta; её проверенные frozen records добавляются к принятому
снимку. Неизменные legacy records и их SHA сохраняются; guard не изменён.
`DELTA-IMPORT.json` фиксирует этот путь. Обновление не требует правок Proxy.

Source candidate от предыдущего шага и его seal не меняются. Текущий working
mapping — новая запись с pins canonical manual и текущего r4 ZIP, без frontend.

Доставка после push: **Проверить обновления → Обновить** в миниаппе Proxy.
Подготовка не переключала установленную версию и не выполняла model/native calls.
Установка и фактическая генерация в Figma — отдельные результаты.

