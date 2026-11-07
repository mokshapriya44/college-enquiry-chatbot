import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

    async function handleSubmit(e) {
        e.preventDefault(); setError("");
        try {
            const data = await apiRequest("/students/login", { method: "POST", body: JSON.stringify(form) });
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/chat");
        } catch (err) { setError(err.message); }
    }
    return <main className="page-center">
        <form className="form-card" onSubmit={handleSubmit}>
            <span className="eyebrow">ABC COLLEGE PORTAL</span><h2>Student Login</h2>
            <p className="muted">Login to access the chatbot and enquiry form.</p>
            <label>Email address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
            {error && <p className="error">{error}</p>}
            <button className="primary-button full-width" type="submit">Login</button>
            <p className="form-footer">New student? <Link to="/register">Create an account</Link></p>
        </form>
    </main>;
}
