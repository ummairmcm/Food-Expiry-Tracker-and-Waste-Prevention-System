# Food Expiry Tracker and Waste Prevention System

A web app that tracks household food expiry dates and uses Prolog rules to recommend what to eat first, helping reduce food waste. Built for **CS121: Programming Languages**, supporting **UN SDG 12 (Responsible Consumption and Production), Target 12.3**.

## What it does
- Add food items with a category, quantity, and expiry date.
- A Prolog rule engine labels each item **fresh**, **use soon**, **use today**, or **expired**.
- An **Eat first** list ranks urgent items and shows the reason for each.
- Mark items as **eaten** or **thrown away**; the **Stats** tab shows saved vs. wasted food.

## Tech stack
| Layer | Technology |
|---|---|
| Front-end | React + Vite |
| Back-end | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Logic engine | Tau Prolog (runs inside Node) |

## Project structure
```
backend/
  server.js, routes.js     Express API (imperative)
  db.js, seed.js           SQLite schema and demo data
  models/FoodItem.js       OOP classes
  utils/functional.js      pure functions (functional)
  logic/rules.pl           Prolog facts and rules (logic)
  logic/prologEngine.js    Node-to-Prolog bridge
frontend/
  src/App.jsx, api.js, styles.css
```

## Programming paradigms
| Paradigm | Where |
|---|---|
| Logic | `backend/logic/rules.pl`, `prologEngine.js` |
| Functional | `backend/utils/functional.js`, `groupBy`/`map`/`filter` in `frontend/src/App.jsx` |
| Object-oriented | `backend/models/FoodItem.js` (`FoodItem`, `Perishable`, `Pantry`) |
| Imperative | `backend/routes.js`, `server.js` |

## How to run
Requires Node.js (LTS). Use two terminals.

**Back end** (http://localhost:3001)
```bash
cd backend
npm install
npm run seed     # optional demo data
npm start
```

**Front end** (http://localhost:5173)
```bash
cd frontend
npm install
npm run dev
```

Newer npm versions block dependency install scripts by default. If `npm install` reports blocked scripts, run `npm install-scripts approve better-sqlite3` (back end) or `npm install-scripts approve esbuild` (front end), then `npm install` again.

## API endpoints
| Method | URL | Purpose |
|---|---|---|
| GET | /api/items | Active items with Prolog status |
| POST | /api/items | Add item |
| PUT / DELETE | /api/items/:id | Edit or delete |
| POST | /api/items/:id/consume | Mark as eaten |
| POST | /api/items/:id/waste | Mark as thrown away |
| GET | /api/eat-first | Prolog-ranked list with reasons |
| GET | /api/stats | Saved vs. wasted summary |
