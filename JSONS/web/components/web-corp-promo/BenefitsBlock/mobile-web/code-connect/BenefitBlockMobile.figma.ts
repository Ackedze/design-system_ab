// url=https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA/Web----Corp-Promo-Components?node-id=19-12037
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/benefit-block/benefit-block-mobile.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=BenefitBlockMobile
import figma from 'figma';
import type { InstanceHandle } from 'figma';

const instance = figma.selectedInstance;
const isDesktop = false;
const componentName = 'BenefitBlockMobile';

function pick<T>(node: InstanceHandle, name: string, values: Record<string, T>): T {
    const value = node.getEnum(name, values);
    if (value === undefined) throw new Error(`Неизвестный VARIANT ${name}`);
    return value;
}
function flag(node: InstanceHandle, name: string) {
    return pick(node, name, { True: true, False: false });
}
function boolean(node: InstanceHandle, name: string) {
    const value = node.getBoolean(name);
    if (typeof value !== 'boolean') throw new Error(`Неизвестный BOOLEAN ${name}`);
    return value;
}
function child(name: string, path: string[]) {
    const node = instance.findInstance(name, { path, traverseInstances: true });
    if (node.type !== 'INSTANCE') throw new Error(`Не найден ${name}`);
    return node;
}
function text(node: InstanceHandle, name: string, path: string[] = []) {
    const value = node.findText(name, { path, traverseInstances: true });
    if (value.type !== 'TEXT') throw new Error(`Не найден текст ${name}`);
    return value.textContent;
}
function layers(node: InstanceHandle, name: string, path: string[] = []) {
    return node.findLayers((n) => n.type === 'INSTANCE' && n.name === name, { path, traverseInstances: true })
        .filter((n): n is InstanceHandle => n.type === 'INSTANCE');
}

const contentPath = ['Content', ...(isDesktop ? ['ContentWrapper'] : [])];
const compact = isDesktop ? flag(instance, 'Compact') : false;
const heightCustom = isDesktop ? flag(instance, 'HeightCustom') : false;
const withBackground = flag(instance, 'Background');
const imagePosition = isDesktop ? pick(instance, 'Image', { Left: 'left', Right: 'right' }) :
    pick(instance, 'Image', { Top: 'top', Bottom: 'bottom' });
const titleView = child('TitleView', contentPath);
if (flag(titleView, 'Skeleton') || ['Subtitle', 'RightAddon', 'TitleAddon', 'TitleStatus'].some((key) => boolean(titleView, key))) {
    throw new Error('BenefitBlock title: публичный API принимает только строку; TitleView addons/subtitle/skeleton не поддерживаются');
}
const expectedTitle = isDesktop && compact ? 'Medium' : 'Large';
if (titleView.getPropertyValue('View') !== expectedTitle) throw new Error('TitleView View отличается от фиксированной типографики BenefitBlock');
const title = text(instance, 'Title', [...contentPath, 'TitleView', 'MainContent', 'Heading']);
const image = child('ImageView', ['Content', 'ImageContainer', 'Container']);
if (image.getPropertyValue('Crop') !== 'Center') throw new Error('ImageView: требуется Crop=Center');

