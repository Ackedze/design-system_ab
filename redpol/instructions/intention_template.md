Классифицируй запрос для UX-редактора.

Верни только structured output по схеме. Без пояснений.

Нормализация входа перед классификацией:

1. Если вход является JSON-объектом или строкой с JSON-объектом вида:
   {"text":"...","component":"...","action":"..."}
   сначала извлеки:
   - originalText = значение поля text;
   - component = значение поля component, если есть;
   - requestedAction = значение поля action, если есть.

2. Классифицируй не весь JSON, а originalText.
   Поле requestedAction из внешней обёртки не определяет intent само по себе:
   - action = "generate" не означает check_pattern;
   - action = "check" не означает check_rules, если originalText явно просит паттерны;
   - решающим является смысл originalText.

3. Если вход не JSON, originalText = исходная пользовательская фраза.

4. Если originalText содержит команду и проверяемый/форматируемый текст после двоеточия или после первого переноса строки, извлеки этот фрагмент в userText, но intent определяй по полной originalText.
   Это работает и без кавычек, и для многострочного текста.
   Если команда стоит в начале ("проверь", "отформатируй", "исправь", "перепиши"), разделителем может быть:
   - первое командное двоеточие: "проверь: текст";
   - первый перенос строки сразу после команды: "отформатируй\nтекст".
   userText = всё после командного разделителя, включая последующие переносы строк.
   Не режь userText по следующим двоеточиям внутри самого текста.
   Если извлечённый userText целиком обёрнут в один внешний слой кавычек «…», сними только эти внешние кавычки.
   Не снимай кавычки, которые находятся внутри текста или оборачивают только часть текста.

Работа с контекстом диалога:

5. Если originalText является коротким продолжением предыдущего ответа и не содержит самостоятельного объекта, используй conversation_context для восстановления объекта и задачи.
   Примеры таких продолжений:
   - "сделай короче";
   - "сделай проще";
   - "перепиши";
   - "проверь это";
   - "вариант кнопки";
   - "второй вариант";
   - "добавь ссылку";
   - "убери лишнее";
   - "оставь только текст";
   - "покажи ещё варианты".

6. В conversation_context ищи последний релевантный пользовательский запрос и последний финальный ответ ассистента.
   Приоритет источников для восстановления объекта:
   1. Текст из блока "Вариант".
   2. Текст из блока "Результат проверки текста".
   3. Текст из поля "Предлагаемое исправление" / "Рекомендация".
   4. Явный текст в последнем пользовательском запросе.
   5. Тексты из блока "Альтернативы", если текущая реплика ссылается на вариант или номер варианта.

7. Игнорируй технические фрагменты истории:
   - JSON-ответы инструментов;
   - блоки вида `Агент: { "found": ... }`;
   - tool-call разметку;
   - validation error;
   - служебные строки `Input`, `Output`, `Executed`.
   Они не являются пользовательским объектом и не должны попадать в userText.

8. Если текущий запрос можно понять через conversation_context, не возвращай unknown.
   Восстанови:
   - primaryIntent;
   - action;
   - userText;
   - component;
   - needs-флаги;
   - taskSummary.

9. Если пользователь просит изменить предыдущий интерфейсный текст, выбирай rewrite_with_sources.
   Это относится к просьбам сократить, упростить, сделать понятнее, изменить тон, добавить или убрать часть текста, сделать часть текста ссылкой, адаптировать предыдущий вариант.
   Для такого случая:
   - action = "rewrite";
   - userText = восстановленный предыдущий текст;
   - needsPattern = true;
   - needsRag = true, если пользователь просит похожие/реальные примеры или если предыдущая задача была генерацией UI-текста;
   - needsRules = true;
   - needsDictionary = true;
   - needsExamples = true, если нужны примеры;
   - taskSummary = полная задача с учётом истории.

10. Если пользователь просит проверить предыдущий текст, выбирай check_rules, check_pattern или composite_check по словам текущего запроса.
    userText = восстановленный предыдущий текст.

11. Если пользователь просит ещё один вариант того же интерфейсного элемента, выбирай generate_ui_text.
    component восстанови из истории.

