// url=https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA/Web----Corp-Promo-Components?node-id=17-12781
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/benefit-card/benefit-card-mobile.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=BenefitCardMobile
import figma from 'figma';
import type { InstanceHandle } from 'figma';

const instance = figma.selectedInstance;
const isDesktop = false;
const componentName = 'BenefitCardMobile';

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
    const value = instance.findInstance(name, { path, traverseInstances: true });
    if (value.type !== 'INSTANCE') throw new Error(`Не найден ${name}`);
    return value;
}

function text(name: string) {
    const value = instance.findText('value', { path: ['ContentWrapper', 'Content', 'Content', name], traverseInstances: true });
    if (value.type !== 'TEXT') throw new Error(`Не найден текст ${name}`);
    return value.textContent;
}

const graphicPosition = pick(instance, 'GraphicPosition', { Left: 'left', Right: 'right' });
const orientation = pick(instance, 'CardAxis', { Horizontal: 'horizontal', Vertical: 'vertical' });
const withBackgroundPlate = flag(instance, 'Background');
const compactView = flag(instance, 'Compact');
const content = child('Content', ['ContentWrapper']);
const titleView = pick(content, 'Title', { Primary: 'primary', Secondary: 'secondary' });
const title = text('Title');
const subtitle = boolean(content, 'Subtitle') ? text('Subtitle') : undefined;
const hasBottom = boolean(content, 'Bottom');
const graphic = child(isDesktop ? '[D] Graphic' : '[M] Graphic', ['GraphicContainer']);
const graphicType = pick(graphic, 'Presets', { Image: 'image', IconView: 'icon-view', Icon: 'icon' });
const warnings: string[] = [];
if (titleView !== (isDesktop ? 'primary' : 'secondary')) {
    warnings.push(`${componentName} принудительно задаёт ${isDesktop ? 'Primary' : 'Secondary'}; Figma Title=${titleView}. titleView не устраняет расхождение`);
}

const names = ['interaction'];
const parameters = ['interaction?: { clickable?: false; onClick?: never } | { clickable: true; onClick: NonNullable<Props[\'onClick\']> }'];
let graphicCode;
let asset;
if (graphicType === 'image') {
    const image = child('ImageView', ['GraphicContainer', graphic.name, 'Container']);
    asset = { layer: image.name, size: image.getPropertyValue('Size'), crop: image.getPropertyValue('Crop'), segment: image.getPropertyValue('Segment') };
    names.push('image'); parameters.push('image: ReactNode');
    graphicCode = figma.code`graphicContent={{ type: 'image', addon: image }}`;
} else {
    names.push('iconProps');
    parameters.push(`iconProps: NonNullable<Extract<NonNullable<Props['graphicContent']>, { type: '${graphicType}' }>['props']> & { Icon: NonNullable<NonNullable<Extract<NonNullable<Props['graphicContent']>, { type: '${graphicType}' }>['props']>['Icon']> }`);
    if (graphicType === 'icon-view') {
        const iconView = child('IconView', ['GraphicContainer', graphic.name]);
        if (iconView.getPropertyValue('Size') !== (isDesktop ? '64' : '48')) throw new Error('IconView Size принудительно задан в React');
        if (['BgImg', 'Indicator', 'Text', 'Border', 'TopAddon', 'BottomAddon'].some((name) => boolean(iconView, name)) ||
            !['Shape', 'BgColor', 'Content'].every((name) => boolean(iconView, name))) {
            throw new Error('IconView: дополнительные слоты/форма не поддерживаются AnimaIconView');
        }
        graphicCode = figma.code`graphicContent={{ type: 'icon-view', props: iconProps }}`;
        warnings.push('IconView: размеры и фон задаёт React; выбранный SVG и его цвета передаются в iconProps');
    } else {
        const icon = child('🔩 Content', ['GraphicContainer', graphic.name]);
        if (icon.getPropertyValue('Type') !== 'Icon') throw new Error('Graphic Icon: Logo/Emoji требуют отдельного ReactNode, не AnimaIconView');
        const size = pick(icon, 'Size', { '16': 16, '20': 20, '24': 24, '32': 32 });
        graphicCode = figma.code`graphicContent={{ type: 'icon', props: { ...iconProps, iconSize: ${size}, superEllipseSize: ${size}, defaultBackgroundColor: 'transparent' } }}`;
    }
    asset = { layer: graphic.name, preset: graphicType };
}