const names = ['image'];
const parameters = ["image: Props['image']"];
if (heightCustom) { names.push('heightCustom'); parameters.push("heightCustom: NonNullable<Props['heightCustom']>"); }
const warnings = ['image: выбери реальный ассет из Corp Image Library; размер, crop и segment сохранены в metadata'];
let preset = 'text';
let contentCode;
if (boolean(instance, 'Presets')) {
    const presetName = isDesktop ? 'Presets' : 'TextContent';
    const content = child(presetName, contentPath);
    preset = pick(content, 'Type', { Text: 'text', List: 'list', Steps: 'steps' });
    if (preset === 'text') {
        const subtitle = text(instance, 'Subtitle', [...contentPath, presetName]);
        contentCode = figma.code`preset="text" subtitle={${JSON.stringify(subtitle)}}`;
    } else if (preset === 'list') {
        const items = layers(instance, 'List', [...contentPath, presetName]);
        if (!items.length) throw new Error('List: нет видимых элементов');
        const listItems = items.map((item) => {
            if (flag(item, 'Caption')) throw new Error('List Caption отсутствует в BenefitBlock listItems');
            const markers = layers(item, '🔩 Marker');
            if (markers.length !== 1 || markers[0].getPropertyValue('Type') !== 'Dash' || markers[0].getPropertyValue('style') !== 'default') {
                throw new Error('List: React использует обычный dash marker');
            }
            return { title: item.getString('✎ Text') };
        });
        contentCode = figma.code`preset="list" listItems={${JSON.stringify(listItems)}}`;
    } else {
        const steps = instance.findLayers((n) => n.type === 'INSTANCE' && ['First', 'Steps_Vertical', 'Last'].includes(n.name),
            { path: [...contentPath, presetName, 'StepsList'], traverseInstances: true }).filter((n): n is InstanceHandle => n.type === 'INSTANCE');
        if (!steps.length) throw new Error('Steps: нет видимых шагов');
        const stepsItems = steps.map((step, index) => {
            const indicators = layers(step, '🔩 IndicatorContent');
            if (indicators.length !== 1 || !flag(indicators[0], 'Ordered') ||
                ['Active', 'Positive', 'Warning', 'Error', 'CriticalError', 'Waiting', 'Custom'].some((key) => flag(indicators[0], key)) ||
                indicators[0].getString('✎ Number') !== String(index + 1) || flag(step, 'LastStep') !== (index === steps.length - 1)) {
                throw new Error('Steps: React задаёт последовательные номера и неинтерактивное состояние');
            }
            const cells = layers(step, '🔄 [D][Corporate] PureCell');
            if (cells.length !== 1) throw new Error('Steps: не найдена PureCell');
            const cell = cells[0];
            if (['Row 2 Value', 'Row 1 Value', 'Addon', 'Footer'].some((key) => boolean(cell, key)) || cell.getPropertyValue('GraphicsSide') !== 'None') {
                throw new Error('Steps: дополнительные PureCell области отсутствуют в stepsItems');
            }
            const rows = layers(cell, 'RowTitle');
            const titles = rows.filter((row) => row.getPropertyValue('Type') === 'Text 16');
            const subtitles = rows.filter((row) => row.getPropertyValue('Type') === 'Text 14');
            if (titles.length !== 1 || subtitles.length > 1 || rows.length !== titles.length + subtitles.length) throw new Error('Steps: ожидается title и необязательный subtitle');
            return { title: text(titles[0], 'Text'), ...(subtitles.length ? { subtitle: text(subtitles[0], 'Text') } : {}) };
        });
        if (steps.length > 3) warnings.push('Steps: больше трёх шагов; рекомендация нормы — три, порядок и все шаги сохранены');
        contentCode = figma.code`preset="steps" stepsItems={${JSON.stringify(stepsItems)}}`;
    }
}

let primaryCode;
let secondaryCode;
if (boolean(instance, 'ButtonGroup')) {
    const group = child('ButtonGroup', contentPath);
    const buttons = layers(instance, 'Button', [...contentPath, 'ButtonGroup']);
    const hasPrimary = flag(group, 'PrimaryButton');
    const hasSecondary = flag(group, 'SecondaryButton');
    if ((!hasPrimary && !hasSecondary) || buttons.length !== Number(hasPrimary) + Number(hasSecondary)) throw new Error('ButtonGroup: набор кнопок не совпадает с флагами');
    function action(view: string) {
        const selected = buttons.filter((button) => button.getPropertyValue('View') === view);
        if (selected.length !== 1) throw new Error(`ButtonGroup: не найдена ${view}`);
        const button = selected[0];
        if (boolean(button, 'Hint') || !boolean(button, 'Label') || flag(button, 'SingleIcon') ||
            button.getPropertyValue('Shape') !== 'Rectangular' || button.getPropertyValue('Size') !== '48') {
            throw new Error('Button: поддерживается Rectangular 48 с Label, без Hint и SingleIcon');
        }
        const name = view === 'Primary' ? 'primaryAction' : 'secondaryAction';
        const prop = view === 'Primary' ? 'primaryButtonProps' : 'secondaryButtonProps';
        const addons = ['Left', 'Right'].filter((side) => boolean(button, side + 'Addon'));
        names.push(name);
        parameters.push(`${name}: { onClick: MouseEventHandler<HTMLButtonElement>${addons.map((side) => `; ${side.toLowerCase()}Addons: NonNullable<NonNullable<NonNullable<Props['${prop}']>['props']>['${side.toLowerCase()}Addons']>`).join('')} }`);
        return figma.code`${prop}={{ label: ${JSON.stringify(button.getString('✎ Label'))}, props: { ...${name}, disabled: ${flag(button, 'DisabledState')} } }}`;
    }
    if (hasPrimary) primaryCode = action('Primary');
    if (hasSecondary) secondaryCode = action('Secondary');
}

