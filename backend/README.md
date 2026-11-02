# Food Expiry Tracker - Backend

## Description
The backend handles API requests, database operations, food expiration tracking, and Prolog-based recommendations.

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Server URL: http://localhost:3001

## Sample Data

```bash
npm run seed
```

Warning: This resets existing food and waste records before inserting sample data.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/items | Retrieve food items |
| POST | /api/items | Add food |
| PUT | /api/items/:id | Update food |
| DELETE | /api/items/:id | Delete food |
| POST | /api/items/:id/consume | Mark as eaten |
| POST | /api/items/:id/waste | Record wasted food |
| GET | /api/eat-first | Get recommendations |
| GET | /api/stats | View statistics |
| GET | /api/waste-log | View waste history |

## Programming Paradigms

- Imperative: routes.js
- Functional: utils/functional.js
- Logic: logic/rules.pl
- Object-Oriented: models/FoodItem.js
  
