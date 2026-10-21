# Проверка BenefitCard r16 в Apollo

В запущенном Proxy должны выдаваться BenefitCard r16 и Link r8. Выделяйте конкретный экземпляр, а не смешанный desktop/mobile борд. После выбора платформы запускайте новую проверку.

| Компонент | Параметры | Ожидаем |
| --- | --- | --- |
| [BC10-03-desktop](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14136-68971) | Платформа Apollo: Desktop; Bottom включён; Link: M (16-24). Высоту Link Fixed сохраняем. | 0 нарушений. Нет CardPlacement/Hug диагностики. |
| [BC10-04-mobile-web](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14136-69023) | Платформа Apollo: MobileWeb; Bottom включён; Link: L (18-24), как в присланном отчёте. | 1 нарушение: `component:web.benefit-card-bottom-link-size-14-20.1.1.1`; подпись «Размер ссылки», допустим S (14-20), включая вариант Size-20 icons. |
| [BC10-03-desktop](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14136-68971) | Сам компонент не меняем; Платформа Apollo: MobileWeb. | 1 нарушение: `component:web.benefit-card-platform-version-must-match.desktop.1.1`; выбранная платформа не соответствует desktop-компоненту. |

Существующий пробел покрытия скрытых аддонов Link учитывается отдельно: четыре not-applicable результата могут сохранять неполное покрытие. Это не новое нарушение высоты, платформы или размера ссылки. Прежние native-прогоны остальных норм не повторяем.