let bottomCode;
let bottomPreset;
if (hasBottom) {
    const bottom = child('Bottom', ['ContentWrapper', 'Content']);
    bottomPreset = pick(bottom, 'Presets', { SwapMe: 'custom-slot', Link: 'link' });
    if (bottomPreset === 'custom-slot') {
        // SwapMe — вложенный компонент/текст, а не native SLOT: содержимое даёт приложение.
        names.push('bottomContent'); parameters.push('bottomContent: ReactNode');
        bottomCode = figma.code`bottomSlot={{ type: 'custom-slot', slot: bottomContent }}`;
    } else {
        const link = child('Link', ['ContentWrapper', 'Content', 'Bottom']);
        if (link.getPropertyValue('Size') !== 'S (14-20)') throw new Error('Link Size: BenefitCard не передаёт размер в Core Link');
        const line = pick(child('Underline', ['ContentWrapper', 'Content', 'Bottom', 'Link', 'Content']), 'Line', { Solid: 'solid', Pseudo: 'pseudo', None: 'none' });
        const addons = ['Left', 'Right'].filter((side) => boolean(link, `${side} Addon`));
        names.push('linkProps');
        parameters.push(`linkProps: Omit<NonNullable<Extract<NonNullable<Props['bottomSlot']>, { type?: 'link' }>['props']>, 'children' | 'leftAddons' | 'rightAddons' | 'underline' | 'pseudo'> & { href: string${addons.map((side) => `; ${side.toLowerCase()}Addons: ReactNode`).join('')} }`);
        bottomCode = figma.code`bottomSlot={{ type: 'link', props: { ...linkProps, children: ${JSON.stringify(link.getString('✎ Label'))}, underline: ${line !== 'none'}, pseudo: ${line === 'pseudo'}, ${!addons.includes('Left') ? 'leftAddons: undefined,' : ''} ${!addons.includes('Right') ? 'rightAddons: undefined,' : ''} } }}`;
        warnings.push('Link: href и выбранные addons передаются приложением; согласуй обработчик ссылки с кликом по карточке');
    }
}

let surfaceCode;
if (withBackgroundPlate) {
    const prefix = isDesktop ? '[D][Promo]' : '[M][Promo]';
    const plate = child(`${prefix} BackgroundPlate`, ['BackgroundPlate']);
    const level = pick(plate, 'Position', { 'Level 1 (outer)': 'outer', 'Level 2 (inner)': 'inner' });
    if (level !== 'outer') throw new Error('BenefitCard: вложенный Level 2 требует отдельной проверки поверхности');
    const style = child(`${prefix} Style Level 1`, ['BackgroundPlate', plate.name]);
    const view = pick(style, 'Type', { Primary: 'Primary', Secondary: 'Secondary', Colored: 'Colored', Border: 'Border' });
    const color = pick(style, 'BackgroundColor', { 'base-bg-alt (gray)': 'base-bg-alt', 'base-bg (white)': 'base-bg', 'modal-bg-alt (gray)': 'unsupported', 'modal-bg (white)': 'unsupported' });
    if (color === 'unsupported') throw new Error('BackgroundPlate: modal-bg отсутствует в публичном API');
    const skeleton = flag(style, 'Skeleton');
    if (view === 'Colored') { names.push('coloredViewValue'); parameters.push("coloredViewValue: NonNullable<Props['backgroundPlateProps']>['coloredViewValue']"); }
    if (skeleton) { names.push('skeletonProps'); parameters.push("skeletonProps?: NonNullable<Props['backgroundPlateProps']>['skeletonProps']"); }
    surfaceCode = figma.code`backgroundPlateProps={{ view: BackgroundPlateView.${view}, level: '${level}', backgroundColor: '${color}', showSkeleton: ${skeleton}, ${view === 'Colored' ? 'coloredViewValue,' : ''} ${skeleton ? 'skeletonProps,' : ''} }}`;
}

export default {
    id: isDesktop ? 'corp-benefit-card-desktop' : 'corp-benefit-card-mobile-web',
    imports: [
        `import { ${componentName} } from 'arui-private/benefit-card';`,
        ...(withBackgroundPlate ? ["import { BackgroundPlateView } from 'arui-private/background-plate';"] : []),
        "import type { ComponentProps, ReactNode } from 'react';",
    ],
    example: figma.code`type Props = ComponentProps<typeof ${componentName}>;
${warnings.map((warning) => `// ${warning}`).join('\n')}
function Example({ ${names.join(', ')} }: { ${parameters.join('; ')} }) {
    return <${componentName}
        title={${JSON.stringify(title)}}
        ${subtitle !== undefined ? figma.code`subtitle={${JSON.stringify(subtitle)}}` : ''}
        graphicPosition="${graphicPosition}"
        orientation="${orientation}"
        compactView={${compactView}}
        withBackgroundPlate={${withBackgroundPlate}}
        clickable={interaction?.clickable}
        onClick={interaction?.onClick}
        ${graphicCode}
        ${bottomCode ?? ''}
        ${surfaceCode ?? ''}
    />;
}`,
    metadata: { nestable: false, props: {
        platform: isDesktop ? 'desktop' : 'mobile-web', graphicType, asset, bottomPreset: bottomPreset ?? 'none',
        figmaTitleView: titleView, warnings,
        requiredContext: names.filter((name) => !['interaction', 'skeletonProps'].includes(name)),
    } },
};
