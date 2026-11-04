// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=103095-68575
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/faq/faq.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=FAQ
import figma from 'figma';
import type { InstanceHandle, ResultSection } from 'figma';

const instance = figma.selectedInstance;
const family: string = "promo-desktop";
const isItem = true;
const platform: string = "desktop";
const promo = family !== 'regular';
const itemId = 'corp-faq-item-' + family;
const memberIds: Record<string, string[]> = { regular: ['75685:85155', '75685:85164'], 'promo-desktop': ['103095:68576', '103095:68587'], 'promo-mobile': ['103095:68597', '103095:68608'] };
type ItemData = { family: string; question: string | null; answer: string | null; open: boolean; border: boolean; background: string | null; backgroundVisible: boolean };
function enumValue<T>(node: InstanceHandle, name: string, values: Record<string, T>): T {
    const value = node.getEnum(name, values);
    if (value === undefined) throw new Error(`Неизвестный ${name}: ${node.getPropertyValue(name)}`);
    return value;
}
function text(path: string[]): string | null {
    const nodes = instance.findLayers(n => n.type === 'TEXT', { path, traverseInstances: true });
    // ponytail: TextHandle exposes text only; use ReactNode overrides for rich content.
    return nodes.length === 1 && nodes[0].type === 'TEXT' ? nodes[0].textContent : null;
}
function readItem(node: InstanceHandle = instance, prefix: string[] = []): ItemData {
    const open = enumValue(node, 'Open', { True: true, False: false });
    const header = instance.findInstance('🔩 AccordionHeader', { path: [...prefix, 'Accordion', 'Header'], traverseInstances: true });
    if (header.type !== 'INSTANCE') throw new Error('Не найден FAQ AccordionHeader');
    enumValue(header, 'Preset', { Text: 'text' });
    let border = false;
    if (!promo) {
        border = node.getBoolean('Border');
        if (typeof border !== 'boolean') throw new Error('FAQItem Border должен быть BOOLEAN');
    }
    let background: string | null = null;
    let backgroundVisible = false;
    if (promo) {
        const platePrefix = platform === 'desktop' ? '[D][Promo]' : '[M][Promo]';
        const plate = instance.findInstance(platePrefix + ' BackgroundPlate', { path: prefix, traverseInstances: prefix.length > 0 });
        if (plate.type === 'INSTANCE') {
            backgroundVisible = true;
            enumValue(plate, 'Position', { 'Level 1 (outer)': 1 });
            const style = instance.findInstance(platePrefix + ' Style Level 1', { path: [...prefix, platePrefix + ' BackgroundPlate'], traverseInstances: true });
            if (style.type !== 'INSTANCE') throw new Error('Не найден FAQ Promo Style Level 1');
            enumValue(style, 'Type', { Primary: 'primary' });
            background = enumValue(style, 'BackgroundColor', { 'base-bg (white)': 'base-bg', 'base-bg-alt (gray)': 'base-bg-alt' });
        }
    }
    return { family, question: text([...prefix, 'Accordion', 'Header', '🔩 AccordionHeader']),
        answer: open ? text([...prefix, 'Accordion', 'Body', '🔩 AccordionBody']) : null,
        open, border, background, backgroundVisible };
}
function isData(value: unknown): value is ItemData {
    if (!value || typeof value !== 'object') return false;
    return 'family' in value && value.family === family && 'open' in value && typeof value.open === 'boolean' &&
        'border' in value && typeof value.border === 'boolean' && 'question' in value && (value.question === null || typeof value.question === 'string') &&
        'answer' in value && (value.answer === null || typeof value.answer === 'string') &&
        'backgroundVisible' in value && typeof value.backgroundVisible === 'boolean' &&
        'background' in value && (value.background === null || value.background === 'base-bg' || value.background === 'base-bg-alt');
}
const data: ItemData[] = [];
if (isItem) data.push(readItem());
else {
    const children = instance.findLayers(n => n.type === 'INSTANCE', { path: [], traverseInstances: false });
    if (!children.length) throw new Error('FAQ не содержит видимых FAQItem');
    for (const child of children) {
        if (child.type !== 'INSTANCE' || !memberIds[family].includes(child.symbolId) || !child.hasCodeConnect()) throw new Error('FAQ содержит неподдерживаемый item или отсутствует его Code Connect');
        if (children.filter(n => n.type === 'INSTANCE' && n.name === child.name).length !== 1) throw new Error('FAQItem layer names должны различаться для точного root path');
        const nested = child.executeTemplate();
        if (nested.example.some(section => section.type === 'ERROR')) throw new Error('FAQItem Code Connect execution failed');
        const value = nested.metadata?.props?.item;
        if (value !== undefined && !isData(value)) throw new Error('FAQItem metadata не соответствует текущему семейству');
        // Native preview can return an INSTANCE pill without metadata for a connected child.
        data.push(value === undefined ? readItem(child, [child.name]) : value);
    }
}
const colors = [...new Set(data.map(d => d.background).filter(c => c !== null))];
if (colors.length > 1) throw new Error('FAQ.promoBackground общий: разные фоны пунктов требуют отдельной композиции');
const background = colors[0] ?? (platform === 'desktop' ? 'base-bg-alt' : 'base-bg');
const contentTypes: string[] = [];
const items: ResultSection[] = [];
const expanded: string[] = [];
const borderless: string[] = [];
for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const value = (name: 'question' | 'answer') => item[name] === null ? `content[${i}].${name}` :
        `(content[${i}].${name} === undefined ? ${JSON.stringify(item[name])} : content[${i}].${name})`;
    contentTypes.push(`{ id: FAQItemType['id']; question${item.question === null ? '' : '?'}: ${item.question === null ? 'NonNullable<' : ''}FAQItemType['question']${item.question === null ? '>' : ''}; answer${item.answer === null ? '' : '?'}: ${item.answer === null ? 'NonNullable<' : ''}FAQItemType['answer']${item.answer === null ? '>' : ''} }`);
    items.push(...figma.code`{ id: content[${i}].id, question: ${value('question')}, answer: ${value('answer')} },`.sections);
    if (item.open) expanded.push(`content[${i}].id`);
    if (!item.border) borderless.push(`content[${i}].id`);
}
const warnings = ['isAccordion — поведение приложения; preExpanded задаёт только начальное раскрытие. Для rich content передайте ReactNode overrides, сохранив ссылки, форматирование и семантику.'];
if (data.some(d => d.answer === null)) warnings.push('Для закрытых/сложных ответов нужен настоящий answer приложения; текст из другого master не подставляется.');
if (promo && data.some(d => !d.backgroundVisible)) warnings.push('SOURCE_PROMO_PLATE_VISIBILITY_GAP: FAQ promo всегда рисует BackgroundPlate, хотя в выбранном FAQItem master фон скрыт.');

