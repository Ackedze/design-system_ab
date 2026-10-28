const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = __dirname, A = path.resolve(R, '../../../..');
const read = p => JSON.parse(fs.readFileSync(p));
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const changes = [];
for (const name of ['Text', 'Slider', 'SegmentedControl']) {
  const dir = R + '/candidate/' + name;
  const manual = read(R + '/../foundation-four-drafts-2026-10-27/' + name + '/contract.manual.json');
  const facts = read(dir + '/variant-evidence.json');
  assert.equal(manual.metadata.revision, 1);
  manual.metadata.revision = 2;
  manual.metadata.updatedAt = new Date().toISOString();
  if (name === 'Text') {
    const rule = manual.rules.find(r => r.id.endsWith('.owned-text'));
    const removed = rule.constraints.filter(c => ['layout.mode', 'appearance.radius'].includes(c.fact));
    assert.equal(removed.length, 2);
    rule.constraints = rule.constraints.filter(c => !removed.includes(c));
    rule.rationale = rule.message = 'Text: текстовый слой сохраняет визуальные свойства библиотечного эталона. Типографика и цвет проверяются отдельными правилами.';
    changes.push({name, removedInapplicableFacts: removed.map(c => c.fact), meaningChanged: false});
  }
  if (name === 'Slider') {
    const target = {id: 'target.pips', semanticRole: 'pips', label: 'Pips', lineage: [manual.component.componentId, 'Pips'],
      nameHint: 'Pips', pathHint: 'Slider / Pips', resolution: 'resolved', representationHints: [], variantHints: []};
    for (const rep of manual.representations) {
      const variants = facts.variants.filter(v => v.componentSetKey === rep.locator.componentKey);
      assert(variants.length);
      for (const v of variants) {
        const shape = facts.structures[v.structureId], texts = shape.filter(n => n.type === 'TEXT');
        if (v.properties.Pips === 'False') { assert.equal(texts.length, 0); continue; }
        assert.equal(v.properties.Pips, 'True'); assert.equal(texts.length, 10);
        const occurrence = facts.occurrences.find(o => o.componentKey === v.componentKey);
        const pips = shape.filter(n => n.type === 'INSTANCE' && !n.path.includes(' / ') && occurrence.namesByPath[n.path] === 'Pips');
        assert.equal(pips.length, 1);
        assert(texts.every(n => n.path.startsWith(pips[0].path + ' / ')));
        const hint = {representationId: rep.id, componentKey: v.componentKey, pathHint: rep.locator.name + ' / ' + pips[0].path};
        target.variantHints.push(hint);
        if (!target.representationHints.some(h => h.representationId === rep.id))
          target.representationHints.push({representationId: rep.id, pathHint: hint.pathHint});
      }
      const witnessed = target.variantHints.find(h => h.representationId === rep.id);
      assert(witnessed);
      for (const v of variants.filter(v => v.properties.Pips === 'False'))
        target.variantHints.push({representationId: rep.id, componentKey: v.componentKey, pathHint: witnessed.pathHint});
    }
    manual.targets.push(target);
    const rule = manual.rules.find(r => r.id.endsWith('.visible-text-typography'));
    rule.targetId = target.id;
    rule.applicability.variants = {Pips: ['True']};
    rule.rationale = rule.message = 'Slider: типографика подписей Pips соответствует библиотечному эталону; текст подписей можно менять. При Pips=False правило не применяется.';
    changes.push({name, target: target.id, supportedRootVariants: target.variantHints.length, noTextVariantsProven: true, meaningChanged: false});
  }
  if (name === 'SegmentedControl') {
    for (const rule of manual.rules) {
      const collection = rule.constraints.find(c => c.type === 'memberCollection')?.collection;
      if (!collection) continue;
      const capacity = Number(rule.id.match(/capacity-(\d)$/)[1]);
      if (capacity > 2) collection.nonMemberReferenceTypes = ['FRAME'];
    }
    changes.push({name, sourceProvenReferenceSiblings: ['FRAME'], meaningChanged: false,
      gapPreserved: 'Nested Segment contract and two-word labels remain explicitly outside this correction.'});
  }
  write(dir + '/contract.manual.json', manual);
}
write(R + '/candidate-changes.json', changes);
console.log(changes);
