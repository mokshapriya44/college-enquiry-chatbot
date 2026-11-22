import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

const emptyForm = { course_name: "", description: "", fee: "", duration: "" };
//Purpose: Courses component lo backend nunchi courses data fetch chesi, React state lo store chesthunnam. Tarvatha UI lo display cheyyadaniki use chestham.
export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState(emptyForm);  // State to hold form data for adding/editing a course
    const [editingId, setEditingId] = useState(null);  // State to track which course is being edited
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
 
    async function loadCourses() {  // Function to load courses from the backend
        try { 
            const data = await apiRequest("/courses");
            setCourses(data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {  //React component render ayyaka effect execute avuthundi.
        loadCourses();
    }, []);         //Empty dependency array ante component first time mount ayinappudu effect execute avuthundi.

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
            setShowForm(false);
            loadCourses();
        } catch (err) {
            setError(err.message);
        }
    }

    function startEdit(course) {
        setEditingId(course.id);
        setShowForm(true);
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
            <div className="section-heading section-heading-row">
                <div>
                    <span className="eyebrow">ADMIN PANEL</span>
                    <h1>Manage Courses</h1>
                    <p className="muted">Maintain the courses available to students.</p>
                </div>
                <button className="primary-button" type="button" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}>
                    {showForm ? "Close" : "+ Add Course"}
                </button>
            </div>

            {showForm && <form className="course-form" onSubmit={handleSubmit}>
                <h2>{editingId ? "Update Course" : "Add a course"}</h2>
                <div className="form-grid">
                    <label>Course name<input name="course_name" value={form.course_name} onChange={handleChange} placeholder="e.g. B.Tech Computer Science" required /></label>
                    <label>Description<input name="description" value={form.description} onChange={handleChange} placeholder="Short course description" /></label>
                    <label>Fee (Rs.)<input name="fee" type="number" min="0" value={form.fee} onChange={handleChange} placeholder="85000" required /></label>
                    <label>Duration<input name="duration" value={form.duration} onChange={handleChange} placeholder="4 Years" required /></label>
                </div>
                <button className="primary-button" type="submit">{editingId ? "Update Course" : "Save Course"}</button>
                {editingId && <button className="secondary-button cancel-button" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(false); }}>Cancel</button>}
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </form>}

            {message && !showForm && <p className="success">{message}</p>}
            {!showForm && error && <p className="error">{error}</p>}
            <div className="table-wrap courses-table-wrap"><table>
                <thead><tr><th>Course</th><th>Fee</th><th>Duration</th><th>Actions</th></tr></thead>
                <tbody>{courses.map(course => <tr key={course.id}>
                    <td className="course-name-cell"><strong>{course.course_name}</strong><span>{course.description || "Course information"}</span></td>
                    <td>Rs. {Number(course.fee).toLocaleString("en-IN")}</td>
                    <td>{course.duration}</td>
                    <td><div className="course-actions"><button className="secondary-button" type="button" onClick={() => startEdit(course)}>Edit</button><button className="danger-button" type="button" onClick={() => deleteCourse(course.id)}>Delete</button></div></td>
                </tr>)}</tbody>
            </table></div>
            {courses.length === 0 && !error && <p className="muted">No courses have been added yet.</p>}
            <p className="courses-footer"><Link to="/admin/enquiries">View student enquiries</Link></p>
        </main>
    );
}









// Complete flow ela work avuthundi?
// Admin opens Courses page
// useEffect() executes
// loadCourses() calls /courses API
// Backend fetches data from MySQL
// setCourses(data)
// Courses displayed in frontend

// useEffect → API call automatic ga trigger chesthundi.
// loadCourses → Backend nunchi data fetch chesthundi.
// setCourses → Fetched data ni state lo store chesthundi.