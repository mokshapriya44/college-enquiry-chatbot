const db = require("../db");

async function createEnquiry(req, res) {
    try {
        const { course_id, message } = req.body;
        if (!course_id) return res.status(400).json({ message: "Please select a course." });

        const [courses] = await db.query("SELECT id FROM courses WHERE id = ?", [course_id]);
        if (!courses.length) return res.status(404).json({ message: "Selected course was not found." });

        const [result] = await db.query(
            "INSERT INTO enquiries (student_id, course_id, message, status) VALUES (?, ?, ?, 'Pending')",
            [req.user.id, course_id, message || null]
        );
        res.status(201).json({ message: "Your enquiry was submitted successfully.", enquiryId: result.insertId });
    } catch (error) {
        console.error("Enquiry create error:", error);
        res.status(500).json({ message: "Could not submit enquiry." });
    }
}

async function getMyEnquiries(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT e.id, c.course_name, e.message, e.status, e.created_at
             FROM enquiries e JOIN courses c ON c.id = e.course_id
             WHERE e.student_id = ? ORDER BY e.created_at DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch your enquiries." });
    }
}

async function getAllEnquiries(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT e.id, s.name AS student_name, s.email, s.phone,
                    c.course_name, e.message, e.status, e.created_at
             FROM enquiries e
             JOIN students s ON s.id = e.student_id
             JOIN courses c ON c.id = e.course_id
             ORDER BY e.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error("Enquiry list error:", error);
        res.status(500).json({ message: "Could not fetch enquiries." });
    }
}

async function updateEnquiryStatus(req, res) {
    try {
        const { status } = req.body;
        if (!["Pending", "Contacted", "Admitted", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid enquiry status." });
        }
        const [result] = await db.query("UPDATE enquiries SET status = ? WHERE id = ?", [status, req.params.id]);
        if (!result.affectedRows) return res.status(404).json({ message: "Enquiry not found." });
        res.json({ message: "Enquiry status updated." });
    } catch (error) {
        res.status(500).json({ message: "Could not update enquiry status." });
    }
}

async function getDashboardStats(req, res) {
    try {
        const [[students]] = await db.query("SELECT COUNT(*) AS total FROM students");
        const [[courses]] = await db.query("SELECT COUNT(*) AS total FROM courses");
        const [[enquiries]] = await db.query("SELECT COUNT(*) AS total FROM enquiries");
        const [[pending]] = await db.query("SELECT COUNT(*) AS total FROM enquiries WHERE status = 'Pending'");
        res.json({ students: students.total, courses: courses.total, enquiries: enquiries.total, pending: pending.total });
    } catch (error) {
        res.status(500).json({ message: "Could not fetch dashboard details." });
    }
}

module.exports = { createEnquiry, getMyEnquiries, getAllEnquiries, updateEnquiryStatus, getDashboardStats };
