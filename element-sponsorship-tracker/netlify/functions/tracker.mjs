// The tracker's only server code: reads and saves the shared data in Netlify Blobs.
// GET  /api/tracker            -> { summary }         (no passcode: header numbers only, no names or details)
// GET  /api/tracker + key      -> { data }            (header x-editor-key = EDITOR_PASSCODE: the full tracker)
// POST /api/tracker            -> { data }            (editors only: header x-editor-key = EDITOR_PASSCODE)
//   body { type: "auth" }                      checks the passcode
//   body { ops: [ {type, collection, id, data} ] }   type = set | update | delete
import { getStore } from '@netlify/blobs';
import seed from '../../data/seed.js';

const KEY = 'tracker-v1';
const COLLECTIONS = new Set(['prospects', 'fighters', 'updates', 'milestones']);
const ID = /^[a-z0-9][a-z0-9_-]{0,79}$/i;
const MAX_BODY = 200_000;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const clone = (o) => JSON.parse(JSON.stringify(o));

async function load(store) {
  const found = await store.getWithMetadata(KEY, { type: 'json' });
  if (!found || !found.data) return { data: clone(seed), etag: null };
  return { data: found.data, etag: found.etag };
}

// Keep stored values plain: strings, numbers, booleans, null. Long text is trimmed.
function clean(value) {
  const out = {};
  for (const [k, v] of Object.entries(value || {})) {
    if (!/^[a-z_]{1,40}$/.test(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 600);
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean' || v === null) out[k] = v;
  }
  return out;
}

function apply(data, op) {
  if (!op || !COLLECTIONS.has(op.collection) || !ID.test(String(op.id || ''))) throw new Error('Invalid change');
  const coll = (data[op.collection] ||= {});
  if (op.type === 'delete') delete coll[op.id];
  else if (op.type === 'set') coll[op.id] = clean(op.data);
  else if (op.type === 'update') {
    if (!coll[op.id]) throw new Error('That item no longer exists');
    coll[op.id] = { ...coll[op.id], ...clean(op.data) };
  } else throw new Error('Invalid change');
}

// The only figures shown before the passcode is entered: totals, never names or details.
function summarize(data) {
  const stages = Array.isArray(data.stages) && data.stages.length === 7 ? data.stages : [];
  const n = (p) => stages.indexOf(p.stage) + 1;
  const all = Object.values(data.prospects || {}).filter((p) => p && p.brand);
  const live = all.filter((p) => !p.declined);
  const closed = live.filter((p) => n(p) === 7);
  const active = live.filter((p) => n(p) >= 4 && n(p) <= 6);
  const sum = (rows, f) => rows.reduce((t, r) => t + (Number(r[f]) || 0), 0);
  const fighters = Object.values(data.fighters || {});
  return {
    prospects: all.length,
    contacted: all.filter((p) => n(p) >= 3 || (Number(p.touches) || 0) > 0).length,
    closed: closed.length,
    active: active.length,
    signed: sum(closed, 'signed_value'),
    pipeline: sum(active, 'potential_value'),
    positions: (data.inventory || []).length,
    inventoryValue: sum(data.inventory || [], 'rate'),
    fightersTaken: fighters.filter((f) => f.sponsor).length,
    fightersTotal: fighters.length,
    updated_at: data.updated_at || 0,
  };
}

function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async (req) => {
  const store = getStore({ name: 'element-sponsorship', consistency: 'strong' });

  const passcode = process.env.EDITOR_PASSCODE;
  const sentKey = req.headers.get('x-editor-key') || '';

  if (req.method === 'GET') {
    const { data } = await load(store);
    if (!sentKey) return json({ summary: summarize(data) });
    if (passcode && sameSecret(sentKey, passcode)) return json({ data });
    return json({ error: 'That passcode is not right.' }, 401);
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  if (!passcode) return json({ error: 'Editing is not set up yet: add EDITOR_PASSCODE in Netlify.' }, 503);
  if (!sameSecret(sentKey, passcode)) return json({ error: 'That passcode is not right.' }, 401);

  const text = await req.text();
  if (text.length > MAX_BODY) return json({ error: 'Change too large' }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: 'Bad request' }, 400); }
  if (body.type === 'auth') return json({ ok: true });

  const ops = Array.isArray(body.ops) ? body.ops.slice(0, 50) : [];
  if (!ops.length) return json({ error: 'Nothing to save' }, 400);

  // Apply on the latest copy; if someone else saved in between, re-read and try again.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, etag } = await load(store);
    try { ops.forEach((op) => apply(data, op)); } catch (e) { return json({ error: e.message }, 400); }
    data.updated_at = Date.now();
    const result = await store.setJSON(KEY, data, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
    if (result && result.modified === false) continue;
    return json({ data });
  }
  return json({ error: 'Someone else is saving right now. Try again.' }, 409);
};

export const config = { path: '/api/tracker' };
