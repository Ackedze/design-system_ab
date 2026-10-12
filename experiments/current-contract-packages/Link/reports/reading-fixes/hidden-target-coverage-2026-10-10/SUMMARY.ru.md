# Hidden target coverage: локальное исправление

Editor **0.2.100**, core **0.1.16**. Новый report opt-in
`hiddenTargetCoverageVersion=1` отличает доказанный present/resolved скрытый
дочерний target в scope self от отсутствующей/неопределённой цели. Для
visibility baseline должен быть известен и совпадать с actual; иначе gap
сохраняется. Структурные assertions и scope descendants не исключаются.

16 synthetic regressions проверяют hidden/visible, mandatory violation,
font negative/RESET, missing/stale/foreign/duplicate/incomplete proof, forged
claims и legacy option. Два Editor теста проверяют download/replay marker.
Полные gates: core 309/309, Editor 828/828, Apollo v4 611/611, Apollo root 81 files.

12 неизменённых пользовательских snapshots replay exact по raw Engine и
старому Editor report. При новой опции Link Addon=false имеет три context-only
пункта вместо семи; BenefitCard hidden Title D/M — три вместо четырёх.
Обязательное нарушение Title и видимые RESET сохранены. Это offline replay,
installed Editor 0.2.100 ещё NOT_RUN_USER_ONLY.

Apollo v4 runtime bytes и все 216 source inventory pins совпадают. Report
modules в runtime inventory не входят. Метаданные сборки отражают core 0.1.16;
main/UI пересобраны с новым build seal. Shared runtime source/compiler/capture
и admission не изменены. Нужен fresh inventory handoff для consumer adoption,
автоматической перепривязки SDK/Proxy не выполнено.

Link r3 и BenefitCard r5 ZIP/manual/IR/статусы не изменены; Source/context,
полная live приёмка, Ready/release остаются открыты. Google нормы не менялись.
Проверка: `node replay.cjs`, после seal читает только frozen files.
