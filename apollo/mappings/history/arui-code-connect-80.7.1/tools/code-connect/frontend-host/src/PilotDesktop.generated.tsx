// Generated projection of pilot.desktop.plan.json; not a browser/typecheck acceptance.
import type { MouseEventHandler } from "react";
import { CorporateContent } from "arui-private/corporate-content";
import { ButtonGroup } from "arui-private/button-group";

type PilotHandlers = { onSend: MouseEventHandler<HTMLButtonElement>; onCancel: MouseEventHandler<HTMLButtonElement> };

export function PilotDesktop({ onSend, onCancel }: PilotHandlers) {
    return (<CorporateContent><ButtonGroup size={56} primaryFirst={true} maxVisibleButtons={4} elements={[{ children: "Отправить", disabled: false, onClick: onSend, dataTestId: "send" }, { children: "Отменить", disabled: false, onClick: onCancel, dataTestId: "cancel" }]} /></CorporateContent>);
}
