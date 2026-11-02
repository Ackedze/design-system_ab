import {useCallback, useEffectEvent, useLayoutEffect, useMemo, useRef, useState, type MouseEvent} from 'react';
import {ButtonGroup, type ButtonGroupProps} from 'arui-private/button-group';
import {CorporateContent} from 'arui-private/corporate-content';

export type ProposalMode = 'baseline-no-overflow' | 'opt-in-auto-overflow-commands';
export type Invocation = {groupId: string; actionId: string; source: 'picker'} |
    {groupId: string; actionId: string; source: 'button'; event: MouseEvent<HTMLButtonElement>};
export type TextAction = {id: string; label: string; view: 'primary' | 'secondary'; disabled: boolean;
    execute: (invocation: Invocation) => void};
export type LayoutObservation = {status: 'pending' | 'pass' | 'blocked'; reasons: string[];
    allocatedInlineSize: number; requiredInlineSize: number; visibleIds: string[]; hiddenIds: string[];
    pickerPresent: boolean; primaryVisible: boolean; originalOrder: string[]};
export type RoutingDiagnostic = {actionId: string | null; source: 'button' | 'picker'; outcome: 'executed' | 'denied';
    reason?: string; observation: LayoutObservation};
type Mapper = NonNullable<ButtonGroupProps['mapElementToPickerOption']>;
type PickerChange = NonNullable<NonNullable<ButtonGroupProps['pickerButtonProps']>['onChange']>;

export function validateActions(actions: readonly TextAction[], mode: ProposalMode) {
    if (!['baseline-no-overflow', 'opt-in-auto-overflow-commands'].includes(mode)) throw new Error('UNKNOWN_PROPOSAL_MODE');
    if (mode === 'baseline-no-overflow' && actions.length !== 2) throw new Error('BASELINE_REQUIRES_TWO_ACTIONS');
    if (actions.length < 1 || actions.length > 4) throw new Error('UNSUPPORTED_ACTION_COUNT');
    const ids = new Set<string>();
    actions.forEach((action, index) => {
        if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(action.id) || ids.has(action.id)) throw new Error('INVALID_ACTION_ID');
        ids.add(action.id);
        if (typeof action.label !== 'string' || !action.label.trim()) throw new Error('EMPTY_LABEL');
        if (!['primary', 'secondary'].includes(action.view) || typeof action.disabled !== 'boolean') throw new Error('INVALID_ACTION_STATE');
        if (action.view === 'primary' && index !== 0) throw new Error('PRIMARY_MUST_BE_FIRST');
        if (typeof action.execute !== 'function') throw new Error('MISSING_COMMAND');
    });
}

// Source-pinned DOM observation, not a documented ButtonGroup visibility API.
// A changed DOM shape must block the proposal rather than guess visibility.
export function readLayoutObservation(group: HTMLDivElement | null, actions: readonly TextAction[], mode: ProposalMode): LayoutObservation {
    const initial: LayoutObservation = {status: 'pending', reasons: [], allocatedInlineSize: 0, requiredInlineSize: 0,
        visibleIds: [], hiddenIds: [], pickerPresent: false, primaryVisible: false, originalOrder: actions.map(a => a.id)};
    if (!group || !group.isConnected || document.fonts.status !== 'loaded') return {...initial, reasons: ['MEASUREMENT_PENDING']};
    const content = group.firstElementChild;
    if (!(content instanceof HTMLElement)) return {...initial, status: 'blocked', reasons: ['SOURCE_DOM_SHAPE_CHANGED']};
    const wrappers = Array.from(content.children).filter(node => node.id !== 'button-group-picker-container');
    const picker = Array.from(content.children).find(node => node.id === 'button-group-picker-container');
    const result: LayoutObservation = {...initial, status: 'pass', allocatedInlineSize: content.clientWidth, pickerPresent: Boolean(picker)};
    if (wrappers.length !== actions.length) result.reasons.push('SOURCE_DOM_SHAPE_CHANGED');
    const contentBox = content.getBoundingClientRect();
    wrappers.forEach((wrapper, index) => {
        if (!(wrapper instanceof HTMLElement) || !actions[index]) {result.reasons.push('SOURCE_DOM_SHAPE_CHANGED'); return;}
        const action = actions[index];
        const button = wrapper.querySelector('button');
        const css = getComputedStyle(wrapper);
        if (!button || !['visible-recipe-' + action.id, 'hidden-recipe-' + action.id].includes(button.getAttribute('data-test-id') || '')) {
            result.reasons.push('UNPROVEN_ACTION_DOM_IDENTITY'); return;
        }
        const bounds = button.getBoundingClientRect();
        result.requiredInlineSize += wrapper.getBoundingClientRect().width + parseFloat(css.marginLeft || '0') + parseFloat(css.marginRight || '0');
        const visible = css.visibility === 'visible' && getComputedStyle(button).visibility === 'visible' && bounds.width > 0;
        (visible ? result.visibleIds : result.hiddenIds).push(action.id);
        if (visible && (bounds.left < contentBox.left || bounds.right > contentBox.right)) result.reasons.push('VISIBLE_ACTION_CLIPPED');
        if (visible && bounds.height !== 56) result.reasons.push('VISIBLE_ACTION_HEIGHT_MISMATCH');
    });
    result.requiredInlineSize = Math.ceil(result.requiredInlineSize);
    result.primaryVisible = actions[0]?.view !== 'primary' || result.visibleIds.includes(actions[0].id);
    if (result.allocatedInlineSize <= 0) result.reasons.push('NONPOSITIVE_ALLOCATION');
    if (!result.primaryVisible) result.reasons.push('PRIMARY_HIDDEN');
    if (mode === 'baseline-no-overflow') {
        if (result.requiredInlineSize > result.allocatedInlineSize) result.reasons.push('INSUFFICIENT_INLINE_SIZE');
        if (result.hiddenIds.length) result.reasons.push('HIDDEN_ACTIONS');
        if (result.pickerPresent) result.reasons.push('PICKER_PRESENT');
        if (result.visibleIds.length !== actions.length) result.reasons.push('VISIBLE_COUNT_MISMATCH');
    } else {
        if (!result.visibleIds.includes(actions[0]?.id)) result.reasons.push('LEADING_ACTION_HIDDEN');
        if (result.requiredInlineSize > result.allocatedInlineSize && !picker) result.reasons.push('SOURCE_OVERFLOW_NOT_SETTLED');
        if (picker instanceof HTMLElement) {
            const pickerBox = picker.getBoundingClientRect();
            if (pickerBox.right > contentBox.right || pickerBox.left < contentBox.left) result.reasons.push('PICKER_CLIPPED');
        }
    }
    if (result.reasons.length) result.status = 'blocked';
    return result;
}

