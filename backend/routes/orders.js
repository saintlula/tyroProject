//Import Express and create a router instance
//Router lets us define routes in a seperate file and plug them into the main app cleanly.
const express = require('express');
const router = express.Router();

//Import the database connection we set up in database.js
//This gives us direct access to the SQLite database.
const db = require('../db/database');

//Import the validation middleware.
//This will run before the POST handler to check if the request is valid. 
const validateOrder = require('../middleware/validateOrder');

// - POST /api/orders
//This creates a new order. validateOrder runs first, if it fails this handler should never execute. 
router.post('/', validateOrder, (req, res) => 
{
    //Pull the validated fields out of the request body. 
    const { orderId, customerId, item, quantity} = req.body;

    //check if the customer exists in the database before saving the order.
    //.get() returns the customer row if found, or undefined if not.
    const customer = db.prepare(
        'SELECT * FROM customers WHERE customerId = ?'
    ).get(customerId);

    //If no customer was found, return 404 as mentioned in the requirements.
    if (!customer)
    {
        return res.status(404).json
        ({
            error: `Customer with id '${customerId}' does not exist.`
        });
    }

    //Customer exists, insert the new order into the database.
    db.prepare(
        'INSERT INTO orders (orderId, customerId, item, quantity) VALUES (?, ?, ?, ?)'
    ).run(orderId, customerId, item, quantity);

    //Fetch the newly saved order from the database to return in the response. 
    //This is to confirm what was actually saved rather than just echoing back the request data.
    const savedOrder = db.prepare(
        'SELECT * FROM orders WHERE orderId = ?'
    ).get(orderId);

    //Return 201 with the saved order.
    //This is different than 200 OK. 201 Created is the standard response for a successful POST that creates a resource.
    res.status(201).json(savedOrder);
});

// --GET /api/orders
//Retrives all orders with optional pagination, sorting and filtering which i wanted to add. 
router.get('/', (req, res) =>
{
    //Pull quary parameters from the URL. 
    //These do all come in as a string so types need to be handled carefully.
    const
    {
        page,       //Which page of results to return 
        limit,      //How many results per page
        sortBy,     //which colum to sort by(like item or orderId) 
        order,      //sort direction (asc or desc)
        customerId  //filter results only to a specific customerId 
    } = req.query;

    // --Filtering
    //Build the base query, if the customerId is providee, filter by it. If not, just select all orders.
    let query = 'SELECT * FROM orders';
    const params = [];

    if (customerId)
    {
        query += ' WHERE customerId = ?';
        params.push(customerId);
    }

    // --Sorting 
    //Define which colums are valid to actually sort by. 
    //This is a whitelist that prevents someone malicious to inject SQL into the ORDER BY clause. 
    const validSortColumns = ['orderId', 'customerId', 'item', 'quantity'];
    const validSortOrders = ['asc', 'desc'];

    //use the requested sortBy if it is in the whitelist, otherwise default to orderId.
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'orderId';

    //use the requested order direction if it is valid, otherwise default to ascending.
    const sortOrder = validSortOrders.includes(order?.toLowerCase()) ? order.toLowerCase() : 'asc';

    //Append the ORDER BY clause to the query.
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // --Pagination
    //Convert page and limit to integers.
    // parseInt with base 10 safely converts the string query param to a number
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    //only apply pagination if bith page and limit are valid numbers greater than 0.
    const paginate = Number.isInteger(pageNum) && pageNum > 0 &&
                     Number.isInteger(limitNum) && limitNum > 0;

    if (paginate)
    {
        //LIMIT controls how many rows return.
        //OFFSET controls how many rows to skip, this is how i get page 2,3 etc. 
        //Such as: page 2, limit 5 -> skip 5 rows (page 1) and return the next 5. 
        const offset = (pageNum - 1) * limitNum; 
        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);
    }

    //--Execute and respond.
    // .all() returns all mathching rows as an array. 
    // If no orders exist, it returns an empty array not an error. 
    const orders = db.prepare(query).all(...params);

    //Return 200 with the array of orders.
    return res.status(200).json(orders);
});

//Export the router so it can be mounted in the app.js.
module.exports = router;