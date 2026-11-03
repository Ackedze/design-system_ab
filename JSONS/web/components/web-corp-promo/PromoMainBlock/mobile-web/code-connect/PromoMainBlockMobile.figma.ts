// url=https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA/Web----Corp-Promo-Components?node-id=2226-10113
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/promo-main-block/mobile/promo-main-block-mobile.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=PromoMainBlockMobile
import figma from 'figma';
import type { InstanceHandle, ResultSection } from 'figma';

const instance = figma.selectedInstance;
const isDesktop = false;
const componentName = 'PromoMainBlockMobile';
const importPath = 'arui-private/promo-main-block/mobile';

function booleanProperty(node: InstanceHandle, name: string) {
    const value = node.getBoolean(name);
    if (typeof value !== 'boolean') throw new Error(`Неизвестный BOOLEAN ${name}`);
    return value;
}

function flag(node: InstanceHandle, name: string) {
    const value = node.getEnum(name, { True: true, False: false });
    if (value === undefined) throw new Error(`Неизвестный VARIANT ${name}`);
    return value;
}

// Как в Core: готовые секции сохраняются, непрозрачный контент требует ReactNode.
function slotContent(sections: ResultSection[] | undefined) {
    if (!sections) throw new Error('Не найден Bottom slot PromoMainBlock');
    function opaque(section: ResultSection) {
        return section.type === 'SLOT' ||
            (section.type === 'INSTANCE' && !section.resultSections?.length) ||
            (section.type === 'CODE' && /^\s*\{\/\* [^\r\n]* — no Code Connect template found \*\/\}\s*$/.test(section.code));
    }
    function count(parts: ResultSection[]): number {
        return parts.reduce((total, section) => total + (opaque(section) ? 1 :
            section.type === 'INSTANCE' ? count(section.resultSections ?? []) : 0), 0);
    }
    const contextCount = count(sections);
    let index = 0;
    function render(parts: ResultSection[]): ResultSection[] {
        const result: ResultSection[] = [];
        for (const section of parts) {
            if (section.type === 'ERROR') throw new Error(`Ошибка Bottom slot: ${section.message}`);
            if (opaque(section)) {
                const expression = contextCount > 1 ? `customAddon[${index++}]` : 'customAddon';
                result.push(...figma.code`{${expression}}`.sections);
            } else if (section.type === 'INSTANCE') {
                result.push({ ...section, resultSections: render(section.resultSections ?? []) });
            } else result.push(section);
        }
        return result;
    }
    return { example: render(sections), contextCount };
}

function buttonLabel(group: InstanceHandle, name: string, expectedSize: string) {
    const button = group.findInstance(name);
    if (button.type !== 'INSTANCE') throw new Error(`Не найдена кнопка ${name}`);
    if (['Hint', 'LeftAddon', 'RightAddon'].some((key) => booleanProperty(button, key)) ||
        !booleanProperty(button, 'Label') || flag(button, 'SingleIcon') || flag(button, 'DisabledState')) {
        throw new Error(`${name}: публичный API PromoMainBlock не передаёт hint/addons/icon-only/disabled`);
    }
    if (button.getEnum('View', { Primary: 'primary', Secondary: 'secondary' }) !== name.toLowerCase() ||
        button.getEnum('Shape', { Rectangular: 'rectangular' }) !== 'rectangular' ||
        button.getPropertyValue('Size') !== expectedSize) {
        throw new Error(`${name}: View/Shape/Size не соответствует внутренней кнопке PromoMainBlock`);
    }
    return button.getString('✎ Label');
}

const appearance = instance.getEnum('Appearance', { Light: 'light', Dark: 'dark' });
if (!appearance) throw new Error('Неизвестный Appearance PromoMainBlock');
const withBackground = flag(instance, 'Background');
const view = isDesktop ? instance.getEnum('View', { Page: 'page', Modal: 'modal' }) : undefined;
if (isDesktop && !view) throw new Error('Неизвестный View PromoMainBlock');
const compact = isDesktop ? flag(instance, 'Compact') : false;
const blurEffect = isDesktop ? booleanProperty(instance, 'BlurEffect') : undefined;
const hasBottom = booleanProperty(instance, 'Bottom');
const hasButtons = booleanProperty(instance, 'ButtonGroup');
const hasHolding = booleanProperty(instance, 'Holding');
const hasStatus = booleanProperty(instance, 'Status');

const textPath = ['Content', 'ContentWrapper', 'Content', ...(isDesktop ? ['Text content'] : [])];
const title = instance.findText('value', { path: [...textPath, 'Title'] });
const subtitle = instance.findText('value', { path: [...textPath, 'Subtitle'] });
if (title.type !== 'TEXT' || subtitle.type !== 'TEXT') throw new Error('Не найдены Title/Subtitle PromoMainBlock');
const image = instance.findInstance('ImageView', {
    path: ['Content', isDesktop ? 'ImageContainer' : 'ImageContent', 'Container'],
});
if (image.type !== 'INSTANCE') throw new Error('Не найден ImageView PromoMainBlock');

