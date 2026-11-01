# CardImage r1 · Draft

[Лабораторная секция](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77294)

Обновить общий пакет данных в Proxy. Экземпляры уже настроены; Apollo: Desktop для всей секции или нужная платформа для отдельного Attach. Подтверждение только ручным прогоном владельца.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [CI-01](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77557) | Show Shadow#17286:0=true, Cover=Alfa Business, Size=68x42, State=Active, Stack=false | 0 нарушений |
| [CI-02](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77573) | Show Shadow#17286:0=true, Cover=Alfa Business, Size=68x42, State=Active, Stack=true | 0 нарушений |
| [CI-03](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77600) | Show Shadow#17286:0=false, Cover=Alfa Business, Size=264x164, State=Active, Stack=false | 0 нарушений |
| [CI-04](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77622) | Show Shadow#17286:0=true, Cover=Alfa Business, Size=68x42, State=Active, Stack=false; width | 1 нарушений · `component:web-corp.card-image.fixed-size-only` |
| [CI-05](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77641) | Show Shadow#17286:0=true, Cover=Alfa Business Premium, Size=24x16, State=Inactive, Stack=false | 1 нарушений · `component:web-corp.card-image.xs-active-only` |
| [CI-06](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77649) | Show Shadow#17286:0=false, Cover=Alfa Business, Size=68x42, State=Active, Stack=true | 1 нарушений · `component:web-corp.card-image.shadow-policy` |
| [CI-07](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77676) | Show Shadow#17286:0=true, Cover=Alfa Business, Size=212x132, State=Locked, Stack=false | 0 нарушений |
| [CI-08](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop?node-id=14728-77696) | Show Shadow#17286:0=true, Cover=None, Size=264x164, State=Active, Stack=false | 0 нарушений |

Draft не означает Ready. Проверка компиляции/IR и повторное открытие ZIP прошли. Новая native-приёмка — NOT_RUN_USER_ONLY.

## Явные пробелы
- Разрешён exact fill override при Cover=None. Тип/порядок Image fill и соответствие утверждённому asset не доказываются текущими предикатами; не выдавать разрешение за исполнение проверки изображения.
- Uppercase фактических символов, штатная маска и последние четыре цифры требуют проверки шаблона текста; текущий Core такого оператора не имеет. Типографика и параметры текста проверяются.
- Назначение карты, соответствие продуктовым данным, число карт/порядок данных, смысл картинки другого банка и нужность SilverLine относятся к контексту или рецепту.

## Источники

Каталоги:
- JSONS/web/components/web-corp/Web _ Corp Components -- CardImage.json

Агентские файлы:
- JSONS/web/components/web-corp/CardImage/contract.generated.json
- JSONS/web/components/web-corp/CardImage/rules.json
- JSONS/web/components/web-corp/CardImage/composition-contract.json
- JSONS/web/components/web-corp/CardImage/agent-context.json
- JSONS/web/components/web-corp/CardImage/contract.overrides.json
- ds-ai-hub/products/ab/components/card-image/instructions.md

Паттерны:
не использовались

Редполитика:
не использовались
