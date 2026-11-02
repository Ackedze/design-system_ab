import {useCallback, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ProposedDesktopActions, type Invocation, type LayoutObservation, type ProposalMode, type RoutingDiagnostic, type TextAction} from './recipe';
import {materializeProposal} from './application';
import './probe.css';

type ProbeEvent = {actionId: string; groupId: string; source: Invocation['source']; label: string; targetTag?: string};
type CaseDefinition = {mode: ProposalMode; width: number; labels: string[]; ids: string[]; disabled: string[]};
const cases: Record<string, CaseDefinition> = {
    'baseline-short': {mode: 'baseline-no-overflow', width: 640, labels: ['Отправить', 'Отменить'], ids: ['send', 'cancel'], disabled: []},
    'baseline-long-disabled': {mode: 'baseline-no-overflow', width: 1000, labels: ['Проверить и подписать платёжное поручение', 'Вернуться к редактированию реквизитов'], ids: ['sign', 'edit'], disabled: ['edit']},
    'baseline-long-narrow': {mode: 'baseline-no-overflow', width: 220, labels: ['Проверить и подписать платёжное поручение', 'Вернуться к редактированию реквизитов'], ids: ['sign', 'edit'], disabled: []},
    'routing-four': {mode: 'opt-in-auto-overflow-commands', width: 240, labels: ['Запуск', 'Подтвердить', 'Отложить', 'Отмена'], ids: ['start', 'approve', 'defer', 'cancel'], disabled: ['defer']},
    'routing-two': {mode: 'opt-in-auto-overflow-commands', width: 220, labels: ['Запуск', 'Вернуться и изменить реквизиты платежа'], ids: ['start', 'edit'], disabled: []},
};
declare global {interface Window {recipeProbe: {caseId: string; observation: LayoutObservation | null; events: ProbeEvent[]; routing: RoutingDiagnostic[]};}}
window.recipeProbe = {caseId: 'baseline-short', observation: null, events: [], routing: []};

function App() {
    const [caseId, setCaseId] = useState('baseline-short');
    const [width, setWidth] = useState(cases[caseId].width);
    const [reordered, setReordered] = useState(false);
    const [renamed, setRenamed] = useState(false);
    const [revision, setRevision] = useState(0);
    const [observation, setObservation] = useState<LayoutObservation | null>(null);
    const [events, setEvents] = useState<ProbeEvent[]>([]);
    const definition = cases[caseId];
    const onObservation = useCallback((next: LayoutObservation) => {
        window.recipeProbe.observation = next;
        setObservation(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    }, []);
    const onRouting = useCallback((next: RoutingDiagnostic) => {window.recipeProbe.routing.push(next);}, []);
    const actions = useMemo<readonly TextAction[]>(() => {
        const disabledIds = new Set(definition.disabled);
        const records: TextAction[] = definition.ids.map((id, index) => ({id, label: renamed && index > 0 ? 'Действие' : definition.labels[index],
            view: index === 0 ? 'primary' : 'secondary', disabled: disabledIds.has(id),
            execute: invocation => {
                const event: ProbeEvent = {groupId: invocation.groupId, actionId: invocation.actionId, source: invocation.source,
                    label: renamed && index > 0 ? 'Действие' : definition.labels[index],
                    targetTag: invocation.source === 'button' ? invocation.event.currentTarget.tagName : undefined};
                const next = [...window.recipeProbe.events, event]; window.recipeProbe.events = next; setEvents(next);
            }}));
        const ordered = reordered ? [records[0], ...records.slice(1).reverse()] : records;
        return materializeProposal({profileId: definition.mode === 'baseline-no-overflow'
            ? 'desktop-size56.baseline-no-overflow.v1' : 'desktop-size56.opt-in-overflow-commands.v1',
            groupId: 'proposal-group', platform: 'desktop', size: 56, mode: definition.mode, inlineSize: definition.width,
            actions: ordered.map(({execute, ...action}) => ({...action, commandRef: 'probe.' + action.id}))},
            Object.fromEntries(records.map(action => ['probe.' + action.id, action.execute]))).actions;
    }, [definition, renamed, reordered]);
    const chooseCase = (nextId: string) => {
        setCaseId(nextId); setWidth(cases[nextId].width); setReordered(false); setRenamed(false); setObservation(null); setEvents([]); setRevision(n => n + 1);
        window.recipeProbe = {caseId: nextId, observation: null, events: [], routing: []};
    };
    return <main>
        <h1>Предложенные API-профили · v1</h1>
        <p>Браузерная проверка. Статус pass относится к измерению; профиль ожидает review.</p>
        <label>Сценарий <select data-test-id="case" value={caseId} onChange={event => chooseCase(event.currentTarget.value)}>
            {Object.keys(cases).map(id => <option key={id} value={id}>{id}</option>)}
        </select></label>
        <label>Allocation <input data-test-id="width" type="number" min={1} value={width} onChange={event => {
            const next = event.currentTarget.valueAsNumber; if (Number.isFinite(next) && next > 0) setWidth(next);
        }} /></label>
        <label><input data-test-id="rename" type="checkbox" checked={renamed} onChange={event => setRenamed(event.currentTarget.checked)} /> Одинаковые подписи вторичных действий</label>
        <label><input data-test-id="reorder" type="checkbox" checked={reordered} onChange={event => setReordered(event.currentTarget.checked)} /> Обратный порядок вторичных действий</label>
        <ProposedDesktopActions key={revision} groupId="proposal-group" mode={definition.mode} inlineSize={width}
            actions={actions} onObservation={onObservation} onRouting={onRouting} />
        <output data-test-id="observation">{JSON.stringify(observation)}</output>
        <output data-test-id="events">{JSON.stringify(events)}</output>
    </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
