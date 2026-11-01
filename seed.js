// Fills the database with demo data (dates are relative to today).
const db = require('./db');

const addDays = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

db.exec('DELETE FROM food_items; DELETE FROM waste_log;');

const demo = [
  ['Milk', 'dairy', 1, 'L', 1],
  ['Spinach', 'vegetable', 1, 'bunch', 1],
  ['Chicken breast', 'meat', 2, 'pc', 0],
  ['Yogurt', 'dairy', 4, 'cup', 3],
  ['Bananas', 'fruit', 6, 'pc', 2],
  ['Canned tuna', 'canned', 2, 'can', 3],
  ['Bread', 'bakery', 1, 'loaf', 3],
  ['Eggs', 'dairy', 12, 'pc', 10],
  ['Rice', 'grain', 2, 'kg', 120],
  ['Instant noodles', 'pantry', 5, 'pack', 90],
  ['Old tomatoes', 'vegetable', 3, 'pc', -2],
];

const insert = db.prepare(
  'INSERT INTO food_items (name, category, quantity, unit, expiry_date) VALUES (?, ?, ?, ?, ?)'
);
demo.forEach(([n, c, q, u, days]) => insert.run(n, c, q, u, addDays(days)));
console.log(`Seeded ${demo.length} items.`);
