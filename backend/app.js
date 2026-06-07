//Import express, it handles all the HTTP routing and middleware.
const express = require('express');

//Import the orders router 
// This contains all the logic for POST /api/orders and GET /api/orders
const ordersRouter = require('./routes/orders');

//Create the Express application instance.
//The core object that everything gets attached to. 
const app = express(); 

//-- Global middleware
//Telling express to parse incoming JSON request bodies automatically
//Without this the req.body would be undefined, what the client sent would be unreadable. 
//This must be registered before any routes that need to read req.body
app.use(express.json());

//--Routes 
//Mount the orders router at /api/orders
//This means that every route defined in orders.js gets the /api/orders prefix automatically
//POST / in orders.js becomes POST /api/orders
//GET / in orders.js becomes GET /api/orders
app.use('/api/orders', ordersRouter);

// -- 404 handler
//If a request comes in that doesnt match any route above, this should catch it 
//It must be registered AFTER all routes so it only fires when nothing else is matched.
app.use((req, res) => 
{
    res.status(404).json({ error: 'Route not found'});
});

//Export the app so server.js can start it and tests can import directly
module.exports = app;
