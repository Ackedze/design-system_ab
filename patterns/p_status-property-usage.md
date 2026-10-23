# Pattern: Использование Status и Property

- documentType: pattern
- patternType: component
- patternId: ptrn:components.status-property-usage
- patternKey: components.status-property-usage
- productType: alfa-business
- platforms: desktop, mobileweb
- locale: ru-RU
- owner: Design System
- status: draft
- updatedAt: 2026-10-24
- sourceType: owner-decision
- tags: status, property, color, contracts
- figmaLink: none
- sections: 10

## Section 1: Определение

Контекстные правила поверхности и допустимого состава статуса/свойств объекта.

## Section 2: Когда использовать

При выборе оформления и сборке объектов интерфейса Альфа-Бизнеса.

## Section 3: Когда не использовать

Не заменяет локальный контракт компонента и не задаёт отсутствующие в библиотеке значения.

## Section 4: Принципы

Одна самостоятельная норма имеет одного владельца. Контракты ссылаются на паттерны без копирования норм.

## Section 5: Структура текста

Локальные лимиты текста определяет контракт конкретного компонента.

## Section 6: Правила

### Rule 1: Выбирай Style по поверхности

- ruleId: rule:components.status-property.style-follows-surface
- severity: error
- appliesTo: screen
- checkType: manual
- autofix: no

На серой поверхности используй Style=Contrast, на белой — Style=Muted.

#### Правильно

Style=Contrast на серой поверхности.

#### Неправильно

Style=Muted на серой поверхности.

#### Почему

Выбор зависит от окружающей поверхности.

### Rule 2: Соблюдай допустимый состав статуса или свойств объекта

- ruleId: rule:components.status-property.allowed-composition
- severity: error
- appliesTo: screen
- checkType: manual
- autofix: no

Для одного объекта/одной группы используй либо один StatusPreset, либо не больше двух одновременно видимых PropertyPreset. Не смешивай эти семейства в одной группе. Отсутствие обоих семейств само по себе не запрещено.

#### Правильно

Один StatusPreset либо один-два PropertyPreset у одного объекта.

#### Неправильно

Два StatusPreset, три видимых PropertyPreset или смешанная группа для одного объекта.

#### Почему

Количество относится к группе/объекту и не определяется одним экземпляром компонента.

## Section 7: Шаблоны

Сначала определить контекст, затем выбрать штатные параметры компонента.

## Section 8: Примеры

Согласованная композиция и токены опубликованной библиотеки.

## Section 9: Антипримеры

Выбор по внешнему сходству без подтверждённой семантики.

## Section 10: Машинная обработка

Паттерн не является новым исполняемым контуром Apollo. Недостающий контекст не выводится из имени слоя.
