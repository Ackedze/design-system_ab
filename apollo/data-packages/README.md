# Данные Apollo для ревью

Каталоги с именем `dataId` содержат неизменяемый переносимый snapshot существующего
reader Proxy: `manifest.json`, контракты с фактами и Figma mappings. Это данные,
а не исходники runtime. Не редактируйте файлы внутри snapshot вручную.

Текущий кандидат: `174a165078babe913d85b58169673dc3dcac3f6d647d23da86c156f1c5707f09`.
Профиль `checking-ask-figma-mcp`: проверка, «Спросить» и Figma MCP; frontend
отключён до отдельного подключения собственного SDK. `Ready=false`.

Для чтения укажите полный путь к каталогу snapshot в `APOLLO_DATA_ROOT`;
`APOLLO_PROJECT_ROOT` должен указывать на совместимую сборку Apollo.
Для сборки поставки используйте существующий `scripts/build-data-release.js`
из Proxy с отдельно принятым knowledge root из приватного ds-ai-hub.
Знания хаба, личные настройки, авторизация, история, SDK и исполняемые bundles
в этот каталог не входят. Канал обновлений и release assets этим коммитом
не публикуются; установленный локальный Proxy не переключается.

Исходные manual и факты перечислены в `JSONS/indexes/component-contracts.index.json`.
Snapshot сохраняет свои исходные hashes/parentDataId: Git-коммит не меняет
историческое происхождение и не повышает готовность контрактов.
