const db = require("../db");

async function createEnquiry(req, res) {
    try {
        const { course_id } = req.body;
        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim();
        const phone = String(req.body.phone || "").trim();
        const message = String(req.body.message || "").trim();

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "Name, email, and phone number are required." });
        }
        if (name.length > 100 || email.length > 100 || phone.length > 15) {
            return res.status(400).json({ message: "Name, email, or phone number exceeds the allowed length." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }
        if (!Number.isInteger(Number(course_id)) || Number(course_id) < 1) {
            return res.status(400).json({ message: "Please select a valid course." });
        }

        const [courses] = await db.query("SELECT id FROM courses WHERE id = ?", [course_id]);
        if (!courses.length) return res.status(404).json({ message: "Selected course was not found." });

        const [result] = await db.query(
            "INSERT INTO admission_enquiries (student_name, email, phone, course_id, message, status) VALUES (?, ?, ?, ?, ?, 'Pending')",
            [name, email, phone, course_id, message || null]
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
             FROM admission_enquiries e JOIN courses c ON c.id = e.course_id
             WHERE e.email = ? ORDER BY e.created_at DESC`,
            [req.user.email]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch your enquiries." });
    }
}

async function getAllEnquiries(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT e.id, e.student_name, e.email, e.phone,
                    c.course_name, e.message, e.status, e.created_at
             FROM admission_enquiries e
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
        if (!["Pending", "Contacted", "Joined", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid enquiry status." });
        }
        const [result] = await db.query("UPDATE admission_enquiries SET status = ? WHERE id = ?", [status, req.params.id]);
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
        const [[enquiries]] = await db.query("SELECT COUNT(*) AS total FROM admission_enquiries");
        const [[pending]] = await db.query("SELECT COUNT(*) AS total FROM admission_enquiries WHERE status = 'Pending'");
        res.json({ students: students.total, courses: courses.total, enquiries: enquiries.total, pending: pending.total });
    } catch (error) {
        res.status(500).json({ message: "Could not fetch dashboard details." });
    }
}

module.exports = { createEnquiry, getMyEnquiries, getAllEnquiries, updateEnquiryStatus, getDashboardStats };
