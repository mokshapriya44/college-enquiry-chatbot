const mysql = require("mysql2/promise");
require("dotenv").config();

console.log("Username:", process.env.DB_USER);
console.log("Database:", process.env.DB_NAME);

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then((connection) => {
        console.log("DB connected successfully");
        connection.release();
    })
    .catch((error) => {
        console.log("DB connection failed:", error.message);
    });

module.exports = db;