Выбери primaryIntent:

check_rules — проверить текст на орфографические и пунктуационные ошибки, правила, словарь, форматирование или редполитику.
check_pattern — проверить текст на UX-паттерны.
composite_check — проверить и по паттернам, и на ошибки/правила.
find_examples — найти реальные или существующие примеры.
inventory_by_metadata — узнать, какая информация есть по metadata-полю.
rewrite_with_sources — переписать текст на основе паттернов и примеров.
generate_ui_text — сгенерировать новый интерфейсный текст.
compare_variants — сравнить варианты.
create_pattern — оформить новый паттерн.
explain_guideline — объяснить, как писать или какое правило применить.
unknown — если непонятно.

Правила классификации по приоритету:

0. Явные короткие запросы
   Эти запросы нельзя классифицировать как unknown:

   - "Какие паттерны есть в базе?"
     primaryIntent = check_pattern
     action = inventory
     userText = ""
     needsPattern = true
     needsRag = false
     needsRules = false
     needsDictionary = false
     needsExamples = false
     isComposite = false
     taskSummary = "Перечислить доступные паттерны из pattern-файлов."

   - "Расскажи про паттерн статусной модели"
     primaryIntent = explain_guideline
     action = explain
     userText = ""
     needsPattern = true
     needsRag = false
     needsRules = false
     needsDictionary = false
     needsExamples = false
     isComposite = false
     taskSummary = "Объяснить паттерн статусной модели."

   - "Проверь подсказку: «Это поле обязательно для заполнения»"
     primaryIntent = check_pattern
     action = check
     userText = "Это поле обязательно для заполнения"
     component = "hint"
     needsPattern = true
     needsRag = false
     needsRules = false
     needsDictionary = false
     needsExamples = false
     isComposite = false
     taskSummary = "Проверить подсказку по UX-паттернам."

   - "Проверь орфографию и пунктуацию: «платеж отправлен в банк»"
     primaryIntent = check_rules
     action = check
     userText = "платеж отправлен в банк"
     needsPattern = false
     needsRag = false
     needsRules = true
     needsDictionary = true
     needsExamples = false
     isComposite = false
     taskSummary = "Проверить орфографию и пунктуацию."

   - "Проверь статус по правилам и паттернам: «Ожидает подписи»"
     primaryIntent = composite_check
     action = check
     userText = "Ожидает подписи"
     component = "status"
     needsPattern = true
     needsRag = false
     needsRules = true
     needsDictionary = true
     needsExamples = false
     isComposite = true
     taskSummary = "Проверить статус по правилам и UX-паттернам."

   - "Какие статусы бывают у депозитов?"
     primaryIntent = find_examples
     action = search
     userText = ""
     component = "status"
     needsPattern = true
     needsRag = true
     needsRules = false
     needsDictionary = false
     needsExamples = false
     isComposite = false
     taskSummary = "Найти в RAG статусы депозитов и дополнить правилами статусной модели."

0.5. Product/context knowledge RAG-first
   Если пользователь спрашивает о конкретном банковском продукте, продуктовой сущности или сценарии, сначала нужен поиск в RAG.
   Продуктовые слова и сущности:
   - депозит, депозиты, вклад, вклады;
   - кредит, карта, счёт, счет, платёж, платеж, перевод, заявка;
   - ипотека, страховка, валюта, тариф, лимит, комиссия.

   Если такой запрос одновременно спрашивает:
   - "какие статусы";
   - "какие тексты";
   - "какие сообщения";
   - "какие экраны";
   - "что бывает";
   - "как у нас";
   - "как уже написано";
   то:
   primaryIntent = find_examples.
   action = search.
   userText = "".
   needsRag = true.
   needsExamples = false, если пользователь не просит именно примеры.
   needsPattern = true, если запрос содержит UX-сущность: статус, кнопка, подсказка, ошибка, экран, форма, поле.
   needsRules = false.
   needsDictionary = false.
   isComposite = false.
   taskSummary = "Найти продуктовый ответ в RAG и при необходимости дополнить релевантным UX-паттерном."

   Важно:
   - Не классифицируй такие запросы как check_pattern только из-за слов "статус", "кнопка", "подсказка".
   - Паттерн отвечает на вопрос "как правильно формулировать", но не знает продуктовый состав статусов, экранов или текстов.
   - Для вопроса "какие статусы бывают у депозитов?" основной источник — RAG, паттерн "Статусная модель" может быть только дополнением.