export function makeBindings(groupId: string, actions: readonly TextAction[], mode: ProposalMode,
    dispatch: (id: string, invocation: Invocation) => void): Pick<ButtonGroupProps, 'elements' | 'primaryFirst' | 'size' | 'maxVisibleButtons' | 'mapElementToPickerOption' | 'pickerButtonProps'> {
    validateActions(actions, mode);
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(groupId)) throw new Error('INVALID_GROUP_ID');
    const elements: ButtonGroupProps['elements'] = actions.map(action => ({children: action.label, disabled: action.disabled,
        dataTestId: 'recipe-' + action.id, onClick: (event: MouseEvent<HTMLButtonElement>) => dispatch(action.id, {groupId, actionId: action.id, source: 'button', event})}));
    const primaryFirst = actions[0]?.view === 'primary';
    if (mode === 'baseline-no-overflow') return {elements, primaryFirst, size: 56, maxVisibleButtons: 4};
    const identities = new Map(elements.map((element, index) => [element, actions[index]]));
    const mapper: Mapper = (element, index) => {
        const action = identities.get(element);
        if (!action || elements[index] !== element) throw new Error('MAPPER_IDENTITY_MISMATCH');
        return {key: action.id, content: action.label, disabled: action.disabled, showCheckMark: false};
    };
    const onChange: PickerChange = payload => {
        // selected/value are not treated as business IDs; a real user initiator is required.
        if (payload.initiator) dispatch(payload.initiator.key, {groupId, actionId: payload.initiator.key, source: 'picker'});
    };
    return {elements, primaryFirst, size: 56, maxVisibleButtons: 4, mapElementToPickerOption: mapper,
        pickerButtonProps: {onChange, dataTestId: groupId + '-picker'}};
}

export function ProposedDesktopActions({groupId, actions, mode, inlineSize, onObservation, onRouting}: {
    groupId: string; actions: readonly TextAction[]; mode: ProposalMode; inlineSize: number;
    onObservation: (observation: LayoutObservation) => void; onRouting: (diagnostic: RoutingDiagnostic) => void;
}) {
    if (!Number.isFinite(inlineSize) || inlineSize <= 0) throw new Error('INVALID_CALLER_ALLOCATION');
    const ref = useRef<HTMLDivElement>(null);
    const [observation, setObservation] = useState<LayoutObservation | null>(null);
    const reportObservation = useEffectEvent(onObservation);
    const dispatch = useCallback((id: string, invocation: Invocation) => {
        const live = readLayoutObservation(ref.current, actions, mode);
        const action = actions.find(a => a.id === id);
        const reason = !action ? 'UNKNOWN_ACTION_ID' : action.disabled ? 'DISABLED_ACTION' : live.status !== 'pass' ? 'LIVE_LAYOUT_GUARD_BLOCKED' : undefined;
        onRouting({actionId: id, source: invocation.source, outcome: reason ? 'denied' : 'executed', reason, observation: live});
        if (action && !reason) action.execute(invocation);
    }, [actions, mode, onRouting]);
    const bindings = useMemo(() => makeBindings(groupId, actions, mode, dispatch), [groupId, actions, mode, dispatch]);
    useLayoutEffect(() => {
        const group = ref.current;
        if (!group) return;
        let frame = 0, alive = true;
        const measure = () => {
            const next = readLayoutObservation(group, actions, mode);
            setObservation(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
            reportObservation(next);
        };
        const schedule = () => {cancelAnimationFrame(frame); frame = requestAnimationFrame(measure);};
        const resize = new ResizeObserver(schedule), mutation = new MutationObserver(schedule);
        resize.observe(group);
        mutation.observe(group, {subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'disabled', 'data-test-id']});
        document.fonts.ready.then(() => {if (alive) schedule();});
        window.addEventListener('resize', schedule); schedule();
        return () => {alive = false; cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); window.removeEventListener('resize', schedule);};
    }, [actions, mode, inlineSize]);
    return <CorporateContent dataTestId="proposal-content">
        <div data-test-id="proposal-body-flow" style={{flex: '1 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}>
            <div data-test-id="proposal-allocation" style={{inlineSize, maxInlineSize: '100%', minInlineSize: 0}}
                inert={observation?.status !== 'pass'} data-proposal-check={observation?.status || 'pending'}>
                <ButtonGroup ref={ref} dataTestId={groupId} {...bindings} />
            </div>
        </div>
    </CorporateContent>;
}
