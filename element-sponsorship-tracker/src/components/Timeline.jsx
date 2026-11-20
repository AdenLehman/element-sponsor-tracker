import { useEffect, useRef, useState } from 'react';
import { addDays, iso, shortDate, today } from '../logic.js';

function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(900);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export default function Timeline({ milestones, editor, onStatus }) {
  const [ref, width] = useWidth();
  const M = milestones.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <section className="band tint" id="timeline">
      <div className="wrap">
        <div className="shead"><div><p className="eyebrow">Timeline · Nov 2026 – Apr 2027</p><h2>Six-month plan</h2></div></div>
        <div className="fig" ref={ref}>{M.length ? <Gantt M={M} W={Math.max(320, width)} /> : <p className="note">No milestones yet.</p>}</div>
        <div className="keys">
          <span className="chip"><i className="k-done" />Complete</span><span className="chip"><i className="fi-red" />In progress</span>
          <span className="chip"><i className="k-soft" />Up next</span><span className="chip"><i className="fi-ink" />Live event</span>
        </div>
        {editor && (
          <details className="mlist">
            <summary className="btn sm">Update milestone status</summary>
            <div className="scroll"><table><thead><tr><th>Milestone</th><th>Dates</th><th>Status</th></tr></thead><tbody>
              {M.map((m) => (
                <tr key={m.id}>
                  <td>{m.milestone}<span className="sub">{m.lane}</span></td>
                  <td className="d">{shortDate(m.start)}{m.end !== m.start ? ' – ' + shortDate(m.end) : ''}</td>
                  <td><select value={m.status} onChange={(e) => onStatus(m.id, e.target.value)} aria-label={`Status for ${m.milestone}`}>
                    {['Complete', 'In progress', 'Up next'].map((s) => <option key={s}>{s}</option>)}
                  </select></td>
                </tr>
              ))}
            </tbody></table></div>
          </details>
        )}
      </div>
    </section>
  );
}

function Gantt({ M, W }) {
  const narrow = W < 560;
  const lanes = [...new Set(M.map((m) => m.lane))];
  const rows = [];
  lanes.forEach((l, i) => { rows.push({ isLane: true, label: `${String.fromCharCode(65 + i)}.  ${l.toUpperCase()}` }); M.filter((m) => m.lane === l).forEach((m) => rows.push(m)); });
  const rowH = 30, top = 44, H = top + rows.length * rowH + 6, labW = Math.round(W * (narrow ? 0.4 : 0.27));
  const t0 = new Date(M.map((m) => m.start).sort()[0] + 'T00:00:00'); t0.setDate(1);
  const t1 = new Date(M.map((m) => m.end).sort().pop() + 'T00:00:00'); t1.setMonth(t1.getMonth() + 1, 1);
  const x = (s) => labW + (W - labW - 4) * ((new Date(s + 'T00:00:00') - t0) / (t1 - t0));
  const months = []; for (const d = new Date(t0); d < t1; d.setMonth(d.getMonth() + 1)) months.push(iso(d));
  const mw = (W - labW) / months.length;
  const now = today();
  const maxCh = Math.floor((labW - 12) / 7.2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Six-month campaign timeline">
      <line x1="0" x2={W} y1={top - 8} y2={top - 8} stroke="#151515" />
      {months.map((m) => (
        <g key={m}>
          <line x1={x(m)} x2={x(m)} y1="0" y2={H} stroke="#D8D8D3" />
          {mw > 30 && <text x={x(m) + 6} y="24" fontFamily="Lexend Exa, Arial" fontWeight="300" fontSize={mw > 70 ? 15 : 11} fill="#151515">
            {new Date(m + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</text>}
        </g>
      ))}
      {rows.map((r, i) => {
        const y = top + i * rowH;
        if (r.isLane) return (
          <g key={r.label}>
            {i > 0 && <line x1="0" x2={W} y1={y + 2} y2={y + 2} stroke="#151515" />}
            <text x="0" y={y + 20} fontSize="11" fontWeight="600" letterSpacing="1.5" fill="#D1262B">{r.label}</text>
          </g>
        );
        const prog = r.status === 'In progress', live = r.kind === 'live';
        const fill = prog ? '#D1262B' : live ? '#151515' : r.status === 'Complete' ? '#D8D8D3' : '#FAFAF7';
        const stroke = prog ? '#D1262B' : live || r.status === 'Complete' ? '#151515' : '#A8A7A2';
        const xs = x(r.start), xe = x(addDays(r.end, 1));
        const tip = `${r.milestone} · ${shortDate(r.start)}${r.end !== r.start ? ' – ' + shortDate(r.end) : ''} · ${r.status}${r.detail ? ' · ' + r.detail : ''}`;
        return (
          <g key={r.id}>
            <text x="0" y={y + 20} fontSize="13" fill="#151515"><title>{tip}</title>{r.milestone.length > maxCh ? r.milestone.slice(0, maxCh - 1) + '…' : r.milestone}</text>
            <rect x={xs + 1} y={y + 7} width={Math.max(8, xe - xs - 2)} height="16" rx="6" fill={fill} stroke={stroke}><title>{tip}</title></rect>
          </g>
        );
      })}
      {now >= iso(t0) && now < iso(t1) && (
        <g>
          <line x1={x(now)} x2={x(now)} y1={top - 8} y2={H} stroke="#D1262B" strokeWidth="1.5" strokeDasharray="5 5" />
          <rect x={x(now) - 26} y={top - 19} width="52" height="17" rx="4" fill="#D1262B" />
          <text x={x(now)} y={top - 6} textAnchor="middle" fontSize="10" fontWeight="600" letterSpacing="1.2" fill="#fff">TODAY</text>
        </g>
      )}
    </svg>
  );
}
