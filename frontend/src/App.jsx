import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// ---------- pure helpers (functional style) ----------
const STATUS_ORDER = ['expired', 'use_today', 'use_soon', 'fresh'];
const STATUS_LABEL = {
  expired: 'Expired',
  use_today: 'Use today',
  use_soon: 'Use soon',
  fresh: 'Fresh',
};
const CATEGORIES = ['dairy', 'vegetable', 'meat', 'fruit', 'seafood', 'bakery', 'grain', 'canned', 'pantry'];

const groupBy = (keyFn) => (list) =>
  list.reduce((acc, x) => ({ ...acc, [keyFn(x)]: [...(acc[keyFn(x)] || []), x] }), {});

const daysText = (d) =>
  d < 0 ? `${Math.abs(d)} day${d === -1 ? '' : 's'} ago` : d === 0 ? 'today' : `${d} day${d === 1 ? '' : 's'}`;

// ---------- data hook ----------
function usePantry() {
  const [state, setState] = useState({ items: [], eatFirst: [], stats: null, error: '', loading: true });

  const refresh = useCallback(async () => {
    try {
      const [items, eatFirst, stats] = await Promise.all([api.items(), api.eatFirst(), api.stats()]);
      setState({ items, eatFirst, stats, error: '', loading: false });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: 'Cannot reach the server. Is the back end running on port 3001?' }));
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { ...state, refresh };
}

// ---------- components ----------
function ItemRow({ item, onEaten, onThrown, reason }) {
  return (
    <li className={`item s-${item.status || item.level}`}>
      <div className="item-main">
        <strong>{item.name}</strong>
        <span className="muted">{item.quantity} {item.unit} · {item.category}</span>
        {reason && <span className="reason">{reason}</span>}
      </div>
      <div className="days" aria-label={`Expires ${daysText(item.daysLeft)}`}>
        <span className="days-num">{item.daysLeft < 0 ? Math.abs(item.daysLeft) : item.daysLeft}</span>
        <span className="days-unit">{item.daysLeft < 0 ? 'days past' : 'days left'}</span>
      </div>
      <div className="actions">
        <button onClick={() => onEaten(item.id)}>Eaten</button>
        <button className="ghost" onClick={() => onThrown(item.id)}>Thrown away</button>
      </div>
    </li>
  );
}

function PantryView({ items, onEaten, onThrown }) {
  if (items.length === 0) return <p className="empty">Your pantry is empty. Add your first item to start tracking.</p>;
  const groups = groupBy((i) => i.status)(items);
  return (
    <>
      {STATUS_ORDER.filter((s) => groups[s]).map((s) => (
        <section key={s}>
          <h2 className={`group s-${s}`}>{STATUS_LABEL[s]} <span className="count">{groups[s].length}</span></h2>
          <ul className="list">
            {groups[s].map((i) => <ItemRow key={i.id} item={i} onEaten={onEaten} onThrown={onThrown} />)}
          </ul>
        </section>
      ))}
    </>
  );
}

function EatFirstView({ list, onEaten, onThrown }) {
  if (list.length === 0) return <p className="empty">Nothing is close to expiring. Check back tomorrow.</p>;
  return (
    <>
      <p className="note">Ranked by the Prolog rules: expires today first, then perishables, then everything else due within 3 days.</p>
      <ul className="list">
        {list.map((i) => (
          <ItemRow key={i.id} item={i} onEaten={onEaten} onThrown={onThrown} reason={i.reason} />
        ))}
      </ul>
    </>
  );
}

function AddView({ onAdded }) {
  const [form, setForm] = useState({ name: '', category: 'dairy', quantity: 1, unit: 'pc', expiryDate: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    try {
      await api.add({ ...form, quantity: Number(form.quantity) });
      setForm({ ...form, name: '', quantity: 1 });
      setError('');
      onAdded();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>Name<input value={form.name} onChange={set('name')} placeholder="e.g. Milk" required /></label>
      <label>Category
        <select value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <div className="row">
        <label>Quantity<input type="number" min="0.1" step="any" value={form.quantity} onChange={set('quantity')} /></label>
        <label>Unit<input value={form.unit} onChange={set('unit')} /></label>
      </div>
      <label>Expiry date<input type="date" value={form.expiryDate} onChange={set('expiryDate')} required /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit">Add to pantry</button>
    </form>
  );
}

function StatsView({ stats }) {
  if (!stats) return null;
  const reasons = Object.entries(stats.wasteByReason);
  return (
    <>
      <div className="big">
        <span className="big-num">{stats.savedPercent}%</span>
        <span>of finished food was eaten, not wasted</span>
      </div>
      <dl className="stats">
        <div><dt>Eaten</dt><dd>{stats.itemsSaved}</dd></div>
        <div><dt>Thrown away</dt><dd>{stats.itemsWasted}</dd></div>
        <div><dt>In pantry</dt><dd>{stats.activeItems}</dd></div>
      </dl>
      <h2 className="group">Why food was thrown away</h2>
      {reasons.length === 0
        ? <p className="empty">No waste logged yet.</p>
        : <ul className="plain">{reasons.map(([r, n]) => <li key={r}>{r}: {n}</li>)}</ul>}
    </>
  );
}

// ---------- app ----------
const TABS = [
  ['pantry', 'Pantry'],
  ['eat', 'Eat first'],
  ['add', 'Add item'],
  ['stats', 'Stats'],
];

export default function App() {
  const [tab, setTab] = useState('eat');
  const { items, eatFirst, stats, error, loading, refresh } = usePantry();

  const act = (fn) => async (id) => { await fn(id); refresh(); };
  const onEaten = act(api.consume);
  const onThrown = act(api.waste);

  return (
    <main>
      <header>
        <h1>UseFirst</h1>
        <p className="muted">Eat what expires first. Waste less.</p>
      </header>

      <nav aria-label="Sections">
        {TABS.map(([key, label]) => (
          <button key={key} className={tab === key ? 'tab on' : 'tab'} onClick={() => setTab(key)} aria-current={tab === key}>
            {label}
          </button>
        ))}
      </nav>

      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {tab === 'pantry' && <PantryView items={items} onEaten={onEaten} onThrown={onThrown} />}
      {tab === 'eat' && <EatFirstView list={eatFirst} onEaten={onEaten} onThrown={onThrown} />}
      {tab === 'add' && <AddView onAdded={() => { refresh(); setTab('pantry'); }} />}
      {tab === 'stats' && <StatsView stats={stats} />}
    </main>
  );
}
