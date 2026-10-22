# PaymentMaskedNumber — mapping

Рабочий Figma mapping: `figma-mapping.json`. Он находится рядом с `../contract.manual.json`, rules и variant facts компонента.

Контракт r4, public representation universal для desktop/mobile-web. Root key `bd25bbd83bfc28176b42284659f21c8a7cd8e97b`, standalone COMPONENT.

Порты: addonVisible, maskNumber, major, minor, addonPreset. Маска — строковый VARIANT; custom Major доступен только в unmasked ветке. SwapMe не допускается как финальный Addon.

Mapping остаётся Draft. Frontend mapping в пакет не включается. Native generation и Ready этой записью не подтверждаются.

Этот файл — редактируемый источник для сборки данных Proxy; `apollo/data-packages/<dataId>/contracts.tgz` — immutable производный результат. Исторический candidate и его проверки сохранены в `experiments/current-contract-packages/PaymentMaskedNumber/reports/mapping-r4-2026-10-22`.
