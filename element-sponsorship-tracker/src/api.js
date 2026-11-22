// Talks to the Netlify function. Viewing needs nothing; saving needs the editor passcode.
const URL_API = '/api/tracker';
const KEY_STORE = 'element-tracker-editor-key';

export const savedKey = () => { try { return localStorage.getItem(KEY_STORE) || ''; } catch { return ''; } };
export const rememberKey = (k) => { try { k ? localStorage.setItem(KEY_STORE, k) : localStorage.removeItem(KEY_STORE); } catch { /* private mode */ } };

async function readJson(res) {
  let body = null;
  try { body = await res.json(); } catch { /* not JSON */ }
  if (!res.ok) {
    const err = new Error((body && body.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

// With the passcode: { data } (the full tracker). Without it: { summary } (header numbers only).
export async function fetchTracker(key) {
  const headers = { accept: 'application/json' };
  if (key) headers['x-editor-key'] = key;
  const res = await fetch(URL_API, { headers, cache: 'no-store' });
  return readJson(res);
}

export async function checkKey(key) {
  const res = await fetch(URL_API, { method: 'POST', headers: { 'content-type': 'application/json', 'x-editor-key': key }, body: JSON.stringify({ type: 'auth' }) });
  await readJson(res);
  return true;
}

export async function saveOps(key, ops) {
  const res = await fetch(URL_API, { method: 'POST', headers: { 'content-type': 'application/json', 'x-editor-key': key }, body: JSON.stringify({ ops }) });
  return (await readJson(res)).data;
}

// Apply the same changes locally so the screen updates before the server answers.
export function applyLocal(data, ops) {
  const next = { ...data };
  ops.forEach((op) => {
    const coll = { ...(next[op.collection] || {}) };
    if (op.type === 'delete') delete coll[op.id];
    else if (op.type === 'set') coll[op.id] = { ...op.data };
    else if (op.type === 'update' && coll[op.id]) coll[op.id] = { ...coll[op.id], ...op.data };
    next[op.collection] = coll;
  });
  return next;
}

// The changes that put things back the way they were before `ops`.
export function inverseOps(data, ops) {
  return ops.map((op) => {
    const before = (data[op.collection] || {})[op.id];
    return before ? { type: 'set', collection: op.collection, id: op.id, data: before } : { type: 'delete', collection: op.collection, id: op.id };
  }).reverse();
}
