// url=https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA/Web-Corp-Promo?node-id=16-9029
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/promo-card/promo-card-mobile.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=PromoCardMobile
import figma from 'figma';
import type { InstanceHandle, ResultSection } from 'figma';
const instance = figma.selectedInstance;
const isDesktop = false;
function pick<T>(node: InstanceHandle, name: string, values: Record<string, T>): T {
    const value = node.getEnum(name, values);
    if (value === undefined) throw new Error(`Неизвестный ${name}: ${node.getPropertyValue(name)}`);
    return value;
}
function flag(node: InstanceHandle, name: string): boolean {
    const value = node.getBoolean(name);
    if (typeof value !== 'boolean') throw new Error(`Неизвестный BOOLEAN ${name}`);
    return value;
}
function child(name: string, path: string[]): InstanceHandle {
    const node = instance.findInstance(name, { path, traverseInstances: true });
    if (node.type !== 'INSTANCE') throw new Error('Не найден ' + [...path, name].join('/'));
    return node;
}
function text(path: string[]): string | undefined {
    const nodes = instance.findLayers(n => n.type === 'TEXT', { path, traverseInstances: true });
    if (!nodes.length) return undefined;
    if (nodes.length !== 1 || nodes[0].type !== 'TEXT') throw new Error('PromoCard принимает строку; сложный текст требует отдельного рецепта');
    return nodes[0].textContent;
}
type Action = { role: string; label: string; disabled: boolean; size: number; view: string; addons: string[] };
function readButtons(group: InstanceHandle, path: string[]) {
    const direction = pick(group, 'Axis', { Horizontal: 'row', Vertical: 'column' });
    const actions: Action[] = [];
    for (const role of ['Primary', 'Secondary']) {
        if (!pick(group, role + 'Button', { True: true, False: false })) continue;
        const button = child(role, [...path, 'ButtonGroup']);
        const view = pick(button, 'View', { Primary: isDesktop ? 'primary' : 'accent', Secondary: 'secondary' });
        if (view !== (role === 'Primary' ? (isDesktop ? 'primary' : 'accent') : 'secondary')) throw new Error('CTA role/View не совпадают');
        if (button.getPropertyValue('Shape') !== 'Rectangular' || pick(button, 'SingleIcon', { True: true, False: false }) || !flag(button, 'Label') || flag(button, 'Hint')) throw new Error('Нужен отдельный рецепт CTA Shape/SingleIcon/Hint/скрытого Label');
        actions.push({ role: role.toLowerCase(), label: button.getString('✎ Label'),
            disabled: pick(button, 'DisabledState', { True: true, False: false }),
            size: pick(button, 'Size', { '32': 32, '40': 40, '48': 48, '56': 56 }), view,
            addons: ['Left', 'Right'].filter(s => flag(button, s + 'Addon')).map(s => s.toLowerCase() + 'Addons') });
    }
    if (!actions.length) throw new Error('Buttons=true требует видимого действия');
    return { direction, actions };
}

