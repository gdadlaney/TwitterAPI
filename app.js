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

// Refactoring
// 1. res.status(4..)
// 2. IsValidInput()

async function handleRegister(req, res) {
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
    
    // todo: query the db for the same username, if it exists, return with error
    // try to do the insert in the same error, else another API may add it with the same name.
    // use use a transaction and use the same connection.

    try {
        await pool.query(
            "INSERT INTO users(username, password) values(?,?)",
            [req.body.username, req.body.password]
        );
        // throws promise exception(probaby due to an mysql error), that username/password cannot be null.
    } catch(err) {
        // console.log(err);
        if ( err.code == 'ER_DUP_ENTRY' ) {
            res.send({
                registration_successful: false,
                error: "username already exists",
            });
            return;
        }
        // else - internal server error?
    }
    
    // todo: if exceptions encountered - An internal error occured, try again later.

    res.send({
        registration_successful: true,
        username: req.body.username,
    });
}

app.post("/login", handleLogin);

async function handleLogin(req, res) {
    // same check for username & password

    let ret_obj = {
        login_successful: true,
    };

    const result = await pool.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [req.body.username, req.body.password]
    );
    if ( result[0].length < 1 ) {
        // throw new Error("User not found with given credentials")
        ret_obj.login_successful = false;
        ret_obj.error = "User not found with given credentials";
        res.send(ret_obj);
        return;
    } else if ( result[0].length > 1 ) {
        // will this ever occur? - DB admin/ race conditions in insert
    }
    // can also individually identify if password is wrong or username is wrong, with just the one query.

    ret_obj.username = req.body.username;
    res.send(ret_obj);
}

// use successful in both login & register.

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// temp
// 1. ValidateInput(), 
// 2. joi, better to use it inside the function

// ValidateInput(res) - returns Object(works)
// IsValidInput(res) - returns (true, false) and sends data from inside(more readable) - seems best, a rename could be better
// () - throws exception, can use finally, to send & return
// IsValidInput() can be combined with handleErrorMessage - repeated code

// {success:false, message:'query error'} seems like a convention on Stack Overflow