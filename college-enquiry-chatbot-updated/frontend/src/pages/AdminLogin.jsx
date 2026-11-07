import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function AdminLogin() {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            const data = await apiRequest("/admin/login", {
                method: "POST",
                body: JSON.stringify(form)
            });

            console.log("Admin login response:", data);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/admin/dashboard");

            window.location.reload();

        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="page-center">
            <form className="form-card" onSubmit={handleSubmit}>
                <span className="eyebrow">ABC COLLEGE MANAGEMENT</span>

                <h2>Admin Login</h2>

                <p className="muted">
                    Authorized administrators only.
                </p>

                <label>Admin email</label>
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <label>Password</label>
                <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                {error && <p className="error">{error}</p>}

                <button
                    className="primary-button full-width"
                    type="submit"
                >
                    Admin Login
                </button>
            </form>
        </main>
    );
}