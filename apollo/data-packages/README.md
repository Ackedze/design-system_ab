# Контрактные данные Apollo

Актуальный подготовленный снимок выбирает [current.json](current.json).
Сейчас это **Indicator r1 Draft для проверки**, dataId
`8d3248d2735c6819906c914a0d75981dda85850a9a86b58d344099c060c8b3f3`.
Рабочая папка — `shared/design-system_ab`, ветка `main`.
Новый пакет сохраняет прежние 12 контрактов, их generation mappings и runtime,
добавляя Indicator для проверки (всего 13). Indicator Figma-generation mapping не
заявлен. PaymentMaskedNumber r4 mapping сохранён. Frontend остаётся отключённым.

Рабочий mapping лежит рядом с manual и facts компонента:
[figma-mapping.json](../../JSONS/web/components/web-corp/PaymentMaskedNumber/mapping/figma-mapping.json).
Исходники редактируются в каталоге компонента; immutable `contracts.tgz` формируется
сборщиком для доставки. Файл в `reports` остаётся историческим evidence.

После push в `main` установка выполняется через **Проверить обновления → Обновить**
в миниаппе Proxy. Код приложения, плагина и engine не пересобирается.
Проверки и границы: [отчёт](../../experiments/current-contract-packages/PaymentMaskedNumber/reports/proxy-figma-mapping-r4-2026-10-22/README.ru.md).

## Исторический снимок и приёмка r1

Исторический snapshot r1: [contracts.tgz](./470c0724eedb5652850331c0783ca89c63c84ddb7c4b505a4a9b834f7340b883/contracts.tgz), dataId `470c0724eedb5652850331c0783ca89c63c84ddb7c4b505a4a9b834f7340b883`. SHA-256 закреплён рядом в `SHA256SUMS`. Один архив сохраняет точные исходные bytes без копирования 128 тысяч строк исторических JSON в diff.

- 12 контрактов: прежние 11 entries и generation pins сохранены точно; добавлен только PaymentMaskedNumber r1.
- Режим нового контракта — `authoring-preview`, Draft. Checking доступен; Ready и публикация не заявлены.
- Runtime `6c6bbc1c22f671875a206b14dc3abeb80ff8f863276151c4f565500e8d9b77bb` сохраняется. Код, SDK, личная конфигурация и история сюда не входят.
- Профиль `checking-ask-figma-mcp`; frontend отключён как в исходном snapshot.
- Формат номера Major/Minor пока не исполняется; это согласованный пробел Draft.

## Обновление напрямую из Git

В `current.json` объявлены совместимый runtime, путь снимка, SHA-256, размер и dataId. Файлы хранятся в этом репозитории; отдельный хост или publisher не нужны. Прежний `apollo/knowledge/channels/stable.json` не используется и не меняется.

1. Подготовить новый снимок, обновить `current.json` и запушить в `main`.
2. Proxy разрешает точный commit `main` и читает индекс и архив из одного commit по Git HTTPS. Неизменный dataId — no-op без скачивания архива. Единица обновления сейчас — весь `contracts.tgz`, а не бинарный diff отдельных компонентов.
3. После скачивания Proxy проверяет размер, SHA-256, runtime, dataId и фактический reader. Служебные AppleDouble `._*` из исторического снимка исключаются при извлечении.
4. Новый контрактный снимок соединяется **локально** с уже установленными знаниями Hub штатным сборщиком. Ни приватные knowledge, ни SDK, ни настройки в Git не отправляются. Локальный архив создаётся с `COPYFILE_DISABLE=1`.
5. Существующий installer атомарно переключает данные и сохраняет предыдущую версию для отката. Миниапп дожидается завершения активной работы и перезапускает только сервер. Приложение, плагин и engine не пересобираются.

Настройка источника в существующем поле `APOLLO_DATA_DESCRIPTOR_URL`:
`https://raw.githubusercontent.com/Ackedze/design-system_ab/main/apollo/data-packages/current.json`.
Название настройки сохранено для совместимости миниаппа; это адрес файла Git.

Требуется Git updater из `apollo-proxy/scripts/git-data-cli.js`, установленный как `scripts/data-release-cli.js` поверх принятого portable Proxy. Он использует уже поставленные modern builder/readers. Наличие только этого скрипта в обычном checkout Proxy 1.3.1 не заменяет установленную portable поставку 1.4.0. Runtime `6c6…` остаётся прежним; меняется только updater CLI.

Приёмка: работающий API/reader видит dataId выше и 12 checking contracts, откат возвращает 11, повторное обновление — 12; unchanged check не скачивает архив. Зелёный индикатор до завершения перезапуска сам по себе активацию не подтверждает. Draft остаётся Draft.

Тесткейсы: [условия и ссылки](../../experiments/current-contract-packages/PaymentMaskedNumber/reports/lab-and-data-update-r1-2026-10-21/README.md).
