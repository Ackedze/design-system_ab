# Pattern: FileUpload

- documentType: pattern
- patternType: component
- component: FileUpload
- patternId: ptrn:components.file-upload
- patternKey: components.file-upload
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Editorial / Design System
- status: active
- updatedAt: 2026-07-16
- sourceType: component-guideline
- tags: file-upload, upload, attach, dropzone, documents, files, errors, adaptive, web-corp
- figmaLink: none
- sections: 10

## Section 1: Определение

`FileUpload` — компонент для прикрепления одного или нескольких файлов в форме, контентном блоке, модальном окне или отдельном Mobile Web-сценарии.

Компонент может показывать заголовок, описание задачи, список загруженных файлов, кнопку прикрепления, ограничения по форматам и размеру, а также ошибочные состояния загрузки. Видимость частей управляется только штатными свойствами компонента.

На desktop Dropzone работает через системный выбор файла и drag-and-drop и имеет подложку. На Mobile Web используется только системный выбор файла, отдельной подложки нет.

## Section 2: Когда использовать

Используйте `FileUpload`, когда нужно:

- прикрепить документ к конкретному полю или разделу формы;
- загрузить несколько документов для отправки в банк;
- добавить файл к информационному блоку или разделу страницы;
- организовать массовую загрузку в модальном окне;
- показать ограничения по размеру одного файла, общему объёму или количеству файлов;
- обработать ошибки формата, размера и технической загрузки;
- адаптировать загрузку файлов под Mobile Web.

## Section 3: Когда не использовать

Не используйте `FileUpload`, если сценарий сводится только к ссылке на скачивание или просмотру уже существующего файла без возможности прикрепить новый.

Не используйте старый формат загрузчика для паспорта и похожих документов, где нужно загрузить несколько страниц. В таких сценариях используйте отдельные блоки `FileUpload` для нужных страниц документа.

Не заменяйте встроенные иконки действий в файлах текстовыми кнопками. Если действие требует пояснения, используйте tooltip.

## Section 4: Принципы

1. Ограничения должны быть видимы до загрузки файла.
2. Текст кнопки прикрепления перечисляет допустимые форматы без точки перед расширением.
3. Если форматов больше трёх, показываются первые три и `ещё N`.
4. Для одного файла FileUpload переходит в `State=Disable` после успешной загрузки.
5. Для нескольких файлов Dropzone остаётся доступным, пока не достигнут лимит.
6. Когда достигнуто максимальное количество файлов, Dropzone остаётся видимым, а FileUpload переходит в `State=Disable`.
7. Ошибка всего блока используется, когда обязательный файл не прикреплён.
8. Ошибки конкретного файла показываются на строке файла и передаются обработчику.
9. Для технической ошибки загрузки пользователь должен иметь возможность попробовать ещё раз.
10. Действия в строках файлов показываются иконками, а не текстовыми кнопками.
11. `Primary` используется как самостоятельный блок, `Secondary` — внутри другого блока.
12. `Disable` блокирует новую загрузку, но сохраняет действия с уже загруженными файлами.
13. `[D]/[M] Attach` являются служебными частями и не используются отдельно.
14. Процесс загрузки файла отображается через `FileUploadItem Preset=Uploading`.
15. Ошибки отдельных файлов независимы и могут различаться.
16. Файлы отображаются в порядке загрузки.
17. `ещё N` относится только к дополнительным допустимым расширениям.
18. Геометрия и визуальные стили следуют effective baseline.
19. Список загруженных файлов всегда показывается полностью.
20. Title обязателен, Subtitle можно скрыть.
21. На desktop вся область Dropzone кликабельна.
22. Общая ошибка и ошибки отдельных файлов не отображаются одновременно.
23. Лимит и Counter учитывают все элементы списка, включая `Uploading` и `Error`.
24. На Mobile Web системный выбор открывается только по кнопке.
25. В пустом состоянии FilesGroup и Counter скрыты.

