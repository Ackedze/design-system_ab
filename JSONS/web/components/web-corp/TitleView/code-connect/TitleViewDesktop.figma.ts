// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=37705-55347
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/title-view/desktop/title-view-desktop.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=TitleViewDesktop
import figma from 'figma';
import type { InstanceHandle } from 'figma';

const instance = figma.selectedInstance;
const isDesktop = true;
const componentName = 'TitleViewDesktop';
const importPath = 'arui-private/title-view/desktop';

function pick<T>(node: InstanceHandle, name: string, values: Record<string, T>): T {
    const value = node.getEnum(name, values);
    if (value === undefined) throw new Error(`Неизвестный VARIANT ${name}: ${node.getPropertyValue(name)}`);
    return value;
}
function boolean(name: string) {
    const value = instance.getBoolean(name);
    if (typeof value !== 'boolean') throw new Error(`Неизвестный BOOLEAN ${name}`);
    return value;
}
function child(name: string, path: string[]) {
    const value = instance.findInstance(name, { path, traverseInstances: true });
    if (value.type !== 'INSTANCE') throw new Error(`Не найден ${name}`);
    return value;
}
function text(name: string, path: string[]) {
    const value = instance.findText(name, { path, traverseInstances: true });
    if (value.type !== 'TEXT') throw new Error(`Не найден текст ${name}`);
    return value.textContent;
}
const view = pick(instance, 'View', { xLarge: 'XLARGE', Large: 'LARGE', Medium: 'MEDIUM', Small: 'SMALL' });
const skeleton = pick(instance, 'Skeleton', { True: true, False: false });
const prefix = isDesktop ? '[D]' : '[M]';
const names = ['tag'];
const parameters = ["tag: Props['tag']"];
const context = (name: string, type: string) => { names.push(name); parameters.push(`${name}: ${type}`); };
const title = skeleton ? undefined : text('Title', ['MainContent', 'Heading']);
if (skeleton) context('title', "NonNullable<Props['children']>");
let subtitle;
if (boolean('Subtitle')) {
    if (skeleton) { context('subtitle', "NonNullable<Props['subtitle']>"); subtitle = figma.code`subtitle={subtitle}`; }
    else subtitle = figma.code`subtitle={${JSON.stringify(text('Subtitle', ['MainContent', 'Subtitle']))}}`;
}

