# Slider r3 — привязки вложенных частей

- Нормы не менялись: 3 исходных правила и 31 semantic IR. Добавлены 35 целей с 124 точными variant bindings на всех 24 корневых вариантах. Прежний Pips target и все variant facts сохранены.
- В retained owner report закрыта атрибуция 30 Pointer/Dots/Dot. Результаты и traces 660 прежних baseline-сравнений неизменны; revision и evaluationId закономерно новые.
- Все варианты прошли synthetic correspondence replay по фактическим read-only source addresses. Это не свежий capture экземпляров Apollo. Ручная приёмка остаётся за владельцем после отдельной поставки данных.
- Первый source read не включал скрытые Pips-слои: source guard корректно остановил проверку. Повторное чтение с skipInvisibleInstanceChildren=false даёт полное совпадение каталогов. Неполный synthetic sourceIdentity и сравнение revision-dependent IDs также исправлены только в проверочном helper. Движок и guards не менялись.
- Проверены source loader реального main, отказ подменённого projection hash, ZIP/full facts reopen, foreign/unknown identity, неполная reference, усечённая topology, SLOT и raw @catalog.
- Для воспроизведения: prepare.py → существующий check_contract.cjs с input-inventory.json и новым каталогом вывода → check.cjs с путём к этому technical output. apply.cjs — одноразовая миграция, повторно не запускать. Предыдущий r2 ZIP закреплён в history/r2.json и оставлен на прежнем пути.
- Индексы содержат 44 пакета; остальные 43 записи сохранены. Реестр Predicate/Леджер обновлён и перечитан. Правила и crosswalk не менялись. Нет установки, публикации, push и Ready.
