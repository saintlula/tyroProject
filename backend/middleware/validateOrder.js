///Middleware function to validate incoming order requiests. 
//In express, middleware runs before the route handler.
//Containing three parameters: req, res, and next.
//If validation fails, we send back an error and stop here, the route handler never runs.
//If it passes we call next and hand over control to the route handler.
function validateOrder(req, res, next)
{
    //destructure the expected fields out of the request body.
    // req.body is the JSON payload the client sent with the request. 
    const{orderId, customerId, item, quantity} = req.body;

    //Check all required fields are present. Note quantity is checked with === undefined, not with !quantity.
    //If quantity is 0, !quantity would incorrectly treat it as missing. 
    // 0 === undefined is false so it passes here and gets caught by the positive integer check.
    if (!orderId || !customerId || !item || quantity === undefined)
    {
        return res.status(400).json
        ({
            error: 'All fields are required: order ID, customer ID, item and quantity'
        });
        // return stops execution here, without it execution would continue and call next().
    }
    //Check that quantity is a positive int. 
    //Number.isInteger rejects desimals and strings. quantity < 1 rejects 0 and negative numbers.
    if (!Number.isInteger(quantity) || quantity < 1)
    {
        return res.status(400).json
        ({
            error: 'Quantity must be a positive integer'
        })
    }
    //If we get here, all validation passed. Call next to pass control to the route handler.
    next();
}   
//Export the middleware function so it can be used in the route files. 
module.exports = validateOrder;