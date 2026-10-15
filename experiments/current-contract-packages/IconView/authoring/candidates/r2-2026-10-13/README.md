# IconView r2 — Draft

Решение владельца: типографика может меняться через библиотечный Text Style Figma. Сравнение fontName/fontSize/lineHeight/letterSpacing с исходным вариантом убрано из активных правил. Старый text-style-baseline сохранён deprecated; новые text-library-style и text-paint-baseline имеют отдельные RuleID.

35 manual rules,34active,1deprecated,54IR,7context-only. Каталог Web _ Typography содержит56TextStyles, включая исходный18–24Bold. Current core0.1.17/Editor0.2.104 уже поддерживает styleBinding; общий код и пилот не изменены.

Core schema/import/ZIP/reopen и6controlled replay checks PASS. Это не native приёмка r2. Binding check проверяет принадлежность Style key закреплённому каталогу по каждому текстовому сегменту; отдельная верификация всех rendered metrics против definitions Text Style в этот scope не включена.

Новые ручные проверки — next-cases.json. Предыдущие r1 receipts/seals сохранены. Принятые r1 проверки цвета могут быть переиспользованы в прежнем scope; это не fresh r2 native PASS. Working manifest не переключён на candidate; parent BenefitCard integration остаётся pending.

Hub proposal сохранён отдельно; canonical Hub не изменён. Drift записан в Google Леджер, Predicate=Draft. Другие незакрытые нормы r1 crosswalk остаются применимыми, кроме явного typography replacement.
