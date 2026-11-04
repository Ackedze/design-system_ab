// url=https://www.figma.com/design/NrzEFUSTXgzOUmsfYym0xD/Web----Corp-Components?node-id=102669-84577
// source=https://git.moscow.alfaintra.net/projects/EF/repos/arui-private/browse/src/tabs-view/tabs-view.tsx?at=4bf38e2be8589da705f991b4dcac0d41975dff3d
// component=TabsView
import figma from 'figma';
import type { InstanceHandle, ResultSection } from 'figma';
const instance = figma.selectedInstance;
const isMobile = false;
function pick<T>(node: InstanceHandle, name: string, map: Record<string, T>): T {
    const v = node.getEnum(name, map); if (v === undefined) throw new Error('Неизвестный ' + name); return v;
}
function flag(node: InstanceHandle, name: string) {
    const v = node.getBoolean(name); if (typeof v !== 'boolean') throw new Error('Ожидается BOOLEAN ' + name); return v;
}
function direct(node: InstanceHandle) {
    return node.findLayers(n => n.type === 'INSTANCE', { path: [], traverseInstances: false }).filter((n): n is InstanceHandle => n.type === 'INSTANCE');
}
function only(nodes: InstanceHandle[], name: string) { if (nodes.length !== 1) throw new Error('Неоднозначный ' + name); return nodes[0]; }
const skeleton = pick(instance, 'Skeleton', { false: false, true: true });
const showSecondary = flag(instance, isMobile ? 'Secondary' : 'TabsSecondary');
type Item = { title: string; disabled: boolean; selected: boolean; addon: boolean };
const top = direct(instance);
let primary: Item[] = [], secondary: Item[] = [], active = -1, secondaryActive = -1;
let primarySlider = false, secondarySlider = false;
if (!skeleton) {
    const main = only(top.filter(n => n.name === 'TabsPrimary'), 'TabsPrimary');
    if (main.symbolId !== '155651:309756') throw new Error('Чужая TabsPrimary family');
    primarySlider = flag(main, 'Slider');
    const primaryNodes = direct(main);
    if (primaryNodes.some(n => n.name !== 'TabPrimary')) throw new Error('Неизвестный primary child');
    primary = primaryNodes.map(n => ({ title: n.getString('✎ Label'), disabled: pick(n, 'DisabledState', { False: false, True: true }), selected: pick(n, 'ActiveState', { True: true, False: false }), addon: flag(n, 'Addon') }));
    if (!primary.length || primary.filter(n => n.selected).length !== 1) throw new Error('Нужна одна выбранная primary вкладка');
    active = primary.findIndex(n => n.selected);
    const second = top.filter(n => n.name.endsWith('TabsSecondary'));
    if (showSecondary) {
        const wrapper = only(second, 'TabsSecondary');
        if (wrapper.symbolId !== (isMobile ? '155651:311222' : '155651:313093') || wrapper.getPropertyValue('Size') !== '40') throw new Error('Неподдержанная Secondary family/size');
        if (isMobile) { if (wrapper.getPropertyValue('View') !== 'Filled') throw new Error('Secondary source фиксирует Filled'); }
        else secondarySlider = flag(wrapper, 'Slider');
        // Items is a native SLOT, but the public API takes typed tab data rather than JSX.
        const nodes = direct(wrapper);
        if (nodes.some(n => n.name !== (isMobile ? '[M] Tag' : '[D] Tag'))) throw new Error('Неизвестный Items child');
        secondary = nodes.map(n => {
            if (!flag(n, 'Label') || flag(n, 'LeftAddon') || n.getPropertyValue('View') !== 'Filled' || n.getPropertyValue('Size') !== '40' || n.getPropertyValue('Shape') !== 'Rounded' || n.getPropertyValue('SingleIcon') !== 'False' || n.getPropertyValue('Indicator') !== 'Hidden') throw new Error('Tag state не выражается TabsProps');
            return { title: n.getString('✎ Label'), disabled: pick(n, 'DisabledState', { False: false, True: true }), selected: pick(n, 'SelectedState', { True: true, False: false }), addon: flag(n, 'RightAddon') };
        });
        if (!secondary.length || secondary.filter(n => n.selected).length !== 1) throw new Error('Нужна одна выбранная secondary вкладка');
        secondaryActive = secondary.findIndex(n => n.selected);
    } else if (second.length) throw new Error('Secondary flag и видимость расходятся');
}
const skeletonPrimaryCount = skeleton ? top.filter(n => n.name === 'Skeleton_Text').length : 0;
const skeletonSecondaryCount = skeleton ? top.filter(n => n.name === 'Skeleton').length : 0;
if (skeleton && (!skeletonPrimaryCount || (showSecondary && !skeletonSecondaryCount))) throw new Error('Неизвестная Skeleton structure');
const requiredAddons: string[] = [];
function itemCode(item: Item, id: string, key: string): ResultSection[] {
    if (item.addon) requiredAddons.push(key);
    return figma.code`{ id: ${id}, title: ${JSON.stringify(item.title)}, disabled: ${item.disabled}, ${item.addon ? 'rightAddons: addons['+JSON.stringify(key)+'],' : ''} }`.sections;
}
const secondaryCode: ResultSection[] = [];
secondary.forEach((item, i) => secondaryCode.push(...figma.code`${itemCode(item, 'ids.secondary['+i+']', 'secondary-'+i)},`.sections));
const tabsCode: ResultSection[] = [];
primary.forEach((item, i) => tabsCode.push(...figma.code`{
    ${showSecondary && i !== active ? '...secondaryByPrimary?.[ids.primary['+i+']],' : ''}
    mainTabProps: ${itemCode(item, 'ids.primary['+i+']', 'primary-'+i)},
    ${showSecondary && i === active ? figma.code`secondaryTabProps: [${secondaryCode}], activeSecondaryTabId: ids.secondary[${secondaryActive}],` : ''}
},`.sections));
const warnings = ['INITIAL_SELECTION_SOURCE_GAP: activePrimaryTab и activeSecondaryTabId инициализируют внутренний state; последующие изменения props source не синхронизирует.'];
if (primarySlider || secondarySlider) warnings.push('SLIDER_CONTEXT: source всегда scrollable; overflow зависит от ширины приложения.');
export default {
    id: 'corp-tabs-view-desktop',
    imports: ["import { TabsView } from 'arui-private/tabs-view';", "import type { ComponentProps } from 'react';"],
    example: figma.code`type Props = ComponentProps<typeof TabsView>;
type SecondaryData = Pick<Props['tabs'][number], 'secondaryTabProps' | 'activeSecondaryTabId'>;
${warnings.map(w => '// '+w).join('\n')}
function Example({ ${skeleton ? 'tabs, activePrimaryTab' : 'ids'+(showSecondary ? ', secondaryByPrimary' : '')}${requiredAddons.length ? ', addons' : ''}, dataTestId, onMainTabChange${showSecondary ? ', onSecondaryTabChange' : ''} }: {
    ${skeleton ? "tabs: Props['tabs']; activePrimaryTab: NonNullable<Props['activePrimaryTab']>;" : 'ids: { primary: ['+primary.map(()=> 'string').join(', ')+']; '+(showSecondary ? 'secondary: ['+secondary.map(()=> 'string').join(', ')+'];' : '')+' };'}
    ${!skeleton && showSecondary ? 'secondaryByPrimary?: Record<string, SecondaryData>;' : ''}
    ${requiredAddons.length ? 'addons: { '+requiredAddons.map(k=>JSON.stringify(k)+": NonNullable<Props['tabs'][number]['mainTabProps']['rightAddons']>").join('; ')+' };' : ''}
    dataTestId: NonNullable<Props['dataTestId']>; onMainTabChange: NonNullable<Props['onMainTabChange']>;
    ${showSecondary ? "onSecondaryTabChange: NonNullable<Props['onSecondaryTabChange']>;" : ''}
}) {
    const validIds = (values: unknown[]) => values.every(id => typeof id === 'string' && id.trim().length > 0) && new Set(values).size === values.length;
    if (!dataTestId.trim()) throw new Error('Нужен dataTestId приложения');
    ${skeleton ? `if (tabs.length !== ${skeletonPrimaryCount} || !validIds(tabs.map(t=>t.mainTabProps.id))) throw new Error('Нужны реальные tabs с устойчивыми уникальными ID');
    const current = tabs.find(t=>t.mainTabProps.id===activePrimaryTab);
    if (!current) throw new Error('activePrimaryTab должен существовать');
    ${showSecondary ? `if (current.secondaryTabProps?.length !== ${skeletonSecondaryCount} || !validIds(current.secondaryTabProps.map(t=>t.id)) || !current.secondaryTabProps.some(t=>t.id===current.activeSecondaryTabId)) throw new Error('Нужны реальные secondary tabs и выбранный ID');` : ''}
    const actualTabs = ${showSecondary ? 'tabs' : 'tabs.map(({mainTabProps})=>({mainTabProps}))'};` : figma.code`if (!validIds(ids.primary)${showSecondary ? ' || !validIds(ids.secondary)' : ''}) throw new Error('Нужны уникальные непустые ID вкладок');
    ${showSecondary ? `for (const [owner, group] of Object.entries(secondaryByPrimary ?? {})) {
        if (!ids.primary.includes(owner) || owner === ids.primary[${active}]) throw new Error('Вторичная группа должна принадлежать другой известной primary вкладке');
        if (group.secondaryTabProps?.length && (!validIds(group.secondaryTabProps.map(t=>t.id)) || (group.activeSecondaryTabId !== undefined && !group.secondaryTabProps.some(t=>t.id===group.activeSecondaryTabId)))) throw new Error('Некорректные ID secondary группы');
    }` : ''}
    const actualTabs: Props['tabs'] = [${tabsCode}];`}
    return <TabsView tabs={actualTabs} activePrimaryTab={${skeleton ? 'activePrimaryTab' : 'ids.primary['+active+']'}}
        additionalMainTabsWrapperProps={{ showSkeleton: ${skeleton} }}
        additionalSecondaryTabsWrapperProps={{ showSkeleton: ${skeleton} }}
        dataTestId={dataTestId} onMainTabChange={onMainTabChange}
        ${showSecondary ? 'onSecondaryTabChange={onSecondaryTabChange}' : ''}
    />;
}`,
    metadata: { nestable: false, props: { platform: isMobile ? 'mobile-web' : 'desktop', sourceImport: 'arui-private/tabs-view', sourceExport: 'TabsView', breakpoint: 768,
        skeleton, showSecondary, primary, secondary, active, secondaryActive, primarySlider, secondarySlider, requiredAddons,
        skeletonPrimaryCount, skeletonSecondaryCount, warnings, browserVerified: false,
        notes: ['Вторичный ряд принадлежит только выбранной primary вкладке; остальные группы задаёт приложение.', 'Skeleton не раскрывает подписи и бизнес-ID: нужны реальные tabs и выбранные ID.', 'Контент страниц и навигационные действия задаёт приложение; здесь отображается навигация.'] } },
};
