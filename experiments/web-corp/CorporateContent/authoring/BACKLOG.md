# CorporateContent — дальнейшие этапы

## Принято · 01.10.2026

- [x] Ручной r11: 6 desktop правил / 17 RuleIR, принят владельцем.
- [x] Manual извлечён из ZIP без изменений; generated facts read-only.
- [x] Общий compiler воспроизводит compiled ZIP; пять отчётов дают exact replay.
- [x] Body-матрица принята owner-attested; новые JSON не заявляются.
- [x] Crosswalk без параллельных RuleID и переноса паттернов в компонент.
- [x] Code Connect template Body → children; CLI parse, typecheck, 5 tests.

## Code Connect и тестовая сборка

- [ ] P0: опубликовать полный parserless template. После отключения владельцем
  повтор connector получил полный template и вернул success, но создал только
  source/name pointer: два readback hasTemplate=false, imports=[].
  Доказательства: reports/code-connect-retry.2026-10-01.json.
  Не принимать fallback. Проверить реальный template, named import и Body
  при чтении из Figma. CLI --force — допустимая альтернатива только при
  настроенной авторизации; не передавать секреты через чат.
- [ ] После полного подключения: тест сборки фронта по промпту с Body content.
- [ ] Отдельный parity profile: React row layout, responsive padding,
  theme/background surface. Не выдумывать props и не менять CSS автоматически.

## Отдельные области, не блокеры принятого desktop subset

- [ ] Hub-проекция из manual по шаблонам Hub; устранить sizing конфликт.
- [ ] Оставшиеся legacy owners: Section и page patterns отдельно.
- [ ] Mobile representation, расширенный generation profile и purpose.
- [ ] Решение владельца о новых checks padding-token binding, placeholder,
  clickability, layout самого Body. Не добавлять их автоматически.
- [ ] Figma API alias IDs для обязательного полного capture.
