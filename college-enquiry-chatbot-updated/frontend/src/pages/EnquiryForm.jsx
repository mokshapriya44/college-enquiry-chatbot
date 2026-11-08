import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function EnquiryForm() {
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [courseId, setCourseId] = useState("");
    const [message, setMessage] = useState("");
    const [student, setStudent] = useState({ name: "", email: "", phone: "" });
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [courseError, setCourseError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function load() {
        try {
            setCourses(await apiRequest("/courses"));
            setCourseError("");
        } catch (error) {
            setCourseError(error.message);
        } finally {
            setCoursesLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    function handleStudentChange(e) {
        setStudent({ ...student, [e.target.name]: e.target.value });
    }

    async function submit(e) {
        e.preventDefault();
        setError("");
        setNotice("");
        setSubmitting(true);
        try {
            const data = await apiRequest("/enquiries", {
                method: "POST",
                body: JSON.stringify({
                    ...student,
                    course_id: Number(courseId),
                    message
                })
            });
            setNotice(data.message);
            setCourseId("");
            setMessage("");
        } catch (e) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    }

    return <main className="content-page">
        <div className="section-heading"><span className="eyebrow">STUDENT SERVICES</span><h1>Course Enquiry Form</h1><p className="muted">Submit your interest. The admin team will contact you.</p></div>
        <div className="enquiry-layout">
            <form className="form-card wide-form enquiry-form" onSubmit={submit}>
                <div className="enquiry-form-heading">
                    <span className="eyebrow">ENQUIRY FORM</span>
                    <h2>Tell us what you need</h2>
                    <p className="muted">Our admissions team will follow up with you.</p>
                </div>
                <div className="enquiry-fields">
                    <div className="enquiry-field">
                        <label htmlFor="student-name">Full name <span className="required-label">*</span></label>
                        <input id="student-name" name="name" value={student.name} onChange={handleStudentChange} maxLength="100" autoComplete="name" required placeholder="Enter your full name" />
                    </div>
                    <div className="enquiry-field">
                        <label htmlFor="student-email">Email address <span className="required-label">*</span></label>
                        <input id="student-email" name="email" type="email" value={student.email} onChange={handleStudentChange} maxLength="100" autoComplete="email" required placeholder="Enter your email address" />
                    </div>
                    <div className="enquiry-field">
                        <label htmlFor="student-phone">Phone number <span className="required-label">*</span></label>
                        <input id="student-phone" name="phone" type="tel" value={student.phone} onChange={handleStudentChange} maxLength="15" autoComplete="tel" required placeholder="Enter your phone number" />
                    </div>
                    <div className="enquiry-field enquiry-field-wide">
                        <label htmlFor="course-id">Course interested <span className="required-label">*</span></label>
                        <select id="course-id" value={courseId} onChange={e => setCourseId(e.target.value)} required disabled={coursesLoading || courses.length === 0}>
                            <option value="" disabled>{coursesLoading ? "Loading courses..." : "Select a course"}</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.course_name} | {course.duration} | Rs. {Number(course.fee).toLocaleString("en-IN")}
                                </option>
                            ))}
                        </select>
                        {courseError && <p className="error">Could not load courses: {courseError}</p>}
                        {!coursesLoading && !courseError && courses.length === 0 && <p className="muted">No courses are available right now.</p>}
                    </div>
                    <div className="enquiry-field enquiry-field-wide">
                        <label htmlFor="enquiry-message">Message <span className="optional-label">(optional)</span></label>
                        <textarea id="enquiry-message" rows="4" maxLength="1000" value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message..." />
                    </div>
                </div>
                {notice && <p className="success" role="status">{notice}</p>}
                {error && <p className="error" role="alert">{error}</p>}
                <button className="primary-button" type="submit" disabled={submitting || coursesLoading || courses.length === 0}>
                    {submitting ? "Submitting..." : "Submit Enquiry"}
                </button>
            </form>
            <aside className="enquiry-promo">
                <img src="https://media.istockphoto.com/id/1463013729/photo/online-registration-form-for-modish-form-filling.jpg?s=612x612&w=0&k=20&c=Fnx06haU4IHYLcRpy9Po_TBknvBqVjicGuUWkGu8e6Y=" />
                <div className="enquiry-promo-copy">
                    <span>ADMISSIONS SUPPORT</span>
                    <h2>We'll get back to you soon.</h2>
                    <p>Your course questions go straight to our college team.</p>
                </div>
            </aside>
        </div>
    </main>;
}
