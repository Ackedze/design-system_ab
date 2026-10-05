# Размещение общего ядра и адаптеров генерации

Решение от 5 октября 2026 года уточнено по запросу владельца: объединить генерацию с Apollo V4 в существующем `projects/Apollo-v3`. Реализация G02 уже добавлена туда. Исходные контракты остаются в `shared/design-system_ab/experiments/current-contract-packages`. Сценарий: [GENERATION-PILOT.md](GENERATION-PILOT.md). Реестр: [GENERATION-ACTIONS.md](GENERATION-ACTIONS.md).

## Структура

```text
/Users/alexkukhta/Desktop/workplace/projects/Apollo-v3/
  packages/
    component-contract-core/   существующий общий core Editor/Apollo
    generation-core/
      src/contracts/           реализованный G02 ZIP loader и lock
      src/model/               G03 ScreenSpec и CompositionPlan
      src/planner/             P01/P02 паттерны и prompt planning
      src/orchestration/       G05/I01 интерфейсы и результаты
    adapter-figma/              граница будущих F01–F03
    adapter-frontend/           граница будущих W01–W03
  apps/
    apollo-v4/                 существующий Figma runtime, audit/capture/UI
      scripts/load-generation-packages.js   локальный вход G02
    generation-cli/            будущая оркестрация target=figma/frontend/both
    pilot-web/                 будущий React/TypeScript preview
  generation-runs/             игнорируемые производные run artifacts
```

Созданы generation-core, локальная команда G02 и README границ обоих адаптеров. Model/planner/orchestration, generation-cli и pilot-web — будущие модули; их исполнение ещё не реализовано. Сохраняется существующий подход Apollo: корневые зависимости и `npm --prefix` команды; отдельный репозиторий или перевод всего проекта на npm workspaces для G02 не требуется.

## Ответственность

`generation-core` задаёт одну спецификацию и один CompositionPlan. Он не требует Figma, DOM или React для общих моделей. Локальный ZIP loader использует Node crypto и получает существующие `sourceFromFiles`/`loadAuthoringSource` V4 через явный порт с закреплённой build identity. Core не импортирует приложение плагина. Существующий V4 entry point соединяет их.

`adapter-figma` переводит принятый общий план в import/configure/native SLOT операции. Apollo V4 предоставляет Plugin API transport и существующий capture/audit. Плагин не принимает бизнес-решение о композиции повторно.

`adapter-frontend` выпускает React/TypeScript по тому же плану через подтверждённые library APIs и собирает source/DOM/browser facts. Он работает вне Figma sandbox. События и состояния принадлежат спецификации; hooks и DOM — адаптеру.

Нормы, compiler и evaluator остаются общими с Editor. Генератор не объявляет новый набор правил по именам компонентов. Успешная компиляция не доказывает generation readiness, frontend parity или полноту Editor scenario coverage.

## Подключения

| Источник | Использование | Подтверждение |
| --- | --- | --- |
| `current-contract-packages` | ZIP inventory и lock одного run | G02 читает фактические архивы, SHA256, revision и closure |
| `Apollo-v3/packages/component-contract-core` | Общий compiler/import/ZIP/runtime | Package 0.1.8; G02 использует свежую сборку и SHA256 runtime/build-inputs |
| `Apollo-v3/apps/apollo-v4` | Authoring source и compatibility profile; затем Figma capture | Runtime profile 0.4.0; существующий audit consumer переиспользуется |
| `ComponentContractEditor` | Авторинг норм и общей модели | Локальный Editor 0.2.89; его приватный dist не является runtime зависимостью генератора |
| `arui-private` | Frontend CorporateContent | Исходники 80.7.1; children подтверждён, W01 проверяет интеграцию |
| `@alfalab/core-components` | Frontend Button/Amount/Spinner/Typography | Declared 50.26.1-alfasans; установленный API ещё требует W01 |

В локальном `arui-private/node_modules` Core при G01 не найден. Declared dependency не считается установленной библиотекой. Есть локальный Code Connect пример CorporateContent → children, который служит входом W01, а не доказательством публикации или полной parity.

Существующий V4 `release:pilot` читает иной набор authoring источников. Команда G02 читает именно текущие ZIP и создаёт отдельный generation lock. Она пока не заменяет release, Proxy registry или панель аудита: подключение там требует своего release/consumer gate.

## Направление зависимостей

```text
Apollo V4 local entry → generation-core + existing V4 source/runtime ports
future orchestrator → generation-core + adapter-figma + adapter-frontend
adapter-figma → общие типы generation-core + shared capture interfaces
adapter-frontend → общие типы generation-core + проверенные library APIs
pilot-web → сгенерированный код + DS библиотеки
```

Адаптеры не импортируют друг друга. Normative ZIP не копируются в Apollo source или fixtures; тестовые пакеты синтетические. Compiled, GenerationView и run artifacts производны. Lock содержит фактические hashes и provenance, а не полные каталоги.

## Совместимость и дальнейшие действия

G02 не изменяет shared core/Editor или нормы DS. Расширение compiler/capture, влияющее на потребителей, учитывается в связанных бэклогах Editor и Apollo по их AGENTS.md. Live Figma, Proxy/published release и открытые PARITY задачи имеют отдельную приёмку.

Следующий action point — G03: схемы ScreenSpec/CompositionPlan и ручной план пилота. После G04/G05 адаптеры развиваются в закреплённых границах Apollo.
