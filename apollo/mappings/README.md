# Маппинг компонентов: рабочая область

Продолжаем работу с маппингами в `design-system_ab`. Общий вход —
[COMPONENTS.md](COMPONENTS.md), машиночитаемый каталог — [catalog.json](catalog.json).

Сбор выполнен 02.11.2026. В каталоге 185 сущностей: данные 151 сущности лежат
в существующих папках компонентов, ещё 34 Core API без design-owner — в `api-only/`.
Сохранены 157 описаний React API, 123 таблицы Code Connect, 7 файлов ручных
уточнений и 31 непринятый draft. Для Figma-only сущностей сохранены входы,
без добавления вымышленных React API.

## Где работать

В папке компонента:

```text
mapping/frontend/
  code.json                           # API из исходного снимка
  code-connect.json                   # собранная таблица соответствий
  code-connect.overrides.json          # существующие ручные уточнения, если есть
  code-connect.overrides.draft.json    # существующий непринятый draft, если есть
  inputs/
    figma.json
    semantics.json
    anatomy.json
    meta.json
```

У конкретной сущности могут присутствовать не все файлы. `inputs` — точные
снимки входов первоначального сборщика; это provenance, а не новая нормативная
версия контрактов. Актуальные contracts/manuals и уже существующие Figma mappings
даны ссылками в каталоге. Прежние frontend evidence остаются в своих `history`.

Новые правки делаем здесь, в папках компонентов. `code.json` обновляем по
проверенному SDK; ручные соответствия — через overrides. Draft не участвует
в сборке, пока не принят. Изменение generated таблицы без изменения её входов
будет обнаружено повторной сборкой. При принятом обновлении отдельно обновляем
текущие pins каталога; происхождение первоначальных копий (`origin`) сохраняем.
Исходные материалы в других репозиториях оставлены неизменными для старых consumers.

## Что сохранено отдельно

- `tooling/hub/` — существующий сборщик Code Connect и его helper, без переписывания.
- `history/hub-import-2026-11-02/` — исходные taxonomy, source lock, индекс,
  документация и extraction adapters для provenance. Их прежние относительные
  пути относятся к исходному Hub; это архив, а не новая установка Hub.
- `history/arui-code-connect-80.7.1/` — три `.figma.ts`, registry, schema,
  consumer, tests, host/profile и handoff records прежнего пилота. Его пути,
  версии и seals сохранены как были. Не запускать старые scripts как текущий
  frontend pipeline из новой папки: они привязаны к исходному repo/toolchain.

Реализация компонентов `arui-private/src`, `node_modules`, `.work`, distributions,
скриншоты и большие логи не копировались. Их отсутствие не компенсировано mocks.

## Проверка сохранённого набора

Из корня `design-system_ab`:

```sh
node apollo/mappings/validate.mjs
node --test apollo/mappings/validate.test.mjs
```

Проверка сверяет pins/владельцев и воспроизводит все 123 таблицы существующим
сборщиком. Для неё не нужны checkout Hub, arui-private или npm install.
Она не проверяет текущую distribution, browser, runtime adoption или публикацию Figma.

`complete` в таблице означает учёт её свойств, а не готовность всего frontend.
Снимок arui API относится к 80.10.0, старый пилот — к 80.7.1; локальная библиотека
на момент сбора объявляла 81.1.0. Прежние Draft/Ready и restricted статусы сохранены;
этот каталог не меняет допуски Apollo/Proxy.

Следующий срез — [лендинги](LANDING-NEXT.md). Изменения навыка, подключение Proxy,
публикация и обновление runtime не входят в перенос файлов.