const size = pick(instance, 'Size', { Small: 'small', Medium: 'medium', Large: 'large' });
const imageMode = pick(instance, 'Image', { Top: 'top', Bottom: 'bottom', 'None (Figma only)': 'none' });
const crop = pick(instance, 'ImageCrop', { True: true, False: false });
const offset = flag(instance, 'Offset');
const contentPath = ['ContentWrapper', 'Content'];
const content = child('Content', ['ContentWrapper']);
const titleView = pick(content, 'Title', { Primary: 'primary', Secondary: 'secondary' });
const centred = pick(content, 'Centred', { True: true, False: false });
const title = text([...contentPath, 'Content', 'Title']);
const subtitle = flag(content, 'Subtitle') ? text([...contentPath, 'Content', 'Subtitle']) : undefined;
if (flag(content, 'Subtitle') && subtitle === undefined) throw new Error('Subtitle=true, но видимый текст отсутствует');
const bottom = flag(content, 'Bottom');
const buttons = flag(content, 'Buttons');
let bottomPreset: string | undefined;
if (bottom) bottomPreset = pick(child('Bottom', contentPath), 'Presets', { SwapMe: 'swap', ButtonGroup: 'button-group' });
const groupName = isDesktop ? '[D] ButtonGroup' : '[M] ButtonGroup';
const buttonData = buttons ? readButtons(child(groupName, contentPath), [...contentPath, groupName]) : undefined;
const plateName = isDesktop ? '[D][Promo] BackgroundPlate' : '[M][Promo] BackgroundPlate';
const styleName = isDesktop ? '[D][Promo] Style Level 1' : '[M][Promo] Style Level 1';
const plate = child(plateName, ['BackgroundPlate']);
pick(plate, 'Position', { 'Level 1 (outer)': 'outer' });
const style = child(styleName, ['BackgroundPlate', plateName]);
pick(style, 'Type', { Primary: 'primary' });
const background = pick(style, 'BackgroundColor', { 'base-bg (white)': 'base-bg', 'base-bg-alt (gray)': 'base-bg-alt' });
const skeleton = pick(style, 'Skeleton', { True: true, False: false });
let imageAlign = 'normal';
let imageInfo: Record<string, string | boolean> | undefined;
if (imageMode !== 'none') {
    const view = child('ImageView', ['ImageContainer']);
    imageInfo = Object.fromEntries(Object.entries(view.properties).map(([name, prop]) => [name, prop.value]));
    const container = instance.findInstance('ImageContainer', { path: [], traverseInstances: false });
    if (container.type === 'INSTANCE' && imageMode === 'bottom') imageAlign = pick(container, 'Image Centred', { True: 'normal', False: 'bottomRight' });
}
const warnings = ['Ассет должен соответствовать выбранному ImageView, включая Crop/Segment. Card action, CTA handlers и bottomAddon задаёт приложение.'];
if (titleView !== (isDesktop ? 'primary' : 'secondary')) warnings.push('TITLE_VIEW_SOURCE_GAP: Desktop/Mobile leaf переопределяет titleView после props; выбранный Title не воспроизводится этим export.');
if (offset && imageMode === 'bottom') warnings.push('OFFSET_SOURCE_GAP: source применяет imageOffset только к верхнему изображению.');
if (crop && imageAlign === 'bottomRight') warnings.push('ALIGN_CROP_SOURCE_GAP: source выключает imageCrop при imageAlign=bottomRight.');
const Component = isDesktop ? 'PromoCardDesktop' : 'PromoCardMobile';
const bindings: string[] = [];
const types: string[] = [];
const props: ResultSection[] = [];
if (imageMode !== 'none') { bindings.push('image'); types.push("image: NonNullable<Props['image']>"); }
if (bottom) { bindings.push('bottomAddon'); types.push("bottomAddon: NonNullable<Props['bottomAddon']>"); }
for (const a of buttonData?.actions ?? []) {
    const binding = a.role + 'Action'; bindings.push(binding);
    const base = `NonNullable<NonNullable<Props['${a.role}ButtonProps']>['props']>`;
    types.push(`${binding}: ActionProps<${base}> & { onClick: NonNullable<${base}['onClick']>${a.addons.map(n => `; ${n}: NonNullable<${base}['${n}']>`).join('')} }`);
    props.push(...figma.code`${a.role}ButtonProps={{ label: ${JSON.stringify(a.label)}, props: { ...${binding}, view: ${JSON.stringify(a.view)}, size: ${a.size}, disabled: ${a.disabled}, ${a.addons.includes('leftAddons') ? '' : 'leftAddons: undefined,'} ${a.addons.includes('rightAddons') ? '' : 'rightAddons: undefined,'} } }}
`.sections);
}
export default {
    id: "corp-promo-card-mobile-web",
    imports: [`import { ${Component} } from 'arui-private/promo-card';`, "import type { ComponentProps } from 'react';"],
    example: figma.code`type Props = ComponentProps<typeof ${Component}>;
${buttonData ? "type ActionProps<T> = T extends unknown ? Omit<T, 'children' | 'view' | 'size' | 'disabled' | 'leftAddons' | 'rightAddons'> : never;" : ''}
${warnings.map(w => '// ' + w).join('\n')}
function Example({ ${bindings.length ? bindings.join(', ') + ', ' : ''}cardAction }: {
    ${types.join(';\n    ')}${types.length ? ';' : ''}
    cardAction?: { onClick: NonNullable<Props['onClick']> };
}) {
    return <${Component}
        size=${JSON.stringify(size)}
        ${title === undefined ? '' : `title={${JSON.stringify(title)}}`}
        ${subtitle === undefined ? '' : `subtitle={${JSON.stringify(subtitle)}}`}
        titleView=${JSON.stringify(titleView)}
        centred={${centred}}
        clickable={cardAction !== undefined}
        onClick={cardAction?.onClick}
        ${imageMode === 'none' ? '' : `image={image} imageOrientation=${JSON.stringify(imageMode)} imageCrop={${crop}} imageOffset={${offset}} imageAlign=${JSON.stringify(imageAlign)}`}
        ${bottom ? 'bottomAddon={bottomAddon}' : ''}
        ${buttonData ? `buttonsDirection=${JSON.stringify(buttonData.direction)}` : ''}
        ${props}
        backgroundPlateProps={{ children: undefined, promo: true, level: 'outer', backgroundColor: ${JSON.stringify(background)}, showSkeleton: ${skeleton} }}
    />;
}`,
    metadata: { nestable: false, props: {
        platform: isDesktop ? 'desktop' : 'mobile-web', sourceImport: 'arui-private/promo-card', sourceExport: Component,
        size, imageMode, imageCrop: crop, imageOffset: offset, imageAlign, imageInfo, titleView, centred,
        title, subtitle, bottomPreset, buttonData, background, skeleton, warnings,
        requiredContext: bindings, optionalContext: ['cardAction'], browserVerified: false,
    } },
};
