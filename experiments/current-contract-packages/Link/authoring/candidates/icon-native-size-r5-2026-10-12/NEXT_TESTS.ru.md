# Проверка Link r5 без detach

В Editor **0.2.103** загрузить `Link.r5.candidate.component-contract.zip`
из этой папки. Общие параметры Link: **M (16-24), оба Addon=true,
Line=Solid, Label=Label**. Справа — flag24.

| Компонент | Параметры | Ожидаем |
|---|---|---|
| [LINK-15 · неподходящий размер](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | Через публичный swap слева выбрать rocket Size=20, как во втором предыдущем отчёте. | Одно нарушение `component:web-core.link.left-icon-native-size.24.1.1`; 8 resolved, 0 inconclusive. |
| [LINK-15 · RESET](https://www.figma.com/design/I3MsagXR8Tz2eZcGtIgUk8/Workshop-AI?node-id=13666-68129) | Через тот же порт вернуть rocket Size=24; сохранить остальные параметры. | 0 нарушений, 8 resolved, 0 inconclusive. |

Отдельный JSON после каждой строки. Меняется размер выбранного компонента
иконки; ручное изменение H и detach не требуются.