let statusCode;
let statusType;
if (view === 'XLARGE' && boolean('Status')) {
    if (skeleton) { context('statusProps', "NonNullable<Props['statusProps']>"); statusCode = figma.code`statusProps={statusProps}`; }
    else {
        const preset = child('StatusPreset', ['MainContent', 'Status']);
        statusType = preset.getPropertyValue('Type');
        const color = pick(preset, 'Type', { Approved: 'green', Attention: 'orange', 'Error / Risk': 'red', Action: 'blue', Processing: 'purple', Neutral: 'grey' });
        const style = pick(preset, 'Style', { Contrast: 'contrast', Muted: 'muted' });
        if (preset.getPropertyValue('Size') !== '24') throw new Error('Status: TitleView задаёт Size=24');
        const status = child('Status', ['MainContent', 'Status', 'StatusPreset']);
        if (status.getPropertyValue('Shape') !== 'Rounded') throw new Error('Status: TitleView задаёт rounded');
        const label = child(isDesktop ? '🔩 Label' : 'Label', ['MainContent', 'Status', 'StatusPreset', 'Status']);
        const uppercase = pick(label, 'Uppercase', { True: true, False: false });
        const addonFields = ['Left', 'Right'].filter((side) => pick(status, side + 'Addon', { True: true, False: false }));
        if (addonFields.length) context('statusAddons', `{ ${addonFields.map((side) => `${side.toLowerCase()}Addons: NonNullable<NonNullable<Props['statusProps']>['${side.toLowerCase()}Addons']>`).join('; ')} }`);
        statusCode = figma.code`statusProps={{ ${addonFields.length ? '...statusAddons,' : ''} children: ${JSON.stringify(label.getString('✎ Label'))}, color: '${color}', view: '${style}', uppercase: ${uppercase} }}`;
    }
}
let holdingCode;
if (view === 'XLARGE' && boolean('Holding')) {
    context('filterCompanySelectProps', "NonNullable<Props['filterCompanySelectProps']>");
    holdingCode = figma.code`filterCompanySelectProps={filterCompanySelectProps}`;
}
let buttonsCode;
const visibleActions: string[] = [];
if (view === 'XLARGE' && boolean('Button group')) {
    context('buttonsGroup', "NonNullable<Props['buttonsGroup']>");
    context('overflowProps', "Pick<Props, 'maxVisibleButtons' | 'pickerButtonProps'>");
    buttonsCode = figma.code`buttonsGroup={buttonsGroup} {...overflowProps}`;
    if (!skeleton) {
        const buttons = instance.findLayers((n) => n.type === 'INSTANCE' && n.name === `${prefix} Button`, { path: ['MainContent', 'Button group'], traverseInstances: true });
        for (const button of buttons) if (button.type === 'INSTANCE' && button.getPropertyValue('SingleIcon') === 'False') visibleActions.push(button.getString('✎ Label'));
    }
}
let titleStatusCode;
let titleStatusType;
if (view === 'XLARGE' && boolean('TitleStatus')) {
    if (skeleton) { context('titleStatusProps', "NonNullable<Props['titleStatusProps']>"); titleStatusCode = figma.code`titleStatusProps={titleStatusProps}`; }
    else {
        const status = child(`${prefix} TitleStatus`, ['MainContent']);
        titleStatusType = status.getPropertyValue('Type');
        const type = pick(status, 'Type', { Approved: 'POSITIVE', Attention: 'WARNING', 'Error / Risk': 'ERROR', Action: 'ACTION', Processing: 'PROCESS', Neutral: 'INFO' });
        const caption = status.getBoolean('Caption');
        if (typeof caption !== 'boolean') throw new Error('TitleStatus Caption: ожидается BOOLEAN');
        const path = ['MainContent', `${prefix} TitleStatus`, 'Content'];
        titleStatusCode = figma.code`titleStatusProps={{ type: TitleStatusType.${type}, title: ${JSON.stringify(text('Title', path))}, ${caption ? figma.code`subtitle: ${JSON.stringify(text('Subtitle', path))},` : ''} }}`;
    }
}
const hasTitleAddon = !skeleton && boolean('TitleAddon');
const hasRightAddon = !skeleton && boolean('RightAddon');
if (hasTitleAddon) context('titleAddon', "NonNullable<Props['titleAddon']>");
if (hasRightAddon) context('rightAddon', "NonNullable<Props['rightAddon']>");
const rowLimit = isDesktop ? undefined : boolean('2 line') ? 2 : 1;
const warnings = statusType && titleStatusType && statusType !== titleStatusType ? ['StatusPreset и TitleStatus имеют разные Type; значения сохранены, требуется сверка с нормой'] : [];

export default {
    id: isDesktop ? 'corp-title-view-desktop' : 'corp-title-view-mobile-web',
    imports: [
        `import { ${componentName} } from '${importPath}';`,
        "import { VIEWS, TitleStatusType } from 'arui-private/title-view';",
        "import type { ComponentProps } from 'react';",
    ],
    example: figma.code`type Props = ComponentProps<typeof ${componentName}>;
// tag: семантический уровень заголовка задаёт приложение.
${names.includes('buttonsGroup') ? '// buttonsGroup: полный упорядоченный список реальных DS actions с callbacks/href; overflow — PickerButton, не дополнительное действие.' : ''}
${skeleton ? '// Skeleton скрывает данные Figma; реальные title/subtitle/props передаются приложением.' : ''}
${warnings.map((warning) => `// ${warning}`).join('\n')}
function Example({ ${names.join(', ')} }: { ${parameters.join('; ')} }) {
    return <${componentName}
        tag={tag}
        view={VIEWS.${view}}
        showSkeleton={${skeleton}}
        ${rowLimit ? figma.code`rowLimit={${rowLimit}}` : ''}
        ${subtitle ?? ''}
        ${statusCode ?? ''}
        ${holdingCode ?? ''}
        ${buttonsCode ?? ''}
        ${titleStatusCode ?? ''}
        ${hasTitleAddon ? figma.code`titleAddon={titleAddon}` : ''}
        ${hasRightAddon ? figma.code`rightAddon={rightAddon}` : ''}
    >{${skeleton ? 'title' : JSON.stringify(title)}}</${componentName}>;
}`,
    metadata: { nestable: false, props: { platform: isDesktop ? 'desktop' : 'mobile-web', view, skeleton,
        requiredContext: names, visibleActions, statusType, titleStatusType, warnings,
        buttonsSource: 'application supplies complete actions including collapsed ones; visible labels are evidence only',
        addonSource: 'typed ReactNode matching selected nested preset/swap; BOOLEAN is not native SLOT',
    } },
};
