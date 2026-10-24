# Контрактные данные Apollo

Актуальный подготовленный снимок выбирает [current.json](current.json).
В нём **20 контрактов для проверки**: прежние 16 сохранены, добавлены
**StatusBadge r1, Checkbox r1, Radio r1 и IconButton r1** в режиме Draft
(`authoring-preview`). Рабочая папка — `shared/design-system_ab`, ветка `main`.

DataId: `ccead9500c50bf36fbd1624a326ca9030094c6ee526dbd5bc3a6d70b3850c437`.
Runtime `28075c51948766147443475a6c181ca396a7a0fbe474a820e80b37a7abe45b0d` остаётся прежним.
[Архив и размер/SHA](current.json), [отчёт поставки](ccead9500c50bf36fbd1624a326ca9030094c6ee526dbd5bc3a6d70b3850c437/delivery.json).

Штатный importer собрал только четыре новых ZIP в пустом временном каталоге.
Они добавлены к прежнему снимку без повторного переписывания исторического
generation provenance. Сохранены все 16 checking-записей, их catalog,
generation payloads и skills. Полные readers, повторное открытие архива
и штатная portable-проекция прошли. Код Proxy, плагина и Core не менялся.

Обновление штатными `updateFromGit` / builder / installer проверено в отдельном
временном хранилище с локальными ответами Git: 16 → 20, повтор — без скачивания
снимка. Это не проверка опубликованного remote: push и обновление работающего
Proxy выполняет владелец. Новые контракты остаются Draft до проверки Figma.

После push в `main`: **Проверить обновления знаний → Обновить** в миниаппе Proxy.
Ожидаемый результат — четыре новых контракта в каталоге проверки, все r1 Draft.
Прежние исторические snapshots и материалы приёмки ниже сохранены как история;
их версии и числа контрактов не описывают текущий `current.json`.

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
