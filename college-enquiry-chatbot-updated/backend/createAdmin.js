// Run once: node createAdmin.js
// Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.
require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./db");

async function createAdmin() {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    }
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.query(
        `INSERT INTO admins (name, email, password_hash)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)`,
        [ADMIN_NAME, ADMIN_EMAIL.toLowerCase(), hash]
    );
    console.log("Admin account created/updated successfully.");
    await db.end();
}
createAdmin().catch(async error => {
    console.error(error.message);
    await db.end();
    process.exit(1);
});
