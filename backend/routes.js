// IMPERATIVE PARADIGM: step-by-step request handling, validation, control flow.
const express = require('express');
const db = require('./db');
const { FoodItem } = require('./models/FoodItem');
const { getStatuses, getEatFirst } = require('./logic/prologEngine');
const { sortBy, computeStats, todayStr } = require('./utils/functional');

const router = express.Router();

const REASONS = {
  urgent: 'Expires today',
  high: 'Perishable and expiring within 3 days',
  medium: 'Expiring within 3 days',
};
const LEVEL_RANK = { urgent: 0, high: 1, medium: 2 };

// ---------- helpers ----------
const loadActive = () =>
  db.prepare("SELECT * FROM food_items WHERE state = 'active' ORDER BY expiry_date ASC")
    .all()
    .map((row) => FoodItem.fromRow(row).toJSON());

function validate(body) {
  const errors = [];
  if (!body.name || !String(body.name).trim()) errors.push('name is required');
  if (!body.category || !String(body.category).trim()) errors.push('category is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.expiryDate || '')) errors.push('expiryDate must be YYYY-MM-DD');
  if (body.quantity !== undefined && !(Number(body.quantity) > 0)) errors.push('quantity must be > 0');
  return errors;
}

// ---------- CRUD ----------
router.get('/items', async (req, res, next) => {
  try {
    const items = loadActive();
    const statuses = await getStatuses(items);
    res.json(items.map((i) => ({ ...i, status: statuses[i.id] || 'fresh' })));
  } catch (e) { next(e); }
});

router.post('/items', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const { name, category, quantity = 1, unit = 'pc', expiryDate } = req.body;
  const info = db.prepare(
    'INSERT INTO food_items (name, category, quantity, unit, expiry_date) VALUES (?, ?, ?, ?, ?)'
  ).run(name.trim(), category.trim().toLowerCase(), Number(quantity), unit, expiryDate);
  const row = db.prepare('SELECT * FROM food_items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(FoodItem.fromRow(row).toJSON());
});

router.put('/items/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM food_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  const merged = {
    name: req.body.name ?? existing.name,
    category: req.body.category ?? existing.category,
    quantity: req.body.quantity ?? existing.quantity,
    unit: req.body.unit ?? existing.unit,
    expiryDate: req.body.expiryDate ?? existing.expiry_date,
  };
  const errors = validate(merged);
  if (errors.length) return res.status(400).json({ errors });
  db.prepare(
    'UPDATE food_items SET name=?, category=?, quantity=?, unit=?, expiry_date=? WHERE id=?'
  ).run(merged.name, merged.category.toLowerCase(), Number(merged.quantity), merged.unit, merged.expiryDate, req.params.id);
  const row = db.prepare('SELECT * FROM food_items WHERE id = ?').get(req.params.id);
  res.json(FoodItem.fromRow(row).toJSON());
});

router.delete('/items/:id', (req, res) => {
  const info = db.prepare('DELETE FROM food_items WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.status(204).end();
});

// ---------- actions ----------
// Mark as eaten / used (counts as "saved")
router.post('/items/:id/consume', (req, res) => {
  const info = db.prepare("UPDATE food_items SET state='consumed' WHERE id=? AND state='active'").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Active item not found' });
  res.json({ ok: true });
});

// Mark as thrown away (goes to waste log)
router.post('/items/:id/waste', (req, res) => {
  const item = db.prepare("SELECT * FROM food_items WHERE id=? AND state='active'").get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Active item not found' });
  const reason = (req.body.reason || (item.expiry_date < todayStr() ? 'expired' : 'other')).trim();
  db.transaction(() => {
    db.prepare("UPDATE food_items SET state='wasted' WHERE id=?").run(item.id);
    db.prepare('INSERT INTO waste_log (item_id, name, quantity, reason) VALUES (?, ?, ?, ?)')
      .run(item.id, item.name, item.quantity, reason);
  })();
  res.json({ ok: true });
});

// ---------- Prolog-powered ----------
router.get('/eat-first', async (req, res, next) => {
  try {
    const items = loadActive();
    const ranked = await getEatFirst(items);
    const byId = Object.fromEntries(items.map((i) => [i.id, i]));
    const result = ranked
      .map(({ id, level }) => {
        const item = byId[id];
        return {
          ...item,
          level,
          reason: `${item.daysLeft} day(s) left. ${REASONS[level]}.`,
        };
      })
      // functional: sort by level, then by days left
      .sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || a.daysLeft - b.daysLeft);
    res.json(result);
  } catch (e) { next(e); }
});

// ---------- stats ----------
router.get('/stats', (req, res) => {
  const items = db.prepare('SELECT * FROM food_items').all();
  const waste = db.prepare('SELECT * FROM waste_log').all();
  res.json(computeStats(items, waste));
});

router.get('/waste-log', (req, res) => {
  res.json(db.prepare('SELECT * FROM waste_log ORDER BY id DESC').all());
});

module.exports = router;
