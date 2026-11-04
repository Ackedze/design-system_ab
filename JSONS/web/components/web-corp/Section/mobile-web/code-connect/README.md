# Section — Mobile Web

Используется общий responsive [Section.figma.ts](../../code-connect/Section.figma.ts)
с default import `Section` из `arui-private/section`. Отдельного public
SectionMobile и подтверждённого `[M] Section` set нет; второй шаблон не создаётся.

На узких экранах source CSS даёт одну колонку. `sidebarOrder.mobile` повторяет
порядок Position для stacked-композиции: false → Isle перед Content, true → после.
Это политика общей responsive-сборки; отдельная native mobile Figma-проверка
не заявлена. Content → children, Isle → sidebar, реальное содержимое задаёт приложение.

[Общий отчёт, проверки и ограничения](../../code-connect/README.md).
