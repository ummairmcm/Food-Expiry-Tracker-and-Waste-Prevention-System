<<<<<<< HEAD
# Food Expiry Backend

## Run
```bash
cd backend
npm install
npm run seed     # optional demo data
npm start        # http://localhost:3001
```

## Endpoints
| Method | URL | Purpose |
|---|---|---|
| GET | /api/items | Active items with Prolog status |
| POST | /api/items | Add item `{name, category, quantity, unit, expiryDate}` |
| PUT | /api/items/:id | Edit item |
| DELETE | /api/items/:id | Delete item |
| POST | /api/items/:id/consume | Mark as eaten (saved) |
| POST | /api/items/:id/waste | Mark as thrown away `{reason}` |
| GET | /api/eat-first | Prolog-ranked list with reasons |
| GET | /api/stats | Saved vs wasted summary |
| GET | /api/waste-log | Waste history |

## Paradigms
- **Logic:** `logic/rules.pl` + `logic/prologEngine.js`
- **Functional:** `utils/functional.js`
- **OOP:** `models/FoodItem.js`
- **Imperative:** `routes.js`, `server.js`
=======
# Food-Expiry-Tracker-and-Waste-Prevention-System
Rule-based food expiry tracker that tells households what to eat first to prevent waste. Supports UN SDG 12.
>>>>>>> 8944c55cb004aad40de13acf57092f907164854a
