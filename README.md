# Order Management System

A full-stack order management system built with Node.js, Express, SQLite, and React.

## Tech Stack

### Backend
- Node.js
- Express
- better-sqlite3 (SQLite)
- Jest
- Supertest

### Frontend
- React
- Vite

## Project Structure

```text
tyroProject/
├── backend/
│   ├── db/
│   │   └── database.js
│   ├── routes/
│   │   └── orders.js
│   ├── middleware/
│   │   └── validateOrder.js
│   ├── tests/
│   │   └── orders.test.js
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── OrdersTable.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/saintlula/tyroProject.git
cd tyroProject
```

### 2. Set Up the Backend

```bash
cd backend
npm install
npm start
```

The backend should start on:

```text
http://localhost:3000
```

On first startup, the SQLite database will be created automatically and seeded with two customers.

### 3. Set Up the Frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend should start on:

```text
http://localhost:5173
```

## API Responses

| Status | Meaning |
|---------|---------|
| 201 | Order created successfully |
| 400 | Missing required field or invalid quantity |
| 404 | Customer does not exist |

## Running Tests

```bash
cd backend
npm test
```

## Testing Approach

Tests are written using **Jest** and **Supertest**. Supertest allows requests to be sent directly to the Express application without starting a real HTTP server.

### Why Separate `app.js` and `server.js`?

`app.js` builds and exports the Express application.

`server.js` is responsible only for starting the server.

This separation allows Supertest to import the application directly, making tests faster and self-contained.

### Test Coverage

#### POST /api/orders

- Returns `201` when the request is valid
- Returns `400` when required fields are missing
- Returns `400` when quantity is a decimal
- Returns `400` when quantity is zero
- Returns `400` when quantity is negative
- Returns `404` when the customer does not exist

## Design Decisions

### Why Express Instead of Fastify?

Express was chosen because it is lightweight, widely understood, and requires minimal configuration. The performance benefits of Fastify were not significant for the scope of this project.

### Why better-sqlite3 Instead of sqlite3?

`better-sqlite3` provides a synchronous API, resulting in simpler and more readable code without callback or promise handling for database operations.

### Why Use a Separate Validation Middleware?

Separating validation logic keeps route handlers focused on business and database logic. It also makes validation easier to test and reuse.

### Why Use a Sort Column Whitelist?

SQL prepared statements can safely parameterize values but not column names. A whitelist ensures only approved column names can appear in the `ORDER BY` clause, preventing SQL injection attacks.
