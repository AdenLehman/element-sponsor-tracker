import { useState } from 'react';
import Modal from './Modal.jsx';
import { checkKey } from '../api.js';

export default function EditorLogin({ onDone, onClose }) {
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await checkKey(key); onDone(key); }
    catch (x) { setErr(x.message || 'Couldn’t check the passcode.'); }
    finally { setBusy(false); }
  };
  return (
    <Modal eyebrow="Editors only" title="Sign in to edit" onClose={onClose}>
      <form className="formwrap" onSubmit={submit}>
        <p className="note">Enter the editor passcode set in Netlify. Everyone else sees the tracker read-only. The passcode is remembered on this device.</p>
        <div className="form"><label className="full">Passcode<input type="password" autoComplete="current-password" value={key} onChange={(e) => setKey(e.target.value)} required /></label></div>
        {err && <p className="status">{err}</p>}
        <div className="foot"><span /><span className="acts"><button className="btn" type="button" onClick={onClose}>Cancel</button><button className="btn red" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button></span></div>
      </form>
    </Modal>
  );
}
