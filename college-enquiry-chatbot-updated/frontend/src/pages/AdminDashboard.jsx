import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");
    useEffect(() => {
        apiRequest("/enquiries/dashboard/stats").then(setStats).catch(e => setError(e.message));
    }, []);
    return <main className="content-page">
        <div className="section-heading"><span className="eyebrow">ADMIN PANEL</span><h1>Dashboard</h1><p className="muted">Welcome to ABC College administration.</p></div>
        {error && <p className="error">{error}</p>}
        <div className="stats-grid">
            <article className="stat-card"><span>Total Students</span><strong>{stats?.students ?? "—"}</strong></article>
            <article className="stat-card"><span>Courses</span><strong>{stats?.courses ?? "—"}</strong></article>
            <article className="stat-card"><span>Total Enquiries</span><strong>{stats?.enquiries ?? "—"}</strong></article>
            <article className="stat-card"><span>Pending Enquiries</span><strong>{stats?.pending ?? "—"}</strong></article>
        </div>
    </main>;
}
