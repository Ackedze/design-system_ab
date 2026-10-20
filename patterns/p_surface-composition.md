# Pattern: Сборка поверхностей страницы

- documentType: pattern
- patternType: layout
- patternId: ptrn:layout.surface-composition
- patternKey: layout.surface-composition
- productType: alfa-business
- platforms: desktop, mobileweb, adaptive
- locale: ru-RU
- owner: Design System
- status: draft
- updatedAt: 2026-10-16
- sourceType: owner-decision
- tags: backgroundplate, composition, contracts
- figmaLink: none
- sections: 10

## Section 1: Определение

Правила композиции BackgroundPlate на странице и в модальной сущности.

## Section 2: Когда использовать

При сборке главной поверхности, вложенных подложек и содержимого BackgroundPlateSlot.

## Section 3: Когда не использовать

Не применяйте норму вне указанного контекста или без доказанных входных данных.

## Section 4: Принципы

Каждая норма имеет одного владельца. Контракт компонента хранит ссылку на внешнюю норму, а не её копию.

## Section 5: Структура текста

Контекст проверки задаётся отдельно от свойств проверяемого экземпляра. Отсутствующий факт не заменяется предположением.

## Section 6: Правила

### Rule 1: Размещай Level 2 поверх Level 1

- ruleId: rule:components.background-plate.level-2-over-level-1
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: no

BackgroundPlate с Position=Level 2 (inner) должен находиться в Auto-ветке контента поверх абсолютной подложки BackgroundPlate Level 1 внутри общего Auto Layout. Подложка располагается перед веткой контента и покрывает область Level 2. Самостоятельный Level 2 запрещён без исключений.

#### Правильно

Level 1 — абсолютная подложка перед Auto-веткой Level 2 в общем Auto Layout; покрывает её область.

#### Неправильно

Самостоятельный Level 2 либо подложка после контента или без покрытия.

#### Почему

Вложенная поверхность зависит от реальной композиции, а не от одного значения Position.

### Rule 2: Ограничивай уровни внутри Slot

- ruleId: rule:components.background-plate.slot-content-levels
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: no

В Slot BackgroundPlateSlot можно размещать любой обычный контент напрямую; обязательная обёртка Level-2 не требуется. Из BackgroundPlate-уровней внутри Slot допустим только Level-2 (inner). Вложенные Level-0 (base) и Level-1 (outer) запрещены.

#### Правильно

Обычный контент напрямую в Slot; отдельный Level 2 добавлен только при необходимости.

#### Неправильно

Вложенный BackgroundPlate Level 0 или Level 1.

#### Почему

Обычному контенту не требуется обязательная обёртка Level 2.

### Rule 3: Назначай Level 0 главной поверхности

- ruleId: rule:components.background-plate.root-surface-level-0
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: no

Level-0 (base) должен быть назначен главной поверхности, на которой располагается BackgroundPlateSlot. Он задаёт исходный variable context, благодаря которому первый вложенный BackgroundPlate автоматически получает Level-1 (outer). Отсутствие Level-0 на главной поверхности нарушает вычисление уровней. Самому экземпляру BackgroundPlate Level-0 не назначается.

#### Правильно

Level-0 (base) назначен главной поверхности страницы или модальной сущности.

#### Неправильно

Level 0 назначен самому BackgroundPlate либо отсутствует у главной поверхности.

#### Почему

Родительский variable context определяет исходный уровень вложенной подложки.

### Rule 4: Выбирай BackgroundColor по контексту поверхности

- ruleId: rule:components.background-plate.background-color-by-page
- severity: error
- appliesTo: screen
- checkType: deterministic
- autofix: no

BackgroundColor выбирается по контексту поверхности. Для страниц используй base-bg-alt (gray) на серой поверхности и base-bg (white) на белой поверхности. Для модальных сущностей используй modal-bg-alt (gray) на серой поверхности и modal-bg (white) на белой поверхности. Часть имени до скобок соответствует цветовому токену поверхности; значение в скобках уточняет визуальный фон gray/white.

#### Правильно

Page gray → base-bg-alt (gray); page white → base-bg (white); modal gray → modal-bg-alt (gray); modal white → modal-bg (white).

#### Неправильно

Контекст modal проверяется как page или gray выбирается для white без основания.

#### Почему

Фон определяется конкретной родительской поверхностью. Требования единого BackgroundColor для всех подложек нет.

## Section 7: Шаблоны

```text
Page / Modal: Level 0
Общий Auto Layout:
  Level 1: ABSOLUTE, перед контентом, покрывает Level 2
  Контентная Auto-ветка: Level 2
```

## Section 8: Примеры

```text
Page / Modal: Level 0
Общий Auto Layout:
  Level 1: ABSOLUTE, перед контентом, покрывает Level 2
  Контентная Auto-ветка: Level 2
```

## Section 9: Антипримеры

```text
Level 2 размещён самостоятельно, без подложки Level 1.
```

## Section 10: Машинная обработка

### Детерминированные проверки

Полный captured graph, порядок sibling-узлов, positioning, bounds, canonical component identity, modes главной поверхности и явный page/modal × gray/white context. Четыре нормы проверяются раздельно.

### Словарные проверки

Имя слоя или совпадение названия токена не доказывают identity.

### LLM-проверки

Уточняют применимый сценарий по предоставленному контексту.

### Не проверяется автоматически

Неполный контекст, недоступный registry или неподтверждённый mapping дают UNKNOWN либо ручную проверку. Этот документ не заявляет готовность runtime.

### Автоисправления

Автоматическое исправление не предусмотрено.
