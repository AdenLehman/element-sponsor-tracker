import { HexMark, Slash } from './Brand.jsx';
import { money } from '../logic.js';

export default function Masthead({ sum, fighters, status, lastSync, editor, onEditor }) {
  const taken = fighters.filter((f) => f.sponsor).length;
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
            <button type="button" className="btn ghost sm" onClick={onEditor}>{editor ? 'Editor · sign out' : 'Editor sign-in'}</button>
          </div>
        </div>
        <Slash className="slash" />
        <h1 className="title">Sponsorship<br /><span>Tracker</span></h1>
        <p className="lede">
          {sum.all.length ? (
            <><b>{sum.closed.length}</b> of <b>{sum.positions}</b> partner positions signed and <b>{money(sum.signed)}</b> secured. <b>{sum.contacted}</b> of <b>{sum.all.length}</b> prospects contacted, <b>{sum.active.length}</b> in active conversation, against <b>{money(sum.inventoryValue)}</b> of available inventory.</>
          ) : status === 'error' ? 'The live data can’t be reached right now. It will appear here as soon as it loads.' : 'Loading the live pipeline…'}
        </p>
        <div className="tiles">
          <Tile red label="Signed revenue" value={money(sum.signed)} note="Agreements signed" />
          <Tile label="Positions secured" value={`${sum.closed.length} / ${sum.positions || 35}`} note="One partner per category" />
          <Tile label="Prospects" value={sum.all.length} note={`${sum.contacted} contacted so far`} />
          <Tile label="Active conversations" value={sum.active.length} note="Interest established" />
          <Tile label="Pipeline value" value={money(sum.pipeline)} note="Potential, not secured" />
          <Tile label="Fighter sponsors" value={fighters.length ? `${taken} / ${fighters.length}` : '—'} note="Dec 5 card slots filled" />
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
