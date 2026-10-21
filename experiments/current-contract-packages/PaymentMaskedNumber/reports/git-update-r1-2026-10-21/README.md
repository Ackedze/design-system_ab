# PaymentMaskedNumber: обновление из Git

Полный цикл установленного ApolloProxyControl: push → индикатор обновления → кнопка обновления → живой API с 12 контрактами → откат к 11 → повторное обновление к 12. PaymentMaskedNumber разрешается по Figma key после обновления и отсутствует после отката.

Источник — `apollo/data-packages/current.json` и объявленный `contracts.tgz` в этом Git-репозитории. Commit разрешается через Git HTTPS, файлы скачиваются по точному commit. Неизменный dataId не скачивает архив. Отдельного хостинга, publisher или токена для публичного Git нет.

Обновлён один установленный updater CLI. Приложение, плагин и engine не пересобирались. Runtime6c6, локальные knowledge, 938 проверенных файлов истории/конфигурации и прежние env сохранены точно.

[EVAL.json](./EVAL.json) содержит этапы, pins и CI. Это приёмка доставки данных. PaymentMaskedNumber r1 остаётся Draft/authoring-preview; исполнение формата номера и новая native-приёмка правил здесь не заявляются.
