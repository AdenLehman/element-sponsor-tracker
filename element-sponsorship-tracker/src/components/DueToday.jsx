import { longDate, shortDate, today } from '../logic.js';

export default function DueToday({ sum, editor, onTouch, onEdit }) {
  const t = today();
  const open = sum.all.filter((p) => !p.declined && sum.stages.indexOf(p.stage) < 6 && p.follow_up);
  const due = open.filter((p) => p.follow_up <= t).sort((a, b) => a.follow_up.localeCompare(b.follow_up) || a.brand.localeCompare(b.brand));
  const next = open.filter((p) => p.follow_up > t).map((p) => p.follow_up).sort()[0];
  const note = due.length ? `${due.length} due or overdue${next ? ' · next after that: ' + longDate(next) : ''}` : next ? `Nothing due · next follow-up ${longDate(next)}` : '';
  return (
    <section className="band" id="today">
      <div className="wrap">
        <div className="shead"><div><p className="eyebrow">Follow-ups</p><h2>Due today</h2></div><p className="note">{note}</p></div>
        {due.length ? (
          <div className="today">
            {due.slice(0, 24).map((p) => {
              const late = p.follow_up < t;
              return (
                <div key={p.id} className={'due' + (late ? ' late' : '')}>
                  <div className="row"><b>{p.brand}</b><span className="cap">{p.wave}</span></div>
                  <span className="note">{p.next_action || 'Follow up'}</span>
                  <div className="row">
                    <span className={late ? 'late-t' : ''}>{late ? 'Overdue · ' : 'Today · '}{shortDate(p.follow_up)}</span>
                    {editor && <span className="acts">
                      {(p.touches || 0) < 4 && <button className="btn sm red" type="button" onClick={() => onTouch(p.id)}>Log touch</button>}
                      <button className="btn sm" type="button" onClick={() => onEdit(p.id)}>Edit</button>
                    </span>}
                  </div>
                </div>
              );
            })}
            {due.length > 24 && <p className="empty">{due.length - 24} more in the pipeline below.</p>}
          </div>
        ) : <p className="empty">No follow-ups due today.</p>}
      </div>
    </section>
  );
}
