// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=67467-50172
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/onboarding-hint/onboarding-hint.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=OnboardingHint
import figma from 'figma';
import type { InstanceHandle } from 'figma';

const instance = figma.selectedInstance;
function pick<T>(node: InstanceHandle, name: string, map: Record<string, T>): T {
    const value = node.getEnum(name, map);
    if (value === undefined) throw new Error('Неизвестный ' + name);
    return value;
}
function direct(node: InstanceHandle) {
    return node.findLayers(n => n.type === 'INSTANCE', { path: [], traverseInstances: false })
        .filter((n): n is InstanceHandle => n.type === 'INSTANCE');
}
function ownText(node: InstanceHandle, name: string) {
    const found = node.findLayers(n => n.type === 'TEXT' && n.name === name, { path: [], traverseInstances: false });
    if (found.length > 1) throw new Error('Неоднозначный text ' + name);
    return found[0]?.type === 'TEXT' ? found[0].textContent : undefined;
}
const direction = pick(instance, 'Tail Direction', { '←': 'right', '→': 'left', '↑': 'bottom', '↓': 'top' });
const alignment = pick(instance, 'Tail Position', { Start: '-start', Center: '', End: '-end' });
const position = direction + alignment;
const parts = direct(instance);
const tails = parts.filter(n => n.name === 'Tail');
if (tails.length !== 1 || pick(tails[0], 'Direction', { '←': 'right', '→': 'left', '↑': 'bottom', '↓': 'top' }) !== direction) throw new Error('Несогласованный Tail');
const closers = parts.filter(n => n.name === 'Cross');
if (closers.length !== 1 || closers[0].getPropertyValue('Size') !== '24') throw new Error('Hint source всегда показывает Cross size=24');
const buttons = parts.filter(n => n.name === '[D] Button');
if (buttons.length > 1) throw new Error('Hint поддерживает одну кнопку');
const button = buttons[0];
if (button && (button.getPropertyValue('View') !== 'Text' || button.getPropertyValue('Size') !== '32' || button.getPropertyValue('Shape') !== 'Rectangular' || button.getPropertyValue('SingleIcon') !== 'False' || button.getPropertyValue('DisabledState') !== 'False' || button.getBoolean('Label') !== true || ['Hint', 'LeftAddon', 'RightAddon'].some(name => button.getBoolean(name) !== false))) throw new Error('Hint API не выражает выбранное состояние кнопки');
const label = button?.getString('✎ Label');
if (button && !label) throw new Error('Пустой buttonText скрывает Hint кнопку в source');
const title = ownText(instance, 'Title');

export default {
    id: 'corp-onboarding-hint',
    imports: ["import OnboardingHint from 'arui-private/onboarding-hint';", "import type { ComponentProps } from 'react';"],
    example: figma.code`type Props = ComponentProps<typeof OnboardingHint>;
function Example({ anchor, visible, onClose, dataTestId${button ? ', onButtonClick' : ''} }: {
    anchor: Props['children']; visible: Props['visible'];
    onClose: NonNullable<Props['onClose']>; dataTestId: NonNullable<Props['dataTestId']>;
    ${button ? "onButtonClick: NonNullable<Props['onButtonClick']>;" : ''}
}) {
    if (!dataTestId.trim()) throw new Error('Нужен dataTestId приложения');
    return <OnboardingHint position=${JSON.stringify(position)} visible={visible} onClose={onClose} dataTestId={dataTestId}
        ${title === undefined ? '' : 'tooltipContent={'+JSON.stringify(title)+'}'}
        ${button ? 'buttonText={'+JSON.stringify(label)+'} onButtonClick={onButtonClick}' : ''}
    >{anchor}</OnboardingHint>;
}`,
    metadata: { nestable: false, props: { position, title, buttonText: label,
        sourceImport: 'arui-private/onboarding-hint', sourceExport: 'default',
        requiredContext: ['real anchor ReactElement', 'visible', 'onClose', 'dataTestId', ...(button ? ['onButtonClick'] : [])],
        notes: ['Tail direction is inverted to obtain bubble placement relative to anchor.', 'Anchor geometry, scrolling/portal policy and complete visual parity require application checks.', 'Source uses TooltipDesktop; mobile execution is not verified.'], browserVerified: false } },
};
