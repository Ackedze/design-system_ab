# Следующий срез: маппинги для frontend лендингов

Исходная точка — существующие `code.json`, `code-connect.json` и overrides
в папках компонентов. Новую параллельную систему маппинга не создаём.

1. Проверить API и distribution выбранной версии SDK для CorporateContent,
   PromoMainBlock, BenefitCard, BenefitBlock, BackgroundPlate, FAQ и нужных Core
   зависимостей. Исторические proofs переиспользовать в их исходной границе.
2. Для имеющихся `partial` BenefitsBlock/PromoCard/PromoTableView разобрать
   оставшиеся свойства. Проверить автоматические совпадения: например,
   Figma Image placement не является ReactNode `image`.
3. Дополнить конкретные content/slots/collection/action bindings. Одних таблиц
   variant → prop недостаточно: title/subtitle, image, items, callbacks и Body
   требуют собственного подтверждения. `reactOnly` не означает, что всё это
   можно заполнить произвольно; фильтр сборщика исключает часть технических props.
4. Принять рецепты Benefits, mobile bottom actions, footer и, при необходимости,
   BentoGrid. У Figma-only пресетов нет одноимённых runtime exports.
5. После component bindings и рецептов добавить frontend adapter к единому
   каноническому навыку `apollo/skills/ab-generate-custom-landing`.
6. Проверить пилот, типы, браузер, D/M и compact, точечную правку; добавить
   поведенческие и отрицательные evals. Сохранить происхождение всех выводов.

Сбор файлов не является выполнением этих шагов. Norms, контракты, actual SDK,
Draft/Ready, историческая приёмка и подключение runtime остаются разными evidence.