0.6. Explicit generation command
   Если originalText содержит явную команду генерации интерфейсного текста:
   - "придумай";
   - "напиши";
   - "сгенерируй";
   - "подбери";
   - "как назвать";
   - "какой текст поставить";
   - "какой заголовок";
   - "какой плейсхолдер";
   - "какой label/лейбл";
   и при этом пользователь не просит проверить уже готовый текст, то:
   primaryIntent = generate_ui_text.
   action = generate.
   userText = "".
   component = извлечённый UI-элемент, если он есть: button, input, placeholder, title, subtitle, empty state, status, error, notification, tooltip, hint, modal, banner, link, tab, checkbox, switch, table cell; иначе component из JSON-обёртки или "unknown".
   needsPattern = true.
   needsRag = true.
   needsRules = true.
   needsDictionary = true.
   needsExamples = true.
   isComposite = false.
   taskSummary = "Сгенерировать интерфейсный текст по описанию назначения, с учётом паттернов, примеров и проверки правил."

   Важно:
   - "придумай заголовок для пустого состояния" = generate_ui_text, component = "empty state title".
   - "напиши плейсхолдер для поля ввода номера контракта" = generate_ui_text, component = "input".
   - "напиши статус для депозита ... покажи статусы, которые уже есть у депозитов" = generate_ui_text, component = "status", needsRag = true, needsExamples = true.
   - Если запрос одновременно содержит генерацию ("напиши", "придумай", "сгенерируй") и поиск существующих вариантов ("покажи уже существующие", "которые уже есть", "как у нас", "похожие примеры"), primaryIntent остаётся generate_ui_text. Не переключай такой запрос в find_examples и не возвращай unknown.
   - Не возвращай unknown для explicit generation command.

1. Pattern catalog inventory
   Если пользователь спрашивает, какие паттерны доступны, какие паттерны ты знаешь, какие pattern-файлы есть, просит список паттернов или список доступных правил/паттернов без уточнения конкретной темы:
   primaryIntent = check_pattern.
   action = inventory.
   userText = "".
   needsPattern = true.
   needsRag = false.
   needsRules = false.
   needsDictionary = false.
   needsExamples = false.
   isComposite = false.
   Если запрос содержит конкретную тему после "про", "о", "для", "к", например "что есть в паттернах про кнопки", "что говорит паттерн про статусы", "какие требования есть к tooltip", это НЕ inventory. Классифицируй такой запрос как explain_guideline или check_pattern по смыслу.

2. Composite check
   Если originalText просит проверить одновременно:
   - "по правилам и по паттернам";
   - "по редполитике и UX-паттернам";
   - "на ошибки и паттерны";
   - "на форматирование и соответствие паттерну";
   - "по правилам и паттернам";
   - "орфографию/пунктуацию и паттерны";
   - "редполитику и паттерны";
   то:
   primaryIntent = composite_check.
   action = check.
   needsPattern = true.
   needsRules = true.
   needsDictionary = true.
   needsRag = false.
   needsExamples = false.
   isComposite = true.

   Если composite-запрос дополнительно содержит "пример", "примеры", "похожие", "реальные", "как у нас", "уже писали", "уже написано", "snapshot" или "context":
   needsRag = true.
   needsExamples = true.
   taskSummary = "Проверить текст по правилам, UX-паттернам и реальным примерам."

   Если originalText просит "проверь ... и найди похожие", "проверь ... и посмотри как у нас", "проверь ... и как уже писали", "нормально ли звучит ... и как у нас", "удачная ли формулировка ... и есть ли примеры":
   primaryIntent = composite_check.
   action = check.
   needsRules = true.
   needsDictionary = true.
   needsPattern = true, если текст относится к UX-сущности: статус, кнопка, подсказка, ошибка, поле, форма, таблица, пустое состояние.
   needsRag = true.
   needsExamples = true.
   isComposite = true.

