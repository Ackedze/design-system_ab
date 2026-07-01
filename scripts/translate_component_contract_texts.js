#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'JSONS/web/components');
const TARGET_FILES = new Set([
  'agent-context.json',
  'composition-contract.json',
  'contract.overrides.json',
  'rules.json',
  'README.md',
]);

const TRANSLATIONS = new Map([
  [
    'Generated component context. Use exact component rules and pattern rules for recommendations; do not infer design prohibitions from this generated context alone.',
    'Сгенерированный контекст компонента. Для рекомендаций используй exact component rules и pattern rules; не выводи дизайн-запреты только из этого сгенерированного контекста.',
  ],
  [
    'Compare layer changes against the effective component state baseline when host composition context is available.',
    'Сравнивай изменения layer с effective baseline текущего состояния компонента, если доступен host composition context.',
  ],
  [
    'Generated placeholder overlay. Add semantic ownership, reset model and design-rule overrides manually when needed.',
    'Сгенерированный placeholder overlay. При необходимости вручную добавь semantic ownership, reset model и design-rule overrides.',
  ],
  [
    'Variant/property changes on this component family are component-property customizations. Report them separately from derived visual layer changes.',
    'Изменения variant/property в этом семействе компонентов являются component-property customizations. Показывай их отдельно от производных визуальных изменений layer.',
  ],
  [
    'Layer/style changes inside this component family should be compared against the effective baseline for the current component variant and nested owner context.',
    'Изменения layer/style внутри этого семейства компонентов нужно сравнивать с effective baseline текущего component variant и nested owner context.',
  ],
  [
    'Component lifecycle status is context for the agent. Do not treat it as a design violation unless a separate pattern or exact design rule is matched.',
    'Lifecycle status компонента является контекстом для агента. Не считай его дизайн-нарушением, если не найден отдельный pattern или exact design rule.',
  ],
  [
    'If a component property changed, compare manual layer overrides against the current actual component state baseline, not against the original reference state baseline.',
    'Если component property изменилась, сравнивай ручные layer overrides с baseline текущего actual-состояния компонента, а не с исходным reference baseline.',
  ],
  [
    'When a component state is reset, layer differences caused only by that state may disappear automatically. Manual layer overrides should remain independently resettable until the parent state reset removes their target state.',
    'При reset состояния компонента layer differences, вызванные только этим состоянием, могут исчезнуть автоматически. Ручные layer overrides должны оставаться независимо сбрасываемыми, пока reset родительского состояния не уберёт их target state.',
  ],
  [
    'Show both changes and compare the layer property against current-state baseline.',
    'Покажи оба изменения и сравни layer property с baseline текущего состояния.',
  ],
  [
    'Compare the manual layer override against the original reference state baseline.',
    'Сравнивать ручной layer override с исходным reference baseline.',
  ],
  [
    'Root layout/visibility is controlled by component variant properties.',
    'Root layout/visibility управляется component variant properties.',
  ],
  [
    'Manual visual/layout changes on Field are layer customizations and should be shown separately from component property changes.',
    'Ручные visual/layout изменения на Field являются layer customizations и должны показываться отдельно от изменений component property.',
  ],
  [
    'Do not report wrapper-owned nested overrides when actual equals this component effective baseline. If actual differs, report effectiveBaseline -> actual.',
    'Не показывай wrapper-owned nested overrides, когда actual совпадает с effective baseline этого компонента. Если actual отличается, показывай effectiveBaseline -> actual.',
  ],
  [
    'Layer/style/layout changes must remain separate from component properties and must reset independently.',
    'Изменения layer/style/layout должны оставаться отдельно от component properties и сбрасываться независимо.',
  ],
  [
    'Component-property reset and layer-property reset are separate. Layer resets must use the effective baseline after nested variant/materialization resolution.',
    'Component-property reset и layer-property reset разделены. Layer reset должен использовать effective baseline после nested variant/materialization resolution.',
  ],
  [
    'Variant/property changes on the component instance are component-property customizations. Do not convert them into unrelated paint or layout findings.',
    'Изменения variant/property на instance компонента являются component-property customizations. Не превращай их в несвязанные paint или layout findings.',
  ],
  [
    'Layer/style changes must be compared against the effective baseline for the current component variant and nested owner context.',
    'Изменения layer/style нужно сравнивать с effective baseline текущего component variant и nested owner context.',
  ],
  [
    'Changes to Size, FilledState, ActiveState, DisabledState, ErrorState and OuterLabel are component property changes and must be reported as first-class customizations.',
    'Изменения Size, FilledState, ActiveState, DisabledState, ErrorState и OuterLabel являются component property changes и должны показываться как самостоятельные customizations.',
  ],
  [
    'Manual text style changes on Label, Placeholder or HintMessage are layer customizations and should be independently resettable.',
    'Ручные изменения text style на Label, Placeholder или HintMessage являются layer customizations и должны сбрасываться независимо.',
  ],
  [
    'Label, placeholder and hint text should follow input-field text rules.',
    'Тексты label, placeholder и hint должны соответствовать текстовым правилам input-field.',
  ],
  [
    'Disabled/enabled component state.',
    'Состояние компонента disabled/enabled.',
  ],
  [
    'Nested addon instance. Its variant properties are slot configuration, not free layer styling.',
    'Вложенный addon instance. Его variant properties являются slot configuration, а не свободной layer styling.',
  ],
  [
    'Internal paint target. Manual fill changes should be treated as layer customization.',
    'Внутренний paint target. Ручные изменения fill нужно трактовать как layer customization.',
  ],
  [
    'Do not report wrapper-owned nested differences as customizations when actual equals the table family effective baseline. If actual differs, report effectiveBaseline -> actual.',
    'Не показывай wrapper-owned nested differences как customizations, когда actual совпадает с effective baseline семейства таблиц. Если actual отличается, показывай effectiveBaseline -> actual.',
  ],
  [
    'Table family nested diffs should use the selected table component effective baseline before falling back to standalone nested component baselines.',
    'Nested diffs семейства таблиц должны использовать effective baseline выбранного table component перед fallback к standalone baselines вложенных компонентов.',
  ],
  [
    'Variant/property changes on table family components are component-property customizations. Report them separately from derived visual layer changes.',
    'Изменения variant/property в компонентах семейства таблиц являются component-property customizations. Показывай их отдельно от производных визуальных изменений layer.',
  ],
  [
    'Layer/style changes inside table family components must be compared against the effective baseline for the current table variant and nested owner context.',
    'Изменения layer/style внутри компонентов семейства таблиц нужно сравнивать с effective baseline текущего table variant и nested owner context.',
  ],
  [
    'Scheduled table parts are lifecycle context for the agent. Do not treat scheduled status as a design violation unless a separate pattern or exact design rule is matched.',
    'Scheduled-части таблиц являются lifecycle context для агента. Не считай scheduled status дизайн-нарушением, если не найден отдельный pattern или exact design rule.',
  ],
  [
    'AmountInput is a component family for amount entry fields. Apollo should treat amount input state changes as component property changes, manual field/token/layout changes as layer customizations, and amount text as content that may need amount/input pattern review.',
    'AmountInput — семейство компонентов для ввода суммы. Apollo должен трактовать изменения состояния amount input как component property changes, ручные изменения field/token/layout как layer customizations, а текст суммы как content, которому может понадобиться проверка по amount/input pattern.',
  ],
  [
    'Amount text/content should follow amount formatting rules: mathematical spaces, mathematical minus and no opacity for amount parts where prohibited.',
    'Текст/content суммы должен соответствовать правилам форматирования сумм: математические пробелы, математический минус и отсутствие opacity для частей суммы там, где это запрещено.',
  ],
  [
    'Button is a component family for action controls. Apollo should treat Button variant changes as component property changes and manual style/token/layout changes as layer customizations.',
    'Button — семейство action controls. Apollo должен трактовать изменения Button variant как component property changes, а ручные изменения style/token/layout как layer customizations.',
  ],
  [
    'Apollo found a component property customization: view primary -> accent.',
    'Apollo нашёл component property customization: view primary -> accent.',
  ],
  [
    'The fill changed from Primary color unless Apollo also reports an explicit layer fill change.',
    'Fill изменился с Primary color, если Apollo дополнительно не показывает явное layer fill change.',
  ],
  [
    'Show both changes: view primary -> accent, and fill from Accent baseline -> actual custom value.',
    'Покажи оба изменения: view primary -> accent и fill от Accent baseline -> actual custom value.',
  ],
  [
    'Compare the manual fill against Primary baseline.',
    'Сравнивать ручной fill с Primary baseline.',
  ],
  [
    'Apollo found a Button contract violation: text style on Label or Hint must match the effective Button baseline.',
    'Apollo нашёл нарушение Button contract: text style на Label или Hint должен совпадать с effective Button baseline.',
  ],
  [
    'This is only a component state change or an allowed layer customization.',
    'Это только изменение состояния компонента или разрешённая layer customization.',
  ],
  [
    'Visual style/state of the button.',
    'Визуальный style/state кнопки.',
  ],
  [
    'Button height/size state.',
    'Состояние высоты/size кнопки.',
  ],
  [
    'Corner shape state.',
    'Состояние формы углов.',
  ],
  [
    'Switches the button into icon-only/single-icon visual state.',
    'Переключает кнопку в icon-only/single-icon visual state.',
  ],
  [
    'Root layout, radius and fill are controlled by component variant properties and design tokens.',
    'Root layout, radius и fill управляются component variant properties и design tokens.',
  ],
  [
    'Text content can be changed. Text style and fill are layer parameters and should normally stay controlled by the variant.',
    'Text content можно менять. Text style и fill являются layer parameters и обычно должны оставаться под управлением variant.',
  ],
  [
    'Hint is present in the component structure, but desktop usage is restricted by pattern rules.',
    'Hint присутствует в структуре компонента, но desktop-использование ограничено pattern rules.',
  ],
  [
    'When a component property is reset, layer differences caused only by that property may disappear automatically. Manual layer overrides should remain independently resettable until the parent property reset removes their target state.',
    'При reset component property layer differences, вызванные только этой property, могут исчезнуть автоматически. Ручные layer overrides должны оставаться независимо сбрасываемыми, пока reset родительской property не уберёт их target state.',
  ],
  [
    'Changes to View, Size, Shape, SingleIcon and DisabledState are component property changes and must be reported as first-class customizations.',
    'Изменения View, Size, Shape, SingleIcon и DisabledState являются component property changes и должны показываться как самостоятельные customizations.',
  ],
  [
    'Manual fill changes on Button root, Label, Hint, Addon PaintMe or icon layers are layer customizations. They should be shown separately from component property changes.',
    'Ручные изменения fill на Button root, Label, Hint, Addon PaintMe или icon layers являются layer customizations. Их нужно показывать отдельно от component property changes.',
  ],
  [
    'Do not manually change text styles on Button Label or Hint. Text style is defined by the Button component state and must match the effective component baseline.',
    'Не меняй вручную text styles на Button Label или Hint. Text style определяется состоянием Button component и должен совпадать с effective component baseline.',
  ],
  [
    'Reset the layer text style to the effective Button baseline.',
    'Сбрось layer text style к effective Button baseline.',
  ],
  [
    'Desktop usage must not use Button variants and parameters forbidden by the button pattern.',
    'В desktop нельзя использовать Button variants и параметры, запрещённые button pattern.',
  ],
  [
    'Hint inside desktop Button is restricted by the button pattern and requires manual review if visible or customized.',
    'Hint внутри desktop Button ограничен button pattern и требует ручной проверки, если он видим или кастомизирован.',
  ],
  [
    'IconButton is a component family for icon-only actions. Apollo should treat Size, View, TransparentBg and nested Icon Type as component/part properties, and manual root/icon visual changes as layer customizations.',
    'IconButton — семейство компонентов для icon-only actions. Apollo должен трактовать Size, View, TransparentBg и nested Icon Type как component/part properties, а ручные root/icon visual changes как layer customizations.',
  ],
  [
    'If a component property changed and then an icon/root layer is manually customized, compare the layer against the current IconButton state baseline, not against the original reference state baseline.',
    'Если component property изменилась, а затем icon/root layer был вручную кастомизирован, сравнивай layer с текущим IconButton state baseline, а не с исходным reference baseline.',
  ],
  [
    'Show both the View component property change and the PaintMe/icon fill layer customization, using the current View baseline for the fill.',
    'Покажи и View component property change, и PaintMe/icon fill layer customization, используя текущий View baseline для fill.',
  ],
  [
    'Compare the icon fill against the original View baseline or collapse the fill change into the View change.',
    'Сравнивать icon fill с исходным View baseline или схлопывать fill change в View change.',
  ],
  [
    'Do not report IconButton-owned nested differences as customizations when actual equals IconButton effective baseline. If actual differs, report effectiveBaseline -> actual.',
    'Не показывай IconButton-owned nested differences как customizations, когда actual совпадает с IconButton effective baseline. Если actual отличается, показывай effectiveBaseline -> actual.',
  ],
  [
    'IconButton size state.',
    'Size state компонента IconButton.',
  ],
  [
    'Size state IconButton.',
    'Size state компонента IconButton.',
  ],
  [
    'IconButton visual view state.',
    'Visual view state компонента IconButton.',
  ],
  [
    'Visual view state IconButton.',
    'Visual view state компонента IconButton.',
  ],
  [
    'Controls transparent background presentation.',
    'Управляет transparent background presentation.',
  ],
  [
    'Icon part type used inside IconButton.',
    'Тип Icon part, используемый внутри IconButton.',
  ],
  [
    'Root size, radius, layout and background are controlled by IconButton variant properties and design tokens.',
    'Root size, radius, layout и background управляются IconButton variant properties и design tokens.',
  ],
  [
    'Nested icon/spinner part. Its Type property is configuration; manual styling below it is a layer customization.',
    'Вложенный icon/spinner part. Его Type property является configuration; ручной styling ниже считается layer customization.',
  ],
  [
    'Icon glyph is controlled by the icon asset/part component.',
    'Icon glyph управляется icon asset/part component.',
  ],
  [
    'When an IconButton component property is reset, visual differences caused only by that property may disappear automatically. Manual layer overrides should stay independently resettable until the parent property reset removes their target state.',
    'При reset IconButton component property visual differences, вызванные только этой property, могут исчезнуть автоматически. Ручные layer overrides должны оставаться независимо сбрасываемыми, пока reset родительской property не уберёт их target state.',
  ],
  [
    'Changes to IconButton Size, View and TransparentBg are component property changes and must be reported as first-class customizations.',
    'Изменения IconButton Size, View и TransparentBg являются component property changes и должны показываться как самостоятельные customizations.',
  ],
  [
    'Changes to the nested Icon Type are part/component configuration, not a free layer style change.',
    'Изменения nested Icon Type являются part/component configuration, а не свободным layer style change.',
  ],
  [
    'Manual root layout, fill, stroke, radius or opacity changes on IconButton are layer customizations and should be compared against the effective component state baseline.',
    'Ручные изменения root layout, fill, stroke, radius или opacity на IconButton являются layer customizations и должны сравниваться с effective component state baseline.',
  ],
  [
    'Manual fill changes on IconButton PaintMe, diamonds or icon layers are layer customizations. They should be shown separately from component property changes.',
    'Ручные изменения fill на IconButton PaintMe, diamonds или icon layers являются layer customizations. Их нужно показывать отдельно от component property changes.',
  ],
  [
    'Scheduled corporate IconButton variants are lifecycle context for the agent. Do not treat scheduled status as a design violation unless a separate pattern or exact design rule is matched.',
    'Scheduled corporate IconButton variants являются lifecycle context для агента. Не считай scheduled status дизайн-нарушением, если не найден отдельный pattern или exact design rule.',
  ],
  [
    'Input is a component family for text fields. Apollo should treat Input state changes as component property changes and manual style/token/layout changes as layer customizations. Text content may need pattern-based editorial review.',
    'Input — семейство text fields. Apollo должен трактовать изменения состояния Input как component property changes, а ручные изменения style/token/layout как layer customizations. Text content может требовать редакторской проверки по pattern.',
  ],
  [
    'Apollo found a component property customization: errorState false -> true.',
    'Apollo нашёл component property customization: errorState false -> true.',
  ],
  [
    'The field fill was manually changed unless Apollo also reports an explicit layer fill change.',
    'Field fill был изменён вручную, если Apollo дополнительно не показывает явное layer fill change.',
  ],
  [
    'Show both changes and compare Field fill against ErrorState=True baseline.',
    'Покажи оба изменения и сравни Field fill с ErrorState=True baseline.',
  ],
  [
    'Compare manual Field fill against ErrorState=False baseline.',
    'Сравнивать ручной Field fill с ErrorState=False baseline.',
  ],
  [
    'This needs pattern-based text review using input-fields no-label-colon rule.',
    'Нужна текстовая проверка по pattern с использованием правила input-fields no-label-colon.',
  ],
  [
    'This is a visual customization.',
    'Это visual customization.',
  ],
  [
    'Input height/size state.',
    'Height/size state компонента Input.',
  ],
  [
    'Height/size state Input.',
    'Height/size state компонента Input.',
  ],
  [
    'Whether the input has a filled/value state.',
    'Есть ли у input filled/value state.',
  ],
  [
    'Focus/active visual state.',
    'Focus/active visual state компонента.',
  ],
  [
    'Validation/error visual state.',
    'Validation/error visual state компонента.',
  ],
  [
    'Whether the label is placed outside/above the field instead of inside/floating.',
    'Размещён ли label снаружи/над field вместо inside/floating.',
  ],
  [
    'Root visibility/layout is controlled by component variant properties.',
    'Root visibility/layout управляется component variant properties.',
  ],
  [
    'Label text can be changed. Text style, fill and placement are controlled by component state and pattern rules.',
    'Label text можно менять. Text style, fill и placement управляются состоянием компонента и pattern rules.',
  ],
  [
    'Field fill, radius, stroke and layout are controlled by size/state variants.',
    'Field fill, radius, stroke и layout управляются size/state variants.',
  ],
  [
    'Placeholder text can be changed. Text style and fill are layer properties and should normally stay controlled by the variant.',
    'Placeholder text можно менять. Text style и fill являются layer properties и обычно должны оставаться под управлением variant.',
  ],
  [
    'Hint or error text can be changed. ErrorState controls whether this text is interpreted as validation/error state.',
    'Hint или error text можно менять. ErrorState управляет тем, интерпретируется ли этот текст как validation/error state.',
  ],
  [
    'Addon instances are slot configuration. Manual fills/strokes on addon placeholders are layer customizations.',
    'Addon instances являются slot configuration. Ручные fills/strokes на addon placeholders являются layer customizations.',
  ],
  [
    'Input field pattern states that desktop uses an internal floating label, while mobileweb/mobile use an external label. OuterLabel changes require pattern-aware review by platform.',
    'Input field pattern задаёт: desktop использует internal floating label, а mobileweb/mobile — external label. Изменения OuterLabel требуют platform-aware проверки по pattern.',
  ],
  [
    'Input label text must name the entity, not instruct the user, and must not end with a colon.',
    'Input label text должен называть сущность, а не инструктировать пользователя, и не должен заканчиваться двоеточием.',
  ],
  [
    'Placeholder should add format/mask/context and should not duplicate the label. If format is known, use a mask rather than an abstract hint or real-value example.',
    'Placeholder должен добавлять format/mask/context и не должен дублировать label. Если format известен, используй mask, а не абстрактный hint или пример с реальным значением.',
  ],
  [
    'Hint should be short and useful. Error text should explain what happened and what to do next using human language.',
    'Hint должен быть коротким и полезным. Error text должен человеческим языком объяснять, что произошло и что делать дальше.',
  ],
  [
    'SelectWithTags is a select/autocomplete-like component family with tag/value part components. Apollo should treat select state changes as component property changes, tag/value configuration as slot/part configuration, and manual visual changes as layer customizations.',
    'SelectWithTags — семейство компонентов типа select/autocomplete с tag/value part components. Apollo должен трактовать изменения состояния select как component property changes, tag/value configuration как slot/part configuration, а ручные visual changes как layer customizations.',
  ],
  [
    'Changes to Size, FilledState, ActiveState, DisabledState, ErrorState and part states are component/part property changes and must be reported as first-class customizations.',
    'Изменения Size, FilledState, ActiveState, DisabledState, ErrorState и part states являются component/part property changes и должны показываться как самостоятельные customizations.',
  ],
  [
    'Manual visual/text style changes on Tag, TagControl or Value internals are layer customizations unless owned by a parent composition contract.',
    'Ручные visual/text style changes на Tag, TagControl или Value internals являются layer customizations, если они не принадлежат parent composition contract.',
  ],
  [
    'Switch is a component family for binary on/off controls. Apollo should treat SelectedState, DisabledState, Reverse and Hint as component property changes, and manual area/oval/label visual changes as layer customizations.',
    'Switch — семейство бинарных on/off controls. Apollo должен трактовать SelectedState, DisabledState, Reverse и Hint как component property changes, а ручные area/oval/label visual changes как layer customizations.',
  ],
  [
    'Changes to SelectedState, DisabledState, Reverse and Hint are component property changes and must be reported as first-class customizations.',
    'Изменения SelectedState, DisabledState, Reverse и Hint являются component property changes и должны показываться как самостоятельные customizations.',
  ],
  [
    'Manual visual/layout changes on switch track area or thumb oval are layer customizations and should be shown separately from component state changes.',
    'Ручные visual/layout changes на switch track area или thumb oval являются layer customizations и должны показываться отдельно от component state changes.',
  ],
  [
    'Manual text style or fill changes on SwitchLabel label are layer customizations.',
    'Ручные text style или fill changes на SwitchLabel label являются layer customizations.',
  ],
  [
    'Web Core Navigation Tabs contains standalone primary and secondary tab components. It defines baseline values for TabsPrimary and TabPrimary, but composite components such as TabsView can own different effective baselines through their own composition contracts.',
    'Web Core Navigation Tabs содержит standalone-компоненты primary и secondary tabs. Он задаёт baseline values для TabsPrimary и TabPrimary, но composite components вроде TabsView могут владеть другими effective baselines через собственные composition contracts.',
  ],
  [
    'Standalone Tabs contract describes core baseline. Composite wrappers such as TabsView may override nested TabsPrimary or TabPrimary baselines through their own composition-contract.',
    'Standalone Tabs contract описывает core baseline. Composite wrappers вроде TabsView могут переопределять nested TabsPrimary или TabPrimary baselines через собственный composition-contract.',
  ],
  [
    'Standalone TabPrimary spacing baseline',
    'Standalone baseline отступов TabPrimary',
  ],
  [
    'Standalone TabPrimary uses itemSpacing 12. Host components may override this only through their own composition-contract effective baseline.',
    'Standalone TabPrimary использует itemSpacing 12. Host components могут переопределять это только через собственный composition-contract effective baseline.',
  ],
  [
    'Standalone TabPrimary typography baseline',
    'Standalone baseline типографики TabPrimary',
  ],
  [
    'Standalone primary tab labels use Paragraph/18–24 Primary Large. Host components may override this only through their own composition-contract effective baseline.',
    'Standalone primary tab labels используют Paragraph/18–24 Primary Large. Host components могут переопределять это только через собственный composition-contract effective baseline.',
  ],
  [
    'Scheduled secondary tabs exist only as migration context',
    'Scheduled secondary tabs существуют только как migration context',
  ],
  [
    'Scheduled secondary tabs are migration context; active [D]/[M] TabsSecondary entries are the audit baseline.',
    'Scheduled secondary tabs являются migration context; active [D]/[M] TabsSecondary entries используются как audit baseline.',
  ],
  [
    'AmountStyles provides amount typography components and internal operation/amount text parts. Apollo should treat Style and Negative as component/part properties, and manual paint/text style changes on leaf text layers as layer customizations.',
    'AmountStyles предоставляет компоненты amount typography и внутренние operation/amount text parts. Apollo должен трактовать Style и Negative как component/part properties, а ручные paint/text style changes на leaf text layers как layer customizations.',
  ],
  [
    'If Style or Negative changed and then a leaf text layer is customized, compare the layer against the current AmountStyles state baseline. Keep the exact leaf target for reset.',
    'Если Style или Negative изменились, а затем leaf text layer был кастомизирован, сравнивай layer с текущим AmountStyles state baseline. Сохраняй точный leaf target для reset.',
  ],
  [
    'Minus is the paint-bearing text layer for the amount operation sign.',
    'Minus — paint-bearing text layer для знака операции суммы.',
  ],
  [
    'Major is the paint-bearing text layer for the amount major part.',
    'Major — paint-bearing text layer для major-части суммы.',
  ],
  [
    'Minor is the paint-bearing text layer for the amount minor part.',
    'Minor — paint-bearing text layer для minor-части суммы.',
  ],
  [
    'Currency is the paint-bearing text layer for the amount currency part.',
    'Currency — paint-bearing text layer для currency-части суммы.',
  ],
  [
    'Optional minus sign shown before an amount.',
    'Опциональный minus sign перед суммой.',
  ],
  [
    'Major numeric part of the amount.',
    'Major numeric part суммы.',
  ],
  [
    'Minor numeric part of the amount.',
    'Minor numeric part суммы.',
  ],
  [
    'Currency symbol or marker.',
    'Currency symbol или marker.',
  ],
  [
    'Paint and text style are stored on text leaf layers. Reset actions must keep the exact leaf target even when UI or agent wording groups the finding by semantic owner.',
    'Paint и text style хранятся на text leaf layers. Reset actions должны сохранять точный leaf target, даже если UI или формулировка агента группирует finding по semantic owner.',
  ],
  [
    'Changes to AmountParagraph or AmountHeadline Style are component property changes and must be reported separately from derived text layer customizations.',
    'Изменения AmountParagraph или AmountHeadline Style являются component property changes и должны показываться отдельно от производных text layer customizations.',
  ],
  [
    'Changes to Operation Negative are part/component configuration for the amount operation sign.',
    'Изменения Operation Negative являются part/component configuration для знака операции суммы.',
  ],
  [
    'Manual fill changes on Operation / Minus are layer customizations of the amount operation sign. Keep the exact Minus leaf layer for reset, but describe the semantic owner as AmountParagraph / Operation.',
    'Ручные изменения fill на Operation / Minus являются layer customizations знака операции суммы. Сохраняй точный Minus leaf layer для reset, но описывай semantic owner как AmountParagraph / Operation.',
  ],
  [
    'Manual fill changes on Major, Minor or Currency text layers are layer customizations of the amount text. Keep the exact leaf layer for reset, but group the explanation under AmountParagraph / Amount.',
    'Ручные изменения fill на Major, Minor или Currency text layers являются layer customizations текста суммы. Сохраняй точный leaf layer для reset, но группируй объяснение под AmountParagraph / Amount.',
  ],
  [
    'Manual text style changes on AmountStyles leaf text layers are layer customizations. They should be independently resettable and not collapsed into the Style variant change.',
    'Ручные изменения text style на AmountStyles leaf text layers являются layer customizations. Они должны сбрасываться независимо и не схлопываться в Style variant change.',
  ],
  [
    'BackgroundPlate is a family of plate, slot and style-level components that map Position, Type, BackgroundColor and Skeleton variants to layer fills and slot padding.',
    'BackgroundPlate — семейство plate, slot и style-level components, которое маппит Position, Type, BackgroundColor и Skeleton variants на layer fills и slot padding.',
  ],
  [
    'BackgroundPlate component properties must be audited as component parameters',
    'Component properties BackgroundPlate нужно проверять как параметры компонента',
  ],
  [
    'BackgroundPlate layer properties must use effective baseline',
    'Layer properties BackgroundPlate должны использовать effective baseline',
  ],
  [
    'ButtonsGroup is a composite wrapper around repeated desktop and mobile Button instances with optional overflow picker button.',
    'ButtonsGroup — composite wrapper вокруг повторяющихся desktop и mobile Button instances с опциональной overflow picker button.',
  ],
  [
    'ButtonGroup [D] component properties must be audited as component parameters',
    'Component properties ButtonGroup [D] нужно проверять как параметры компонента',
  ],
  [
    'ButtonGroup [D] layer properties must use effective baseline',
    'Layer properties ButtonGroup [D] должны использовать effective baseline',
  ],
  [
    'Table Basic [D] is a desktop table family for basic rows, cells, group dividers, graphics, sorting and table add-ons in Web Corp Components.',
    'Table Basic [D] — desktop-семейство таблиц для basic rows, cells, group dividers, graphics, sorting и table add-ons в Web Corp Components.',
  ],
  [
    'Table Wide [D] is a desktop table family for wide rows, head rows, body cells, control cells, action cells, dividers and table add-ons in Web Corp Components.',
    'Table Wide [D] — desktop-семейство таблиц для wide rows, head rows, body cells, control cells, action cells, dividers и table add-ons в Web Corp Components.',
  ],
  [
    'TabsView is a wrapper/composite component around primary and secondary tabs. Apollo should use TabsView effective baseline for nested TabsPrimary/TabsSecondary differences and suppress wrapper-owned overrides when actual equals effective baseline.',
    'TabsView — wrapper/composite component вокруг primary и secondary tabs. Apollo должен использовать TabsView effective baseline для nested TabsPrimary/TabsSecondary differences и подавлять wrapper-owned overrides, когда actual совпадает с effective baseline.',
  ],
  [
    'For nested TabsPrimary/TabsSecondary changes, compare actual against TabsView effective baseline, not standalone nested component baseline.',
    'Для nested TabsPrimary/TabsSecondary changes сравнивай actual с TabsView effective baseline, а не со standalone nested component baseline.',
  ],
  [
    'No customization: this is a wrapper-owned TabsView override.',
    'Нет customization: это wrapper-owned TabsView override.',
  ],
  [
    'Apollo found spacing customization 24 -> 32.',
    'Apollo нашёл spacing customization 24 -> 32.',
  ],
  [
    'Apollo found TabsView layer customization: spacing 32 -> 40.',
    'Apollo нашёл TabsView layer customization: spacing 32 -> 40.',
  ],
  [
    'Spacing changed 24 -> 40.',
    'Spacing изменился 24 -> 40.',
  ],
  [
    'Do not report wrapper-owned overrides as customizations when actual equals TabsView effective baseline. If actual differs, report effectiveBaseline -> actual.',
    'Не показывай wrapper-owned overrides как customizations, когда actual совпадает с TabsView effective baseline. Если actual отличается, показывай effectiveBaseline -> actual.',
  ],
  [
    'TabsView controls spacing between primary tabs and skeleton tabs.',
    'TabsView управляет spacing между primary tabs и skeleton tabs.',
  ],
  [
    'TabsView controls spacing between primary tab items.',
    'TabsView управляет spacing между primary tab items.',
  ],
  [
    'TabsView controls spacing inside each primary tab item.',
    'TabsView управляет spacing внутри каждого primary tab item.',
  ],
  [
    'TabsView applies action typography to nested primary tab labels.',
    'TabsView применяет action typography к nested primary tab labels.',
  ],
  [
    'TabsView controls secondary tag spacing.',
    'TabsView управляет secondary tag spacing.',
  ],
  [
    'TabsView controls mobile secondary tag spacing.',
    'TabsView управляет mobile secondary tag spacing.',
  ],
  [
    'Switches TabsView between ready and loading/skeleton presentation.',
    'Переключает TabsView между ready и loading/skeleton presentation.',
  ],
  [
    'Wrapper-owned primary tabs implementation.',
    'Wrapper-owned реализация primary tabs.',
  ],
  [
    'TabsView owns spacing between primary tab items.',
    'TabsView владеет spacing между primary tab items.',
  ],
  [
    'Wrapper-owned secondary tabs/tag implementation.',
    'Wrapper-owned реализация secondary tabs/tag.',
  ],
  [
    'Wrapper-owned overrides define effective baseline for nested core components. Manual layer overrides should be compared against TabsView effective baseline, not against standalone nested component baseline.',
    'Wrapper-owned overrides задают effective baseline для nested core components. Ручные layer overrides нужно сравнивать с TabsView effective baseline, а не со standalone nested component baseline.',
  ],
  [
    'Skeleton changes are component property changes and should be reported as first-class customizations.',
    'Изменения Skeleton являются component property changes и должны показываться как самостоятельные customizations.',
  ],
  [
    'TabsView owns selected layout and text-style overrides inside TabsPrimary. When actual equals TabsView effective baseline, these nested differences must not be reported as customizations.',
    'TabsView владеет selected layout и text-style overrides внутри TabsPrimary. Когда actual совпадает с TabsView effective baseline, эти nested differences нельзя показывать как customizations.',
  ],
  [
    'If a nested TabsPrimary layer differs from TabsView effective baseline, report it as a TabsView layer customization using effective baseline as reference.',
    'Если nested TabsPrimary layer отличается от TabsView effective baseline, показывай это как TabsView layer customization, используя effective baseline как reference.',
  ],
  [
    'If a nested TabsSecondary/Tag layer differs from TabsView effective baseline, report it as a TabsView layer customization using effective baseline as reference.',
    'Если nested TabsSecondary/Tag layer отличается от TabsView effective baseline, показывай это как TabsView layer customization, используя effective baseline как reference.',
  ],
  [
    'TitleView is a composite header/title wrapper with status, title addons, right addons, holding selector, subtitle, title status and button group areas.',
    'TitleView — composite header/title wrapper со status, title addons, right addons, holding selector, subtitle, title status и button group areas.',
  ],
  [
    'TitleView component properties must be audited as component parameters',
    'Component properties TitleView нужно проверять как параметры компонента',
  ],
  [
    'TitleView layer properties must use effective baseline',
    'Layer properties TitleView должны использовать effective baseline',
  ],
]);

