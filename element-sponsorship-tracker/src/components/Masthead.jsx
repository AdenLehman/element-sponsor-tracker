import { HexMark, Slash } from './Brand.jsx';
import { money } from '../logic.js';

// stats: header figures only (from the server before sign-in, from the full tracker after).
export default function Masthead({ stats, status, lastSync, editor, onEditor }) {
  const s = stats;
  const liveText = status === 'live'
    ? `Live · synced ${lastSync ? lastSync.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}`
    : status === 'error' ? 'Can’t reach the tracker right now' : 'Connecting…';
  return (
    <header className="mast band">
      <div className="wrap">
        <div className="bar">
          <div className="brand"><HexMark /><span className="word">ELEMENT</span><span className="gym">GYM</span></div>
          <div className="bar-right">
            <span className={'live' + (status === 'live' ? ' on' : '')}><i className="dot" />{liveText}</span>
            <button type="button" className="btn ghost sm" onClick={onEditor}>{editor ? 'Lock · sign out' : 'Enter passcode'}</button>
          </div>
        </div>
        <Slash className="slash" />
        <h1 className="title">Sponsorship<br /><span>Tracker</span></h1>
        <p className="lede">
          {s ? (
            <><b>{s.closed}</b> of <b>{s.positions}</b> partner positions signed and <b>{money(s.signed)}</b> secured. <b>{s.contacted}</b> of <b>{s.prospects}</b> prospects contacted, <b>{s.active}</b> in active conversation, against <b>{money(s.inventoryValue)}</b> of available inventory.</>
          ) : status === 'error' ? 'The live data can’t be reached right now. It will appear here as soon as it loads.' : 'Loading the live pipeline…'}
        </p>
        <div className="tiles">
          <Tile red label="Signed revenue" value={s ? money(s.signed) : '—'} note="Agreements signed" />
          <Tile label="Positions secured" value={s ? `${s.closed} / ${s.positions}` : '—'} note="One partner per category" />
          <Tile label="Prospects" value={s ? s.prospects : '—'} note={s ? `${s.contacted} contacted so far` : 'Brands in the pipeline'} />
          <Tile label="Active conversations" value={s ? s.active : '—'} note="Interest established" />
          <Tile label="Pipeline value" value={s ? money(s.pipeline) : '—'} note="Potential, not secured" />
          <Tile label="Fighter sponsors" value={s && s.fightersTotal ? `${s.fightersTaken} / ${s.fightersTotal}` : '—'} note="Dec 5 card slots filled" />
        </div>
      </div>
    </header>
  );
}

function Tile({ label, value, note, red }) {
  return (
    <div className={'tile' + (red ? ' r' : '')}>
      <span className="cap">{label}</span>
      <span className="big">{value}</span>
      <small>{note}</small>
    </div>
  );
}