## Section 5: Структура текста

Заголовок называет тип файлов или документ: `Файл`, `Документы`, `Файлы документа`, `Паспорт РФ`, `Подтверждающие документы`.

Subtitle объясняет, что нужно загрузить и зачем: `Загрузите несколько документов, которые хотите отправить в банк`.

Текст кнопки прикрепления строится по формуле `Прикрепить файл docx, xls, pdf`. Если допустимых форматов больше трёх, используйте `Прикрепить файл docx, xls, pdf, ещё 13`.

Ограничения пишутся под кнопкой: `Не больше 20 МБ`, `До 20 МБ каждый, всего — не больше 5 файлов`, `До 20 МБ каждый, всего — не больше 100 МБ`.

Ошибки формулируются конкретно: `Прикрепите файл`, `Нужен файл не больше 20 МБ`, `Нужен docx, xls или pdf`, `Нужен pdf, png или jpg не больше 20 МБ`, `Не получилось загрузить, попробуйте ещё раз`.

Под контекст можно менять `Title`, `Subtitle`, число в Counter, `File extension`, названия файлов и значения внутри квадратных скобок. Например, `До [20] МБ каждый, всего — не больше [5] файлов` можно изменить на `До [30] МБ каждый, всего — не больше [10] файлов`.

## Section 6: Правила

### Rule 1: Показывай ограничения до загрузки

- ruleId: rule:components.file-upload.constraints-visible-before-upload
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

До выбора файла компонент должен показывать допустимые форматы и ограничения по размеру, количеству или общему объёму.

#### Правильно

```text
Прикрепить файл docx, xls, pdf
До 20 МБ каждый, всего — не больше 5 файлов
```

#### Неправильно

```text
Прикрепить файл
```

#### Почему

Пользователь должен понимать ограничения до загрузки, а не только после ошибки.

### Rule 2: Переводи FileUpload в Disable после загрузки единственного файла

- ruleId: rule:components.file-upload.single-file-disables-file-upload
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Если сценарий ограничен одним файлом, после успешной загрузки FileUpload должен перейти в `State=Disable`, а Dropzone должен остаться видимым.

#### Правильно

```text
Лимит: 1 файл
Файл загружен -> State=Disable, Dropzone видим
```

#### Неправильно

```text
Лимит: 1 файл
Файл загружен -> State=Default
```

#### Почему

После достижения лимита одного файла пользователь не должен иметь возможность добавить второй файл, но видимая структура компонента сохраняется.

### Rule 3: Переводи FileUpload в Disable при достижении максимума файлов

- ruleId: rule:components.file-upload.disable-file-upload-at-max-files
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Когда загружено максимальное количество файлов, Dropzone остаётся видимым, а весь FileUpload переходит в `State=Disable`.

#### Правильно

```text
Лимит: 5 файлов
Загружено: 5 файлов -> State=Disable, Dropzone видим
```

#### Неправильно

```text
Лимит: 5 файлов
Загружено: 5 файлов -> State=Default
```

#### Почему

Состояние Disable сохраняет структуру компонента и явно показывает недоступность новой загрузки.

### Rule 4: Различай лимит по количеству и лимит по объёму

- ruleId: rule:components.file-upload.limit-copy-matches-policy
- severity: error
- appliesTo: text
- checkType: llm
- autofix: partial

Если ограничение задано по количеству файлов, пишите `всего — не больше N файлов`. Если ограничение задано по общему объёму, пишите `всего — не больше N МБ`.

#### Правильно

```text
До 20 МБ каждый, всего — не больше 5 файлов
До 20 МБ каждый, всего — не больше 100 МБ
```

#### Неправильно

```text
До 20 МБ каждый, всего — не больше 5 МБ
```

#### Почему

Текст ограничения должен совпадать с реальной политикой загрузки.

### Rule 5: Используй счётчик при массовой загрузке более 50 файлов

