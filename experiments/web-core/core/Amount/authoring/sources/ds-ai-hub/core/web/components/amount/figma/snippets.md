---
id: Amount.js-snippets.figma
layer: core
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-08-10
---

# Сниппеты: Amount

Сборка инстанса в Figma. Правила и defaults — `cookbook.md`. Импорт — `importComponentByKeyAsync` по `componentKey` из `keys.json`.

```js
function propKey(inst, prefix) {
  return Object.keys(inst.componentProperties || {}).find((k) => k.startsWith(prefix))
}

function applyAmountProps(instance, props = {}) {
  const minor = propKey(instance, 'Minor')
  const currency = propKey(instance, 'Currency')
  const addon = propKey(instance, 'Addon')
  const out = {}
  if (minor) out[minor] = props.minor ?? true
  if (currency) out[currency] = props.currency ?? true
  if (addon) out[addon] = props.addon ?? false
  Object.assign(out, props.extra || {})
  instance.setProperties(out)
}

function findAmountPart(instance, name) {
  return (
    instance.children.find((node) => node.type === 'INSTANCE' && node.name === name) ||
    instance
      .findAllWithCriteria({ types: ['INSTANCE'] })
      .find((node) => node.name === name)
  )
}

function setAmountPartText(instance, partName, value) {
  const part = findAmountPart(instance, partName)
  if (!part) throw new Error(`Amount part not found: ${partName}`)
  const textKey = Object.keys(part.componentProperties || {}).find(
    (key) => part.componentProperties[key]?.type === 'TEXT',
  )
  if (!textKey) throw new Error(`TEXT property not found: ${partName}`)
  part.setProperties({ [textKey]: value })
  return part
}

function setAmountMinor(instance, { value = ',00', opacity = 'False' } = {}) {
  const minor = setAmountPartText(instance, 'Minor', value)
  minor.setProperties({ Opacity: opacity })
  return minor
}

function setAmountCurrency(instance, { type = '₽', opacity = 'False', custom } = {}) {
  const currency = findAmountPart(instance, 'Currency')
  if (!currency) throw new Error('Amount part not found: Currency')
  currency.setProperties({ Type: type, Opacity: opacity })
  if (type === 'Custom') setAmountPartText(instance, 'Currency', custom ?? ' Custom ')
  return currency
}
```