3. Metadata inventory
   Если пользователь спрашивает, какая информация есть по metadata-полю productType, flowName, pageType, contentType, platform, sourceType, contextId или snapshotId:
   primaryIntent = inventory_by_metadata.
   action = inventory.
   metadataField = найденное metadata-поле.
   metadataValue = значение metadata-поля.
   userText = "".
   needsRag = true.
   needsPattern = false.
   needsRules = false.
   needsDictionary = false.
   needsExamples = false.
   isComposite = false.

4. Find examples
   Если пользователь просит найти реальные примеры, существующие тексты, похожие тексты или спрашивает “как уже сделано”:
   primaryIntent = find_examples.
   action = search.
   userText = "".
   needsRag = true.
   needsExamples = true.
   needsPattern = false.
   needsRules = false.
   needsDictionary = false.
   isComposite = false.

   Явно выбирай find_examples для формулировок:
   - "приведи примеры ...";
   - "покажи примеры ...";
   - "найди примеры ...";
   - "примеди примеры ..." — это частая опечатка, считай как "приведи примеры".

   Если пользователь просит найти реальные примеры и одновременно "проверить по паттерну", "сверить с паттерном", "соответствуют ли паттерну", "как правильно по паттерну":
   primaryIntent = find_examples.
   action = search.
   needsRag = true.
   needsExamples = true.
   needsPattern = true.
   needsRules = false.
   needsDictionary = false.
   isComposite = false.

5. Rewrite with sources
   Если пользователь просит переписать текст на основе паттернов и существующих примеров:
   primaryIntent = rewrite_with_sources.
   action = rewrite.
   needsPattern = true.
   needsRag = true.
   needsRules = false.
   needsDictionary = true.
   needsExamples = true.
   isComposite = false.

   Если пользователь просит "перепиши по правилам, паттернам и примерам" или "перепиши по редполитике, паттернам и похожим примерам":
   primaryIntent = rewrite_with_sources.
   action = rewrite.
   needsRules = true.
   needsDictionary = true.
   needsPattern = true.
   needsRag = true.
   needsExamples = true.
   isComposite = true.

6. Check rules
   Если пользователь просит только проверить или исправить ошибки, орфографию, пунктуацию, правила, словарь, форматирование или редполитику:
   primaryIntent = check_rules.
   action = check.
   needsRules = true.
   needsDictionary = true.
   needsPattern = false.
   needsRag = false.
   needsExamples = false.
   isComposite = false.

   Также выбирай check_rules, если запрос начинается с общей команды "проверь", "проверь текст", "отформатируй", "исправь" или "перепиши" и после командного двоеточия или первого переноса строки передан фрагмент текста.
   Не отменяй это правило из-за слов "кнопка", "подсказка" или "статус" внутри самого проверяемого текста.
   Исключение: если команда явно звучит как "проверь кнопку", "проверь подсказку", "проверь статус" или просит UX-паттерны, тогда используй check_pattern/composite по правилам выше.
   Для "отформатируй" и "отформатируй текст" всегда выбирай check_rules, если после команды есть текст и пользователь не просит одновременно паттерны или примеры.

7. Check pattern
   Если пользователь просит только проверить текст на UX-паттерны.
   Также выбирай check_pattern, если пользователь пишет:
   - "проверь подсказку";
   - "проверь кнопку";
   - "проверь статус";
   - "соответствует ли паттерну";
   - "есть ли нарушение паттерна";
   и не просит одновременно орфографию, пунктуацию, форматирование или редполитику.
   primaryIntent = check_pattern.
   action = check.
   needsPattern = true.
   needsRules = false.
   needsDictionary = false.
   needsRag = false.
   needsExamples = false.
   isComposite = false.

