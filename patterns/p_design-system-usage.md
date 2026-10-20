# Pattern: Общие правила использования дизайн-системы

- documentType: pattern
- patternType: visual
- patternId: ptrn:system.design-system-usage
- patternKey: system.design-system-usage
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

Общие нормы выбора токенов и версии компонента для канала.

## Section 2: Когда использовать

При проверке компонентов независимо от их семейства.

## Section 3: Когда не использовать

Не применяйте норму вне указанного контекста или без доказанных входных данных.

## Section 4: Принципы

Каждая норма имеет одного владельца. Контракт компонента хранит ссылку на внешнюю норму, а не её копию.

## Section 5: Структура текста

Контекст проверки задаётся отдельно от свойств проверяемого экземпляра. Отсутствующий факт не заменяется предположением.

## Section 6: Правила

### Rule 1: Используй токены разрешённых библиотек

- ruleId: rule:system.library-tokens-only
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Каждый используемый токен должен принадлежать разрешённой опубликованной библиотеке дизайн-системы. Локальные и кастомные токены запрещены. Обязательность token binding конкретного свойства задаётся его отдельным контрактом; это правило проверяет принадлежность уже выбранного токена.

#### Правильно

Canonical token key найден в принятом registry разрешённой библиотеки.

#### Неправильно

Локальный или кастомный токен, включая копию с тем же именем и значением.

#### Почему

Имя, RGB, remote=true или просто наличие binding не доказывают принадлежность разрешённой библиотеке.

### Rule 2: Сопоставляй компонент с выбранным каналом

- ruleId: rule:system.component-channel-match
- severity: error
- appliesTo: component
- checkType: deterministic
- autofix: no

Desktop/mobile-web версия компонента должна соответствовать каналу, выбранному пользователем в интерфейсе плагина. Expected channel поступает из переключателя UI независимо от проверяемого компонента; actual platform определяется по canonical component identity.

#### Правильно

UI desktop и desktop-компонент; UI mobile-web и mobile-web компонент.

#### Неправильно

UI mobile-web и desktop-компонент. Вывод expected channel из самого экземпляра также недопустим.

#### Почему

Иначе проверка сравнивает компонент с ним самим и пропускает неправильную версию.

## Section 7: Шаблоны

```text
UI channel: mobile-web
Component identity: mobile-web
Applied token key: approved published library
```

## Section 8: Примеры

```text
UI channel: mobile-web
Component identity: mobile-web
Applied token key: approved published library
```

## Section 9: Антипримеры

```text
UI channel: desktop
Component identity: mobile-web
Token: local copy
```

## Section 10: Машинная обработка

### Детерминированные проверки

Проверять canonical token identity по принятому registry и независимый UI channel. Missing registry или UI context → UNKNOWN, известное несовпадение → error. Не дублировать component binding checks.

### Словарные проверки

Имя слоя или совпадение названия токена не доказывают identity.

### LLM-проверки

Уточняют применимый сценарий по предоставленному контексту.

### Не проверяется автоматически

Неполный контекст, недоступный registry или неподтверждённый mapping дают UNKNOWN либо ручную проверку. Этот документ не заявляет готовность runtime.

### Автоисправления

Автоматическое исправление не предусмотрено.