let surfaceCode;
if (withBackground) {
    const prefix = isDesktop ? '[D][Promo]' : '[M][Promo]';
    const plate = child(`${prefix} BackgroundPlate`, ['Content', 'BackgroundPlate']);
    if (plate.getPropertyValue('Position') !== 'Level 1 (outer)') throw new Error('BackgroundPlate: требуется Level 1 (outer)');
    const style = child(`${prefix} Style Level 1`, ['Content', 'BackgroundPlate', plate.name]);
    const view = pick(style, 'Type', { Primary: 'Primary', Colored: 'Colored' });
    const color = pick(style, 'BackgroundColor', { 'base-bg-alt (gray)': 'base-bg-alt', 'base-bg (white)': 'base-bg' });
    const skeleton = flag(style, 'Skeleton');
    if (view === 'Colored') { names.push('coloredViewValue'); parameters.push("coloredViewValue: NonNullable<NonNullable<Props['backgroundPlateProps']>['coloredViewValue']>"); }
    if (skeleton) { names.push('skeletonProps'); parameters.push("skeletonProps?: NonNullable<Props['backgroundPlateProps']>['skeletonProps']"); }
    // Public type requires children. BenefitBlock replaces it with its own content in JSX.
    surfaceCode = figma.code`backgroundPlateProps={{ children: null, view: BackgroundPlateView.${view}, level: 'outer', backgroundColor: '${color}', showSkeleton: ${skeleton}, ${view === 'Colored' ? 'coloredViewValue,' : ''} ${skeleton ? 'skeletonProps,' : ''} }}`;
}

export default {
    id: isDesktop ? 'corp-benefit-block-desktop' : 'corp-benefit-block-mobile-web',
    imports: [
        `import { ${componentName} } from 'arui-private/benefit-block';`,
        ...(withBackground ? ["import { BackgroundPlateView } from 'arui-private/background-plate';"] : []),
        "import type { ComponentProps, MouseEventHandler } from 'react';",
    ],
    example: figma.code`type Props = ComponentProps<typeof ${componentName}>;
${warnings.map((warning) => `// ${warning}`).join('\n')}
function Example({ ${names.join(', ')} }: { ${parameters.join('; ')} }) {
    return <${componentName}
        title={${JSON.stringify(title)}}
        image={image}
        ${isDesktop ? figma.code`imagePositionDesktop="${imagePosition}" compact={${compact}}` : figma.code`imagePositionMobile="${imagePosition}"`}
        ${heightCustom ? figma.code`heightCustom={heightCustom}` : ''}
        withBackground={${withBackground}}
        ${contentCode ?? ''}
        ${primaryCode ?? ''}
        ${secondaryCode ?? ''}
        ${surfaceCode ?? ''}
    />;
}`,
    metadata: { nestable: false, props: {
        platform: isDesktop ? 'desktop' : 'mobile-web', preset, presetsVisible: boolean(instance, 'Presets'),
        asset: { layer: image.name, size: image.getPropertyValue('Size'), crop: image.getPropertyValue('Crop'), segment: image.getPropertyValue('Segment') },
        requiredContext: names.filter((name) => name !== 'skeletonProps'), warnings,
    } },
};
