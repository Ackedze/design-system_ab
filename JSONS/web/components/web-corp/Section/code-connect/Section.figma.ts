// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=137848-49081
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/section/section.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=Section
import figma from 'figma';
import type { ResultSection } from 'figma';

const instance = figma.selectedInstance;
function variant(name: string): boolean {
    const value = instance.getEnum(name, { false: false, true: true });
    if (typeof value !== 'boolean') throw new Error('Неизвестный Section ' + name);
    return value;
}
const position = variant('Position');
const tabletIsle = variant('👽 TabletIsle');

// Native SLOT and unresolved children require real application content, as in CorporateContent.
function slotContent(name: string, prop: 'children' | 'sidebar') {
    const sections = instance.getSlot(name);
    if (!sections) throw new Error('Не найден обязательный Section SLOT ' + name);
    function opaque(section: ResultSection): boolean {
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
            if (section.type === 'ERROR') throw new Error('Section ' + name + ': ' + section.message);
            if (opaque(section)) {
                result.push(...figma.code`{${contextCount > 1 ? `${prop}[${index++}]` : prop}}`.sections);
            } else if (section.type === 'INSTANCE') {
                result.push({ ...section, resultSections: render(section.resultSections ?? []) });
            } else result.push(section);
        }
        return result;
    }
    const example = render(sections);
    return { example, contextCount, hasContent: example.some(s => s.type !== 'CODE' || s.code.trim().length > 0) };
}
const content = slotContent('Content', 'children');
const isle = slotContent('Isle', 'sidebar');
const inputs = [
    ...(content.contextCount ? [`children: NonNullable<Props['children']>${content.contextCount > 1 ? '[]' : ''}`] : []),
    ...(isle.contextCount ? [`sidebar: NonNullable<Props['sidebar']>${isle.contextCount > 1 ? '[]' : ''}`] : []),
];
const parameters = [content.contextCount ? 'children' : '', isle.contextCount ? 'sidebar' : ''].filter(Boolean);
const needsContext = inputs.length > 0;
const stackedOrder = position ? 2 : 1;

export default {
    id: 'corp-section-responsive',
    imports: ["import Section from 'arui-private/section';", ...(needsContext ? ["import type { ComponentProps } from 'react';"] : [])],
    example: figma.code`${needsContext ? `type Props = ComponentProps<typeof Section>;\nfunction Example({ ${parameters.join(', ')} }: { ${inputs.join('; ')} }) { return (` : ''}<Section
    sidebarOrder={{ desktop: 2, tablet: ${stackedOrder}, mobile: ${stackedOrder} }}
    ${isle.hasContent ? figma.code`sidebar={<>${isle.example}</>}` : ''}
>${content.example}</Section>${needsContext ? '); }' : ''}`,
    metadata: { nestable: !needsContext, props: {
        sourceImport: 'arui-private/section', sourceExport: 'default',
        responsivePlatforms: ['desktop', 'tablet', 'mobile-web'],
        position, tabletIsle, sidebarOrder: { desktop: 2, tablet: stackedOrder, mobile: stackedOrder },
        slotBindings: { Content: 'children', Isle: 'sidebar' },
        contextCount: { children: content.contextCount, sidebar: isle.contextCount },
        mobileFigmaIdentity: null, browserVerified: false,
        notes: ['Единый responsive Section; отдельный Mobile Figma set не обнаружен.', 'TabletIsle — автоматическое Figma-состояние, адаптивность задаёт существующий CSS.', 'Position определяет stacked order; mobile использует тот же порядок, отдельного mobile Figma evidence нет.'],
    } },
};
