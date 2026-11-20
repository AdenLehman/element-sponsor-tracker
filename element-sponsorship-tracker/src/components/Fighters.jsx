import { useState } from 'react';
import Modal from './Modal.jsx';
import { PACKAGES, twoDigits } from '../logic.js';

export default function Fighters({ fighters, editor, onSave }) {
  const [editing, setEditing] = useState(null);
  const rows = fighters.slice().sort((a, b) => a.bout - b.bout);
  return (
    <section className="band" id="fighters">
      <div className="wrap">
        <div className="shead"><div><p className="eyebrow">Fighters · December 5 card</p><h2>Fighter sponsorships</h2></div>{editor && <p className="note">Click a card to assign a sponsor.</p>}</div>
        <div className="cards">
          {rows.map((f, i) => {
            const parts = String(f.fighter).split(' ');
            const inner = (
              <>
                <span className="top"><span>ELEMENT</span><span>{twoDigits(i + 1)}</span></span>
                <span className="face">{f.initials}</span>
                <span className="first">{parts[0]}</span>
                <span className="last">{parts.slice(1).join(' ')}</span>
                <span className="bout">Bout {twoDigits(f.bout)}</span>
                <span className="vs"><span>vs </span>{f.opponent}</span>
                <span className={'spn' + (f.sponsor ? ' taken' : '')}>{f.sponsor ? `${f.sponsor}${f.package ? ' · ' + f.package.split(' · ')[0] : ''}` : 'Sponsor: open'}</span>
              </>
            );
            return editor
              ? <button key={f.id} type="button" className="card" onClick={() => setEditing(f)}>{inner}</button>
              : <div key={f.id} className="card">{inner}</div>;
          })}
          {!rows.length && <p className="note">No fighters loaded.</p>}
        </div>
        <div className="prices">
          <div><span className="cap">Corner · single bout</span><b>$500</b></div>
          <div><span className="cap">Main event · single bout</span><b>$1,000</b></div>
          <div><span className="cap">Fight program · 3 nights</span><b>$1,500</b></div>
          <div><span className="cap">Season · 12 nights</span><b>$3,000</b></div>
        </div>
        <p className="note" style={{ marginTop: 12 }}>Fighter sponsors sit outside the 35-partner cap and the $490K inventory total.</p>
      </div>
      {editing && <FighterForm fighter={editing} onClose={() => setEditing(null)} onSave={(d) => { onSave(editing.id, d); setEditing(null); }} />}
    </section>
  );
}

function FighterForm({ fighter, onSave, onClose }) {
  const [sponsor, setSponsor] = useState(fighter.sponsor || '');
  const [pkg, setPkg] = useState(fighter.package || '');
  return (
    <Modal eyebrow="Fighter sponsor" title={`${fighter.fighter} · Bout ${twoDigits(fighter.bout)}`} onClose={onClose}>
      <form className="formwrap" onSubmit={(e) => { e.preventDefault(); onSave({ sponsor: sponsor.trim(), package: pkg }); }}>
        <div className="form">
          <label className="full">Sponsor (leave blank if open)<input value={sponsor} onChange={(e) => setSponsor(e.target.value)} /></label>
          <label className="full">Package<select value={pkg} onChange={(e) => setPkg(e.target.value)}><option value="">—</option>{PACKAGES.map((p) => <option key={p}>{p}</option>)}</select></label>
        </div>
        <div className="foot"><span /><span className="acts"><button className="btn" type="button" onClick={onClose}>Cancel</button><button className="btn red" type="submit">Save</button></span></div>
      </form>
    </Modal>
  );
}
