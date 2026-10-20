# BackgroundPlate r6 · Figma и Front

Подключён к текущему Apollo для генерации Draft. Figma: desktop, три семейства legacy/promo/slot, 9 опубликованных вариантов. Front: Desktop и Mobile, 6 bindings к реальным публичным BackgroundPlate экспортам. BackgroundPlateView в коде — enum, не React-компонент.

Slot Figma сопоставлен с native `Slot#136328:0`; пустое содержимое и порядок дочерних узлов сохраняются. Для legacy/promo доступны только подтверждённые root Position: вложенные Type/Skeleton/BackgroundColor не превращены в writable native props. Для Slot доступны Type/Skeleton/Slot. Не объявлены несуществующие комбинации Secondary+Skeleton=True.

Полный r6 manual и все 31 правило сохранены без изменений. В контракте пока нет code representation: frontend использует явно обозначенные внешние Draft bindings к проверенному публичному API. Mobile Figma остаётся кандидатом до поддержки платформы native actor. Все варианты не означают полного покрытия контрактных правил или Ready.

Проверено: актуальные Figma definitions и существующие пустые native SLOT; полная проверка Apollo — 1095 тестов; 5 настроенных host-тестов без пропусков; реальные frontend TypeScript/Vite/Chrome и 20 browser cases при 1600/390 px; планировщик, SDK и текущий UI result envelope для обоих targets. Модель/генерацию макета здесь не запускали.

Proxy обновлён. Реальный клиент «Данные Apollo» получает 9 строк; BackgroundPlate r6 подключён к Figma/Front. Набор проверки пока не включает этот компонент. Режим Figma — только генерация; автоудаление выключено. История сохранена. Для теста переоткрой development-плагин Apollo.

Пример: «Собери белый экран 1600×900. Добавь BackgroundPlate Slot Primary без Skeleton. Внутри — две кнопки “Купить” и “Заморозить”.»