- ruleId: rule:components.file-upload.counter-for-more-than-50-files
- severity: warning
- appliesTo: component
- checkType: llm
- autofix: no

Если предполагается единовременная загрузка более `50` файлов, рекомендуется показывать счётчик общего количества элементов списка.

#### Правильно

```text
Всего файлов 100
```

#### Неправильно

```text
100 файлов загружаются без счётчика прогресса
```

#### Почему

При большом количестве файлов счётчик помогает понять объём и прогресс загрузки.

### Rule 6: Используй Border для контраста на схожем фоне

- ruleId: rule:components.file-upload.border-for-similar-background
- severity: warning
- appliesTo: component
- checkType: llm
- autofix: no

Если desktop `FileUpload` расположен на схожем фоне, для контрастности можно использовать prop `Border` в `View=Primary` или `View=Secondary`. В `State=Disable` и в `[M] FileUpload` Border запрещён.

#### Правильно

```text
Фон блока близок к фону FileUpload -> Border включён
```

#### Неправильно

```text
Фон блока сливается с FileUpload -> Border не используется
```

#### Почему

Border помогает отделить компонент от похожего фона.

### Rule 7: Показывай ошибку всего блока, если обязательный файл не прикреплён

- ruleId: rule:components.file-upload.required-file-block-error
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Если файл обязателен, а пользователь не прикрепил ни одного файла, показывайте ошибку всего блока с текстом `Прикрепите файл`.

#### Правильно

```text
State: Error
Error text: Прикрепите файл
```

#### Неправильно

```text
Обязательный файл не прикреплён, но блок остаётся в Default
```

#### Почему

Ошибка относится ко всему блоку, потому что пользователь пропустил обязательный шаг.

### Rule 8: Пиши конкретную ошибку размера файла

- ruleId: rule:components.file-upload.file-size-error
- severity: error
- appliesTo: text
- checkType: llm
- autofix: partial

Если файл превышает допустимый размер, сообщение должно называть лимит.

#### Правильно

```text
Нужен файл не больше 20 МБ
```

#### Неправильно

```text
Файл слишком большой
```

#### Почему

Пользователь должен знать, какой файл выбрать вместо ошибочного.

### Rule 9: Пиши конкретную ошибку формата файла

- ruleId: rule:components.file-upload.file-format-error
- severity: error
- appliesTo: text
- checkType: llm
- autofix: partial

Если формат не поддерживается, сообщение должно назвать допустимые форматы или прямо сказать, что формат не подходит.

#### Правильно

```text
Нужен docx, xls или pdf
Формат не подходит
```

#### Неправильно

```text
Ошибка файла
```

#### Почему

Пользователь должен понять, что проблема именно в формате.

### Rule 10: Объединяй ошибку формата и размера

- ruleId: rule:components.file-upload.combined-format-and-size-error
- severity: warning
- appliesTo: text
- checkType: llm
- autofix: partial

Если файл одновременно неподходящего формата и превышает лимит размера, сообщение должно описывать оба ограничения.

#### Правильно

```text
Нужен pdf, png или jpg не больше 20 МБ
```

#### Неправильно

```text
Формат не подходит
```

#### Почему

Одно сообщение должно закрывать обе причины ошибки, чтобы пользователь не исправлял файл по одной проблеме за раз.

### Rule 11: Давай повторную загрузку при технической ошибке

- ruleId: rule:components.file-upload.retry-on-upload-failure
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Если файл не удалось загрузить по технической причине, покажите сообщение `Не получилось загрузить, попробуйте ещё раз` и оставьте возможность загрузить файл снова.

#### Правильно

```text
Не получилось загрузить, попробуйте ещё раз
Доступна повторная загрузка
```

#### Неправильно

```text
Файл не загрузился, строка заблокирована без возможности повторить
```

#### Почему

Техническая ошибка не должна заводить пользователя в тупик.

