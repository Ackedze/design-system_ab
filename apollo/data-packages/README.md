# Снимок данных для проверки PaymentMaskedNumber r1

Текущий подготовленный snapshot: [contracts.tgz](./470c0724eedb5652850331c0783ca89c63c84ddb7c4b505a4a9b834f7340b883/contracts.tgz), dataId `470c0724eedb5652850331c0783ca89c63c84ddb7c4b505a4a9b834f7340b883`. SHA-256 закреплён рядом в `SHA256SUMS`. Один архив сохраняет точные исходные bytes без копирования 128 тысяч строк исторических JSON в diff.

- 12 контрактов: прежние 11 entries и generation pins сохранены точно; добавлен только PaymentMaskedNumber r1.
- Режим нового контракта — `authoring-preview`, Draft. Checking доступен; Ready и публикация не заявлены.
- Runtime `6c6bbc1c22f671875a206b14dc3abeb80ff8f863276151c4f565500e8d9b77bb` сохраняется. Код, SDK, личная конфигурация и история сюда не входят.
- Профиль `checking-ask-figma-mcp`; frontend отключён как в исходном snapshot.
- Формат номера Major/Minor пока не исполняется; это согласованный пробел Draft.

## Обновление через Proxy

Один push этой папки НЕ активирует данные. Прежний `apollo/knowledge/channels/stable.json` имеет schema `apollo.knowledge-channel.v1` и не заменяется.

1. Запушить main checkout с Draft и snapshot.
2. Проверить SHA-256, распаковать `contracts.tgz` в новую локальную папку. В корне окажется `manifest.json` с указанным dataId. Штатным `build-data-release.js` установленного Proxy собрать полный release из этой папки, принятого knowledge и неизменного runtime. Runtime не пересобирать.
3. Полный release содержит knowledge/Hub; хранить его на согласованном **приватном** HTTPS-хосте, не добавлять в публичный Git-репозиторий.
4. Разместить неизменяемый `apollo-data-<releaseId>.tgz`, затем modern descriptor `apollo.proxy-data-channel.v1` со ссылкой и integrity. Сначала архив, затем descriptor.
5. Указать URL descriptor через `portable:configure -- --data-url HTTPS_URL` либо `APOLLO_DATA_DESCRIPTOR_URL` в настройках установленного Proxy.
6. В миниаппе выполнить «Обновить знания». Проверить dataId `470c0724eedb5652850331c0783ca89c63c84ddb7c4b505a4a9b834f7340b883`, 12 checking contracts и PaymentMaskedNumber r1, после чего запустить лабораторные кейсы.

Приватный HTTPS-адрес пока не выбран. Локальный полный release подготовлен отдельно, не активирован; descriptor с `example.invalid` — только шаблон и не является опубликованным каналом. Настройки работающего Proxy не менялись. При несовпадении runtimeId обновление должно остановиться, не обходить guard.

Тесткейсы: [условия и ссылки](../../experiments/current-contract-packages/PaymentMaskedNumber/reports/lab-and-data-update-r1-2026-10-21/README.md).
