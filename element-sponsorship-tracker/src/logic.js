// Shared rules for the tracker: dates, money, stages and the follow-up cadence.
export const DEFAULT_STAGES = ['Prospecting', 'Qualified', 'Outreach initiated', 'In conversation', 'Proposal presented', 'Negotiation', 'Closed'];
export const WAVES = ['Warm', 'Wave 1', 'Wave 2', 'Wave 3', 'National'];
export const UPDATE_SECTIONS = ['Completed', 'This week', 'Next week', 'Developments', 'Declined', 'Upcoming', 'Decisions needed', 'Next priorities'];
export const PACKAGES = ['Corner · $500', 'Main event · $1,000', 'Fight program · $1,500', 'Season · $3,000'];

// After touch N, the next follow-up is due in `days` with this next step (outreach calendar cadence).
export const CADENCE = {
  1: [4, 'Touch 2: short bump with one new hook'],
  2: [4, 'Touch 3: phone call + 20-second voicemail'],
  3: [5, 'Touch 4: final note, happy to reopen in January'],
  4: [0, 'Reopen in January'],
};

const pad = (n) => String(n).padStart(2, '0');
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => iso(new Date());
export const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
export const shortDate = (s) => (s ? new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '');
export const longDate = (s) => (s ? new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');
export const money = (v) => '$' + Math.round(Number(v) || 0).toLocaleString('en-US');
export const nextFriday = () => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); return iso(d); };
export const slugId = (s) => (String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'item') + '-' + Date.now().toString(36);
export const twoDigits = pad;

export const stageNo = (stages, st) => { const i = stages.indexOf(st); return i < 0 ? 0 : i + 1; };

export function summarize(data) {
  const stages = data.stages?.length === 7 ? data.stages : DEFAULT_STAGES;
  const all = Object.entries(data.prospects || {}).map(([id, p]) => ({ id, ...p })).filter((p) => p.brand);
  const live = all.filter((p) => !p.declined);
  const n = (p) => stageNo(stages, p.stage);
  const closed = live.filter((p) => n(p) === 7);
  const active = live.filter((p) => n(p) >= 4 && n(p) <= 6);
  const inventory = data.inventory || [];
  return {
    stages, all, live, closed, active,
    signed: closed.reduce((t, p) => t + (Number(p.signed_value) || 0), 0),
    pipeline: active.reduce((t, p) => t + (Number(p.potential_value) || 0), 0),
    contacted: all.filter((p) => n(p) >= 3 || (p.touches || 0) > 0).length,
    positions: inventory.length,
    inventoryValue: inventory.reduce((t, r) => t + (Number(r.rate) || 0), 0),
  };
}

// The furthest stage any active prospect has reached on each partner position.
export function positionStatus(data) {
  const stages = data.stages?.length === 7 ? data.stages : DEFAULT_STAGES;
  const best = {};
  Object.values(data.prospects || {}).forEach((p) => {
    if (!p.brand || p.declined || !p.position_id) return;
    best[p.position_id] = Math.max(best[p.position_id] || 0, stageNo(stages, p.stage));
  });
  return best;
}
