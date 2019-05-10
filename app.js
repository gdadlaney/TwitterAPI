const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const Joi = require("joi");
const session = require('express-session');
const bcrypt = require('bcrypt');

const PORT = 5000;                                   // get from env
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'twitterAPI',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}); 
const saltRounds = 12;

// set up express app instance and configure middleware
app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({secret: 'myRandomSecret'}));               // deprecated


app.post("/register", handleRegister);
app.post("/login", handleLogin);
app.get("/users", getUsers);                    // Lists all registered users


app.post('/tweet', createTweet);
app.get('/tweets', getOwnTweets);

// More routes
// app.get('/followers', getFollowers);
// app.post('/follow/:username', handleFollow);
// app.post('/unfollow/:username', handleUnfollow); 
// app.delete('/tweet/:tweet_id', deleteTweet);
// app.get('/tweets/username', gerUserTweets);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Function definitions
async function getUsers(req, res) {
    const result = await pool.query("SELECT user_id, username FROM users;");
    res.status(200).send(result[0]);
}

function validateSignUpInput(body) {
    const schema = {
        username: Joi.string().min(3).required(),
        password: Joi.string().min(6).required(),
    };

    return Joi.validate(body, schema);
}

// Currently, just takes in username & password, more fields can be added as and when required.
async function handleRegister(req, res) {
    // if a user is already logged in
    if (req.session.username)
        return res.status(400).send({
            success: false,
            message: "logout first",
        });

    // Input validation
    const { error } = validateSignUpInput(req.body);
    if ( error ) {
        res.status(400).send({message: error.details[0].message});
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        await pool.query(
            "INSERT INTO users(username, password) values(?,?)",
            [req.body.username, hashedPassword]
        );
    } catch(err) {
        
        if ( err.code == 'ER_DUP_ENTRY' ) {
            res.status(400).send({
                registration_successful: false,
                error: "username already exists",
            });
        }
        // else internal server error
        return;
    }
    
    // todo: if exceptions encountered - An internal error occured, try again later.
    

    res.status(200).send({
        registration_successful: true,
        username: req.body.username,
    });
}

async function handleLogin(req, res) {
    // if a user is already logged in
    if (req.session.username)
        return res.status(400).send({
            success: false,
            message: "logout first",
        });

    // same check for username & password
    const { error } = validateSignUpInput(req.body);
    if ( error ) {
        res.status(400).send({message: error.details[0].message});
        return;
    }

    let ret_obj = {
        login_successful: true,
    };

    const result = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [req.body.username]
    );

    // check username
    if ( result[0].length < 1 ) {
        ret_obj.login_successful = false;
        ret_obj.error = "username not found";
        res.status(400).send(ret_obj);
        return;
    } else if ( result[0].length > 1 ) {
        // can occur due to DB admin/ race conditions in insert
        // throw an error that will be caught by the error handler at the end
    }
    
    // check password
    const passwordHash = result[0][0].password;
    const passwordMatch = await bcrypt.compare(req.body.password, passwordHash);
    if ( !passwordMatch ) {
        ret_obj.login_successful = false;
        ret_obj.error = "wrong password";
        res.status(400).send(ret_obj);
        return;
    }

    // set session
    req.session.username = req.body.username;

    ret_obj.username = req.body.username;
    res.status(200).send(ret_obj);
}

app.post('/logout', handleLogout);
function handleLogout(req, res) {
    if (!req.session.username)
        return res.status(400).send({
            success: false,
            message: "not logged in",
        });

    req.session.destroy((err) => {
        if(!err) {
            res.status(200).send({
                success: true,
                message: "logged out",
            });
        } else {
            res.status(500).send({
                success: false,
                message: "log out failed, try again",
            });
        }
    });
}

async function createTweet(req, res) {
    if (!req.session.username)
        return res.status(400).send({
            success: false,
            message: "not logged in",
        });
    
    // todo: input validation - data must be less than 280 chars, and must be required

    await pool.query(
        "INSERT INTO tweets(username, tweet_data) values(?,?)",
        [req.session.username, req.body.tweet_data]
    );

    const result = await pool.query("SELECT tweet_id FROM tweets WHERE username = ? AND tweet_data = ?;", [req.session.username, req.body.tweet_data]);
    res.status(200).send({
        username: req.session.username,
        tweet_id: result[0][0].tweet_id,
        tweet_data: req.body.tweet_data,
    });
}

async function getOwnTweets(req, res) {
    if (!req.session.username)
        return res.status(400).send({
            success: false,
            message: "not logged in",
        });

    const result = await pool.query("SELECT tweet_id, tweet_data FROM tweets WHERE username = ?;", [req.session.username]);  
    res.status(200).send(result[0]);
}