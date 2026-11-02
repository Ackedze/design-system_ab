/**
 * Code Connect: сопоставление Figma-компонента и React-компонента одной сущности.
 *
 * Вход:  figma.json (свойства и значения вариантов), code.json (пропсы и их значения),
 *        code-connect.overrides.json (авторские маппинги хаба, побеждают автоматические).
 * Выход: code-connect.json — для каждого публичного Figma-компонента таблица
 *        «свойство Figma → проп React» с переводом значений и статусом покрытия.
 */

import { compact, uniq } from '../../adapters/lib/fsx.mjs';

/** Figma-свойство → вероятные имена React-пропа (кроме совпадения по имени). */
const SYNONYMS = {
  type: ['view', 'type', 'variant'],
  view: ['view', 'type'],
  style: ['view'],
  presets: ['view', 'type'],
  skeleton: ['showSkeleton', 'skeleton', 'loading'],
  loading: ['loading', 'showSkeleton'],
  disabled: ['disabled'],
  disabledstate: ['disabled'],
  position: ['level', 'position'],
  level: ['level'],
  compact: ['compact', 'compactView'],
  open: ['open', 'expanded', 'isOpen'],
  expanded: ['expanded', 'open'],
  selected: ['selected', 'checked'],
  checked: ['checked'],
  error: ['error'],
  size: ['size'],
  shape: ['shape'],
  block: ['block'],
  backgroundcolor: ['backgroundColor', 'background'],
  background: ['background', 'withBackground', 'withBackgroundPlate'],
  orientation: ['orientation', 'direction'],
  direction: ['direction', 'orientation'],
  axis: ['orientation', 'direction'],
};

/** Пропсы без смысла для дизайна — не считаем «только в React». */
const TECHNICAL_PROPS = /^(className|dataTestId|data-test-id|id|style|ref|children|.*ClassName|.*Props|on[A-Z].*)$/;

/** Интерактивные состояния: в Figma это варианты, в коде — поведение, а не пропсы. */
const INTERACTION_STATE = /^(hover|hovered|pressed|press|focus|focused|active|filled)(state)?$/i;

/**
 * Стандартные HTML-атрибуты: в документации пропсов их нет (наследуются от HTML-элемента),
 * но Figma-состояния на них отображаются. Используются только если в коде нет одноимённого пропа.
 */
const HTML_ATTRIBUTES = [
  { name: 'disabled', type: 'boolean', html: true },
  { name: 'readOnly', type: 'boolean', html: true },
  { name: 'required', type: 'boolean', html: true },
];

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const cleanProp = (p) => String(p).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/#\d+:\d+$/, '').trim();