let primary: string | undefined;
let secondary: string | undefined;
let layout: 'horizontal' | 'vertical' | undefined;
if (hasButtons) {
    const group = instance.findInstance('ButtonGroup', { path: ['Content', 'ContentWrapper'] });
    if (group.type !== 'INSTANCE') throw new Error('Не найдена ButtonGroup PromoMainBlock');
    const hasPrimary = flag(group, 'PrimaryButton');
    const hasSecondary = flag(group, 'SecondaryButton');
    if (hasSecondary && !hasPrimary) {
        throw new Error('Secondary-only: текущий исходник PromoMainBlock читает primaryButtonProps.loading; требуется исправление реализации');
    }
    if (isDesktop && flag(group, '🔒 Compact') !== compact) throw new Error('Compact группы не соответствует корню');
    layout = isDesktop ? 'horizontal' : group.getEnum('Axis', { Horizontal: 'horizontal', Vertical: 'vertical' } as const);
    if (!layout) throw new Error('Неизвестный Axis ButtonGroup');
    const size = compact ? '48' : '56';
    if (hasPrimary) primary = buttonLabel(group, 'Primary', size);
    if (hasSecondary) secondary = buttonLabel(group, 'Secondary', size);
}
const bottom = hasBottom ? slotContent(instance.getSlot('Bottom slot')) : undefined;
const names = ['imageProps', 'backgroundColor'];
const parameters = [
    `imageProps: NonNullable<Props['imageProps']> & { src: string; alt: string }`,
    `backgroundColor?: Props['backgroundColor']`,
];
if (primary !== undefined) {
    names.push('onPrimaryAction');
    parameters.push(`onPrimaryAction: NonNullable<Props['primaryButtonProps']>['onClick']`);
}
if (secondary !== undefined) {
    names.push('onSecondaryAction');
    parameters.push(`onSecondaryAction: NonNullable<Props['secondaryButtonProps']>['onClick']`);
}
if (hasStatus) { names.push('statuses'); parameters.push(`statuses: NonNullable<Props['statuses']>`); }
if (hasHolding) { names.push('holdingProps'); parameters.push(`holdingProps: NonNullable<Props['corporateFilterCompanySelectProps']>`); }
if (bottom?.contextCount) {
    names.push('customAddon');
    parameters.push(`customAddon: ${bottom.contextCount > 1 ? 'ReactNode[]' : 'ReactNode'}`);
}

const warnings = [
    ...(isDesktop && ((view === 'page' && withBackground) || (view === 'modal' && !withBackground)) ? ['raw Background не соответствует матрице контракта; значение не исправлено автоматически'] : []),
    ...(isDesktop && !blurEffect ? ['desktop BlurEffect выключен; проверь контракт'] : []),
    ...(!isDesktop && !withBackground ? ['raw mobile Background=False не допускается curated-контрактом'] : []),
    ...(!isDesktop && hasButtons ? ['Для mobile-лендинга действия выносятся во внешний fixed ButtonStack; здесь отражён raw ButtonGroup'] : []),
    ...(!isDesktop && hasHolding ? ['raw mobile Holding существует, но не допускается curated-сценарием лендинга'] : []),
    ...(hasStatus ? ['Статусы передаются явно: Figma StatusPreset и runtime Status имеют разные API'] : []),
];

export default {
    id: isDesktop ? 'corp-promo-main-block-desktop' : 'corp-promo-main-block-mobile-web',
    imports: [
        `import { ${componentName} } from '${importPath}';`,
        `import type { ComponentProps${bottom?.contextCount ? ', ReactNode' : ''} } from 'react';`,
    ],
    example: figma.code`type Props = ComponentProps<typeof ${componentName}>;
${warnings.map((warning) => `// ${warning}`).join('\n')}
function Example({ ${names.join(', ')} }: { ${parameters.join('; ')} }) {
    return <${componentName}
        title={${JSON.stringify(title.textContent)}}
        subtitle={${JSON.stringify(subtitle.textContent)}}
        appearance="${appearance}"
        withBackground={${withBackground}}
        imageProps={imageProps}
        backgroundColor={backgroundColor}
        ${isDesktop ? figma.code`view="${view}" compact={${compact}} blurEffect={${blurEffect}}` : ''}
        ${primary !== undefined ? figma.code`primaryButtonProps={{ label: ${JSON.stringify(primary)}, onClick: onPrimaryAction }}` : ''}
        ${secondary !== undefined ? figma.code`secondaryButtonProps={{ label: ${JSON.stringify(secondary)}, onClick: onSecondaryAction }}` : ''}
        ${layout ? figma.code`buttonsGroupLayout="${layout}"` : ''}
        ${hasStatus ? 'statuses={statuses}' : ''}
        ${hasHolding ? 'corporateFilterCompanySelectProps={holdingProps}' : ''}
        ${bottom ? figma.code`customAddon={<>${bottom.example}</>}` : ''}
    />;
}`,
    metadata: {
        nestable: false,
        props: { platform: isDesktop ? 'desktop' : 'mobile-web', imageLayerName: image.name, requiredContext: names.filter((name) => name !== 'backgroundColor'), warnings },
    },
};
