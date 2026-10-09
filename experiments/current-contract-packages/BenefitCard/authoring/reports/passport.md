# Паспорт BenefitCard r4

- Component ID: web.benefit-card; manual revision: 4; весь пакет Draft.
- Public Figma representations: desktop D / mobile-web M, по 16 вариантов.
- 9 targets / 256 exact portable native bindings; identity policy 2.
- 21 source rules / 37 IR / 4 non-executable.
- Runtime: Editor 0.2.94, core 0.1.13; nativeTargetPropertyFactsVersion=1, textContentFactsVersion=1.
- ViewportClass: desktop (≥768 px) или mobile-web (<768 px), явно по сценарию.
- CardPlacement: single или group. Для single высота Hug; группа — отдельный рецепт.
- Link, IconView, BackgroundPlate: acceptance/pins открыты. Общая icon policy Draft.
- Code API availability исторически подтверждена отдельно; code parity и generation profiles не приняты.
- 46 private counterfactual cases PASS; полная live acceptance r4 открыта.
- Library drift: FIXED height у двух default эталонов; Primary title у 8 D Compact=True.

Подробности: rule-coverage.json, gaps.json, owner-decisions.r4.json. Эталонный дефект не превращает нарушение в PASS.
