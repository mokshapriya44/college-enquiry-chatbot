import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

const emptyForm = { course_name: "", description: "", fee: "", duration: "" };

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function loadCourses() {
        try {
            const data = await apiRequest("/courses");
            setCourses(data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadCourses();
    }, []);

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        const url = editingId ? `/courses/${editingId}` : "/courses";
        const method = editingId ? "PUT" : "POST";

        try {
            const data = await apiRequest(url, {
                method,
                body: JSON.stringify({ ...form, fee: Number(form.fee) })
            });
            setMessage(data.message);
            setForm(emptyForm);
            setEditingId(null);
            loadCourses();
        } catch (err) {
            setError(err.message);
        }
    }

    function startEdit(course) {
        setEditingId(course.id);
        setForm({
            course_name: course.course_name,
            description: course.description || "",
            fee: course.fee,
            duration: course.duration
        });
    }

    async function deleteCourse(id) {
        if (!window.confirm("Delete this course?")) return;
        try {
            const data = await apiRequest(`/courses/${id}`, { method: "DELETE" });
            setMessage(data.message);
            loadCourses();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="content-page">
            <div className="section-heading">
                <span className="eyebrow">COLLEGE INFORMATION</span>
                <h1>Courses</h1>
                <p className="muted">View courses or manage the sample course list.</p>
            </div>

            <form className="course-form" onSubmit={handleSubmit}>
                <h2>{editingId ? "Update Course" : "Add Course"}</h2>
                <div className="form-grid">
                    <input name="course_name" value={form.course_name} onChange={handleChange} placeholder="Course name" required />
                    <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
                    <input name="fee" type="number" min="0" value={form.fee} onChange={handleChange} placeholder="Fee" required />
                    <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration (e.g. 4 Years)" required />
                </div>
                <button className="primary-button" type="submit">{editingId ? "Update Course" : "Add Course"}</button>
                {editingId && <button className="secondary-button cancel-button" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </form>

            <div className="course-list">
                {courses.map((course) => (
                    <article className="course-card" key={course.id}>
                        <div>
                            <h3>{course.course_name}</h3>
                            <p>{course.description}</p>
                            <strong>₹{Number(course.fee).toLocaleString("en-IN")}</strong>
                            <span className="muted"> · {course.duration}</span>
                        </div>
                        <div className="course-actions">
                            <button className="secondary-button" onClick={() => startEdit(course)}>Edit</button>
                            <button className="danger-button" onClick={() => deleteCourse(course.id)}>Delete</button>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}