export function buildCodeConnect({ entity, figma, code, semantics, overrides }) {
  if (!figma?.components?.length || !code) return null;

  const props = (code.props ?? []).map((p) => ({ ...p, values: p.values ?? valuesFromType(p.type) }));
  const byName = new Map(props.map((p) => [norm(p.name), p]));
  for (const a of HTML_ATTRIBUTES) if (!byName.has(norm(a.name))) byName.set(norm(a.name), a);
  const manual = overrides?.properties ?? [];
  const declaredFigmaOnly = overrides?.figmaOnly ?? [];
  // Выбор Figma-компонента сам задаёт пропсы: [D][Promo] FAQ → promo, TableView :: Vertical → direction.
  const fixedByComponent = new Map((overrides?.components ?? []).map((c) => [c.figma, c]));
  const referenced = new Set([
    ...fixedByComponent.keys(),
    ...manual.map((m) => m.figmaComponent),
    ...declaredFigmaOnly.map((f) => f.figmaComponent),
  ].filter(Boolean));

  const components = publicComponents(entity, figma, semantics, referenced).map((fc) => {
    const properties = Object.entries(fc.properties ?? {})
      // "raw" — служебное имя варианта у компонентов без свойств, а не свойство.
      .filter(([rawProp]) => rawProp !== 'raw')
      .map(([rawProp, figmaValues]) => {
      const figmaProp = cleanProp(rawProp);
      // Сначала маппинг именно этого компонента, затем общий (без figmaComponent).
      const m = manual.find((x) => norm(x.figma) === norm(figmaProp) && x.figmaComponent === fc.name)
        ?? manual.find((x) => norm(x.figma) === norm(figmaProp) && !x.figmaComponent);
      if (m) return manualMapping(figmaProp, figmaValues, m, byName);

      const declared = declaredFigmaOnly.find((x) =>
        (norm(x.property) === norm(figmaProp) || norm(x.property).startsWith(norm(figmaProp)))
        && (!x.figmaComponent || x.figmaComponent === fc.name));
      // Ручное объявление «только Figma» побеждает автоматику, даже если она нашла похожий проп.
      if (declared) return compact({ figma: figmaProp, status: 'figma-only', note: declared.workaround, origin: 'manual' });
      const target = findProp(figmaProp, figmaValues, byName);
      if (!target && INTERACTION_STATE.test(norm(figmaProp))) {
        return { figma: figmaProp, status: 'interaction-state', origin: 'auto' };
      }
      if (!target) {
        return { figma: figmaProp, status: 'figma-only', origin: 'auto' };
      }
      return autoMapping(figmaProp, figmaValues, target);
    });
    const fixed = fixedByComponent.get(fc.name);
    return {
      ...compact({ figma: fc.name, key: fc.key, platform: fc.platform, fixedProps: fixed?.props, note: fixed?.note }),
      properties,
    };
  });

  const used = new Set(components.flatMap((c) => [
    ...c.properties.map((p) => p.react).filter(Boolean),
    ...c.properties.flatMap((p) => (p.kind === 'props' ? Object.values(p.values ?? {}).flatMap((v) => Object.keys(v ?? {})) : [])),
    ...Object.keys(c.fixedProps ?? {}),
  ]));
  const reactOnly = props.filter((p) => !p.from && !used.has(p.name) && !TECHNICAL_PROPS.test(p.name)).map((p) => p.name);

  const all = components.flatMap((c) => c.properties);
  const count = (s) => all.filter((p) => p.status === s).length;
  const coverage = {
    properties: all.length,
    mapped: count('mapped'),
    partial: count('partial'),
    figmaOnly: count('figma-only'),
    interactionStates: count('interaction-state'),
  };
  const undeclaredGaps = all.filter((p) => p.status === 'partial' || (p.status === 'figma-only' && p.origin !== 'manual')).length;

  return compact({
    $schema: 'hub/code-connect@1',
    react: compact({ component: code.component, import: code.import ?? code.package, package: code.package }),
    status: coverage.properties === 0 ? 'no-properties' : undeclaredGaps === 0 ? 'complete' : coverage.mapped || coverage.partial ? 'partial' : 'none',
    coverage,
    components,
    reactOnly,
    notes: overrides?.notes,
  });
}

/**
 * Публичные Figma-компоненты: из semantics, по имени семейства, иначе все main без служебных.
 * Компоненты, на которые ссылаются ручные маппинги (referenced), добавляются всегда.
 */
function publicComponents(entity, figma, semantics, referenced = new Set()) {
  const live = figma.components.filter((c) => c.status !== 'deprecated' && c.role === 'main' && !/^[🔩🔒❌]/u.test(c.name));
  const declared = new Set((semantics?.components ?? []).map((s) => s.figmaName));
  const family = [entity.name, figma.family].filter(Boolean).map(norm);
  let base = live.filter((c) => declared.has(c.name));
  if (!base.length) base = live.filter((c) => family.includes(norm(c.name.replace(/\[(D|M|T|Promo)\]/g, ''))));
  if (!base.length) base = live;
  const extra = figma.components.filter((c) => referenced.has(c.name) && !base.includes(c));
  return [...base, ...extra];
}

