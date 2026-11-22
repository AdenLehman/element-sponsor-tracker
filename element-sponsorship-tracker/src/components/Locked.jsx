import { useState } from 'react';
import { checkKey } from '../api.js';

// Shown below the header until the passcode is entered. The blurred layout is a placeholder:
// no names or details are loaded until the server accepts the passcode.
const ROWS = [62, 48, 70, 55, 66, 44, 58, 72, 50];

export default function Locked({ onUnlock }) {
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await checkKey(key); onUnlock(key); }
    catch (x) { setErr(x.status === 401 ? 'That passcode is not right.' : x.message || 'Couldn’t check the passcode.'); }
    finally { setBusy(false); }
  };
  return (
    <div className="locked">
      <div className="ghost-page" aria-hidden="true">
        {['Due today', 'Who we’re talking to', 'Where the campaign stands'].map((h, s) => (
          <section className={'band' + (s === 2 ? ' tint' : '')} key={h}>
            <div className="wrap">
              <div className="shead"><div><p className="eyebrow">{['Follow-ups', 'Pipeline', 'Progress'][s]}</p><h2>{h}</h2></div></div>
              {s === 0 && <div className="today">{[0, 1, 2].map((i) => <div className="due" key={i}><i className="gl w60" /><i className="gl w40" /><i className="gl w30" /></div>)}</div>}
              {s === 1 && <div className="ghost-rows">{ROWS.map((w, i) => <div className="ghost-row" key={i}><i className="gl" style={{ width: w * 0.4 + '%' }} /><i className="gl" style={{ width: '12%' }} /><i className="gl" style={{ width: w * 0.35 + '%' }} /><i className="gl pill" /></div>)}</div>}
              {s === 2 && <div className="grid2">{[0, 1].map((c) => <div key={c}>{ROWS.slice(0, 7).map((w, i) => <div className="brow" key={i}><i className="gl" /><span className="track" style={{ width: w + '%' }}><i className="fi-ink" style={{ width: '100%' }} /></span><i className="gl w30" /></div>)}</div>)}</div>}
            </div>
          </section>
        ))}
      </div>
      <div className="lock-card-wrap">
        <form className="lock-card" onSubmit={submit}>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="#151515" strokeWidth="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#151515" strokeWidth="2" /></svg>
          <p className="eyebrow">Private</p>
          <h2 className="sheet-title">Enter the passcode</h2>
          <p className="note">The pipeline, fighter sponsors, timeline and Friday update open with the editor passcode. It’s remembered on this device.</p>
          <input type="password" autoComplete="current-password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Passcode" aria-label="Passcode" required />
          {err && <p className="status">{err}</p>}
          <button className="btn red" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Unlock tracker'}</button>
        </form>
      </div>
    </div>
  );
}
