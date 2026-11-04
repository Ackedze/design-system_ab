// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=31961-32462
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/onboarding-tooltip/onboarding-tooltip.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=OnboardingTooltip
import figma from 'figma';
import type { InstanceHandle } from 'figma';

const instance = figma.selectedInstance;
function pick<T>(node: InstanceHandle, name: string, map: Record<string, T>): T {
    const value = node.getEnum(name, map);
    if (value === undefined) throw new Error('Неизвестный ' + name);
    return value;
}
function flag(node: InstanceHandle, name: string) {
    const value = node.getBoolean(name);
    if (typeof value !== 'boolean') throw new Error('Ожидается BOOLEAN ' + name);
    return value;
}
function direct(node: InstanceHandle) {
    return node.findLayers(n => n.type === 'INSTANCE', { path: [], traverseInstances: false })
        .filter((n): n is InstanceHandle => n.type === 'INSTANCE');
}
function child(node: InstanceHandle, name: string) {
    const found = direct(node).filter(n => n.name === name);
    if (found.length !== 1) throw new Error('Не найден однозначный child ' + name);
    return found[0];
}
function ownText(node: InstanceHandle, name: string, required: boolean) {
    const found = node.findLayers(n => n.type === 'TEXT' && n.name === name, { path: [], traverseInstances: false });
    if (found.length > 1 || (required && found.length !== 1)) throw new Error('Неоднозначный text ' + name);
    return found[0]?.type === 'TEXT' ? found[0].textContent : undefined;
}
const direction = pick(instance, 'Tail Direction', { '←': 'right', '→': 'left', '↑': 'bottom', '↓': 'top' });
const alignment = pick(instance, 'Tail Position', { Start: '-start', Center: '', End: '-end' });
const position = direction + alignment;
const tail = child(instance, '👻 TooltipTail');
if (tail.getPropertyValue('View') !== 'Tooltip' || pick(tail, 'Direction', { '←': 'right', '→': 'left', '↑': 'bottom', '↓': 'top' }) !== direction) throw new Error('Несогласованный TooltipTail');
const body = child(instance, 'Text content');
const footer = child(instance, 'Onboarding footer');
if (body.symbolId !== '31961:32953' || footer.symbolId !== '31961:32952') throw new Error('Чужая onboarding family');
const closer = child(instance, 'Close');
const cross = child(closer, 'cross');
if (cross.getPropertyValue('Size') !== '24' || cross.getPropertyValue('Style') !== 'Line' || cross.getPropertyValue('Color') !== 'False') throw new Error('Source использует CrossLine24Icon');
const title = ownText(body, 'Title', false);
const subhead = flag(body, 'Subhead') ? ownText(body, 'Subhead', true) : undefined;
const description = flag(body, 'Subtitle') ? ownText(body, 'Subtitle', true) : undefined;
const parts = direct(footer);
const pips = parts.filter(n => ['31961:32956', '31961:32957'].includes(n.symbolId));
if (parts.some(n => n.name !== '[D] Button' && !pips.includes(n))) throw new Error('Неизвестный Footer child');
const selected = pips.map(n => pick(n, 'Selected', { True: true, False: false }));
if (pips.length && selected.filter(Boolean).length !== 1) throw new Error('Нужен ровно один selected pip');
const totalSlides = pips.length || 1;
const currentSlide = pips.length ? selected.indexOf(true) : 0;
const buttons = parts.filter(n => n.name === '[D] Button');
const primary = buttons.filter(n => n.getPropertyValue('View') === 'Primary');
const previous = buttons.filter(n => n.getPropertyValue('View') === 'Secondary');
if (primary.length !== 1 || previous.length > 1 || buttons.length !== primary.length + previous.length) throw new Error('Footer source требует один Primary и допускает один Secondary');
function button(node: InstanceHandle, primary: boolean) {
    if (node.getPropertyValue('Size') !== '40' || node.getPropertyValue('Shape') !== 'Rectangular' || node.getPropertyValue('SingleIcon') !== 'False' || node.getPropertyValue('DisabledState') !== 'False' || !flag(node, 'Label') || flag(node, 'Hint') || flag(node, primary ? 'LeftAddon' : 'RightAddon')) throw new Error('Footer API не выражает выбранное состояние кнопки');
    const label = node.getString('✎ Label');
    if (!label) throw new Error('Пустой label Footer не принят');
    return { label, addon: flag(node, primary ? 'RightAddon' : 'LeftAddon') };
}
const next = button(primary[0], true);
const prev = previous[0] ? button(previous[0], false) : undefined;
const warnings = [];
if (!!prev !== (currentSlide > 0)) warnings.push('PREVIOUS_BUTTON_SOURCE_GAP: source показывает Назад только при currentSlide > 0; фактический индекс не подменяется.');
if (pips.length === 1) warnings.push('PIPS_SOURCE_GAP: source скрывает Pips при totalSlides=1.');

