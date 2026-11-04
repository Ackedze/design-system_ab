// url=https://www.figma.com/design/IgMTjHSWHjRKY5HyQrDtbA/Web-Corp-Promo?node-id=4-9112
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/promo-table-view/promo-table-view-desktop.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=PromoTableViewDesktop
import figma from 'figma';
import type { InstanceHandle, ResultSection } from 'figma';
const instance = figma.selectedInstance;
const isDesktop = true;
const members = {"body": ["4:9031", "4:9038", "5:9397", "5:9379"], "first": ["4:9053", "4:9060", "5:9209"], "last": ["4:9083", "4:9086", "4:9089", "4:9093"], "head": ["4:9024", "4:9027"], "header": ["4:9347", "4:9363"], "row": ["4:9188", "4:9203", "4:9227", "4:9242"], "spacers": ["4:3640", "4:3677", "4:3679", "4:3681"]};
function pick<T>(node: InstanceHandle, name: string, values: Record<string, T>): T {
    const v = node.getEnum(name, values);
    if (v === undefined) throw new Error(`Неизвестный ${name}: ${node.getPropertyValue(name)}`);
    return v;
}
function flag(node: InstanceHandle, name: string): boolean {
    const v = node.getBoolean(name);
    if (typeof v !== 'boolean') throw new Error('Ожидается BOOLEAN ' + name);
    return v;
}
function direct(node: InstanceHandle, depth = 0): InstanceHandle[] {
    if (depth > 16) throw new Error('Слишком глубокая spacer hierarchy');
    const nodes = node.findLayers(n => n.type === 'INSTANCE', { path: [], traverseInstances: false })
        .filter((n): n is InstanceHandle => n.type === 'INSTANCE');
    return nodes.flatMap(n => members.spacers.includes(n.symbolId) ? direct(n, depth + 1) : [n]);
}
function only(nodes: InstanceHandle[], message: string): InstanceHandle {
    if (nodes.length !== 1) throw new Error(message);
    return nodes[0];
}
function child(node: InstanceHandle, name: string, path: string[] = []): InstanceHandle {
    return only(direct(node).filter(n => n.name === name), 'Не найден однозначный scoped child ' + name);
}
function descriptor(node: InstanceHandle) {
    return { symbolId: node.symbolId, properties: Object.fromEntries(Object.entries(node.properties).map(([k,v]) => [k,v.value])) };
}
function readHead(node: InstanceHandle) {
    const own = node.findLayers(n => n.type === 'TEXT', { path: [], traverseInstances: false });
    if (own.length !== 1 || own[0].type !== 'TEXT') throw new Error('HeaderCell требует один собственный text');
    const content = own[0].textContent;
    const addon = flag(node, 'RightAddon');
    return { content, addon, addonDescriptor: addon ? descriptor(child(node, 'RightAddon')) : undefined };
}
function readCell(node: InstanceHandle, first: boolean) {
    const preset = first ? pick(node, 'Presets', { 'Accent Title': 'accent', Text: 'text', SwapMe: 'slot' }) :
        pick(node, 'Presets', { Text: 'text', Status: 'status', StatusBadge: 'status-badge', SwapMe: 'slot' });
    if (preset === 'slot') return { type: 'slot' as const, preset };
    if (preset === 'status-badge') {
        const badge = only(direct(node).filter(n => n.name === 'StatusBadge'), 'Не найден StatusBadge');
        const view = pick(badge, 'View', { PositiveCheckmark: 'positive-checkmark', NegativeCross: 'negative-cross', NegativeAlert: 'negative-alert', NegativeBlock: 'negative-block', AttentionAlert: 'attention-alert', NeutralInformation: 'neutral-information', NeutralOperation: 'neutral-operation', NeutralCross: 'neutral-cross' });
        const size = pick(badge, 'Size', { '16': 16, '20': 20, '24': 24, '32': 32, '40': 40 });
        return { type: 'status-badge' as const, view, size, badgeDescriptor: direct(badge).map(descriptor) };
    }
    if (preset === 'status') {
        const p = only(direct(node).filter(n => n.name.includes('StatusPreset')), 'Не найден StatusPreset');
        const color = pick(p, 'Type', { Approved: 'green', Attention: 'orange', 'Error / Risk': 'red', Action: 'blue', Processing: 'purple', Neutral: 'grey' });
        const view = pick(p, 'Style', { Contrast: 'contrast', Muted: 'muted' });
        const size = pick(p, 'Size', { '20': 20, '24': 24, '32': 32, '40': 40 });
        const status = child(p, 'Status');
        if (status.getPropertyValue('Size') !== String(size)) throw new Error('Status size mismatch');
        const shape = pick(status, 'Shape', { Rounded: 'rounded', Rectangular: 'rectangular' });
        const label = only(direct(status).filter(n => n.name === '🔩 Label' || n.name === 'Label'), 'Не найден Status label');
        const uppercase = pick(label, 'Uppercase', { True: true, False: false });
        const addons = direct(status).filter(n => n.name === 'LeftAddon' || n.name === 'RightAddon').map(n => n.name === 'LeftAddon' ? 'leftAddons' : 'rightAddons');
        return { type: 'status' as const, color, view, size, shape, uppercase, label: label.getString('✎ Label'), addons };
    }
    const hasSubtitle = flag(node, 'Subtitle');
    // The native typed family fixes Title then Subtitle; nested addon text is excluded.
    const own = node.findLayers(n => n.type === 'TEXT', { path: [], traverseInstances: false });
    if (own.length !== (hasSubtitle ? 2 : 1) || own.some(n => n.type !== 'TEXT')) throw new Error('TEXT_ROLE_CARDINALITY: неоднозначный Title/Subtitle override');
    const values = own.filter((n): n is import('figma').TextHandle => n.type === 'TEXT').map(n => n.textContent);
    const title = values[0];
    const subtitle = hasSubtitle ? values[1] : undefined;
    return { type: 'text-content' as const, title, subtitle, titleAddon: title !== undefined && flag(node, 'TitleAddon'), subtitleAddon: subtitle !== undefined && flag(node, 'SubtitleAddon'), boldTitle: first ? preset === 'accent' : undefined };
}
function readLast(node: InstanceHandle) {
    const direction = pick(node, 'Axis', { Horizontal: 'row', Vertical: 'column' });
    if (!pick(node, 'PrimaryButton', { True: true, False: false })) throw new Error('LAST_SECONDARY_ONLY_UNSUPPORTED: public lastCells требует Primary, фиктивное действие не создаётся');
    const read = (role: string) => {
        const button = child(node, role, ['ButtonGroup']);
        if (button.getPropertyValue('View') !== role || button.getPropertyValue('Size') !== '48' || button.getPropertyValue('Shape') !== 'Rectangular' || pick(button, 'SingleIcon', { True: true, False: false }) || pick(button, 'DisabledState', { True: true, False: false }) || !flag(button, 'Label') || flag(button, 'Hint') || flag(button, 'LeftAddon') || flag(button, 'RightAddon')) throw new Error('LastCell API не передаёт size/view/disabled/Hint/addons; требуется отдельный рецепт');
        return { label: button.getString('✎ Label') };
    };
    return { direction, primary: read('Primary'), secondary: pick(node, 'SecondaryButton', { True: true, False: false }) ? read('Secondary') : undefined };
}

