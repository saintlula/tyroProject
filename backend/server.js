//Importing the Express app built in app.js
// server.js is meant to only have one job, take the app and start listening to requests. 
const app = require('./app'); 

//Define the port the server will listen on 
//process.env.PORT allows the port to be set via environment variable if needed. 
//If no environment variable is set, it falls back to 3000. 
const PORT = process.env.PORT || 3000;

//Start the server and begin listening for incoming requests.
// The callback just logs a confirmation message so we know its running
app.listen(PORT, () => 
{
    console.log(`Server is running on http://localhost:${PORT}`);
});