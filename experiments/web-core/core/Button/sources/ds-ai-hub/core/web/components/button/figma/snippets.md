---
id: Button.js-snippets.figma
layer: core
platforms: [web]
targets: [figma]
status: verified
lastReviewed: 2026-08-10
---

# Сниппеты: Button

Сборка инстанса в Figma. Технические и рабочие defaults — `cookbook.md`. Keys — `keys.json`.

```js
function propKey(inst, prefix) {
  return Object.keys(inst.componentProperties || {}).find((k) => k.startsWith(prefix))
}

/** Рабочий default Secondary/56. Технический default Figma Accent/72 — в cookbook и model.json. */
function applyButtonProps(instance, props = {}) {
  const labelVis = propKey(instance, 'Label#') || propKey(instance, 'Label')
  const labelText = propKey(instance, '✎ Label')
  const hintVis = propKey(instance, 'Hint#') || propKey(instance, 'Hint')
  const hintText = propKey(instance, '✎ Hint')
  const left = propKey(instance, 'LeftAddon')
  const right = propKey(instance, 'RightAddon')
  const hasHintText = typeof props.hint === 'string' || typeof props.hint === 'number'
  const out = {
    View: props.view ?? 'Secondary',
    Size: props.size ?? '56',
    Shape: props.shape ?? 'Rectangular',
    SingleIcon: props.singleIcon ? 'True' : 'False',
    DisabledState: props.disabled ? 'True' : 'False',
  }
  if (labelVis) out[labelVis] = props.labelVisible !== false
  if (labelText && props.label != null) out[labelText] = props.label
  if (hintVis) out[hintVis] = props.hintVisible ?? hasHintText
  if (hintText && hasHintText) out[hintText] = String(props.hint)
  if (left) out[left] = props.leftAddon ?? false
  if (right) out[right] = props.rightAddon ?? false
  Object.assign(out, props.extra || {})
  instance.setProperties(out)
}

/**
 * После Addon `Type=Spinner` — цвет спиннера по view.
 * Вызывать после `Type=Spinner` на Addon; искать вложенный инстанс с `name === 'Spinner'`.
 * Канон матрицы — `../bridge.md` → Loading (здесь не дублировать таблицу).
 */
function configureButtonLoadingSpinner(button, view) {
  const matrix = {
    accent: { inverted: 'True', static: 'True' },
    primary: { inverted: 'True', static: 'False' },
    secondary: { inverted: 'False', static: 'False' },
    outlined: { inverted: 'False', static: 'False' },
    transparent: { inverted: 'False', static: 'False' },
    text: { inverted: 'False', static: 'False' },
  }
  const key = String(view || button.componentProperties?.View?.value || 'secondary').toLowerCase()
  const cfg = matrix[key] || matrix.secondary
  const spinner = button.findOne((n) => n.type === 'INSTANCE' && n.name === 'Spinner')
  if (!spinner) return null
  spinner.setProperties({ Inverted: cfg.inverted, Static: cfg.static })
  return spinner
}

/** textResizing=fill: Text/Label/Hint FILL+HEIGHT; Label и Hint — textAlignHorizontal CENTER. */
function applyButtonFillTextLayout(button) {
  const textFrame = button.findOne((n) => n.name === 'Text' && n.type === 'FRAME')
  const label = button.findOne((n) => n.name === 'Label' && n.type === 'TEXT')
  const hint = button.findOne((n) => n.name === 'Hint' && n.type === 'TEXT')
  if (textFrame) textFrame.layoutSizingHorizontal = 'FILL'
  for (const layer of [label, hint]) {
    if (!layer) continue
    layer.layoutSizingHorizontal = 'FILL'
    layer.textAutoResize = 'HEIGHT'
    layer.textAlignHorizontal = 'CENTER'
  }
  return { textFrame, label, hint }
}

/** nowrap=true: кнопка HUG, Label WIDTH_AND_HEIGHT. nowrap=false в узком контейнере: FILL + Label HEIGHT. */
function applyButtonNowrapLayout(button, { nowrap, textFrame, label }) {
  if (nowrap) {
    button.layoutSizingHorizontal = 'HUG'
    if (label) {
      label.layoutSizingHorizontal = 'HUG'
      label.textAutoResize = 'WIDTH_AND_HEIGHT'
    }
    if (textFrame) textFrame.layoutSizingHorizontal = 'HUG'
  } else {
    button.layoutSizingHorizontal = 'FILL'
    if (textFrame) textFrame.layoutSizingHorizontal = 'FILL'
    if (label) {
      label.layoutSizingHorizontal = 'FILL'
      label.textAutoResize = 'HEIGHT'
    }
  }
}
```
