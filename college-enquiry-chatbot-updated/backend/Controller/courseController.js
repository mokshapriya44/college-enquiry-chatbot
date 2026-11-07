const db = require("../db");

async function getCourses(req, res) {
    try {
        const [rows] = await db.query(
            "SELECT id, course_name, description, fee, duration FROM courses ORDER BY id"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch courses." });
    }
}

async function addCourse(req, res) {
    try {
        const { course_name, description, fee, duration } = req.body;

        if (!course_name || fee === undefined || !duration) {
            return res.status(400).json({ message: "Course name, fee and duration are required." });
        }

        const [result] = await db.query(
            "INSERT INTO courses (course_name, description, fee, duration) VALUES (?, ?, ?, ?)",
            [course_name, description || "", fee, duration]
        );

        res.status(201).json({ message: "Course added.", courseId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: "Could not add course." });
    }
}

async function updateCourse(req, res) {
    try {
        const { course_name, description, fee, duration } = req.body;

        if (!course_name || fee === undefined || !duration) {
            return res.status(400).json({ message: "Course name, fee and duration are required." });
        }

        const [result] = await db.query(
            "UPDATE courses SET course_name = ?, description = ?, fee = ?, duration = ? WHERE id = ?",
            [course_name, description || "", fee, duration, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Course not found." });
        }

        res.json({ message: "Course updated." });
    } catch (error) {
        res.status(500).json({ message: "Could not update course." });
    }
}

async function deleteCourse(req, res) {
    try {
        const [result] = await db.query(
            "DELETE FROM courses WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Course not found." });
        }

        res.json({ message: "Course deleted." });
    } catch (error) {
        res.status(500).json({ message: "Could not delete course. It may be linked to a student." });
    }
}

module.exports = { getCourses, addCourse, updateCourse, deleteCourse };