### Rule 12: Пиши форматы без точки

- ruleId: rule:components.file-upload.format-names-without-dot
- severity: error
- appliesTo: text
- checkType: dictionary
- autofix: partial

В списке допустимых форматов не ставьте точку перед расширением. Используйте только сокращённое название формата.

#### Правильно

```text
Прикрепить файл docx, xls, pdf
```

#### Неправильно

```text
Прикрепить файл .docx, .xls, .pdf
```

#### Почему

Без точки список форматов читается чище и соответствует компонентному паттерну.

### Rule 13: Показывай не больше трёх форматов до `ещё`

- ruleId: rule:components.file-upload.max-three-formats-before-more
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: partial

Если допустимых форматов больше трёх, показывайте первые три формата, затем запятую и `ещё N`.

#### Правильно

```text
Прикрепить файл docx, xls, pdf, ещё 13
```

#### Неправильно

```text
Прикрепить файл doc, pdf, jpg, png, xls, docx, odt, rtf, tiff, bmp, gif
```

#### Почему

Длинный список форматов перегружает кнопку прикрепления.

### Rule 14: Используй иконки для действий с файлами

- ruleId: rule:components.file-upload.file-actions-use-icons
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Для действий в строках файлов используйте заложенные по умолчанию иконки. Не заменяйте их текстовыми кнопками; пояснение действия давайте в tooltip.

#### Правильно

```text
Иконка скачивания
Tooltip: Скачать
```

#### Неправильно

```text
Текстовая кнопка «Скачать» в строке файла
```

#### Почему

Иконки сохраняют компактность строки файла и соответствуют компонентной модели.

### Rule 15: Используй только публичный FileUpload

- ruleId: rule:components.file-upload.public-roots-only
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Используй `[D] FileUpload` или `[M] FileUpload`. Не используй служебные `[D]/[M] Attach` отдельно.

### Rule 16: Выбирай View по композиции

- ruleId: rule:components.file-upload.view-semantics
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Используй `Primary` для самостоятельного блока. Используй `Secondary`, когда FileUpload расположен внутри другого блока или поверхности.

### Rule 17: В Disable блокируй только новую загрузку

- ruleId: rule:components.file-upload.disable-blocks-new-upload-only
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В `State=Disable` запрещай загрузку новых файлов, но сохраняй взаимодействие с уже загруженными файлами.

### Rule 18: Управляй частями через свойства компонента

- ruleId: rule:components.file-upload.slots-use-component-properties
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Скрывай и добавляй части FileUpload только через предусмотренные свойства компонента. Не используй detach и ручное изменение видимости внутренних слоёв.

### Rule 19: Соблюдай различия платформ

- ruleId: rule:components.file-upload.platform-interaction-and-surface
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

На desktop оставляй системный выбор и drag-and-drop, а также подложку компонента. На Mobile Web используй только системный выбор файла и не добавляй отдельную подложку.

### Rule 20: Разделяй ошибку блока и ошибки файлов

- ruleId: rule:components.file-upload.block-and-item-errors-are-separate
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

При валидации обязательного блока без файлов показывай общую ошибку FileUpload. Ошибки отдельных `FileUploadItem` храни независимо для каждого файла. Общая ошибка и ошибки файлов не должны отображаться одновременно.

### Rule 21: Используй Uploading для процесса загрузки

- ruleId: rule:components.file-upload.uploading-uses-file-item-preset
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Показывай процесс загрузки через `FileUploadItem Preset=Uploading`.

### Rule 22: Показывай действия согласно состоянию

- ruleId: rule:components.file-upload.file-actions-follow-state
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Скачать и удалить файл можно во всех состояниях. Повторную загрузку показывай только в `Error` и `Default`.

### Rule 23: Убирай Border в Disable

- ruleId: rule:components.file-upload.disable-hides-border
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В `State=Disable` не используй Border: отсутствие обводки показывает, что новые файлы загрузить нельзя.

