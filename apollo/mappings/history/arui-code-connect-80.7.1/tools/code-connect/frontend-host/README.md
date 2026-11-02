# Source build / browser handoff · Apollo v4

Этот project-local host проверяет настоящий source API двух public subpath
`arui-private` 80.7.1, HEAD `c037d0c322ea9774a9c251400d76d41222819b87`:
`arui-private/button-group` и `arui-private/corporate-content`.
Он использует frozen NEXT-01 registry/lock. Новый registry и генератор не создаются.

## Результат от 05.10.2026

- Source closure: 38 оригинальных source/config файлов, без правок implementations.
- Полный TypeScript check/emit выбранных source entrypoints, ESM + CJS declarations: PASS.
- CJS `require.resolve` и ESM `import.meta.resolve` двух public imports: PASS.
- Полный React/TypeScript check host и исходного generated pilot: PASS.
- Vite production bundle с настоящими Core/React dependencies: PASS.
- Chrome 154.0.8037.95: девять observations, реальные callbacks, primary/secondary,
  disabled state и native width/overflow measurements. Исключений/console errors: 0.
- React Doctor 0.9.17: scope changed пропустил untracked host; scope full проверил
  три файла. После исправления guard числового ввода: 100/100, без findings.

В browser suite PASS означает исполнение проверок поддержанного source API
с явной шириной от host. Исходная композиция и overflow имеют наблюдаемые gaps.
Полная contract/UI приёмка и нормативный SOURCE_COMPILE остаются отдельными
этапами. Снимок NEXT-01 registry не переписывается вслед за pending NEXT-02.

## Distribution и зависимости

Core **50.26.1-alfasans** доступен из публичного npm; tarball integrity закреплён
в `package-lock.json`. Button 13.2.2-alfasans, PickerButton 13.0.22-alfasans,
Select 19.2.4-alfasans, Vars 11.2.1-alfasans, Themes 15.2.1-alfasans.
React/ReactDOM **19.2.7**, TypeScript **5.3.3**, Vite **5.4.21**, Playwright **1.61.1**.

Опубликованный `arui-private@80.7.1` из публичного npm не получен: E404.
Registry checkout `http://binary/artifactory/api/npm/npm/` недоступен при
проверке вне sandbox: ECONNRESET / socket hang up. Private dependency
`@alfa-bank/common-app-html@0.10.1` также возвращает E404 в публичном npm.
Подмена пакетов mocks/stubs не выполнялась.

Для доступной части из exact source closure создаётся **локальный selective
distribution** `.work/source/dist`, затем используется оригинальный
`tools/build/copy-package-json.mjs` для package exports. Он подключается
symlink `node_modules/arui-private`. Сборка ограничена двумя entrypoints;
наличие wildcard exports не подтверждает остальные компоненты.
Полная штатная сборка всей библиотеки и private/published distribution не подтверждены.

TypeScript использует исходные compiler settings с изменением module/output и
списка двух entrypoints. `src/module.d.ts` — оригинальное CSS typing из checkout.
CSS компилируется настоящим исходным PostCSS config, включая Core corp theme,
custom media и source skeleton mixins. Vite обрабатывает уже скомпилированный CSS
и CSS modules; импортов-алиасов или вымышленных библиотечных типов нет.

Есть исходный peer conflict: `bem-react-classname@1.3.2` требует React 16,
checkout использует React 19. Обычный npm install вернул ERESOLVE. Toolchain
подготовлен с **--legacy-peer-deps** при сохранении исходных версий;
это наблюдаемый compile/runtime profile, а не подтверждение совместимости
всех declared peer constraints. `package-lock.json` фиксирует отдельную npm
топологию host; полный root `yarn.lock`/resolutions не воспроизводился.
Пины обоих lock файлов и installed package manifests записаны в environment receipt.
DOMPurify/lodash и private dependencies всей библиотеки не нужны этой source
closure и не считаются проверенными по результату двух entrypoints.

Source PostCSS config даёт warning об удалённой feature `color-mod-function`
в postcss-preset-env. Vite сообщает chunk >500 kB. Warnings сохранены;
конфигурация checkout и реализации компонентов не правились.

## Воспроизведение

Из этого каталога на checkout с теми же code/mapping pins:

Prerequisite — существующий project-local tooling в родительском
`tools/code-connect`: reference consumer использует его TypeScript 5.3.3.
На чистом workspace сначала выполните `npm ci --ignore-scripts --no-audit
--no-fund --registry=https://registry.npmjs.org/` в родительском каталоге.
Его manifest/lock также закреплены в environment receipt; root dependencies
всего `arui-private` для selective profile не устанавливаются.

```sh
npm ci --legacy-peer-deps --ignore-scripts --no-audit --no-fund --registry=https://registry.npmjs.org/
npm run snapshot
npm run pins
npm run build:subpaths
npm run typecheck
npm run build
npm run test:browser
```

