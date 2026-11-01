# Mapping PaymentMaskedNumber

[Manual](<../contract.manual.json>) — r5, `payment-masked-number.universal`.

- **[Текущий Figma mapping](<figma-mapping.current.json>)** — техническая перепривязка к r5 с полным замыканием нормативных зависимостей.

Основа native evidence — прежний пакет `68179d13bb84c26cba5e8c9faaa170b4a1e6c3758cd9d907223a525a86a441bc`. Новое замыкание r5 поставлено в `1.4.10-data.20261101.2`, snapshot `00b70f7d32167e5556110803f05dadbba0ef81f58a4ca869be9248ff475d6d79`. Пять typed source pins и четыре RuleID/source записи ссылаются на r5; native порты, домены, профили и цели сохранены. [Проверка](<../reports/reader-repair-2026-11-01/MAPPING-EVAL.json>).

Исходные Candidate/Draft/Ready и capability gaps сохранены. Это не свежая native-приёмка r5. Пинованные shared/ ссылки разрешаются относительно нового snapshot; текущая проекция проверена loader и защищённым consumer без пересборки Proxy.

## История и кандидаты

- [payment-masked-number.frontend-mapping.json](<history/r4-2026-10-22/payment-masked-number.frontend-mapping.json>) — `frontend` r4; `superseded-evidence`. [Provenance](<history/r4-2026-10-22/FINAL-SEAL.json>).
- [figma-mapping.json](<history/r4-before-effective-2026-10-23/figma-mapping.json>) — `figma-generic` r4; `superseded-evidence`. [Provenance](<../../../../../../experiments/current-contract-packages/PaymentMaskedNumber/reports/proxy-figma-mapping-r4-2026-10-22/FINAL-SEAL.json>).

Прежние producer inputs и seals в .local/experiments сохранены без изменений. Старые canonical receipts относятся к прежнему размещению и не перепривязаны. Frontend-кандидаты остаются в history: в принятом переносимом профиле frontend отключён.
