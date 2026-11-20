import { useMemo, useState } from 'react';
import { UPDATE_SECTIONS, longDate, nextFriday } from '../logic.js';

export default function WeeklyUpdate({ updates, editor, onAdd, onRemove }) {
  const weeks = useMemo(() => [...new Set(updates.map((u) => u.week_ending))].sort().reverse(), [updates]);
  const [picked, setPicked] = useState('');
  const week = weeks.includes(picked) ? picked : weeks[0] || '';
  const items = updates.filter((u) => u.week_ending === week).sort((a, b) => (a.order || 0) - (b.order || 0));
  const sections = [...new Set(items.map((u) => u.section))];
  const [draft, setDraft] = useState({ week: nextFriday(), section: 'Completed', item: '' });

  const add = (e) => {
    e.preventDefault();
    if (!draft.item.trim()) return;
    onAdd({ week_ending: draft.week, section: draft.section, item: draft.item.trim(), order: Date.now() });
    setDraft({ ...draft, item: '' });
    setPicked(draft.week);
  };

  return (
    <section className="band" id="update">
      <div className="wrap">
        <div className="shead">
          <div><p className="eyebrow">Friday update</p><h2>{week ? `Week ending ${longDate(week)}` : 'This week'}</h2></div>
          {weeks.length > 1 && <select value={week} onChange={(e) => setPicked(e.target.value)} aria-label="Choose week">
            {weeks.map((w) => <option key={w} value={w}>Week ending {longDate(w)}</option>)}
          </select>}
        </div>
        {sections.length ? (
          <div className="upd">{sections.map((s) => (
            <div key={s}><h4>{s}</h4><ul>{items.filter((u) => u.section === s).map((u) => (
              <li key={u.id}><span>{u.item}</span>{editor && <button className="x" type="button" onClick={() => onRemove(u.id)} aria-label="Remove item">×</button>}</li>
            ))}</ul></div>
          ))}</div>
        ) : <p className="empty">No update posted yet.</p>}
        {editor && (
          <form className="addrow" onSubmit={add}>
            <input type="date" value={draft.week} onChange={(e) => setDraft({ ...draft, week: e.target.value })} aria-label="Week ending" required />
            <select value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value })} aria-label="Section">{UPDATE_SECTIONS.map((s) => <option key={s}>{s}</option>)}</select>
            <input value={draft.item} onChange={(e) => setDraft({ ...draft, item: e.target.value })} placeholder="Add an item to the update" aria-label="Update item" required />
            <button className="btn solid" type="submit">Add</button>
          </form>
        )}
      </div>
    </section>
  );
}
