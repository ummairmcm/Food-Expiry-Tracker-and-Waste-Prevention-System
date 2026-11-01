// Bridge between Node and Prolog (Tau Prolog, runs in-process).
const fs = require('fs');
const path = require('path');
const pl = require('tau-prolog');

const RULES = fs.readFileSync(path.join(__dirname, 'rules.pl'), 'utf8');

// Make any category string a valid Prolog atom
const toAtom = (s) => {
  const a = String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'other';
  return /^[a-z]/.test(a) ? a : 'c_' + a;
};

const buildFacts = (items) =>
  items.map((i) => `item(${Number(i.id)}, ${toAtom(i.category)}, ${Math.trunc(i.daysLeft)}).`).join('\n');

const consult = (session, program) =>
  new Promise((resolve, reject) => session.consult(program, { success: resolve, error: reject }));

const query = (session, goal) =>
  new Promise((resolve, reject) => session.query(goal, { success: resolve, error: reject }));

const nextAnswer = (session) =>
  new Promise((resolve, reject) =>
    session.answer({
      success: (a) => resolve(a),
      fail: () => resolve(null),
      limit: () => resolve(null),
      error: reject,
    })
  );

const termValue = (t) => (t.value !== undefined ? t.value : t.id);

async function runQuery(items, goal, vars) {
  const session = pl.create(10000);
  await consult(session, RULES + '\n' + buildFacts(items));
  await query(session, goal);
  const rows = [];
  for (;;) {
    const ans = await nextAnswer(session);
    if (ans === null) break;
    rows.push(Object.fromEntries(vars.map((v) => [v, termValue(ans.lookup(v))])));
  }
  return rows;
}

// Returns { [id]: 'fresh' | 'use_soon' | 'use_today' | 'expired' }
async function getStatuses(items) {
  if (items.length === 0) return {};
  const rows = await runQuery(items, 'status(Id, S).', ['Id', 'S']);
  return Object.fromEntries(rows.map((r) => [r.Id, r.S]));
}

// Returns [{ id, level }] for items that should be eaten first
async function getEatFirst(items) {
  if (items.length === 0) return [];
  const rows = await runQuery(items, 'eat_first(Id, L).', ['Id', 'L']);
  return rows.map((r) => ({ id: r.Id, level: r.L }));
}

module.exports = { getStatuses, getEatFirst };
