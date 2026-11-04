// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=62786-48893
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/button-group/button-group.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=ButtonGroup
import figma from 'figma';
import type { InstanceHandle, ResultSection } from 'figma';

const instance = figma.selectedInstance;
const isDesktop = true;

function pick<T>(node: InstanceHandle, name: string, values: Record<string, T>): T {
    const value = node.getEnum(name, values);
    if (value === undefined) throw new Error(`Неизвестный VARIANT ${name}: ${node.getPropertyValue(name)}`);
    return value;
}
function boolean(node: InstanceHandle, name: string) {
    const value = node.getBoolean(name);
    if (typeof value !== 'boolean') throw new Error(`Неизвестный BOOLEAN ${name}`);
    return value;
}
const size = pick(instance, 'Size', { '32': 32, '40': 40, '48': 48, '56': 56 });
const overflow = pick(instance, 'Overflow', { true: true, false: false });
const buttonName = isDesktop ? '[D] Button' : '[M] Button';
// Native findLayers omits hidden layers and stops at instance boundaries.
const buttons = instance.findLayers((node) => node.type === 'INSTANCE' && node.name === buttonName,
    { path: [], traverseInstances: false }).filter((node): node is InstanceHandle => node.type === 'INSTANCE');
if (buttons.length < 2 || buttons.length > (isDesktop ? 4 : 2)) throw new Error('ButtonsGroup: ожидаются 2–4 видимых D или 2 видимых M slots');
const last = buttons[buttons.length - 1];
if (last.getPropertyValue('Size') !== String(size)) throw new Error('Overflow/control Size не совпадает с группой');
if (pick(last, 'SingleIcon', { True: true, False: false }) !== overflow) throw new Error('Overflow не совпадает с последним SingleIcon control');
if (overflow && last.getPropertyValue('View') !== 'Secondary') throw new Error('Overflow control должен быть Secondary');
const actions = overflow ? buttons.slice(0, -1) : buttons;
let primaryFirst = false;
const actionCode: ResultSection[] = [];
const bindingTypes: string[] = [];
const labels: string[] = [];
for (let index = 0; index < actions.length; index++) {
    const button = actions[index];
    const view = pick(button, 'View', { Primary: 'primary', Secondary: 'secondary' });
    if (index && view === 'primary') throw new Error('ButtonGroup может задать Primary только первой кнопке');
    if (!index) primaryFirst = view === 'primary';
    if (button.getPropertyValue('Size') !== String(size)) throw new Error('Button Size не совпадает с группой');
    if (button.getPropertyValue('Shape') !== 'Rectangular' || pick(button, 'SingleIcon', { True: true, False: false }) ||
        !boolean(button, 'Label') || boolean(button, 'Hint')) {
        throw new Error('Нужен отдельный public API рецепт для Hint/SingleIcon/скрытого Label/другого Shape');
    }
    const addons = ['Left', 'Right'].filter((side) => boolean(button, side + 'Addon'));
    const label = button.getString('✎ Label');
    const disabled = pick(button, 'DisabledState', { True: true, False: false });
    labels.push(label);
    bindingTypes.push(`Omit<ButtonElementProps, 'children' | 'disabled' | 'leftAddons' | 'rightAddons'> & { onClick: NonNullable<ButtonElementProps['onClick']>${addons.map((side) => `; ${side.toLowerCase()}Addons: NonNullable<ButtonElementProps['${side.toLowerCase()}Addons']>`).join('')} }`);
    actionCode.push(...figma.code`{ ...actions[${index}], children: ${JSON.stringify(label)}, disabled: ${disabled}, ${!addons.includes('Left') ? 'leftAddons: undefined,' : ''} ${!addons.includes('Right') ? 'rightAddons: undefined,' : ''} },`.sections);
}
if (bindingTypes.length !== actions.length || !actionCode.length) throw new Error('Action conversion failed');
const warnings = [];
if (!isDesktop && !overflow) warnings.push('MOBILE_TWO_VISIBLE_SOURCE_GAP: source скрывает все действия после первого даже при Figma Overflow=false; визуальная эквивалентность не подтверждена');
warnings.push('Source автоматически рассчитывает overflow. hostWidth и полный список действий должны соответствовать выбранной композиции; prop overflow отсутствует');
if (isDesktop && overflow) warnings.push('При единственном скрытом действии overflow зависит от ширины; maxVisibleButtons включает место под picker, а не только число обычных кнопок');

export default {
    id: isDesktop ? 'corp-buttons-group-desktop' : 'corp-buttons-group-mobile-web',
    imports: [
        "import { ButtonGroup } from 'arui-private/button-group';",
        "import type { ButtonElementProps } from 'arui-private/button-group';",
        "import type { ComponentProps, CSSProperties } from 'react';",
    ],
    example: figma.code`type Props = ComponentProps<typeof ButtonGroup>;
${warnings.map((warning) => `// ${warning}`).join('\n')}
// mapper и picker.onChange используют общие стабильные keys и бизнес-действия; label не является ID.
function Example({ hostWidth, actions, overflowBindings${overflow ? ', hiddenElements' : ''} }: {
    hostWidth: NonNullable<CSSProperties['width']>;
    actions: [${bindingTypes.join(', ')}];
    overflowBindings: {
        pickerButtonProps: NonNullable<Props['pickerButtonProps']> & { onChange: NonNullable<NonNullable<Props['pickerButtonProps']>['onChange']>; label: NonNullable<NonNullable<Props['pickerButtonProps']>['label']> };
        mapElementToPickerOption: NonNullable<Props['mapElementToPickerOption']>;
    };
    ${overflow ? "hiddenElements: [Props['elements'][number], ...Props['elements']];" : ''}
}) {
    return <div style={{ width: hostWidth }}>
        <ButtonGroup
            size={${size}}
            primaryFirst={${primaryFirst}}
            maxVisibleButtons={${buttons.length}}
            pickerButtonProps={{ ...overflowBindings.pickerButtonProps, breakpoint: 768, footer: undefined }}
            mapElementToPickerOption={overflowBindings.mapElementToPickerOption}
            elements={[${actionCode}${overflow ? '...hiddenElements' : ''}]}
        />
    </div>;
}`,
    metadata: { nestable: false, props: {
        platform: isDesktop ? 'desktop' : 'mobile-web', size, figmaOverflow: overflow, primaryFirst,
        visibleSlotCount: buttons.length, visibleActionLabels: labels, warnings,
        requiredContext: ['hostWidth', 'actions', 'overflowBindings', ...(overflow ? ['hiddenElements'] : [])],
        sourceImport: 'arui-private/button-group', sourceExport: 'ButtonGroup', sourceBreakpoint: 768,
        sourceParity: !isDesktop && !overflow ? 'known-mobile-visibility-gap' : 'requires-width-and-action-integration',
        browserVerified: false,
    } },
};
