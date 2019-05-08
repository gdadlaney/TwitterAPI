const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");

const PORT = 5000;          // get from env
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'twitterAPI',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});  

// set up express app instance and configure middleware
app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get("/hello", (req, res) => {
    res.send("Hello World");
});

// for debugging
// Lists all registered users
app.get("/users", getUsers);

async function getUsers(req, res) {
    const result = await pool.query("SELECT * FROM users;");
    res.send(result[0]);
}

// temp
app.post("/register", handleRegister);

async function handleRegister(req, res) { // better names
    // Input validation
    if ( !req.body.username ) {
        res.send({
            registration_successful: false,
            error: "username required",
        });
        return;
    } else if ( !req.body.password ) {
        res.send({
            registration_successful: false,
            error: "password required",
        });
        return;
    }
    // can also return an array of errors, if both don't exist

    // todo: hash password
    
    await pool.query(
        "INSERT INTO users(username, password) values(?,?)",
        [req.body.username, req.body.password]
    );
    // throws promise exception(probaby due to an mysql error), that username/password cannot be null.
    
    // todo: if exceptions encountered - An internal error occured, try again later.

    res.send({
        registration_successful: true,
        username: req.body.username,
    });
}

// app.post("/login" handleLogin);
// {login_successful: true}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));