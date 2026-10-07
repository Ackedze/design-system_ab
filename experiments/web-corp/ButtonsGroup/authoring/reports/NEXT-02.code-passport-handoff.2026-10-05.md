# NEXT-02: кодовые поля паспортов и область генерации

Статус: анализ завершён, поля предложены для ревью и не применены. Нормативные main manual, ZIP, правила, Code Connect registry и shared core не менялись. Это передача доказательств и запросов схемы; она не подтверждает Ready для кода.

## Точные источники

Публичные исходные экспорты: ButtonGroup из arui-private/button-group и CorporateContent из arui-private/corporate-content. Пакет 80.7.1, commit c037d0c322ea9774a9c251400d76d41222819b87, registry digest bf7834d4f4b89b187476dc80dd84c93c9130562e88c552073a3343e53e2abad0. Свежая read-only проверка 29 source/build файлов, пяти mapping/consumer файлов, трёх ZIP и lock прошла.

| Контракт | Главный editable manual | Закреплённый ZIP | Predicate source |
| --- | --- | --- | --- |
| arui-private.buttons-group.desktop | r57, 5ba3bf8f2b92bc842f917c209eef2e5a98f939eb0403bb4e204c7154f2cbef6a | r57, manual 5ba3bf8f2b92bc842f917c209eef2e5a98f939eb0403bb4e204c7154f2cbef6a, ZIP 214d9cc0c16a4b7c56e3a69e9151e0d5a36d3d9d05e947bf2122d0e53eb3743a | draft |
| arui-private.corporate-content.desktop | r11, 8c014c78a0163b7d32b9a79e957bebc7cc3f6f85ff0036d4aa60f37f0e666b9f | r12, manual babd61bace922b9ce4c46ddad751c8bf1ebd906fd7c8e828a7a0d02c82d1a408, ZIP 281159400f53164d58c4302b8f3fcecc32da3aff573bb8dd949e9072cd8bc8de | ready |
| arui-private.corporate-content.mobile-web | r6, e68649c64756864d3acaaf1e44c51a41fd82f9e7cb9a9660deaca6e7f63ced31 | r7, manual e64c6fff24a1d16f87cf42f5c506599556323c61b36b93b17e20c4307c335d79, ZIP 7bcabd8ec7659bf1992720b312f42c5e93bfd3c1ee936c445cf916c70f2e6925 | ready |

ButtonsGroup main и ZIP совпадают. У CorporateContent r11/r6 отсутствуют semantic Body API и generation fields принятого ZIP r12/r7, различаются описания и component.library. Правила не различаются. Сначала требуется сверка единственного main source; ZIP не был скопирован поверх него.

Button r31 и Spinner r8 имеют подтверждённые manual pins. Их текущие ZIP не содержат собственных compiled-проекций: новый exporter stamp меняет хеш Spinner, и raw source load Button завершается COMPONENT_DEPENDENCY_LINK. В отдельном диагностическом прогоне добавлены только в памяти точные исторические проекции из canonical файлов; исходные manual/facts воспроизвели обе закреплённые проекции. Это не исправление ZIP и не production fallback. Полные SHA256 и оба результата находятся в JSON handoff.

## Предложенные поля

Для каждого компонента подготовлен code representation со статусом draft и точным package/import/export/commit/registry locator. ButtonsGroup Size строкового VARIANT связывается с числовым props.size; прямого overflow prop нет. CorporateContent сохраняет существующий body slot/content и связывает его с props.children с сохранением порядка. Это подтверждение доступности API, а не принятие соответствия всем правилам.

В четырёх owned Button occurrences сохраняются targetId, semantic role, прямой dependency binding и два точных Size56 source address для Overflow false/true. Индекс elements вычисляется по захваченной видимости и порядку; скрытая средняя кнопка меняет индекс. Label/DisabledState/View связываются только после проверки identity. onClick и action meaning поступают из сценария. Body требует native SLOT proof, а не совпадения имени слоя.

Файлы предложений:

- shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.code-fields.proposed.2026-10-05.json
- shared/design-system_ab/experiments/web-corp/CorporateContent/authoring/reports/next-02.code-fields.proposed.2026-10-05.json
- shared/design-system_ab/experiments/web-corp/CorporateContent/mobile-web/authoring/reports/next-02.code-fields.proposed.2026-10-05.json

## Что блокирует применение

Пять негативных проверок воспроизвели SEMANTIC_TARGET_BINDING: code binding с targetId не поддерживается; native slot с target.body также не поддерживается. Свободная строка path проходит валидатор, но не решает адресацию occurrences или доверие к SLOT. Дополнительно draft code representation не понижает Ready CorporateContent: compiler рассчитывает готовность правил, а не code parity.

Запросы к владельцу schema/core: NEXT02-REPRESENTATION-EVIDENCE, NEXT02-OWNED-OCCURRENCE-CODE-BINDING, NEXT02-NATIVE-SLOT-CODE-BINDING, NEXT02-SCOPED-GENERATION-AUTHORITY. Для каждого в JSON указаны точное текущее ограничение, proposed shape, исходные файлы и acceptance criteria. Общий core самостоятельно не исправлялся. Дополнительный запрос NEXT02-DEPENDENCY-PROJECTION-PACKAGING передаёт владельцу exporter воспроизводимый сбой dependency ZIP: нужен авторитетный экспорт с проверяемыми historical projection stamps либо явная перекомпиляция и обновление всей цепочки pins.

## Область генерации для ревью

ButtonsGroup desktop: Size56, Overflow=false, 1–4 текстовые нормальные кнопки, без addons/Hint/SingleIcon/Loading. Нужно получить native identity/visibility/order, реальные handlers и бизнес-приоритет, измерить достаточную ширину и доказать отсутствие автоматического overflow. 17 Reviewed Figma правил и девять context Draft сохранены. Текущие raw ZIP сначала блокируются на dependency link. После контролируемого воспроизведения точных Button/Spinner projections в памяти достигается отдельный Ready gate и подтверждается Draft-блокировка SOURCE_COMPILE; добавление паспортных полей её не снимает. Для запуска нужен принятый механизм scoped authority либо завершение применимых context gates.

CorporateContent: возможен только предложенный Body content bridge. Figma source Ready r12/r7 подтверждён; направление flex, отступы/токены и background modes в коде остаются gaps CC-GEOMETRY/CC-PADDING/CC-SURFACE. Для заявления layout parity нужны измерения и утверждённый адаптер; для content-only профиля нужна явная область принятия.

Native host получает exact source/dependency pins, code registry lock, fresh external preflight receipt, Body SLOT receipt или buttonsGroupBinding port, реальный сценарий и результаты frontend/live positive-negative-reset. Ни публикация пакета, ни production acceptance, ни новый live test этой передачей не заявляются.

## Проверки

Три accepted ZIP/manual pins подтверждены. Предложенные поля проверены в памяти обоими compiler bundle; parity совпала, ошибок shape нет. Проверки ограничений target/slot и независимости code draft от Ready воспроизведены. V4 load принимает CorporateContent predicate sources. Raw Button/Spinner ZIP load блокируется; контролируемый прогон с доказанными историческими stamps затем отклоняет Draft ButtonsGroup. SHA256 всех нормативных и закреплённых входов повторно проверены: изменений нет.

Машинная передача: shared/design-system_ab/experiments/web-corp/ButtonsGroup/authoring/reports/next-02.code-passport-handoff.2026-10-05.json.