### Rule 24: Ограничивай текстовые override

- ruleId: rule:components.file-upload.text-overrides-are-limited
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: partial

Меняй только `Title`, `Subtitle`, N в Counter, `File extension`, название файла и значения внутри квадратных скобок.

### Rule 25: Делегируй детали FileUploadItem

- ruleId: rule:components.file-upload.file-item-details-are-delegated
- severity: info
- appliesTo: component
- checkType: manual
- autofix: no

Подробные presets и внутренние правила `FileUploadItem` описываются отдельным компонентным пакетом.

### Rule 26: Сохраняй порядок загрузки

- ruleId: rule:components.file-upload.file-order-follows-upload
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Показывай файлы в порядке загрузки. Не меняй порядок вручную.

### Rule 27: Используй ещё N только для расширений

- ruleId: rule:components.file-upload.more-counts-extensions-only
- severity: error
- appliesTo: text
- checkType: deterministic
- autofix: partial

Используй `ещё N` для количества дополнительных допустимых расширений. Не применяй эту конструкцию к загруженным или скрытым файлам.

### Rule 28: Считай все элементы списка

- ruleId: rule:components.file-upload.counter-counts-all-list-items
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Counter `Всего файлов N` показывает общее количество элементов списка, включая `Uploading` и `Error`.

### Rule 29: Сохраняй effective baseline

- ruleId: rule:components.file-upload.visuals-follow-effective-baseline
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не меняй вручную padding, gap, radius, fill, stroke, typography и размеры иконок FileUpload или FileUploadItem.

### Rule 30: Снимай общую ошибку после успешной валидации

- ruleId: rule:components.file-upload.error-clears-after-successful-validation
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Переводи корневой FileUpload из `State=Error` в `Default` только после успешной повторной валидации блока.

### Rule 31: Учитывай платформу для Border

- ruleId: rule:components.file-upload.border-platform-matrix
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

В `[D] FileUpload` Border можно использовать в `View=Primary` и `View=Secondary`, кроме `State=Disable`. В `[M] FileUpload` Border запрещён.

### Rule 32: Настраивай TitleView через его контракт

- ruleId: rule:components.file-upload.title-view-follows-own-contract
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Для вложенного TitleView используй только параметры, разрешённые контрактом TitleView соответствующего размера.

### Rule 33: Сохраняй Fill и Hug

- ruleId: rule:components.file-upload.fill-hug-sizing
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Для `[D] FileUpload` и `[M] FileUpload` используй `Fill` по ширине и `Hug` по высоте.

### Rule 34: Показывай полный список файлов

- ruleId: rule:components.file-upload.file-list-is-always-expanded
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Не сворачивай список загруженных файлов и не скрывай отдельные элементы.

### Rule 35: Делай desktop Dropzone кликабельным целиком

- ruleId: rule:components.file-upload.desktop-dropzone-is-clickable
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

В `[D] FileUpload` вся область Dropzone открывает системный выбор файла по клику.

### Rule 36: Сохраняй обязательный Title

- ruleId: rule:components.file-upload.title-required-subtitle-optional
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Title обязателен. Subtitle можно скрыть штатным параметром компонента.

### Rule 37: Не совмещай общую и файловые ошибки

- ruleId: rule:components.file-upload.root-and-file-errors-are-exclusive
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

Не показывай общую ошибку FileUpload одновременно с ошибками отдельных FileUploadItem.

### Rule 38: Учитывай все элементы в лимите

- ruleId: rule:components.file-upload.limit-counts-all-list-items
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

При расчёте лимита учитывай все элементы списка, включая файлы в состояниях `Uploading` и `Error`.

### Rule 39: Открывай Mobile Web picker только по кнопке

- ruleId: rule:components.file-upload.mobile-selection-uses-button-only
- severity: error
- appliesTo: component
- checkType: manual
- autofix: partial

