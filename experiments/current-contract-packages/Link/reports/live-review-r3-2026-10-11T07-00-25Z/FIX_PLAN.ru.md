EDITOR-DECLARED-TARGET-CONFIGURATION-001 / CC-COMPAT-DECLARED-TARGET-CONFIGURATION-04

Подтверждённый scope: разрешённые Left/Right icon 24 INSTANCE_SWAP в Link r3
теряют все declared targets после выбора другого asset. RESET восстанавливает
их. Норма разрешает swap через точный публичный порт; менять её не требуется.

Исправление должно отделить identity native occurrence от выбранного asset
по доказанному source address, owner и typed mainComponent port. Проекция
reference обязана учитывать только явно разрешённое внешнее содержимое этого
порта и сопоставлять его с исходным native slot. Просто исключить значения
INSTANCE_SWAP из root hash недостаточно: меняются subtree paths/types/identity.
Снимать весь pin или доверять captured role/name нельзя.

Критерии проверки:

- разрешённый swap: exact native ports/source/owner, 8 resolved targets,
  0 inconclusive; root/label/container constraints продолжают исполняться;
- изменение fontSize/root padding либо высоты swapped instance обнаруживается
  собственным constraint; custom asset не отменяет ограничения slot/host;
- swap через иной порт, missing/wrong type/source/owner, duplicate occurrence,
  stale host structure и insufficient capture остаются UNKNOWN/нарушением
  согласно действующему constraint, без обхода guards;
- старые identity/configuration policies и закрытые TEXT/BOOLEAN/Line/RESET
  replays сохраняются; новый policy при необходимости имеет явный opt-in;
- общий core → Editor → Apollo v4 проверяются отдельно; native повтор после
  новой сборки, consumer adoption и Ready не объявляются по synthetic PASS.

Приватные actual captures используются в reports/replay, в продуктовые fixtures
попадает минимальный synthetic regression с тем же публичным swap механизмом.
Фикс в этом review не реализован.
