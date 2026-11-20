import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { applyLocal, fetchTracker, inverseOps, rememberKey, saveOps, savedKey } from './api.js';
import { CADENCE, addDays, slugId, summarize, today } from './logic.js';
import { Slash } from './components/Brand.jsx';
import Masthead from './components/Masthead.jsx';
import DueToday from './components/DueToday.jsx';
import Pipeline from './components/Pipeline.jsx';
import ProspectForm from './components/ProspectForm.jsx';
import Progress from './components/Progress.jsx';
import Fighters from './components/Fighters.jsx';
import Timeline from './components/Timeline.jsx';
import WeeklyUpdate from './components/WeeklyUpdate.jsx';
import EditorLogin from './components/EditorLogin.jsx';

const EMPTY = { prospects: {}, fighters: {}, updates: {}, milestones: {}, inventory: [], stages: [] };
const POLL_MS = 15000;
const asList = (o) => Object.entries(o || {}).map(([id, v]) => ({ id, ...v }));

export default function App() {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('loading');
  const [lastSync, setLastSync] = useState(null);
  const [key, setKey] = useState(savedKey);
  const [login, setLogin] = useState(false);
  const [form, setForm] = useState(null); // { id } for edit, { id: null } for add
  const [toast, setToast] = useState(null);
  const saving = useRef(0);
  const dataRef = useRef(data);
  dataRef.current = data;

  const refresh = useCallback(async () => {
    if (saving.current) return;
    try {
      const d = await fetchTracker();
      if (!saving.current) { setData(d); setStatus('live'); setLastSync(new Date()); }
    } catch {
      setStatus((s) => (s === 'live' ? 'live' : 'error'));
    }
  }, []);

  useEffect(() => {
    refresh();
    const tick = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(tick); window.removeEventListener('focus', onFocus); };
  }, [refresh]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const commit = useCallback(async (ops, message, allowUndo = true) => {
    if (!key) { setLogin(true); return false; }
    const before = dataRef.current;
    const undo = allowUndo ? inverseOps(before, ops) : null;
    setData(applyLocal(before, ops));
    saving.current += 1;
    try {
      const d = await saveOps(key, ops);
      setData(d); setLastSync(new Date()); setStatus('live');
      setToast({ message, undo });
      return true;
    } catch (e) {
      setData(before);
      if (e.status === 401) { rememberKey(''); setKey(''); setToast({ message: 'That passcode no longer works. Sign in again to keep editing.' }); }
      else setToast({ message: e.message || 'Couldn’t save just now. Try again in a moment.' });
      return false;
    } finally {
      saving.current -= 1;
    }
  }, [key]);

  const sum = useMemo(() => summarize(data), [data]);
  const fighters = useMemo(() => asList(data.fighters), [data.fighters]);
  const updates = useMemo(() => asList(data.updates), [data.updates]);
  const milestones = useMemo(() => asList(data.milestones), [data.milestones]);
  const editor = !!key;

  const logTouch = (id) => {
    const p = data.prospects[id]; if (!p) return;
    const n = Math.min(4, (Number(p.touches) || 0) + 1);
    const [days, next] = CADENCE[n];
    const t = today();
    const change = { touches: n, last_contact: t, follow_up: days ? addDays(t, days) : '', next_action: next, updated_at: Date.now() };
    if (sum.stages.indexOf(p.stage) < 2) change.stage = sum.stages[2];
    commit([{ type: 'update', collection: 'prospects', id, data: change }], `Touch ${n} logged for ${p.brand}`);
  };

  const editing = form && form.id ? { id: form.id, ...data.prospects[form.id] } : null;

  return (
    <>
      <Masthead sum={sum} fighters={fighters} status={status} lastSync={lastSync} editor={editor}
        onEditor={() => { if (editor) { rememberKey(''); setKey(''); setToast({ message: 'Signed out. The tracker is read-only on this device.' }); } else setLogin(true); }} />
      <main>
        <DueToday sum={sum} editor={editor} onTouch={logTouch} onEdit={(id) => setForm({ id })} />
        <Pipeline sum={sum} inventory={data.inventory || []} editor={editor} onTouch={logTouch} onEdit={(id) => setForm({ id })} onAdd={() => setForm({ id: null })} />
        <Progress data={data} sum={sum} />
        <Fighters fighters={fighters} editor={editor}
          onSave={(id, d) => commit([{ type: 'update', collection: 'fighters', id, data: d }], `Saved ${data.fighters[id]?.fighter || 'fighter'}`)} />
        <Timeline milestones={milestones} editor={editor}
          onStatus={(id, s) => commit([{ type: 'update', collection: 'milestones', id, data: { status: s } }], `${data.milestones[id]?.milestone}: ${s}`)} />
        <WeeklyUpdate updates={updates} editor={editor}
          onAdd={(d) => commit([{ type: 'set', collection: 'updates', id: slugId('u-' + d.week_ending), data: d }], 'Added to the update')}
          onRemove={(id) => commit([{ type: 'delete', collection: 'updates', id }], 'Item removed')} />
      </main>
      <footer className="foot-band band">
        <span className="cap">Keg House Commons · West 7th, St. Paul</span>
        <span className="cap">Aden Lehman · Sponsorships and Creative · design.lehman@gmail.com</span>
        <Slash width={56} />
      </footer>

      {form && (
        <ProspectForm prospect={editing} stages={sum.stages} inventory={data.inventory || []} onClose={() => setForm(null)}
          onDelete={async () => { if (await commit([{ type: 'delete', collection: 'prospects', id: form.id }], `Deleted ${editing.brand}`)) setForm(null); }}
          onSave={async (d) => {
            const id = form.id || slugId(d.brand);
            if (await commit([{ type: 'set', collection: 'prospects', id, data: d }], form.id ? `Saved ${d.brand}` : `Added ${d.brand}`)) setForm(null);
          }} />
      )}
      {login && <EditorLogin onClose={() => setLogin(false)} onDone={(k) => { rememberKey(k); setKey(k); setLogin(false); setToast({ message: 'Signed in. You can edit the tracker on this device.' }); }} />}
      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.undo && <button type="button" onClick={() => { const u = toast.undo; setToast(null); commit(u, 'Undone', false); }}>Undo</button>}
        </div>
      )}
    </>
  );
}
