import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });     //React state lo form data (email, password) ni store chestundi.
    const [error, setError] = useState("");                   //React state lo error messages ni store chestundi.
    const navigate = useNavigate();        //Login successful ayyaka student ni direct ga /chat page ki redirect cheyyadaniki React Router hook.
    function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

    async function handleSubmit(e) {  
        e.preventDefault(); setError("");
        try {
            const data = await apiRequest("/students/login", { method: "POST", body: JSON.stringify(form) });
            localStorage.setItem("token", data.token);      //Login successful ayyaka, backend nundi vachina JWT token ni localStorage lo store chestundi, so that user session maintain avvachu.
            localStorage.setItem("user", JSON.stringify(data.user));   //Login successful ayyaka, backend nundi vachina user details (name, email, etc.) ni localStorage lo store chestundi, so that user info access cheyyachu.
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
