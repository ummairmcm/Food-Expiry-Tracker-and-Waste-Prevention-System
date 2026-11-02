# Food Expiry Tracker and Waste Prevention System

This is our project for CS121: Programming Languages. It is a web app that keeps track of the food you have at home and tells you which ones to eat first before they expire.

It supports UN SDG 12 (Responsible Consumption and Production)

## What it does

- You add food with its name, category, quantity, and expiry date.
- The app checks how many days are left and labels each item as fresh, use soon, use today, or expired.
- The "Eat first" page shows what you should use first and says why.
- You can mark an item as eaten or thrown away.
- The "Stats" page shows how much food you ate vs. how much you wasted.

## What we used

- React and Vite for the front end
- Node.js and Express for the back end
- SQLite for the database
- Tau Prolog for the rules that decide the status and priority of each food

## Folders

```
backend/    the server, database, and Prolog rules
frontend/   the React app
```

Inside backend:

- `server.js` and `routes.js` handle the API
- `db.js` creates the database tables
- `seed.js` adds sample food for testing
- `models/FoodItem.js` has the classes
- `utils/functional.js` has the helper functions
- `logic/rules.pl` has the Prolog rules
- `logic/prologEngine.js` connects Node to Prolog

## Programming paradigms

- **Logic:** the Prolog rules in `logic/rules.pl` decide the status of each item and which ones to eat first.
- **Functional:** `utils/functional.js` has pure functions like `daysBetween` and `computeStats`. The React code also uses `map`, `filter`, and `reduce`.
- **Object-oriented:** `FoodItem` is the main class. `Perishable` and `Pantry` extend it.
- **Imperative:** `routes.js` handles each request step by step, with validation and checks.

## How to run it

You need Node.js installed. Open two terminals.

Terminal 1 (back end):

```
cd backend
npm install
npm run seed
npm start
```

The server runs on http://localhost:3001. `npm run seed` is optional and inserts demonstration food items. Warning: running this command deletes existing food items and waste records before inserting the sample data.

Terminal 2 (front end):

```
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser. Keep the back end running or the page will not load any data.


## API

- `GET /api/items` list of items with their status
- `POST /api/items` add an item
- `PUT /api/items/:id` edit an item
- `DELETE /api/items/:id` delete an item
- `POST /api/items/:id/consume` mark as eaten
- `POST /api/items/:id/waste` mark as thrown away
- `GET /api/eat-first` items ranked by the Prolog rules
- `GET /api/stats` eaten vs. wasted numbers

## Limitations

- You have to type in the expiry dates yourself.
- It only gives advice. It is not a guarantee that food is safe to eat.
- There is no login, so it only supports one household.
