import { useState } from 'react';
import Modal from './Modal.jsx';
import { WAVES, money } from '../logic.js';

const FIELDS = ['brand', 'wave', 'category', 'opportunity', 'position_id', 'stage', 'first_touch', 'last_contact', 'follow_up', 'meeting_date', 'next_action', 'decline_reason'];

export default function ProspectForm({ prospect, stages, inventory, onSave, onDelete, onClose }) {
  const init = prospect || { wave: 'Wave 3', stage: stages[0], touches: 0 };
  const [f, setF] = useState(() => {
    const o = {};
    FIELDS.forEach((k) => { o[k] = init[k] || ''; });
    o.touches = String(init.touches || 0);
    o.potential_value = init.potential_value ?? '';
    o.signed_value = init.signed_value ?? '';
    o.declined = !!init.declined;
    return o;
  });
  const [err, setErr] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const num = (v) => (v === '' || v === null ? null : Math.max(0, Number(v) || 0));

  const submit = (e) => {
    e.preventDefault();
    if (!f.brand.trim()) { setErr('Add a brand name.'); return; }
    const data = {};
    FIELDS.forEach((k) => { data[k] = String(f[k] || '').trim(); });
    data.touches = Number(f.touches) || 0;
    data.potential_value = num(f.potential_value);
    data.signed_value = num(f.signed_value);
    data.declined = !!f.declined;
    data.updated_at = Date.now();
    onSave(data);
  };

  return (
    <Modal eyebrow="Prospect" title={prospect ? prospect.brand : 'Add prospect'} onClose={onClose}>
      <form onSubmit={submit} className="formwrap">
        <div className="form">
          <label className="full">Brand<input value={f.brand} onChange={set('brand')} required /></label>
          <label>Wave<select value={f.wave} onChange={set('wave')}>{WAVES.map((w) => <option key={w}>{w}</option>)}</select></label>
          <label>Category<input value={f.category} onChange={set('category')} /></label>
          <label className="full">Opportunity<input value={f.opportunity} onChange={set('opportunity')} placeholder="e.g. Presenting partner, annual bundle" /></label>
          <label>Partner position<select value={f.position_id} onChange={set('position_id')}>
            <option value="">Not assigned</option>
            {inventory.map((r) => <option key={r.position_id} value={r.position_id}>{r.position_id} · {r.position} · {money(r.rate)}</option>)}
          </select></label>
          <label>Stage<select value={f.stage} onChange={set('stage')}>{stages.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Touches sent<select value={f.touches} onChange={set('touches')}>{[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <label>First touch (planned)<input type="date" value={f.first_touch} onChange={set('first_touch')} /></label>
          <label>Last contact<input type="date" value={f.last_contact} onChange={set('last_contact')} /></label>
          <label>Follow-up<input type="date" value={f.follow_up} onChange={set('follow_up')} /></label>
          <label>Meeting<input type="date" value={f.meeting_date} onChange={set('meeting_date')} /></label>
          <label>Potential value ($)<input type="number" min="0" step="500" value={f.potential_value} onChange={set('potential_value')} /></label>
          <label>Signed value ($)<input type="number" min="0" step="500" value={f.signed_value} onChange={set('signed_value')} /></label>
          <label className="full">Next action<input value={f.next_action} onChange={set('next_action')} /></label>
          <label className="check full"><input type="checkbox" checked={f.declined} onChange={set('declined')} /> Declined / not pursuing</label>
          {f.declined && <label className="full">Decline reason<input value={f.decline_reason} onChange={set('decline_reason')} /></label>}
        </div>
        {err && <p className="status">{err}</p>}
        <div className="foot">
          {prospect ? <button className="btn" type="button" onClick={() => (confirmDel ? onDelete() : setConfirmDel(true))}>{confirmDel ? 'Click again to delete' : 'Delete'}</button> : <span />}
          <span className="acts"><button className="btn" type="button" onClick={onClose}>Cancel</button><button className="btn red" type="submit">Save</button></span>
        </div>
      </form>
    </Modal>
  );
}