В `[M] FileUpload` открывай системный выбор файла только по нажатию на кнопку прикрепления. Не делай кликабельной всю область компонента.

### Rule 40: Скрывай пустой список и Counter

- ruleId: rule:components.file-upload.empty-state-hides-file-list
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: partial

Если в FileUpload нет элементов, скрывай FilesGroup и Counter.

## Section 7: Шаблоны

### Один файл

```text
Файл
Загрузите документ, который хотите отправить в банк
Прикрепить файл docx, xls, pdf
Не больше 20 МБ
```

### Несколько файлов с лимитом количества

```text
Документы
Вложите несколько документов, которые хотите отправить в банк
Прикрепить файл docx, xls, pdf
До 20 МБ каждый, всего — не больше 5 файлов
```

### Несколько файлов с лимитом общего объёма

```text
Документы
Вложите несколько документов, которые хотите отправить в банк
Прикрепить файл docx, xls, pdf
До 20 МБ каждый, всего — не больше 100 МБ
```

### Больше трёх форматов

```text
Прикрепить файл docx, xls, pdf, ещё 13
```

### Ошибка обязательного файла

```text
Прикрепите файл
Не больше 20 МБ
```

### Disable

```text
State=Disable
Новая загрузка недоступна
Действия с загруженными файлами доступны
```

### Загрузка файла

```text
FileUploadItem
Preset=Uploading
```

### Порядок файлов

```text
1. first.pdf
2. second.docx
3. third.xls
```

### Разные ошибки файлов

```text
Файл 1: ошибка формата
Файл 2: ошибка размера
```

## Section 8: Примеры

### Пример 1: Загрузка документов в форме

```text
Документы
Загрузите несколько документов, которые хотите отправить в банк
Название файла.docx
20 МБ
Прикрепить файл docx, xls, pdf
До 20 МБ каждый, всего — не больше 5 файлов
```

Компонент прикрепляет документы к конкретному разделу формы.

### Пример 2: Массовая загрузка

```text
Всего файлов 100
Название файла.docx
Название файла.xls
Прикрепить файл docx, xls, pdf
```

Для большого количества файлов показан счётчик.

### Пример 3: Ошибка формата и размера

```text
Название файла.psd
Нужен pdf, png или jpg не больше 20 МБ
```

Сообщение объясняет обе причины ошибки.

### Пример 4: Загрузка паспорта

```text
Паспорт РФ
Разворот с фотографией
Прикрепить файл docx, xls, pdf
Не больше 20 МБ
Разворот с регистрацией
Прикрепить файл docx, xls, pdf
Не больше 20 МБ
```

Для разных страниц документа используйте отдельные блоки загрузки.

### Пример 5: FileUpload внутри блока

```text
View=Secondary
Container=информационный блок
```

### Пример 6: Mobile Web

```text
[M] FileUpload
Системный выбор файла
Drag-and-drop отсутствует
Подложка отсутствует
```

### Пример 7: Настраиваемые ограничения

```text
До [30] МБ каждый, всего — не больше [10] файлов
```

### Пример 8: Дополнительные форматы

```text
docx, xls, pdf, ещё 2
```

### Пример 9: Счётчик

```text
Всего файлов 57
```

## Section 9: Антипримеры

### Антипример 1: Форматы с точками

```text
Прикрепить файл .pdf, .png, .jpg
```

Точки перед расширениями не используются.

### Антипример 2: Слишком длинный список форматов

```text
Прикрепить файл doc, pdf, jpg, png, xls, docx, odt, rtf, tiff, bmp, gif, heic
```

После трёх форматов нужно использовать `ещё N`.

### Антипример 3: Текстовая кнопка действия

```text
Название файла.docx
Скачать
20 МБ
```

Действие должно быть иконкой с tooltip.

### Антипример 4: Неясная ошибка

```text
Название файла.psd
Ошибка
```

Пользователь не понимает, что исправить: формат, размер или повторить загрузку.

