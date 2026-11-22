import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useSearchParams } from "react-router-dom";

export default function EnquiryDetails() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [searchParams] = useSearchParams();
    const showPendingOnly = (searchParams.get("status") || "").toLowerCase() === "pending";
    const visibleItems = showPendingOnly
        ? items.filter(item => item.status.toLowerCase() === "pending")
        : items;
    async function load() {
        try { setItems(await apiRequest("/enquiries")); }
        catch (e) { setError(e.message); }
    }
    useEffect(() => { load(); }, []);
    async function changeStatus(id, status) {
        setError(""); setNotice("");
        try {
            const data = await apiRequest(`/enquiries/${id}/status`, {
                method: "PATCH", body: JSON.stringify({ status })
            });
            setNotice(data.message); load();
        } catch (e) { setError(e.message); }
    }
    return <main className="content-page">
        <div className="section-heading"><span className="eyebrow">ADMIN PANEL</span><h1>{showPendingOnly ? "Pending Enquiries" : "Enquiry Details"}</h1><p className="muted">{showPendingOnly ? "Review enquiries that are waiting for follow-up." : "View student enquiries and update their status."}</p></div>
        {notice && <p className="success">{notice}</p>}{error && <p className="error">{error}</p>}
        <div className="table-wrap"><table>
            <thead><tr><th>Student</th>
            <th>Email / Phone</th>
            <th>Course</th>
            <th>Message</th>
            <th>Date</th>
            <th>Status</th>
            </tr></thead>
            <tbody>{visibleItems.map(x => <tr key={x.id}>
                <td>{x.student_name}</td>
                <td>{x.email}<br />{x.phone}</td>
                <td>{x.course_name}</td>
                <td>{x.message || "—"}</td>
                <td>{new Date(x.created_at).toLocaleDateString()}</td>
                <td><select className={`enquiry-status status-${x.status.toLowerCase()}`} value={x.status} onChange={e => changeStatus(x.id, e.target.value)}>
                    {["Pending", "Contacted", "Joined", "Rejected"].map(s => <option key={s}>{s}</option>)}
                </select></td>
            </tr>)}</tbody>
        </table></div>
        {visibleItems.length === 0 && !error && <p className="muted">{showPendingOnly ? "No pending enquiries to review." : "No enquiries received yet."}</p>}
    </main>;
}
