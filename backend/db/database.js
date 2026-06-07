//Importing the better-sqlite3 library
// This give us the Database class which we can use to create a connection to our SQLite database
const Database = require('better-sqlite3');

//Importing Node's built-in path module
//This will allow to build a reliable file path to our database file.
const path = require('path');

//Create (or open if it already exists) a SQLite database file.
// __dirname means "the folder this file lives in", so the db file always ends in the backend/db
// This is important as it will avoid the file being created in a random location, depending where the server is run from.
const db = new Database(path.join(__dirname, 'orders.db'));

//Create the customers and orders tables if they don't already exist. 
//IF NOT EXISTS means it is safe to run this code every time the server starts
//Without it the server could crash.
db.exec(`
    CREATE TABLE IF NOT EXISTS customers
    (
    customerId      TEXT PRIMARY KEY,
    firstName       TEXT NOT NULL,
    lastName        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders
    (
    orderId         TEXT PRIMARY KEY,
    customerId      TEXT NOT NULL,
    item            TEXT NOT NULL,
    quantity        INTEGER NOT NULL,
    FOREIGN KEY (customerId) REFERENCES customers(customerId)
    );
`)

//Check how many customers are in the database. Is seeding needed?
//.get() returns a single row
const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();

//Only seeding if there are no customers in the database. This prevents duplicate entries if the server is restarted. 
if(customerCount.count === 0)
{
    //Prepare the re-usable INSERT statement.
    //The ? marks are placeholders. better-sql3 fills them in safely when we call .run().
    //Prevention against SQL injection attacks. 
    const insert = db.prepare
    (
        'INSERT INTO customers (customerId, firstName, lastName) VALUES (?, ?, ?)'
    );
    //Seeding two customers so the API can be tested straight away after setup.
    insert.run('CUST-1', 'Johnny', 'Cash');
    insert.run('CUST-2', 'Billy', 'Joel');
}

//Export the database connection so it can be imported and used in other files.
//Single shared connection. One db instance used across the app. 
module.exports = db;