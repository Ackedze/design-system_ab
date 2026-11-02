# Draft r1: компоненты прогресса

Подготовлены BarItem, SteppedProgressBar, CircularProgressBar и HatchingProgressBar: 9 самостоятельных правил, 98 исполняемых ограничений, 17 публичных вариантов. Компиляция, ZIP/reopen и загрузка штатным защищённым consumer проверены. Core, Apollo и Proxy не пересобирались.

Файлы manual, native-api, variant-evidence, ZIP и карты покрытия находятся в папках компонентов под JSONS/web/components/web-core/progressbars. BarItem находится в SteppedProgressBar/parts/BarItem. План проверок с RuleID и RESET: reports/draft-r1-2026-11-02/test-cases.json внутри каждой папки.

Steps в SteppedProgressBar — открытый Slot для любого объекта. Фиксированные число шагов и обязательность BarItem не вводились. Default/Inverted разделены. CircularProgressBar использует активное семейство с восемью Size; устаревшее семейство не опубликовано как новое.

Статус всех четырёх — Draft. Ещё нужны независимые native references и полный граф тестовой области. У CircularProgressBar отдельно открыты Content/Circle и их типографика; компиляция не подтверждает их проверку. Тесткейсы подготовлены в файлах, но на холсте не размещены и вручную не запускались.

Локальный пакет данных: **1.4.12-data.20261102.1**. Включает 65 контрактов: прежний 61 и четыре новых. Генерация и 1409 файлов знаний/навыков сохранены побайтно относительно 1.4.11-data.20261102.2. ZIP, manual, compiled cache и индекс согласованы. Пакет не опубликован и не установлен в рабочий Proxy.

Архив: [apollo-data-1.4.12-data.20261102.1.tgz](../../../../apollo/data-packages/e61ead93cec08ee5419f0791ff81196f57c05606da97711695d1aed57c670e92/apollo-data-1.4.12-data.20261102.1.tgz). Подробности и точные хеши: [STATUS.json](STATUS.json), [CACHE-PARITY.json](CACHE-PARITY.json), [CONSUMER.json](CONSUMER.json).