### Антипример 5: Служебный Attach отдельно

```text
[D] Attach
```

Используйте публичный `[D] FileUpload`.

### Антипример 6: Полностью заблокированные файлы в Disable

```text
State=Disable
Удаление или скачивание уже загруженного файла недоступно
```

### Антипример 7: Border в Disable

```text
State=Disable
Border=true
```

### Антипример 8: Retry во время Uploading

```text
FileUploadItem Preset=Uploading
Action=Retry
```

### Антипример 9: Переставленные файлы

```text
Загружено: first.pdf, second.docx
Показано: second.docx, first.pdf
```

### Антипример 10: ещё N для скрытых файлов

```text
Показано 3 файла, ещё 10
```

## Section 10: Машинная обработка

### Детерминированные проверки

- Проверять наличие текста ограничений до загрузки.
- Проверять, что при лимите `1` файл FileUpload переходит в Disable после загрузки.
- Проверять, что при достижении максимального количества файлов FileUpload переходит в Disable, а Dropzone остаётся видимым.
- Проверять `State=Error` и текст `Прикрепите файл` для обязательного блока без файла.
- Проверять отсутствие точки перед расширениями файлов.
- Проверять, что до `ещё N` показано не больше трёх форматов.
- Проверять запятую перед `ещё N`.
- Проверять отсутствие текстовых кнопок действий в строках файлов.
- Проверять публичный корень `[D]/[M] FileUpload`.
- Проверять View по типу композиции.
- Проверять, что Disable блокирует только новую загрузку.
- Проверять управление слотами через свойства компонента.
- Проверять `Preset=Uploading` во время загрузки.
- Проверять матрицу действий по состояниям.
- Проверять отсутствие Border в Disable.
- Проверять допустимые текстовые override.
- Проверять порядок файлов.
- Проверять смысл `ещё N`.
- Проверять Counter.
- Проверять visual/layout параметры по effective baseline.
- Проверять, что общая ошибка снимается после успешной повторной валидации.
- Проверять платформенную матрицу Border.
- Проверять Fill по ширине и Hug по высоте.
- Проверять полный список файлов без сворачивания.
- Проверять обязательный Title.
- Проверять, что лимит и Counter учитывают Uploading и Error.
- Проверять скрытие FilesGroup и Counter в пустом состоянии.

### Словарные проверки

- Находить расширения файлов с точкой: `.docx`, `.xls`, `.pdf`, `.png`, `.jpg`.
- Находить тексты ошибок размера, формата, комбинированной ошибки и технической ошибки.
- Находить тексты `ещё N`, `Не больше N МБ`, `До N МБ каждый`.

### LLM-проверки

- Проверять, что текст ограничения совпадает с политикой: количество файлов или общий объём.
- Проверять необходимость счётчика при массовой загрузке.
- Проверять уместность `Border` на схожем фоне.
- Проверять, что ошибка файла объясняет реальную проблему.
- Проверять структуру загрузки паспорта и похожих многостраничных документов.
- Проверять платформенное соответствие drag-and-drop и подложки.
- Проверять разделение общей ошибки и ошибок отдельных файлов.
- Проверять настройки TitleView по его компонентному контракту.
- Проверять кликабельность всей области desktop Dropzone.
- Проверять взаимоисключение общей и файловых ошибок.
- Проверять, что Mobile Web picker открывается только по кнопке.

### Не проверяется автоматически

- Реальная серверная политика загрузки.
- Фактический результат drag-and-drop.
- Техническая причина сбоя загрузки.
- Корректность tooltip без данных о состоянии ховера.

### Автоисправления

- Убрать точки перед расширениями файлов.
- Свернуть длинный список форматов до трёх форматов и `ещё N`, если известно общее количество.
- Заменить общую ошибку на конкретную, если известна причина.
- Предложить заменить текстовую кнопку действия на иконку с tooltip.
