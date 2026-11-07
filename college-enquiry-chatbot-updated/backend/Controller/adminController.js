const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function loginAdmin(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

        const [rows] = await db.query(
            "SELECT id, name, email, password_hash FROM admins WHERE email = ?",
            [email.toLowerCase().trim()]
        );
        if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
            return res.status(401).json({ message: "Invalid admin email or password." });
        }

        const admin = rows[0];
        const token = jwt.sign(
            { id: admin.id, name: admin.name, email: admin.email, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );
        res.json({
            message: "Admin login successful.",
            token,
            user: { id: admin.id, name: admin.name, email: admin.email, role: "admin" }
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Server error during admin login." });
    }
}

module.exports = { loginAdmin };
