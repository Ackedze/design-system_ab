# Подготовка самостоятельного контракта BackgroundPlate

Актуализировано: 15.10.2026. Основание — уточнение владельца: подготовка
BackgroundPlate является отдельным этапом, предшествующим подключению зависимости
в BenefitCard. Документ фиксирует работу; нормы и готовность пакетов не меняет.

## Порядок работы

1. Завершить текущий исполняемый scope IconView и его проверку.
2. Подготовить и проверить самостоятельный контракт BackgroundPlate. Анализ
   источников можно вести, пока внедрение Reader IconView ожидает общего окна.
3. Подключить принятые Link, IconView и BackgroundPlate в новую ревизию
   BenefitCard с точными revision/hash и полным dependency closure.
4. Проверить настроенные дочерние экземпляры в BenefitCard и закрыть оставшиеся
   родительские ограничения. Отложенное библиотечное обновление Link учитывается
   отдельно в задаче Athena CLI.

## Входы и начальное состояние

- Нормативный источник: `shared/design-system_ab/JSONS/web/components/web-corp/BackgroundPlate/rules.json`.
- API, identity и composition: `contract.generated.json`, `contract.overrides.json`,
  `composition-contract.json`, `agent-context.json` из той же папки.
- Raw-каталог: `shared/design-system_ab/JSONS/web/components/web-corp/Web _ Corp Components -- BackgroundPlate.json`.
- Hub: `ds-ai-hub/products/ab/components/background-plate/` — instructions,
  Figma adapter, keys и cookbook.
- Исторический эксперимент: `shared/design-system_ab/experiments/web-corp/BackgroundPlate/`.
  Его compiled и прежняя coverage — материал для сверки, без переноса статуса
  исполнимости или приёмки в новый контракт.
- Родительские требования: `BenefitCard/authoring/context/dependency-requirements.json`.
  Старый план `BenefitCard/reports/dependency-contract-plan.r4.md` сохраняется.

## Самостоятельная подготовка

1. Сверить точные текущие источники и pins. Разделить шесть публичных D/M-корней:
   BackgroundPlateSlot, legacy BackgroundPlate и Promo BackgroundPlate.
   Сопоставить фактически встроенное promo-семейство BenefitCard; ключи и привязки
   между desktop и mobile-web не переносить автоматически.
2. Составить coverage-map всех исходных норм. Отделить собственные ограничения
   от контекста поверхности, адаптивных рецептов и интерактивности. Рекомендации
   по padding/sizing не превращать в жёсткие запреты.
3. Создать Draft manual: public API и домены, допустимые overrides, состав,
   внутренние части, token bindings, независимые configured baselines и
   применимость по Type/уровню/платформе. Для разных семейств явно определить,
   достаточно ли отдельных representations или нужны отдельные пакеты.
4. Проверить Type-зависимые fill/stroke, radius/opacity/blend mode, effects,
   Skeleton и ограничения уровней по фактическим нормам и текущим возможностям
   core. Пробелы исполнения сохранять явно; исторический executable не равен
   проверке установленного Editor.
5. Переиспользовать подтверждённые механизмы тестирования. Новые ручные кейсы
   назначать только для новых native bindings и отличающихся условий; сначала
   проверить доступность мутации в интерфейсе. Формат: прямая ссылка на экземпляр,
   параметры, конкретный ожидаемый RuleID. Отдельно учесть UNKNOWN и разрешённую
   смену Type с корректным эталоном нового состояния.
6. Выполнить compile/import/export/reopen и релевантную native-проверку, сохранить
   eval и закрытый handoff. Согласованно синхронизировать Правила/Леджер/Predicate,
   затем сохранить ZIP и manifests в `current-contract-packages`.

## Подключение к BenefitCard

Родитель разрешает менять только Type BackgroundPlate. Остальные собственные
настройки дочернего компонента регулируются его контрактом с учётом активных
ограничений хоста. Проверить родительские `background-plate-style-overrides`,
`position`, `background-plate-colors-use-tokens`, разрешённый Type и configured
baseline дочернего occurrence. Недостающие identity/closure/baseline дают
неполноту проверки, а не PASS.

Подготовка контракта не добавляет BackgroundPlate в generation-пилот. Общие
source/build/core/registry записи выполняются только в согласованном окне.
