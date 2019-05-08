const express = require("express");
const mysql = require("mysql2/promise");

const PORT = 5000;          // get from env

// set up express app instance
app = express();

app.get("/hello", (req, res) => {
    res.send("Hello World");
});

// app.post("/register", handleRegister);
// app.post("/login" handleLogin);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));