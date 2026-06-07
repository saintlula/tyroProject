//Importing supertest, this lets us make HTTP requests to the app 
//without needing the server to actually be running on a port
const request = require('supertest');

//Import the express app, not the server.js
//We import app.js because it exports the edxpress app without starting a listener.
//This is why I seperated app.js from server.js
const app = require('../app');

//Import the database so we can control the state during tests
//We use this to clean up and set up data between tests. 
const db = require('../db/database');

// -- Test setup and teardown
//beforeEach runs before every single test
//We delete all orders before each test so the tests dont interfere with eachother
//Each test must start with a clean slate
beforeEach(() => 
{
    db.prepare('DELETE FROM orders').run();

    db.prepare('DELETE FROM customers').run();

    const insert = db.prepare(
        'INSERT INTO customers (customerId, firstName, lastName) VALUES (?, ?, ?)'
    );

    insert.run('CUST-1', 'Johnny' , 'Dylan');
    insert.run('CUST-2', 'Bob', 'Cash');
});

//afterAll will run after all tests have finished. 
//Closing the database connection cleanly so Jest can exit correctly. 
//Without this jest sometimes hangs afrer tests finish.
afterAll(() =>
{
    db.close();
})

//-- POST /api/orders
//describe groups related tests together under a label.
//this is for readability
describe('POST /api/orders', () => 
{
    //--Valid order
    test('should return 201 and the saved order when request is valid', async() =>
    {
        //Define a valid order payload that meets all requirements. 
        const validOrder = 
        {
            orderId: 'ORD-1001',
            customerId: 'CUST-1',
            item: 'Laptop',
            quantity: 2
        };

        //Send a POST request to /api/orders with the valid order. 
        //supertest handles this entirely in memory, no server needs to be running. 
        const response = await request(app)
            .post('/api/orders')
            .send(validOrder);

        //Assert the response status is 201 created. 
        expect(response.status).toBe(201);

        //Assert the response body contains the correct data
        expect(response.body.orderId).toBe('ORD-1001');
        expect(response.body.customerId).toBe('CUST-1');
        expect(response.body.item).toBe('Laptop');
        expect(response.body.quantity).toBe(2);
    });

    //--Missing fields
    test('should return 400 when a required field is missing', async () => 
    {
        //This order is missing the item field
        //validateOrder middleware should catch this and return 400
        const incompleteOrder = 
        {
            orderId: 'ORD-1002',
            customerId: 'CUST-1',
            quantity: 1
        };

        const response = await request(app)
            .post('/api/orders')
            .send(incompleteOrder);
            
            // Assert the response status is 400 Bad Request
            expect(response.status).toBe(400);

            //Assert the response body contains an error message
            expect(response.body).toHaveProperty('error');
    });

    //-- Invalid quantity, not an integer. Should be rejected as decimal quantity is given.
    test('should return 400 when quantity is not an integer', async() => 
    {
        const invalidOrder =
        {
            orderId: 'ORD-1003',
            customerId: 'CUST-1',
            item: 'Mouse',
            quantity: 2.5
        };

        const response = await request(app)
            .post('/api/orders')
            .send(invalidOrder);
        
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
    });

    //--Invalid quantity, zero.
    test('should return 400 when quantity is zero', async () => 
    {
        const invalidOrder = 
        {
            orderId: 'ORD-1004',
            customerId: 'CUST-1',
            item: 'Mouse',
            quantity: 0
        };

        const response = await request(app)
            .post('/api/orders')
            .send(invalidOrder);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    //--Invalid quantity, negative
    test('should return 400 when quantity is negetive', async () =>
    {
        const invalidOrder = 
        {
            orderId: 'ORD-1005',
            customerId: 'CUST-1',
            item: 'Mouse',
            quantity: -3
        };

        const response = await request(app)
            .post('/api/orders')
            .send(invalidOrder);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    //--Customer does not exist
    test('should return 404 when customer does not exist', async () => 
    {
        const orderWithGhostCustomer =
        {
            orderId: 'ORD-1006',
            customerId: 'CUST-222',
            item: 'Keyboard',
            quantity: 1
        };

        const response = await request(app)
            .post('/api/orders')
            .send(orderWithGhostCustomer);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error');
    });
});


// --GET /api/orders
describe('GET /api/orders', () => 
{
    //--Empty database
    test('should return 200 and an empty array when no orders exist', async() =>
    {
        //beforeEach already shouldve deleted orders, database should be clean here
        const response = await request(app).get('/api/orders');

        expect(response.status).toBe(200);

        //Should be an array
        expect(Array.isArray(response.body)).toBe(true);

        //Should be empty
        expect(response.body.length).toBe(0);
    });

    //--Order exists
    test('should return 200 and all orders when orders exist', async() =>
    {
        //Firstly creating an order directly in the database to test against. 
        db.prepare(
            'INSERT INTO orders (orderId, customerId, item, quantity) VALUES (?, ? , ?, ?)'
        ).run('ORD-2001', 'CUST-1', 'Monitor', 1);

        const response = await request(app).get('/api/orders');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].orderId).toBe('ORD-2001');
    });

    //--Filtering
    test('should filter orders by customerId when provided', async () =>
    {
        //Inserting orders for two different customers
        db.prepare(
            'INSERT INTO orders (orderId, customerId, item, quantity) VALUES (?, ?, ?, ?)'
        ).run('ORD-2002', 'CUST-1', 'Keyboard', 2);

        db.prepare(
            'INSERT INTO orders (orderId, customerId, item, quantity) VALUES (?, ?, ?, ?)'
        ).run('ORD-2003', 'CUST-2', 'Monitor', 2);

        //Filter to only CUST-1 orders
        const response = await request(app).get('/api/orders?customerId=CUST-1');

        expect(response.status).toBe(200);

        //Should only return orders belonging to CUST-1
        expect(response.body.length).toBe(1);
        expect(response.body[0].customerId).toBe('CUST-1');
    });

    //--Pagination
    test('should return correct page of results when pagination params are provided', async () =>
    {
        //Inserting 3 orders in order to paginate them.
        db.prepare(
            'INSERT INTO orders (orderId, customerId, item, quantity) VALUES (?, ?, ?, ?)'
        ).run('ORD-2004', 'CUST-1', 'Item-1', 1);

        db.prepare(
            'INSERT INTO orders (orderId, customerId, item, quantity) VALUES (?, ?, ?, ?)'
        ).run('ORD-2005', 'CUST-1', 'Item-2', 1);

        db.prepare(
            'INSERT INTO orders (orderId, customerId, item, quantity) VALUES (?, ?, ?, ?)'
        ).run('ORD-2006', 'CUST-1', 'Item-3', 1);

        //Request page 1 with a limit of 2 , this should return first 2 orders only
        const response = await request(app).get('/api/orders?page=1&limit=2');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });
});