function readSurface(node: InstanceHandle) {
    const plate = direct(node).find(n => n.name.endsWith('[Promo] BackgroundPlate'));
    if (!plate) return undefined;
    pick(plate, 'Position', { 'Level 1 (outer)': 'outer' });
    const style = only(direct(plate).filter(n => n.name.endsWith('Style Level 1')), 'Не найден row Style');
    const view = pick(style, 'Type', { Primary: 'primary', Colored: 'colored' });
    const background = pick(style, 'BackgroundColor', { 'base-bg (white)': 'base-bg', 'base-bg-alt (gray)': 'base-bg-alt' });
    if (pick(style, 'Skeleton', { True: true, False: false })) throw new Error('SKELETON_UNSUPPORTED: public PromoTableView API не управляет skeleton');
    return { view, background };
}

const orientation = pick(instance, 'Axis', { Horizontal: 'horizontal', Vertical: 'vertical' });
const stylePreset = pick(instance, 'Style preset', { White: 'white', Gray: 'gray' });
const top = direct(instance);
if (top.some(n => !members.row.includes(n.symbolId) && !members.header.includes(n.symbolId))) throw new Error('Неизвестный root instance таблицы');
const rowNodes = top.filter(n => members.row.includes(n.symbolId));
if (!rowNodes.length) throw new Error('Нет видимых BodyRow');
let headers: ReturnType<typeof readHead>[] = [];
let headerLast: boolean | undefined;
let headerBg: boolean | undefined;
let headerSurface: ReturnType<typeof readSurface>;
if (orientation === 'horizontal') {
    const head = only(top.filter(n => members.header.includes(n.symbolId)), 'Горизонтальная таблица требует HeadRow');
    headers = direct(head).filter(n => members.head.includes(n.symbolId)).map(readHead);
    headerLast = flag(head, 'LastCell');
    headerBg = pick(head, 'Bg plate', { True: true, False: false });
    headerSurface = readSurface(head);
} else if (top.some(n => members.header.includes(n.symbolId))) throw new Error('Vertical headers должны находиться в карточках');
const rows = rowNodes.map(row => {
    if (pick(row, 'Axis', { Horizontal: 'horizontal', Vertical: 'vertical' }) !== orientation) throw new Error('Row Axis не совпадает с root');
    const rowStyle = pick(row, 'Style preset', { White: 'white', Gray: 'gray' });
    const nested = direct(row);
    if (nested.some(n => (n.name.includes('BodyCell') || n.name.includes('FirstHeadCell')) && ![...members.first,...members.body,...members.last,...members.head].includes(n.symbolId))) throw new Error('Чужая cell family');
    const first = nested.filter(n => members.first.includes(n.symbolId));
    const last = nested.filter(n => members.last.includes(n.symbolId));
    if (first.length > 1 || last.length > 1 || !!first.length !== flag(row,'FirstCell') || !!last.length !== flag(row,'LastCell')) throw new Error('Row FirstCell/LastCell и видимость расходятся');
    const cells = nested.filter(n => members.body.includes(n.symbolId)).map(n => readCell(n,false));
    if (orientation === 'vertical') {
        const rowHeaders = nested.filter(n => members.head.includes(n.symbolId)).map(readHead);
        if (!headers.length) headers = rowHeaders;
        else if (JSON.stringify(headers) !== JSON.stringify(rowHeaders)) throw new Error('HEADER_CORRESPONDENCE: API использует общие headerCells; headers карточек различаются');
    }
    if (!headers.length || cells.length + first.length !== headers.length) throw new Error('HEADER_CARDINALITY: число логических cells не совпадает с headerCells');
    return { first: first.length ? readCell(first[0],true) : undefined, cells, last: last.length ? readLast(last[0]) : undefined, rowStyle, surface: readSurface(row) };
});
if (headerLast !== undefined && headerLast !== rows.some(r => r.last !== undefined)) throw new Error('Header LastCell не совпадает с наличием lastCells');
const warnings = ['IDs и обработчики — данные приложения; цены сохраняются строками, а SwapMe передаётся как реальный ReactNode.'];
if (stylePreset !== (isDesktop ? 'white' : 'gray') || rows.some(r => r.rowStyle !== (isDesktop ? 'white' : 'gray'))) warnings.push('TABLE_STYLE_SOURCE_GAP: Source фиксирует Primary фон по платформе; Gray Desktop / White Mobile и per-row colors не настраиваются public API.');
if (rows.some(r => !r.surface || r.surface.view !== 'primary' || r.surface.background !== (isDesktop ? 'base-bg-alt' : 'base-bg'))) warnings.push('ROW_SURFACE_SOURCE_GAP: Source фиксирует Primary/Outer/background; выбранные row surface overrides не выражаются API.');
if (headerBg === false) warnings.push('HEADER_BACKGROUND_SOURCE_GAP: HorizontalLayout всегда создаёт BackgroundPlate для Header.');
const bindings: string[] = [];
const requiredBindings: string[] = [];
function bind(name: string, type: string): string {
    requiredBindings.push(name);bindings.push(`${JSON.stringify(name)}: ${type}`);
    return `bindings[${JSON.stringify(name)}]`;
}
function cellCode(cell: ReturnType<typeof readCell>, id: string, key: string, first: boolean): ResultSection[] {
    if (cell.type === 'slot') return figma.code`{ id: ${id}, type: 'slot', content: ${bind(key+':slot',"NonNullable<Extract<Body, {type:'slot'}>['content']>")} }`.sections;
    if (cell.type === 'status-badge') return figma.code`{ id: ${id}, type: 'status-badge', props: { ...${bind(key+':badgeProps',"Omit<Extract<Body, {type:'status-badge'}>['props'], 'view'|'size'>")}, view: ${JSON.stringify(cell.view)}, size: ${cell.size} } }`.sections;
    if (cell.type === 'status') {
        const addons = (cell.addons ?? []).map(name => `${name}: ${bind(key+':'+name,`NonNullable<Extract<Body,{type:'status'}>['props']['${name}']>`)}`);
        return figma.code`{ id: ${id}, type: 'status', props: { children: ${JSON.stringify(cell.label)}, color: ${JSON.stringify(cell.color)}, view: ${JSON.stringify(cell.view)}, size: ${cell.size}, shape: ${JSON.stringify(cell.shape)}, uppercase: ${cell.uppercase}, ${addons.join(', ')} } }`.sections;
    }
    const fields = [];
    if (cell.title !== undefined) fields.push('title: '+JSON.stringify(cell.title));
    if (cell.subtitle !== undefined) fields.push('subtitle: '+JSON.stringify(cell.subtitle));
    if (cell.titleAddon) fields.push('rightTitleAddon: '+bind(key+':titleAddon',"NonNullable<Extract<Body,{type:'text-content'}>['props']['rightTitleAddon']>"));
    if (cell.subtitleAddon) fields.push('rightSubtitleAddon: '+bind(key+':subtitleAddon',"NonNullable<Extract<Body,{type:'text-content'}>['props']['rightSubtitleAddon']>"));
    return figma.code`{ id: ${id}, type: 'text-content', ${first ? 'boldTitle: '+cell.boldTitle+',' : ''} props: { ${fields.join(', ')} } }`.sections;
}
const headerCode: ResultSection[] = [];
headers.forEach((h,i) => headerCode.push(...figma.code`{ id: ids.headers[${i}], content: ${JSON.stringify(h.content)}, ${h.addon ? 'rightAddon: '+bind('header-'+i+':addon',"NonNullable<Props['headerCells'][number]['rightAddon']>")+',' : ''} },`.sections));
const firstCode: ResultSection[] = [];
const lastCode: ResultSection[] = [];
const rowCode: ResultSection[] = [];
const idTypes: string[] = [];
const idScopes: string[] = [ 'ids.headers', '['+rows.map((_,i)=>`ids.rows[${i}].id`).join(', ')+']' ];
rows.forEach((row,i) => {
    idTypes.push(`{ id: string; ${row.first ? 'first: string;' : ''} ${row.last ? 'last: string;' : ''} cells: [${row.cells.map(()=> 'string').join(', ')}] }`);
    idScopes.push('['+[...(row.first ? [`ids.rows[${i}].first`] : []),`...ids.rows[${i}].cells`,...(row.last ? [`ids.rows[${i}].last`] : [])].join(', ')+']');
    if (row.first) firstCode.push(...figma.code`firstCells[${i}] = ${cellCode(row.first,`ids.rows[${i}].first`,'row-'+i+':first',true)};
`.sections);
    if (row.last) {
        const primary = bind('row-'+i+':primary',"NonNullable<Props['lastCells']>[number]['props']['primaryButtonProps']['onClick']");
        const secondary = row.last.secondary ? bind('row-'+i+':secondary',"NonNullable<NonNullable<Props['lastCells']>[number]['props']['secondaryButtonProps']>['onClick']") : undefined;
        lastCode.push(...figma.code`lastCells[${i}] = { id: ids.rows[${i}].last, direction: ${JSON.stringify(row.last.direction)}, props: { primaryButtonProps: { label: ${JSON.stringify(row.last.primary.label)}, onClick: ${primary} }, ${row.last.secondary ? `secondaryButtonProps: { label: ${JSON.stringify(row.last.secondary.label)}, onClick: ${secondary} },` : ''} } };
`.sections);
    }
    const cells: ResultSection[] = [];
    row.cells.forEach((c,j)=>cells.push(...figma.code`${cellCode(c,`ids.rows[${i}].cells[${j}]`,'row-'+i+':cell-'+j,false)},`.sections));
    rowCode.push(...figma.code`{ id: ids.rows[${i}].id, cells: [${cells}] },`.sections);
});
if (orientation === 'vertical') idScopes.push('['+rows.flatMap((r,i)=>r.first ? [`ids.rows[${i}].first`] : []).join(', ')+']');
const Component = isDesktop ? 'PromoTableViewDesktop' : 'PromoTableViewMobile';
export default {
    id: "corp-promo-table-view-desktop",
    imports: [`import { ${Component} } from 'arui-private/promo-table-view';`, "import type { ComponentProps } from 'react';"],
    example: figma.code`type Props = ComponentProps<typeof ${Component}>;
type Body = Props['rows'][number]['cells'][number];
${warnings.map(w=>'// '+w).join('\n')}
function Example({ ids, bindings, backgroundPlateBorder }: {
    ids: { headers: [${headers.map(()=> 'string').join(', ')}]; rows: [${idTypes.join(', ')}] };
    bindings: { ${bindings.join('; ')} };
    backgroundPlateBorder: NonNullable<Props['backgroundPlateBorder']>;
}) {
    const scopes = [${idScopes.join(', ')}];
    if (scopes.some(values => values.some(id => !id.trim()) || new Set(values).size !== values.length)) throw new Error('Table IDs must be nonempty and unique within their scope');
    const firstCells: NonNullable<Props['firstCells']> = [];
    const lastCells: NonNullable<Props['lastCells']> = [];
    ${firstCode}${lastCode}
    return <${Component}
        orientation=${JSON.stringify(orientation)}
        ${orientation === 'vertical' ? 'direction='+JSON.stringify(isDesktop ? 'row' : 'column') : ''}
        backgroundPlateBorder={backgroundPlateBorder}
        headerCells={[${headerCode}]}
        firstCells={firstCells}
        lastCells={lastCells}
        rows={[${rowCode}]}
    />;
}`,
    metadata: { nestable: false, props: {
        platform: isDesktop ? 'desktop' : 'mobile-web', sourceExport: Component, sourceImport: 'arui-private/promo-table-view',
        headerSurface, orientation, direction: isDesktop ? 'row' : 'column', stylePreset, headers, rows, requiredBindings,
        requiredContext: ['stable IDs','bindings','backgroundPlateBorder'], warnings, browserVerified: false,
    } },
};
