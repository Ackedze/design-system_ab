# Исправление данных и чтения native b7 · 30.10.2026

Статус: PARTIAL_LOCAL_VERIFIED. TitleView r3, CorporateSystemMessage r2 и FilterCompanySelect r2 исправлены; нормы и исходные Athena-файлы сохранены.

На сохранённых снимках 22 корневых кейса дают 9/9 ожидаемых нарушений. Закрыто 65 UNKNOWN; остаются 50 у вложенного Select и 568 у IconView. Это открытые технические ограничения, не неприменимые правила. Отдельный свежий Figma-прогон не выполнялся.

TitleView использует уникальную роль subtitle; CorporateSystemMessage — уникальную роль Title, эталон текста состояния из независимого host reference и явные absence bindings Small. FilterCompanySelect содержит производную проекцию одного source variant по двум одинаковым независимым reference; исходные три SLOT wrappers отсутствуют в этом опубликованном эталоне. Остальные variants, нормы SLOT и guard не удалялись. Multi удерживает точные прежние shared facts в history; его manual, ZIP и compiled projection не менялись.

Пакет данных **1.4.4-data.20261030.3** подготовлен локально:51 контракт, обновлены3, неизменны48. Protected consumer PASS. Архив: [apollo-data-1.4.4-data.20261030.3.tgz](prepared/1.4.4-data.20261030.3/apollo-data-1.4.4-data.20261030.3.tgz). Публикации и установки нет; текущий канал сохранён.

Apollo: переиспользование hash в пределах запуска и максимум6 независимых pristine source reads. Validate:1413 PASS,0 FAIL,1 прежний skip. Все287 build inputs,94 защищённых source pins и31 файл packaged runtime d058 сверены. Новое native время не измерялось. Build ID: ca18f47d1b0886dbac24f2afebec494ba23dd4f30364ffd42301ef985f14ee7f.

Результат — [eval.json](eval.json); точные canonical выходы — [APPLIED.json](APPLIED.json). Полный пользовательский отчёт, replay-данные, сборочные логи и клеточные backups остаются локальными и не включаются в Git.
