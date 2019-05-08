const express = require("express");
const mysql = require("mysql2/promise");

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

// set up express app instance
app = express();

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

// app.post("/register", handleRegister);
// app.post("/login" handleLogin);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));