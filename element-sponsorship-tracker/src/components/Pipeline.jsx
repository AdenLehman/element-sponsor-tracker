import { useMemo, useState } from 'react';
import { WAVES, money, shortDate, stageNo, today } from '../logic.js';

export default function Pipeline({ sum, inventory, editor, onTouch, onEdit, onAdd }) {
  const [q, setQ] = useState('');
  const [wave, setWave] = useState('');
  const [stage, setStage] = useState('');
  const [showDeclined, setShowDeclined] = useState(false);
  const t = today();
  const posById = useMemo(() => Object.fromEntries(inventory.map((r) => [r.position_id, r])), [inventory]);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return sum.all
      .filter((p) => (showDeclined || !p.declined) && (!wave || p.wave === wave) && (!stage || p.stage === stage) &&
        (!s || [p.brand, p.category, p.opportunity, p.next_action].join(' ').toLowerCase().includes(s)))
      .sort((a, b) => (!!a.declined - !!b.declined) || (a.follow_up || '9999').localeCompare(b.follow_up || '9999') || a.brand.localeCompare(b.brand));
  }, [sum.all, q, wave, stage, showDeclined]);

  return (
    <section className="band" id="pipeline">
      <div className="wrap">
        <div className="shead">
          <div><p className="eyebrow">Pipeline</p><h2>Who we’re talking to</h2></div>
          {editor && <button className="btn solid" type="button" onClick={onAdd}>Add prospect</button>}
        </div>
        <div className="tools">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand, category or opportunity" aria-label="Search prospects" />
          <select value={wave} onChange={(e) => setWave(e.target.value)} aria-label="Filter by wave">
            <option value="">All waves</option>{WAVES.map((w) => <option key={w}>{w}</option>)}
          </select>
          <select value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Filter by stage">
            <option value="">All stages</option>{sum.stages.map((s) => <option key={s}>{s}</option>)}
          </select>
          <label className="chip"><input type="checkbox" checked={showDeclined} onChange={(e) => setShowDeclined(e.target.checked)} /> Show declined</label>
        </div>
        <p className="note">Showing {rows.length} of {sum.all.length} prospects, soonest follow-up first.</p>
        <div className="tbl">
          <table className="stack">
            <thead><tr><th>Brand</th><th>Wave</th><th>Opportunity</th><th>Stage</th><th>Touches</th><th>Next action</th><th>Follow-up</th>{editor && <th>Update</th>}</tr></thead>
            <tbody>
              {rows.map((p) => {
                const n = stageNo(sum.stages, p.stage);
                const late = !p.declined && n < 7 && p.follow_up && p.follow_up <= t;
                const pos = p.position_id && posById[p.position_id];
                const tc = Number(p.touches) || 0;
                return (
                  <tr key={p.id}>
                    <td data-l="Brand" className="brandcell">{p.brand}<span className="sub">{p.category}</span></td>
                    <td data-l="Wave">{p.wave}</td>
                    <td data-l="Opportunity">{p.opportunity}
                      {pos && <span className="sub">{pos.position_id} · {pos.position}</span>}
                      {Number(p.potential_value) > 0 && <span className="sub">{money(p.potential_value)} potential</span>}</td>
                    <td data-l="Stage"><span className={'stage ' + (p.declined ? 'stx' : 'st' + n)}>{p.declined ? 'Declined' : p.stage}</span>
                      {p.declined && p.decline_reason && <span className="sub">{p.decline_reason}</span>}</td>
                    <td data-l="Touches"><span className="touch" aria-label={`${tc} of 4 touches`}>{[1, 2, 3, 4].map((i) => <i key={i} className={i <= tc ? 'on' : ''} />)}</span>
                      {p.last_contact && <span className="sub">Last {shortDate(p.last_contact)}</span>}</td>
                    <td data-l="Next action">{p.next_action}</td>
                    <td data-l="Follow-up" className={'d' + (late ? ' late-t' : '')}>{shortDate(p.follow_up)}</td>
                    {editor && <td data-l="Update"><span className="acts">
                      {!p.declined && tc < 4 && <button className="btn sm red" type="button" onClick={() => onTouch(p.id)}>Log touch</button>}
                      <button className="btn sm" type="button" onClick={() => onEdit(p.id)}>Edit</button>
                    </span></td>}
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={8} className="note">No prospects match.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="note" style={{ marginTop: 12 }}>Cadence: touch 1 email + LinkedIn · touch 2 a short bump 4–5 days later · touch 3 a phone call around day 8–10 · touch 4 a final note from day 14. Contact details and negotiation notes stay in the internal CRM.</p>
      </div>
    </section>
  );
}
