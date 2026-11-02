import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ButtonGroup} from 'arui-private/button-group';
import {CorporateContent} from 'arui-private/corporate-content';
import {PilotDesktop} from './PilotDesktop.generated';
import './host.css';

type EventRecord = {action: string; sequence: number};
declare global {interface Window {pilotEvents: EventRecord[];}}
window.pilotEvents = [];

function App() {
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [probeWidth, setProbeWidth] = useState(700);
    const record = (action: string) => {
        const next = [...window.pilotEvents, {action, sequence: window.pilotEvents.length + 1}];
        window.pilotEvents = next;
        setEvents(next);
    };
    const elements = [
        {children: 'Отправить', dataTestId: 'host-send', onClick: () => record('send')},
        {children: 'Отменить', dataTestId: 'host-cancel', onClick: () => record('cancel')},
    ];
    const overflowElements = ['Первое', 'Второе', 'Третье', 'Четвёртое'].map((label, index) => ({
        children: label, dataTestId: 'probe-' + index, onClick: () => record('probe-' + index),
    }));
    return <main>
        <h1>Проверка сборки компонентов</h1>
        <section data-test-id="raw-pilot"><h2>Исходная композиция</h2>
            <PilotDesktop onSend={() => record('raw-send')} onCancel={() => record('raw-cancel')} />
        </section>
        <section><h2>Композиция с шириной от host</h2>
            <CorporateContent dataTestId="hosted-content">
                <div className="body-width"><ButtonGroup dataTestId="hosted-group" size={56} primaryFirst maxVisibleButtons={4} elements={elements} /></div>
            </CorporateContent>
        </section>
        <section><h2>Недоступное действие</h2>
            <CorporateContent dataTestId="disabled-content">
                <div className="body-width"><ButtonGroup dataTestId="disabled-group" size={56} primaryFirst elements={[
                    {...elements[0], disabled: true, dataTestId: 'disabled-send'},
                    {...elements[1], dataTestId: 'enabled-cancel'},
                ]} /></div>
            </CorporateContent>
        </section>
        <section><h2>Проверка переноса действий</h2>
            <label>Ширина контейнера <input data-test-id="probe-width" type="number" min={1} value={probeWidth} onChange={event => {
                const value = event.currentTarget.valueAsNumber;
                if (Number.isFinite(value) && value > 0) setProbeWidth(value);
            }} /></label>
            <div style={{width: probeWidth, maxWidth: '100%'}}><ButtonGroup dataTestId="overflow-group" size={56} primaryFirst elements={overflowElements} /></div>
        </section>
        <output data-test-id="events" aria-live="polite">{JSON.stringify(events)}</output>
    </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
