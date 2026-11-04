// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=102592-139631
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/background-plate/mobile/background-plate-mobile.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=BackgroundPlateMobile
import figma from 'figma';
import type { InstanceHandle, ResultSection } from 'figma';

const instance = figma.selectedInstance;
const isDesktop = false;
const promo = true;
const isSlot = false;
const componentName = 'BackgroundPlateMobile';
const importPath = 'arui-private/background-plate/mobile';

function pick<T>(node: InstanceHandle, name: string, values: Record<string, T>): T {
    const value = node.getEnum(name, values);
    if (value === undefined) throw new Error(`Неизвестный VARIANT ${name}: ${node.getPropertyValue(name)}`);
    return value;
}
function slotContent(sections: ResultSection[] | undefined) {
    if (!sections) throw new Error('Не найден обязательный Slot SLOT BackgroundPlate');
    function opaque(section: ResultSection) {
        return (
            section.type === 'SLOT' ||
            (section.type === 'INSTANCE' && !section.resultSections?.length) ||
            (section.type === 'CODE' &&
                /^\s*\{\/\* [^\r\n]* — no Code Connect template found \*\/\}\s*$/.test(section.code))
        );
    }
    function count(parts: ResultSection[]): number {
        return parts.reduce((total, section) => total + (opaque(section)
            ? 1
            : section.type === 'INSTANCE' ? count(section.resultSections ?? []) : 0), 0);
    }
    const contextCount = count(sections);
    let contextIndex = 0;
    function render(parts: ResultSection[]): ResultSection[] {
        const result: ResultSection[] = [];
        for (const section of parts) {
            if (section.type === 'ERROR') throw new Error(`Ошибка Slot: ${section.message}`);
            if (opaque(section)) {
                const expression = contextCount > 1 ? `children[${contextIndex++}]` : 'children';
                result.push(...figma.code`{${expression}}`.sections);
            } else if (section.type === 'INSTANCE') {
                result.push({ ...section, resultSections: render(section.resultSections ?? []) });
            } else result.push(section);
        }
        return result;
    }
    return { example: render(sections), contextCount };
}
const level = isSlot ? 'outer' : pick(instance, 'Position', { 'Level 1 (outer)': 'outer', 'Level 2 (inner)': 'inner' });
const prefix = `${isDesktop ? '[D]' : '[M]'}${promo ? '[Promo]' : ''}`;
const styleName = `${prefix} Style Level ${level === 'outer' ? '1' : '2'}`;
const style = isSlot ? instance : instance.findInstance(styleName, { path: [], traverseInstances: true });
if (style.type !== 'INSTANCE') throw new Error(`Не найден ${styleName}`);
const view = pick(style, 'Type', { Primary: 'Primary', Secondary: 'Secondary', Colored: 'Colored', Border: 'Border' });
if (level === 'inner' && view === 'Secondary') throw new Error('Style Level 2: Secondary отсутствует в Figma family');
const skeleton = pick(style, 'Skeleton', { True: true, False: false });
const color = isSlot ? undefined : pick(style, 'BackgroundColor', {
    'base-bg-alt (gray)': 'base-bg-alt', 'base-bg (white)': 'base-bg',
});

const names: string[] = [];
const parameters: string[] = [];
let content;
let contentCount = 0;
if (isSlot) {
    const body = slotContent(instance.getSlot('Slot'));
    content = body.example.length ? body.example : figma.code`{null}`;
    contentCount = body.contextCount;
    if (contentCount) { names.push('children'); parameters.push(`children: ${contentCount > 1 ? 'ReactNode[]' : 'ReactNode'}`); }
    // Slot padding/layout is not a VARIANT; it belongs to the selected composition.
    names.push('layoutProps');
    parameters.push("layoutProps: { paddings?: Props['paddings']; style: Pick<NonNullable<Props['style']>, 'padding' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'display' | 'flexDirection' | 'gap' | 'alignItems' | 'justifyContent'> }");
} else {
    names.push('children'); parameters.push("children: Props['children']");
    content = figma.code`{children}`;
}
if (view === 'Colored') { names.push('coloredViewValue'); parameters.push("coloredViewValue: NonNullable<Props['coloredViewValue']>"); }
if (skeleton) { names.push('skeletonProps'); parameters.push("skeletonProps?: Omit<NonNullable<Props['skeletonProps']>, 'borderRadius'>"); }

export default {
    id: `corp-background-plate-${isDesktop ? 'desktop' : 'mobile-web'}${promo ? '-promo' : ''}${isSlot ? '-slot' : ''}`,
    imports: [
        `import { ${componentName} } from '${importPath}';`,
        "import { BackgroundPlateView } from 'arui-private/background-plate';",
        "import type { ComponentProps, ReactNode } from 'react';",
    ],
    example: figma.code`type Props = ComponentProps<typeof ${componentName}>;
${isSlot ? '// layoutProps: передай фактические padding, axis, gap и alignment выбранной композиции; параметры не угадываются.' : '// children: содержимое приложения; у этого семейства Figma нет native SLOT.'}
${view === 'Colored' ? '// coloredViewValue: используй значение разрешённого DS token, совпадающее с Figma fill.' : ''}
function Example({ ${names.join(', ')} }: { ${parameters.join('; ')} }) {
    return <${componentName}
        ${isSlot ? figma.code`{...layoutProps}` : ''}
        view={BackgroundPlateView.${view}}
        level="${level}"
        promo={${promo}}
        ${color ? figma.code`backgroundColor="${color}"` : ''}
        showSkeleton={${skeleton}}
        ${view === 'Colored' ? figma.code`coloredViewValue={coloredViewValue}` : ''}
        ${skeleton ? figma.code`skeletonProps={{ ...skeletonProps, borderRadius: ${isDesktop && !promo ? (level === 'outer' ? 16 : 12) : (level === 'outer' ? 24 : 16)} }}` : ''}
    >${content}</${componentName}>;
}`,
    metadata: { nestable: false, props: {
        platform: isDesktop ? 'desktop' : 'mobile-web', family: isSlot ? 'slot' : promo ? 'promo' : 'regular',
        level, view, skeleton, color: color ?? 'application-default', contentCount,
        requiredContext: names.filter((n) => n !== 'skeletonProps'),
        layoutSource: isSlot ? 'application context matching selected Figma composition' : 'component source',
    } },
};