export default {
    id: 'corp-onboarding-tooltip',
    imports: ["import { OnboardingTooltip } from 'arui-private/onboarding-tooltip';", "import type { ComponentProps } from 'react';"],
    example: figma.code`type Props = ComponentProps<typeof OnboardingTooltip>;
${warnings.map(w => '// '+w).join('\n')}
function Example({ anchor, visible, onClose, onClickNext${prev ? ', onClickPrev' : ''}${pips.length > 1 ? ', onClickPips' : ''}${next.addon ? ', nextButtonRightAddon' : ''}${prev?.addon ? ', prevButtonLeftAddon' : ''} }: {
    anchor: Props['children']; visible: Props['visible']; onClose: NonNullable<Props['onClose']>;
    onClickNext: NonNullable<Props['onClickNext']>;
    ${prev ? "onClickPrev: NonNullable<Props['onClickPrev']>;" : ''}
    ${pips.length > 1 ? "onClickPips: NonNullable<Props['onClickPips']>;" : ''}
    ${next.addon ? "nextButtonRightAddon: NonNullable<Props['nextButtonRightAddon']>;" : ''}
    ${prev?.addon ? "prevButtonLeftAddon: NonNullable<Props['prevButtonLeftAddon']>;" : ''}
}) {
    return <OnboardingTooltip position=${JSON.stringify(position)} visible={visible} onClose={onClose}
        ${title === undefined ? '' : 'title={'+JSON.stringify(title)+'}'}
        ${subhead === undefined ? '' : 'subhead={'+JSON.stringify(subhead)+'}'}
        ${description === undefined ? '' : 'description={'+JSON.stringify(description)+'}'}
        totalSlides={${totalSlides}} currentSlide={${currentSlide}}
        nextButtonText={${JSON.stringify(next.label)}} onClickNext={onClickNext}
        ${prev ? 'prevButtonText={'+JSON.stringify(prev.label)+'} onClickPrev={onClickPrev}' : ''}
        ${pips.length > 1 ? 'onClickPips={onClickPips}' : ''}
        ${next.addon ? 'nextButtonRightAddon={nextButtonRightAddon}' : ''}
        ${prev?.addon ? 'prevButtonLeftAddon={prevButtonLeftAddon}' : ''}
    >{anchor}</OnboardingTooltip>;
}`,
    metadata: { nestable: false, props: { position, title, subhead, description, totalSlides, currentSlide,
        nextButtonText: next.label, prevButtonText: prev?.label, nextAddon: next.addon, prevAddon: prev?.addon,
        requiredContext: ['real anchor ReactElement', 'visible', 'real navigation/close callbacks', 'real addons when enabled'],
        sourceImport: 'arui-private/onboarding-tooltip', sourceExport: 'OnboardingTooltip', warnings,
        notes: ['Step count and zero-based selected index reflect the native snapshot; application owns the whole journey.', 'Source uses TooltipDesktop and Highlighter with automatic scrolling; geometry/portal/scroll policy and mobile execution need application checks.'], browserVerified: false } },
};
