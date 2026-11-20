import { iso, positionStatus, shortDate, money } from '../logic.js';

function Bar({ label, segs, total, max, value }) {
  return (
    <div className="brow">
      <span>{label}</span>
      <span className="track" style={{ width: `${max ? (100 * total) / max : 0}%` }}>
        {segs.filter((s) => s[1]).map(([cls, n]) => <i key={cls} className={cls} style={{ width: `${(100 * n) / (total || 1)}%` }} />)}
      </span>
      <span className="val">{value}</span>
    </div>
  );
}

export default function Progress({ data, sum }) {
  const counts = sum.stages.map((s, i) => sum.all.filter((p) => sum.stages.indexOf(p.stage) >= i).length);
  const maxF = Math.max(1, ...counts);

  const weeks = {};
  sum.all.filter((p) => p.first_touch).forEach((p) => {
    const d = new Date(p.first_touch + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const k = iso(d);
    const w = (weeks[k] ||= { Warm: 0, 'Wave 1': 0, 'Wave 2': 0, 'Wave 3': 0, total: 0 });
    w[w[p.wave] !== undefined ? p.wave : 'Wave 3'] += 1; w.total += 1;
  });
  const wk = Object.keys(weeks).sort();
  const maxW = Math.max(1, ...wk.map((k) => weeks[k].total));

  const best = positionStatus(data);
  const inv = data.inventory || [];
  const tiers = [...new Set(inv.map((r) => r.tier))];
  const cls = (n) => (!n ? '' : n <= 3 ? 's1' : n === 4 ? 's2' : n <= 6 ? 's3' : 's4');

  return (
    <section className="band tint" id="progress">
      <div className="wrap">
        <div className="shead"><div><p className="eyebrow">Progress</p><h2>Where the campaign stands</h2></div></div>
        <div className="grid2">
          <div>
            <h3>Brands by stage reached</h3>
            <p className="note">Each brand counts at every stage it has reached, declined ones included.</p>
            <div className="rows">{sum.stages.map((s, i) => <Bar key={s} label={s} segs={[[i === 6 ? 'fi-red' : 'fi-ink', counts[i]]]} total={counts[i]} max={maxF} value={counts[i]} />)}</div>
          </div>
          <div>
            <h3>First touches by sprint week</h3>
            <p className="note">Planned first touch for each prospect, by week and wave.</p>
            <div className="rows">{wk.length ? wk.map((k, i) => (
              <Bar key={k} label={`Week ${i + 1} · ${shortDate(k)}`} total={weeks[k].total} max={maxW} value={weeks[k].total}
                segs={[['fi-gray', weeks[k].Warm], ['fi-ink', weeks[k]['Wave 1']], ['fi-mute', weeks[k]['Wave 2']], ['fi-red', weeks[k]['Wave 3']]]} />
            )) : <p className="note">No first touches scheduled.</p>}</div>
            <div className="keys"><Key c="fi-gray">Warm</Key><Key c="fi-ink">Wave 1</Key><Key c="fi-mute">Wave 2</Key><Key c="fi-red">Wave 3</Key></div>
          </div>
        </div>
        <div style={{ marginTop: 40 }}>
          <h3>Every partner position</h3>
          <p className="note">{inv.length} positions, {money(sum.inventoryValue)} a year at proposed rates. A position lights up when a prospect is assigned to it.</p>
          <div className="posmap">
            {tiers.map((t) => (
              <div className="tier" key={t}>
                <span className="cap">{t}</span>
                <span className="sq">{inv.filter((r) => r.tier === t).map((r) => (
                  <b key={r.position_id} className={cls(best[r.position_id])} title={`${r.position_id} · ${r.position} · ${money(r.rate)}`}>{r.position_id.split('-')[1]}</b>
                ))}</span>
              </div>
            ))}
          </div>
          <div className="keys"><Key c="k-open">Open</Key><Key c="k-line">Targeted</Key><Key c="k-red2">In conversation</Key><Key c="fi-ink">Proposal out</Key><Key c="fi-red">Signed</Key></div>
        </div>
      </div>
    </section>
  );
}

function Key({ c, children }) {
  return <span className="chip"><i className={c} />{children}</span>;
}