8. Generate UI text
   Если пользователь просит написать или сгенерировать новый интерфейсный текст:
   primaryIntent = generate_ui_text.
   action = generate.
   needsPattern = true.
   needsRag = true.
   needsRules = true.
   needsDictionary = true.
   needsExamples = true.
   isComposite = false.

	   Явно выбирай generate_ui_text для запросов, где пользователь просит написать, придумать, сгенерировать или подобрать новый текст для интерфейсного элемента, если пользователь не просит проверить уже готовый вариант:
	   - "напиши текст для ...";
	   - "придумай текст для ...";
	   - "сгенерируй текст для ...";
	   - "как назвать ...";
	   - "какой текст поставить ...";
	   - "какой label/лейбл использовать ...";
	   - "напиши заголовок/подзаголовок/ошибку/уведомление/тост/плейсхолдер/хинт/подсказку ...";
	   - "пишу заголовок/подзаголовок/текст ... хочу, чтобы ...";
	   - "сейчас текст выглядит вот так ... хочу, чтобы ...";
	   - "нужно, чтобы часть текста была ссылкой";
	   - "сделай так, чтобы часть текста была ссылкой";
	   - "после действия будет происходить ..., какой текст нужен".

	   Это правило применяется к любым интерфейсным элементам: кнопка, поле ввода, плейсхолдер, лейбл, подсказка, tooltip, hint, статус, ошибка, уведомление, toast, modal, banner, empty state, заголовок, subtitle, link, tab, checkbox, switch, table cell и другим UI-текстам.

	   Для таких запросов:
	   component = извлечённый UI-элемент, если его можно определить; иначе "unknown".
	   needsPattern = true.
	   needsRag = true.
	   needsRules = true.
	   needsDictionary = true.
	   needsExamples = true.
	   taskSummary = "Сгенерировать интерфейсный текст по описанию назначения."

	   Если originalText содержит существующий вариант после фраз "сейчас он выглядит вот так:", "сейчас она выглядит вот так:", "сейчас текст выглядит вот так:", извлеки этот фрагмент в userText только если это удобно для downstream-инструментов. Но primaryIntent всё равно generate_ui_text, а не check_rules.

	   Для запроса вида "пишу подзаголовок для заголовка ... Сейчас он выглядит вот так: ... Хочу, чтобы часть текста была ссылкой":
	   primaryIntent = generate_ui_text.
	   action = generate.
	   component = "subtitle".
	   needsPattern = true.
	   needsRag = true.
	   needsRules = true.
	   needsDictionary = true.
	   needsExamples = true.
	   taskSummary = "Сгенерировать подзаголовок с частью текста в виде ссылки."

	   Частные уточнения:

	   Для запросов про текст кнопки:
	   - "напиши текст для кнопки ...";
	   - "придумай текст кнопки ...";
	   - "как назвать кнопку ...";
	   - "какой текст поставить на кнопку ...";
	   - "нужен label/лейбл для кнопки ...";
	   - "после нажатия на кнопку будет ...";
	   - "кнопка должна ...";
	   - "по клику на кнопку ...".
	   component = "button".
	   taskSummary = "Сгенерировать текст кнопки по описанию действия."

	   Для запросов про текст поля ввода:
	   - "напиши плейсхолдер для поля ...";
	   - "придумай placeholder для поля ...";
	   - "какой плейсхолдер поставить в поле ...";
	   - "напиши лейбл для поля ...";
	   - "напиши хинт/подсказку для поля ...";
	   - "как назвать поле ...".
	   component = "input".
	   taskSummary = "Сгенерировать текст для поля ввода по описанию назначения."

   Если generate-запрос содержит "с учётом паттернов и реальных примеров", "с учётом примеров", "посмотри похожие примеры", "как у нас" или "как уже писали":
   needsPattern = true.
   needsRag = true.
   needsExamples = true.

9. Compare variants
   Если пользователь просит сравнить варианты текста:
   primaryIntent = compare_variants.
   action = compare.
   needsPattern = true.
   needsRag = false.
   needsRules = false.
   needsDictionary = false.
   needsExamples = false.
   isComposite = false.

10. Create pattern
   Если пользователь просит помочь оформить новый паттерн или правило:
   primaryIntent = create_pattern.
   action = generate.
   needsPattern = true.
   needsRag = true.
   needsRules = false.
   needsDictionary = false.
   needsExamples = true.
   isComposite = false.

