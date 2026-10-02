---
id: AmountStyles.cookbook.02-build
layer: product
product: ab
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-07-24
---

# AmountStyles — сборка

Overview — [`01-overview.md`](01-overview.md). Контексты — [`03-contexts.md`](03-contexts.md).

## 1. Импорт и variant

```js
const set = await figma.importComponentSetByKeyAsync(AMOUNT_STYLES_KEYS.paragraph)
const style = 'Paragraph 14/20'
const component = set.findOne(
  (node) =>
    node.type === 'COMPONENT' &&
    node.variantProperties?.Style === style,
)
if (!component) throw new Error(`AmountStyles Style not found: ${style}`)
const amountStyles = component.createInstance()
```

Для headline смени import key и используй только Style из соответствующего списка в `figma-keys.json`.

## 2. Helper для property keys

Suffix после `#` зависит от компонента. Ищи property по точному display-name:

```js
function propertyKey(instance, name) {
  const key = Object.keys(instance.componentProperties).find(
    (candidate) => candidate === name || candidate.startsWith(`${name}#`),
  )
  if (!key) throw new Error(`Property not found: ${name} on ${instance.name}`)
  return key
}
```

## 3. Operation

```js
amountStyles.setProperties({
  [propertyKey(amountStyles, 'Operation')]: true,
})

const operation = amountStyles.findOne(
  (node) => node.type === 'INSTANCE' && node.name === 'Operation',
)
if (!operation) throw new Error('Nested Operation not found')
operation.setProperties({ Negative: 'True' }) // True = минус, False = плюс
```

Для отсутствия знака выключи root Operation. Не редактируй `Minus` text.

## 4. Nested Amount

```js
const amount = amountStyles.findOne(
  (node) => node.type === 'INSTANCE' && node.name === 'Amount',
)
if (!amount) throw new Error('Nested Core Amount not found')

amount.setProperties({
  [propertyKey(amount, 'Minor')]: true,
  [propertyKey(amount, 'Currency')]: true,
  [propertyKey(amount, 'Addon')]: false,
})
```

`Major` обязателен и не скрывается.

## 5. Тексты

```js
function nestedInstance(root, name) {
  const node = root.findOne(
    (candidate) => candidate.type === 'INSTANCE' && candidate.name === name,
  )
  if (!node) throw new Error(`Nested instance not found: ${name}`)
  return node
}

const major = nestedInstance(amount, 'Major')
const minor = nestedInstance(amount, 'Minor')
const currency = nestedInstance(amount, 'Currency')

major.setProperties({ [propertyKey(major, '✎ Major')]: '1 234 567' })
minor.setProperties({ [propertyKey(minor, '✎ Minor')]: '00' })
currency.setProperties({ [propertyKey(currency, '✎ Currency')]: '₽' })
```

В `Major` использован математический пробел. `Minor` содержит один или два знака.

Если символ/код валюты есть в штатном `Currency.Type`, выбери variant. `Custom` используй только для отсутствующего штатного значения.

## 6. Addon

Включи nested `Addon`, затем используй только `IconView` или `StatusBadge` и их штатные properties. Addon не выше line-height текста и сохраняет собственные contextual colors.

## 7. Профиль баллов

```js
amount.setProperties({
  [propertyKey(amount, 'Minor')]: false,
  [propertyKey(amount, 'Currency')]: false,
  [propertyKey(amount, 'Addon')]: true,
})
```

После этого замени содержимое Addon на библиотечный Core `IconView` по [`IconView cookbook`](../../../../../core/web/components/icon-view/figma/cookbook.md).

- `Major` содержит количество баллов.
- Используй иконку баллов и `IconView.Size`, подтверждённые конкретным макетом или владельцем.
- Размер не превышает line-height текущего AmountStyles `Style`.
- Пока отдельный points pattern не опубликован, не выводи asset или size из названия Style самостоятельно; оставь `[VERIFY]`, если точного источника нет.

Не detach library instances и не создавай части суммы вручную.
