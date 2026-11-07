const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function createToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    });
}

async function registerStudent(req, res) {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: "Password must contain at least 6 characters." });
        }
        const [existing] = await db.query("SELECT id FROM students WHERE email = ?", [email]);
        if (existing.length) return res.status(409).json({ message: "Email is already registered." });

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO students (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
            [name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash]
        );
        res.status(201).json({ message: "Registration successful. Please log in.", studentId: result.insertId });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
}

async function loginStudent(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

        const [rows] = await db.query(
            "SELECT id, name, email, phone, password_hash FROM students WHERE email = ?",
            [email.toLowerCase().trim()]
        );
        if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const student = rows[0];
        const token = createToken({ id: student.id, name: student.name, email: student.email, role: "student" });
        res.json({
            message: "Student login successful.",
            token,
            user: { id: student.id, name: student.name, email: student.email, role: "student" }
        });
    } catch (error) {
        console.error("Student login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
}

async function getProfile(req, res) {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, phone, created_at FROM students WHERE id = ?",
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Student not found." });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Could not get profile." });
    }
}

module.exports = { registerStudent, loginStudent, getProfile };
