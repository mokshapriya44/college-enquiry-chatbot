import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function EnquiryForm() {
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState("");
    const [message, setMessage] = useState("");
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [mine, setMine] = useState([]);

    async function load() {
        try {
            const [courseData, enquiryData] = await Promise.all([
                apiRequest("/courses"), apiRequest("/enquiries/mine")
            ]);
            setCourses(courseData); setMine(enquiryData);
        } catch (e) { setError(e.message); }
    }
    useEffect(() => { load(); }, []);

    async function submit(e) {
        e.preventDefault(); setError(""); setNotice("");
        try {
            const data = await apiRequest("/enquiries", {
                method: "POST",
                body: JSON.stringify({ course_id: Number(courseId), message })
            });
            setNotice(data.message); setCourseId(""); setMessage(""); load();
        } catch (e) { setError(e.message); }
    }

    return <main className="content-page">
        <div className="section-heading"><span className="eyebrow">STUDENT SERVICES</span><h1>Course Enquiry Form</h1><p className="muted">Submit your interest. The admin team will contact you.</p></div>
        <form className="form-card wide-form" onSubmit={submit}>
            <label>Select course</label>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} required>
                <option value="">Choose a course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.course_name} — ₹{Number(c.fee).toLocaleString("en-IN")}</option>)}
            </select>
            <label>Message (optional)</label>
            <textarea rows="4" value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us if you have any questions..." />
            {notice && <p className="success">{notice}</p>}{error && <p className="error">{error}</p>}
            <button className="primary-button" type="submit">Submit Enquiry</button>
        </form>
        <section className="table-section"><h2>My Enquiries</h2>
            {mine.length === 0 ? <p className="muted">No enquiries submitted yet.</p> :
                <div className="table-wrap"><table><thead><tr><th>Course</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>{mine.map(x => <tr key={x.id}><td>{x.course_name}</td><td>{x.message || "—"}</td><td>{x.status}</td><td>{new Date(x.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
        </section>
    </main>;
}
