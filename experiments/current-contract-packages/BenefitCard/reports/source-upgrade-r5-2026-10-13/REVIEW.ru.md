Принята версия Link r5: четыре варианта Size и typed порты иконок 20 px.
В черновике исходной Corp Promo библиотеки обновлены только вложения Link
17:12838 и 17:12843 в D/M BottomContent. Восемь прежних настроек, layout,
текст и типографика сохранены; native readback подтверждает 10 полей / 4 Size.

Независимый pristine reference Link в Workshop совпал с точным pin r5.
Это preflight источника, а не свежая приёмка родительского BenefitCard.
В publisher file тот же hash различается только по локальным INSTANCE_SWAP ID;
переносимость pin между файлами не принята. Исходный отказ сохранён, guard не изменён.

Публикация не выполнена. После публикации двух BottomContent и обновления
библиотек в Workshop нужны baseline D/M и затронутые negative/RESET.
BenefitCard r7 и Link r5 остаются Draft, v4 интеграция HELD.
Рабочий BenefitCard r5, candidate ZIP и Editor/shared core не изменялись.

`verify.cjs` использует существующий Editor reader. Native reference получен
неизменёнными collectNodes/captureVariantReference через выбранные exports
в temporary minified bundle; полный bundle в evidence не копируется.
`read-pristine-source.js` содержит шаблон с маркером для этого bundle;
для Workshop заменяется только pageId на 8701:32684.
