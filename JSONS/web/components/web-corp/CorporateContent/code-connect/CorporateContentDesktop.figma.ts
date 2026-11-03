// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=89622-29551
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/corporate-content/corporate-content.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=CorporateContent
import figma from 'figma';
import type { ResultSection } from 'figma';

const instance = figma.selectedInstance;

// Как в Core: CLI не собирает локальные helpers, поэтому обе копии проверяются тестом.
function slotContent(sections: ResultSection[] | undefined) {
    if (!sections) throw new Error('Не найден обязательный Body SLOT CorporateContent');
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
            if (section.type === 'ERROR') throw new Error(`Ошибка Body: ${section.message}`);
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

const body = slotContent(instance.getSlot('[D] Body'));
const needsContext = body.contextCount > 0;

export default {
    id: 'corp-corporate-content-desktop',
    imports: [
        "import { CorporateContent } from 'arui-private/corporate-content';",
        ...(needsContext ? ["import type { ReactNode } from 'react';"] : []),
    ],
    example: figma.code`${needsContext ? `function Example({ children }: { children: ${body.contextCount > 1 ? 'ReactNode[]' : 'ReactNode'} }) { return (` : ''}<CorporateContent>${body.example}</CorporateContent>${needsContext ? '); }' : ''}`,
    metadata: { nestable: !needsContext },
};