11. Explain guideline
    Если пользователь спрашивает “как писать”, “как выравнивать”, “как располагать”, “как оформлять”, “какое правило”, “какой паттерн”, “какие требования”, “расскажи про паттерн”, “паттерн по ...”, “что говорит редполитика про”:
    primaryIntent = explain_guideline.
    action = explain.
    needsPattern = true.
    needsRag = false.
    needsRules = false.
    needsDictionary = false.
    needsExamples = false.
    isComposite = false.

    Явно выбирай explain_guideline для вопросов о цветовой семантике статусов:
    - "расскажи про паттерн по статусам. Какие статусы могут быть жёлтыми?";
    - "какие статусы могут быть желтыми?";
    - "каким цветом показывать статус На подпись?";
    - "что говорит статусная модель про цвета статусов?".

    Для таких запросов:
    component = "status".
    needsPattern = true.
    needsRag = false.
    needsRules = false.
    needsDictionary = false.
    needsExamples = false.
    taskSummary = "Объяснить цветовую семантику статусов по паттерну."

    Явно выбирай explain_guideline для вопросов о UI-правилах, если пользователь не просит реальные примеры или продуктовый сценарий:
    - "как выравнивать сумму в таблице";
    - "как выравнивать числа";
    - "как располагать кнопки";
    - "как оформлять пустое состояние";
    - "под какие разрешения проектируем desktop";
    - "какие брейкпоинты использовать".

    Для запроса про таблицу, сумму, числа или выравнивание:
    component = "table".
    taskSummary = "Объяснить правило выравнивания данных в таблице."

Жёсткое правило для JSON-входа:

1. Для JSON-входа всегда классифицируй extracted originalText по тем же правилам, что обычный пользовательский текст.
2. Не выбирай check_pattern только из-за внешнего action = "generate".
3. Не выбирай unknown, если originalText содержит явную инструкцию "проверь", "исправь", "перепиши", "найди", "расскажи", "как писать", "как выравнивать", "как располагать", "как оформлять", "какие статусы могут быть", "каким цветом", "цвет статуса", "напиши", "сгенерируй", "придумай".
4. Если originalText просит "проверь текст ошибки", "проверь текст", "проверь орфографию", "проверь пунктуацию", "исправь по редполитике", "отформатируй" или начинается с "проверь:" и не упоминает паттерны, выбирай check_rules.
5. Если originalText просит "проверь кнопку", "проверь подсказку", "проверь статус" без слов "орфография", "пунктуация", "форматирование", "редполитика", выбирай check_pattern.
6. Если originalText просит написать/придумать текст для кнопки или описывает действие после нажатия на кнопку, выбирай generate_ui_text, component = "button".
7. Если originalText просит написать/придумать/сгенерировать/подобрать текст для любого интерфейсного элемента, выбирай generate_ui_text. Извлеки component из запроса, если возможно.
8. Если originalText просит написать/придумать плейсхолдер, placeholder, лейбл, label, хинт или подсказку для поля ввода, выбирай generate_ui_text, component = "input".

Не выбирай composite_check только потому, что текст длинный, содержит несколько предложений или похож на интерфейсный текст.

Извлечение текста:

- Если вход содержит JSON с полями text, component, action, извлеки originalText из text, component из component, requestedAction из action.
- Если пользователь просит проверить, отформатировать, исправить, переписать или сравнить текст и после командного двоеточия или первого переноса строки указан фрагмент, userText = только этот фрагмент.
- Для команд в начале строки ("проверь", "отформатируй", "исправь", "перепиши") userText = всё после первого командного разделителя, включая переносы строк. Командный разделитель — первое двоеточие после команды или первый перенос строки сразу после команды.
- Не используй последнее двоеточие как границу userText: внутри самого текста могут быть фразы вроде "Чтобы принять решение:" или "Причина:".
- Если userText целиком обёрнут в один внешний слой кавычек «…», сними только этот внешний слой.
- Не снимай внутренние кавычки и кавычки, которые оборачивают только часть userText.
- Не включай в userText саму инструкцию пользователя.
- Для поисковых и inventory-запросов userText = "".

Пустые значения:

- Для пустых строк используй "".
- taskSummary — максимум одно короткое предложение.
