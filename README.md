# Order Management System
~~~~~~~~~~~~~~~~~~~~~~~~
A full stack order management system built with Node.js, Express, SQLite, and React.

## Tech Stack
~~~~~~~~~~~~~
**Backend**
-----------
◒ Node.js
◒ Express
◒ better-sqlite3 (SQLite)
◒ Jest + Supertest (For testing)

**Frontend**
------------
◒ React
◒ Vite

tyroProject/
├── backend/
│   ├── db/
│   │   └── database.js        # Database connection, schema creation, and seeding data
│   ├── routes/
│   │   └── orders.js          # POST and GET /api/orders route handlers
│   ├── middleware/
│   │   └── validateOrder.js   # Request validation middleware
│   ├── tests/
│   │   └── orders.test.js     # Jest + Supertest API tests
│   ├── app.js                 # Express app setup and middleware registration
│   └── server.js              # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── OrdersTable.jsx  # Orders table with sorting, filtering, pagination
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js           # Vite config with API proxy
└── README.md


## Getting Started
~~~~~~~~~~~~~~~~~~
### Prerequisites
● Node.js v18 or higher
● npm 

### 1. Clone the repo
~~~~~~~~~~~~~~~~~~~~~
● git clone https://github.com/saintlula/tyroProject.git
● cd tyroProject

### 2. Set up the backend 
~~~~~~~~~~~~~~~~~~~~~~~~~
● cd backend
● npm install
● npm start

The backend should start on 'http://localhost:3000'
On first setup the database should be created with two seeded customers.

### 3. Setting up the frontend
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
● Open up a second terminal
● cd frontend
● npm install
● npm run dev

The frontend should start on 'http://localhost:5173'

**Responses:**
|Status| |Meaning|
|210|    |Order created succesfully|
|400|    |Missing a required field or invalid quantity|
|401|    |Customwe does not exist|

## Running Tests
~~~~~~~~~~~~~~~~
● cd backend
● npm test

## Testing approach
~~~~~~~~~~~~~~~~~~~
Tests are written using **Jest** as the test runner and **Supertest** to make HTTP requests directly to the Express app without needing a running server

### Why this approach?
----------------------
'app.js' and 'server.js' are seperated intentionally. 'app.js' builds and exports the Express app. 'server.js' just starts the listener. This means Supertest can import the app directly without starting a real server, keeping the test not only fast but self contained. 

### What's being tested
-----------------------
*POST /api/orders*
●⁠  ⁠Returns 201 and the saved order when the request is valid
●⁠  ⁠Returns 400 when any required field is missing
●⁠  ⁠Returns 400 when quantity is a decimal
●⁠  ⁠Returns 400 when quantity is zero
●  ⁠Returns 400 when quantity is negative
●⁠  ⁠Returns 404 when the customer does not exist

## Design Decisions
~~~~~~~~~~~~~~~~~~~
**Why Express over Fastify?**
Express felt like the better tool to use for a lightweight project. It's widely understood, has minimal config overhead and the performance advantages of Fastify didn't feel relevant at this scale.

**Why better-sqlite3 over sqlite3?**
beter-sqlite3 is synchronous which means cleaner, simpler code with no callback or promise handling for database calls. As i wanted to keep code clarity a priority it felt like the better choice.

**Why a seperate validation middleware?**
Keeping validation logic in its own fle means the route handler stays clean and focused on database logic only. The middleware is independetly testable and reusable across routes. 

**Why a sort column whitelist?**
Column names cannot use SQL prepared statement placeholds, only values can. The purpose of the whitelist here was to ensure only known safe column names ever appear in the ORDER BY clause preventing SQL injection via query parameters. 