Browser suite использует установленный Chrome по умолчанию
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Для другого
существующего browser executable задаётся `APOLLO_PILOT_BROWSER_PATH`.
Browser/application в систему не устанавливается. Local HTTP server создаётся
на свободном порту 127.0.0.1 и закрывается после checks; порт/OS browser могут
требовать разрешённого локального execution environment.

На этой машине CDP подтвердил реальный **Alfa Interface Sans / AlfaInterfaceSans-Medium**
из установленного system font (`isCustomFont=false`). Host не включает файлы шрифта;
для совпадения измерений на другой машине нужна та же font source. Наличие CSS
font-family само по себе не доказывает используемый face.

`snapshot` проверяет code HEAD/version/hashes, точный registry lock, копирует
реальную TS/CSS closure и исходный `examples/PilotDesktop.generated.tsx`.
Проверка текущих contract archive pins записывается отдельно; stale/pending
контракт не обновляет registry и не разрешает нормативную генерацию.
`build:subpaths` проверяет копии по hashes, выполняет настоящий tsc emit,
PostCSS и source package-export script. `typecheck` проверяет всю host application
через реальные installed declarations, без paths aliases.

Обычный `npm ci` удаляет selective symlink, поэтому после него нужны snapshot/build.
`src/PilotDesktop.generated.tsx` — ignored копия исходного примера, не новый authoring source.
`.work`, node_modules, dist и artifacts исключены из Git; source/config/lock host
и итоговый машиночитаемый handoff находятся в области Code Connect.

## Что наблюдал браузер

| Сценарий | Результат |
| --- | --- |
| Исходный CorporateContent → ButtonGroup | Group width **0 px**, оба действия hidden; raw composition непригодна без layout/width profile |
| Native host wrapper width=100% | Два visible actions, высота 56, первый primary/второй secondary, gap 16; callbacks send/cancel исполняются |
| Disabled first action | disabled=true; pointer click не вызывает callback; второй cancel вызывает callback |
| Viewport 1600 | CorporateContent width 1348, row, padding **40/50/64/50** |
| Viewport 1024 | CorporateContent width 1024, padding **40/30/64/30** |
| Viewport 768 | CorporateContent width 768, padding **40/32/64/32** |
| Group width 700 | Четыре visible actions |
| Group width 320 и 220 | Первое visible, три остальных hidden |
| Group width 120 | Все четыре hidden, включая primary; виден PickerButton |
| Menu at width 220 | Порядок **Второе → Третье → Четвёртое**; выбор «Второе» не вызывает исходный onClick |

`body-width` wrapper — явный diagnostic host layout. Он не добавлен в generated
pilot/контракт/mapping и не принят как нормативный профиль. Generation должен
согласовать layout/width через свой системный порт или передать проблему владельцу
implementation. Не добавлять несуществующие `width`/`overflow` props в компоненты.

Default menu routing/order и скрытие primary не объявляются исправленными из-за
build PASS. Для управляемого overflow нужны согласованный mapper, picker events,
action identity и отдельные scenarios. Figma live/сопоставление screenshot с
нормативным источником в этой задаче не выполнялись.

## Передача frontend host Generation

- Source/config/peer/lock pins: `artifacts/environment-pins.json`.
- Source-copy provenance: `artifacts/source-snapshot.json`.
- Local ESM/CJS package + declarations: `.work/source/dist`; pins и import receipts:
  `artifacts/subpath-build.json`.
- Browser evidence: `artifacts/browser-receipt.json`, `desktop-1600.png`,
  `overflow-120.png`, `overflow-220-menu.png`.
- Public host scripts: package.json, snapshot.cjs, build-subpaths.cjs,
  tsconfig.json, vite.config.mjs, browser-check.cjs.
- Итоговый handoff: `../reports/NEXT-05-source-build.2026-10-05.json`.

Это внешний toolchain/proof для Apollo v4; он не встроен в Generation/Proxy.
Generation может использовать закреплённую selective distribution и environment
как порт сборки с сохранением provenance входного плана/кодового результата.
При другом generated input нужны собственные source hashes и проверки его сценариев;
проходящий static harness не подтверждает произвольный generated screen.

Для полной штатной/private distribution нужен доступный авторизованный источник
`arui-private@80.7.1` либо build exact полного checkout со всеми dependencies
из source package.json и source yarn.lock. В отдельной копии checkout:

```sh
corepack yarn install --immutable
BUILD_FORMAT=esm corepack yarn build
```

Эти полные команды здесь не запускались: required private package source недоступен.
Нужны реальный registry/tarballs (включая common-app-html 0.10.1), без передачи
секретов в чат и без подмены dependency types/runtime. SOURCE_COMPILE по контрактам,
layout/overflow parity и интеграция в Apollo v4 принимаются отдельно.
