import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [error, setError] = useState("");
    useEffect(() => {
        Promise.all([apiRequest("/enquiries/dashboard/stats"), apiRequest("/enquiries")])
            .then(([dashboardStats, enquiries]) => {
                setStats(dashboardStats);
                setRecent(enquiries.slice(0, 5));
            })
            .catch(e => setError(e.message));
    }, []);
    return <main className="content-page dashboard-page">
        <div className="section-heading"><span className="eyebrow">ADMIN PANEL</span><h1>Dashboard Overview</h1><p className="muted">A snapshot of college admissions activity.</p></div>
        {error && <p className="error">{error}</p>}
        <div className="stats-grid">
            <article className="stat-card"><span>Total Courses</span><strong>{stats?.courses ?? "—"}</strong></article>
            <article className="stat-card"><span>Total Enquiries</span><strong>{stats?.enquiries ?? "—"}</strong></article>
            <article className="stat-card"><span>Pending</span><strong>{stats?.pending ?? "—"}</strong></article>
            <article className="stat-card"><span>Registered Students</span><strong>{stats?.students ?? "—"}</strong></article>
        </div>
        <div className="dashboard-bottom">
            <section className="dashboard-recent">
                <div className="subsection-heading"><h2>Recent Student Enquiries</h2><Link to="/admin/enquiries">View all</Link></div>
                <div className="table-wrap"><table><thead><tr><th>Student</th><th>Course</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>{recent.map(item => <tr key={item.id}><td>{item.student_name}</td><td>{item.course_name}</td><td><span className={`status-label status-${item.status.toLowerCase()}`}>{item.status}</span></td><td>{new Date(item.created_at).toLocaleDateString()}</td></tr>)}</tbody>
                </table></div>
                {recent.length === 0 && !error && <p className="muted">No enquiries received yet.</p>}
            </section>
            <aside className="quick-actions">
                <h2>Quick actions</h2>
                <Link to="/admin/courses">Manage Courses <span aria-hidden="true">→</span></Link>
                <Link to="/admin/enquiries">View Enquiries <span aria-hidden="true">→</span></Link>
                <Link to="/admin/enquiries">Review Pending <span aria-hidden="true">→</span></Link>
            </aside>
        </div>
    </main>;
}
