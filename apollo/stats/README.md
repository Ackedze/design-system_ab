# Apollo Stats

Каталог статистики проверок Apollo.

```text
apollo/stats/
  User-Name/
    06-06-2026/
      User-Name_06-06-2026_12-13-42.json
      User-Name_06-06-2026_12-13-42_agent.json
```

Одна успешная проверка создаёт два файла:

- полный отчёт Apollo: `<User-Name>_dd-mm-yyyy_hh-mm-ss.json`;
- компактный агентский отчёт: `<User-Name>_dd-mm-yyyy_hh-mm-ss_agent.json`.

Отчёт содержит устаревшие компоненты и стили, кастомные стили, обновления, кастомизации, локальные и detached-компоненты, пресеты, технические и актуальные компоненты, ошибки канала и темизации.

`currentComponents` используется как инвентаризация и не входит в `problemOccurrenceCount`.

Production-отчёты автоматически публикует Supabase Edge Function. Локальный `services/apollo-stats-collector` используется только для изолированной отладки и сохраняет файлы в той же структуре.

Корневой каталог сохранения:

```text
/Users/alexkukhta/Desktop/DS-AB-Plugin/shared/design-system_ab/apollo/stats
```