export default {
    id: "corp-faq-item-promo-desktop",
    imports: ["import { FAQ } from 'arui-private/faq';", "import type { FAQProps, FAQItemType } from 'arui-private/faq';"],
    example: figma.code`${warnings.map(w => '// ' + w).join('\n')}
function Example({ content, isAccordion, onItemClick }: {
    content: [${contentTypes.join(', ')}];
    isAccordion: NonNullable<FAQProps['isAccordion']>;
    onItemClick?: FAQProps['onItemClick'];
}) {
    const ids = content.map(item => item.id);
    if (ids.some(id => !id.trim()) || new Set(ids).size !== ids.length) throw new Error('FAQ item IDs must be nonempty and unique');
    return <FAQ
        isAccordion={isAccordion}
        onItemClick={onItemClick}
        preExpanded={[${expanded.join(', ')}]}
        ${promo ? `promo={true} promoBackground=${JSON.stringify(background)}` : `hideBorderForItems={[${borderless.join(', ')}]}`}
        items={[${items}]}
    />;
}`,
    metadata: { nestable: true, props: { item: isItem ? data[0] : undefined,
        platform, family, sourceImport: 'arui-private/faq', sourceExport: 'FAQ', breakpoint: 768,
        itemCount: data.length, initialOpen: data.map(d => d.open), observedContent: data,
        requiredContext: ['stable unique IDs', 'isAccordion', 'missing answers', 'rich ReactNode overrides when needed'],
        warnings, browserVerified: false,
    } },
};
