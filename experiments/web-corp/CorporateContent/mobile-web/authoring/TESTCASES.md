# [M] CorporateContent r6 — проверки в Editor

Импортировать мобильный r6 ZIP и выбрать экземпляр `[M] CorporateContent`.
Сначала зафиксировать контрольный отчёт. Если получен `instance-structure-needs-remap`
для одинаковых Spacer keys, проверка считается незавершённой; unknown не является PASS.

Каждое изменение проверять отдельно и затем возвращать библиотечное значение.
Во всех случаях сохранять JSON-отчёт с manual revision/hash.

01.10.2026 пользовательский отчёт Editor 0.2.73 от 17:59:37 UTC подтвердил
совмещённый negative: clipping=true и modal-bg (white) дают ровно два violation;
остальные 15 проверок compliant. 6/6 matches, полный audit, unknown/notExecuted=0,
Body payload пропущен по открытой native SLOT policy. Shared compiler, engine
и Editor exact replay подтверждены. Evidence:
`reports/live-review-editor-0.2.73.2026-10-01T17-59-37-209Z.json`.
Контроль/reset подтверждён пользовательским JSON от 18:09:18 UTC:
clipping=false, page grey 136853:0, 17 compliant / 0 violations, 6/6 matches.
Владелец принял шесть норм сообщением «всё ок»; Ready относится к этой области.
Приёмка: `reports/acceptance.json`. Полная индивидуальная live-матрица всех
protected capabilities в предоставленных отчётах не заявляется.

| Полная норма | RuleID | Сценарии |
|---|---|---|
| Body допускает произвольное внешнее содержимое через native SLOT; его payload не проверяется контрактом host | `component:corporate-content.mobile-web.body.composition-content` | ALLOW: произвольная композиция и несколько детей. UNKNOWN: утрачен или неверен slotContentId. Корневые нарушения продолжают обнаруживаться |
| Прямые overrides девяти root layout capabilities запрещены относительно effective library baseline; режим высоты свободен | `component:corporate-content.mobile-web.corporate-content.auto-layout-1` | PASS: baseline. FAIL: right padding 30 вместо baseline 20 в текущем mode. ALLOW: HUG высоты |
| Root clipsContent должен сохранять library baseline false | `component:corporate-content.mobile-web.corporate-content.layout-clips-content` | PASS: false. FAIL: true. UNKNOWN: отсутствует независимый baseline |
| Системный мобильный grid style нельзя менять или отвязывать | `component:corporate-content.mobile-web.corporate-content.layout-grid-style-id` | PASS: библиотечный grid style. FAIL: пустой или другой style. UNKNOWN: отсутствует baseline |
| Для root разрешены только page modes base-bg-alt и base-bg; modal modes запрещены | `component:corporate-content.mobile-web.corporate-content.variable-modes-22d83aeb0d0d643a5359f63464a2ab81838fbe9f` | PASS: 136853:0 и 136853:1. FAIL: 136941:0 и 136941:1 |
| Прямые overrides root fill, stroke, opacity, radius и effects запрещены относительно library baseline | `component:corporate-content.mobile-web.corporate-content.visual-style-1` | PASS: baseline. FAIL: root opacity 0.5. ALLOW: изменение собственного содержимого Body |

Если сценарии рисуются в Figma, полную норму и RuleID показывать рядом с каждым
отдельным тестом. Успешная проверка шести правил не означает проверку Spacer=24,
Section, страницы, frontend parity или publication.
