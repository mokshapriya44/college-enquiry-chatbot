import React,{ useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            const data = await apiRequest("/students/register", {
                method: "POST",
                body: JSON.stringify(form)
            });
            setMessage(data.message);
            setTimeout(() => navigate("/student-login"), 900);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="page-center">
            <form className="form-card" onSubmit={handleSubmit}>
                <span className="eyebrow">GET STARTED</span>
                <h2>Student Registration</h2>
                <p className="muted">Create your account to use the college chatbot.</p>

                <label>Full name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />

                <label>Email address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />

                <label>Phone number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" required />

                <label>Password</label>
                <input name="password" type="password" minLength="6" value={form.password} onChange={handleChange} placeholder="Minimum 6 characters" required />

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}

                <button className="primary-button full-width" type="submit">Register</button>
                <p className="form-footer">Already registered? <Link to="/student-login">Login</Link></p>
            </form>
        </main>
    );
}