function findProp(figmaProp, figmaValues, byName) {
  const key = norm(figmaProp);
  const base = key.replace(/state$/, '');
  const candidates = uniq([figmaProp, base, ...(SYNONYMS[key] ?? []), ...(SYNONYMS[base] ?? [])])
    .map((n) => byName.get(norm(n)))
    .filter(Boolean);
  // Из нескольких кандидатов берём тот, чьи значения лучше совпадают со значениями Figma.
  let best = null;
  let bestScore = -1;
  for (const p of candidates) {
    const score = figmaValues.filter((v) => translateValue(v, p) !== undefined).length;
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return best && (bestScore > 0 || norm(best.name) === key || norm(best.name) === base) ? best : null;
}

function autoMapping(figmaProp, figmaValues, prop) {
  const values = {};
  for (const v of figmaValues) values[v] = translateValue(v, prop) ?? null;
  const mapped = Object.values(values).filter((v) => v !== null).length;
  const isNode = /ReactNode/.test(String(prop.type ?? ''));
  return compact({
    figma: figmaProp,
    react: prop.name,
    kind: kindOf(prop),
    values,
    status: mapped === figmaValues.length ? 'mapped' : 'partial',
    origin: 'auto',
    note: prop.html ? 'HTML-атрибут: в документации пропсов его нет'
      : isNode && mapped ? 'Проп принимает ReactNode: вместо true передайте текст или элемент' : undefined,
  });
}

function manualMapping(figmaProp, figmaValues, m, byName) {
  const values = {};
  for (const v of figmaValues) values[v] = m.values && v in m.values ? m.values[v] : null;
  const prop = m.react ? byName.get(norm(m.react)) : null;
  // Без react, но со значениями-объектами: одно значение Figma задаёт набор пропсов
  // (State=Disable → { disabled: true }, State=Error → { error: "…" }).
  if (!m.react && m.values && Object.values(m.values).some((v) => v && typeof v === 'object')) {
    const mappedProps = Object.values(values).filter((v) => v !== null).length;
    return compact({
      figma: figmaProp,
      kind: 'props',
      values,
      status: mappedProps === figmaValues.length ? 'mapped' : 'partial',
      origin: 'manual',
      note: m.note,
    });
  }
  if (!m.react) return compact({ figma: figmaProp, status: 'figma-only', note: m.note, origin: 'manual' });
  const mapped = Object.values(values).filter((v) => v !== null).length;
  return compact({
    figma: figmaProp,
    react: m.react,
    kind: prop ? kindOf(prop) : undefined,
    values,
    status: mapped === figmaValues.length ? 'mapped' : 'partial',
    origin: 'manual',
    note: [m.note, prop ? null : `проп ${m.react} не найден в коде`].filter(Boolean).join('; ') || undefined,
  });
}

/** Значение Figma → значение React или undefined, если перевести нельзя. */
export function translateValue(figmaValue, prop) {
  const v = String(figmaValue).trim();
  const type = String(prop.type ?? '');

  // ReactNode-проп с булевым Figma-свойством (ErrorState → error): истинность включает состояние.
  if (type === 'boolean' || type === 'bool' || /\bboolean\b/.test(type) || (/ReactNode/.test(type) && /^(true|false)$/i.test(v))) {
    if (/^(true|on|yes|да)$/i.test(v)) return true;
    if (/^(false|off|no|нет)$/i.test(v)) return false;
    return undefined;
  }

  const values = prop.values ?? [];
  if (!values.length) {
    if (/^(number)$/.test(type) && /^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    return undefined;
  }

  const nv = norm(v);
  const exact = values.find((x) => norm(x) === nv);
  if (exact !== undefined) return exact;
  if (/^-?\d+$/.test(v)) {
    const num = values.find((x) => x === Number(v));
    if (num !== undefined) return num;
  }
  // "Level 1 (outer)" → "outer", "base-bg-alt (gray)" → "base-bg-alt": самое длинное значение, входящее в строку Figma.
  const contained = values
    .filter((x) => typeof x === 'string' && norm(x).length >= 3 && nv.includes(norm(x)))
    .sort((a, b) => norm(b).length - norm(a).length);
  return contained[0];
}

function kindOf(prop) {
  const type = String(prop.type ?? '');
  if (/\bboolean\b/.test(type)) return 'boolean';
  if (prop.values?.length) return prop.values.every((x) => typeof x === 'number') ? 'number' : 'enum';
  if (type === 'number') return 'number';
  return type === 'string' ? 'text' : 'other';
}

/** '"a" | "b" | 16' → ['a', 'b', 16] — для пропсов, где значения есть только в строке типа. */
function valuesFromType(type) {
  if (!type || !type.includes('|')) return undefined;
  const parts = type.split('|').map((s) => s.trim()).filter((s) => s && s !== 'undefined' && s !== 'null');
  const values = parts.map((p) => {
    if (/^"[^"]*"$/.test(p) || /^'[^']*'$/.test(p)) return p.slice(1, -1);
    if (/^-?\d+(\.\d+)?$/.test(p)) return Number(p);
    return undefined;
  });
  return values.every((x) => x !== undefined) ? values : undefined;
}