function main() {
  const files = collectFiles(ROOT);
  let changedCount = 0;

  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    let next = original;

    if (file.endsWith('.json')) {
      const json = JSON.parse(original);
      const translated = translateValue(json);
      next = `${JSON.stringify(translated, null, 2)}\n`;
    } else if (file.endsWith('README.md')) {
      next = translateMarkdown(original);
    }

    if (next !== original) {
      fs.writeFileSync(file, next);
      changedCount += 1;
    }
  }

  console.log(`translated files: ${changedCount}`);
}

function collectFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectFiles(fullPath));
    } else if (TARGET_FILES.has(entry.name)) {
      result.push(fullPath);
    }
  }
  return result.sort((left, right) => left.localeCompare(right));
}

function translateValue(value) {
  if (typeof value === 'string') {
    return translateString(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => translateValue(item));
  }
  if (value && typeof value === 'object') {
    const output = {};
    for (const key of Object.keys(value)) {
      output[key] = translateValue(value[key]);
    }
    return output;
  }
  return value;
}

function translateString(value) {
  if (TRANSLATIONS.has(value)) {
    return TRANSLATIONS.get(value);
  }
  return value;
}

function translateMarkdown(markdown) {
  let output = markdown;

  for (const [from, to] of TRANSLATIONS) {
    output = output.split(from).join(to);
  }

  output = output
    .replace(
      /^# (.+?) component contract MVP$/gm,
      '# $1 — MVP component contract',
    )
    .replace(
      /^This folder contains a generated component-contract layer for \*\*(.+?)\*\*\.$/gm,
      'Папка содержит сгенерированный слой component-contract для **$1**.',
    )
    .replace(
      /^This folder contains an experimental component-contract layer for \*\*(.+?)\*\*\.$/gm,
      'Папка содержит экспериментальный слой component-contract для **$1**.',
    )
    .replace(
      /^- `contract\.overrides\.json` - generated placeholder for human-authored semantic overrides\.$/gm,
      '- `contract.overrides.json` — сгенерированный placeholder для semantic overrides, которые заполняются вручную.',
    )
    .replace(
      /^- `contract\.overrides\.json` — human-authored semantic layer: public API, anatomy, slots and reset model\.$/gm,
      '- `contract.overrides.json` — semantic layer, заполняемый вручную: public API, anatomy, slots и reset model.',
    )
    .replace(
      /^- `contract\.overrides\.json` - human-authored semantic layer: public API, anatomy and reset model\.$/gm,
      '- `contract.overrides.json` — semantic layer, заполняемый вручную: public API, anatomy и reset model.',
    )
    .replace(
      /^- `audit-mapping\.json` — how Apollo should classify and group (.+?) diffs\.$/gm,
      '- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs $1.',
    )
    .replace(
      /^- `audit-mapping\.json` - how Apollo should classify and group (.+?) diffs\.$/gm,
      '- `audit-mapping.json` — как Apollo должен классифицировать и группировать diffs $1.',
    )
    .replace(/^Apollo should use /gm, 'Apollo должен использовать ')
    .replace(
      /The agent should receive `agent-context\.json` or a smaller slice of it, not the full raw Figma catalog or the full generated contract\./g,
      'Агент должен получать `agent-context.json` или меньший slice этого файла, а не полный raw Figma catalog и не полный generated contract.',
    )
    .replace(/^This is a draft for (.+?)\. It covers:$/gm, 'Это draft для $1. Он покрывает:')
    .replace(
      /^If a component state changes and then a layer is manually customized inside the new state, Apollo must compare the layer against the \*\*current state baseline\*\*, not the original state baseline\.$/gm,
      'Если состояние компонента изменилось, а затем layer внутри нового состояния был вручную кастомизирован, Apollo должен сравнивать layer с **current state baseline**, а не с original state baseline.',
    )
    .replace(
      /^variant\.ErrorState: False -> True plus manual Field fill should compare fill against ErrorState=True baseline\.$/gm,
      'variant.ErrorState: False -> True плюс ручной Field fill должен сравнивать fill с ErrorState=True baseline.',
    )
    .replace(
      /^If `View`, `Size`, `TransparentBg` or nested `Icon\.Type` changes and then a layer is manually customized, Apollo must compare the layer against the \*\*current state baseline\*\*, not the original state baseline\.$/gm,
      'Если меняется `View`, `Size`, `TransparentBg` или nested `Icon.Type`, а затем layer кастомизируется вручную, Apollo должен сравнивать layer с **current state baseline**, а не с original state baseline.',
    )
    .replace(/^## Source$/gm, '## Источник')
    .replace(/^## Files$/gm, '## Файлы')
    .replace(/^## Generated summary$/gm, '## Сводка генерации')
    .replace(/^## Notes$/gm, '## Примечания')
    .replace(/^- Library: /gm, '- Библиотека: ')
    .replace(/^- Generated at: /gm, '- Сгенерировано: ')
    .replace(/^- Components: /gm, '- Компонентов: ')
    .replace(
      /^This package is generated\. Add manual rules only when there is an explicit component behavior or design rule to encode\.$/gm,
      'Пакет сгенерирован. Добавляй ручные rules только когда есть явное поведение компонента или design rule, которые нужно закодировать.',
    );

  return output;
}

main();
