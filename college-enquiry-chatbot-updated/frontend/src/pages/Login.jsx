import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import { apiRequest } from "../api";

export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [captchaChecked, setCaptchaChecked] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [forgotPassword, setForgotPassword] = useState(false);
    const [resetStage, setResetStage] = useState("request");
    const [resetEmail, setResetEmail] = useState("");
    const [resetOtp, setResetOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const captchaRef = useRef(null);
    const navigate = useNavigate();
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        try {
            const data = await apiRequest("/students/login", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    captchaChecked,
                    captchaToken
                })
            });

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/chat");
        } catch (err) {
            setError(err.message);
            setCaptchaChecked(false);
            setCaptchaToken("");
            captchaRef.current?.reset();
        }
    }

    function openForgotPassword() {
        setResetEmail(form.email);
        setResetOtp("");
        setNewPassword("");
        setResetStage("request");
        setResetMessage("");
        setError("");
        setCaptchaChecked(false);
        setCaptchaToken("");
        captchaRef.current?.reset();
        setForgotPassword(true);
    }

    function returnToLogin() {
        setForgotPassword(false);
        setResetStage("request");
        setForm(previous => ({ ...previous, email: resetEmail, password: "" }));
        setError("");
        setResetMessage("");
        setCaptchaChecked(false);
        setCaptchaToken("");
        captchaRef.current?.reset();
    }

    async function handleResetSubmit(event) {
        event.preventDefault();
        setError("");
        setResetMessage("");
        setResetLoading(true);

        try {
            if (resetStage === "request") {
                const data = await apiRequest("/students/forgot-password", {
                    method: "POST",
                    body: JSON.stringify({ email: resetEmail })
                });
                setResetMessage(data.message);
                setResetStage("reset");
            } else {
                const data = await apiRequest("/students/reset-password", {
                    method: "POST",
                    body: JSON.stringify({
                        email: resetEmail,
                        otp: resetOtp,
                        newPassword
                    })
                });
                setResetMessage(data.message);
                setResetStage("done");
                setForm(previous => ({ ...previous, email: resetEmail, password: "" }));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setResetLoading(false);
        }
    }

    function handleCaptchaCheck(event) {
        setCaptchaChecked(event.target.checked);
        setCaptchaToken("");
        setError("");

        if (!event.target.checked) {
            captchaRef.current?.reset();
        }
    }

    return (
        <main className="page-center">
            <form className="form-card" onSubmit={forgotPassword ? handleResetSubmit : handleSubmit}>
                {forgotPassword ? (
                    <>
                        <span className="eyebrow">ABC COLLEGE PORTAL</span>
                        <h2>{resetStage === "done" ? "Password Reset" : "Forgot Password"}</h2>
                        <p className="muted">
                            {resetStage === "request"
                                ? "Enter your student email to receive a password reset code."
                                : resetStage === "reset"
                                    ? "Enter the 6-digit code sent to your email and choose a new password."
                                    : "Your password has been updated."}
                        </p>

                        {resetStage !== "done" && (
                            <>
                                <label htmlFor="resetEmail">Email address</label>
                                <input
                                    id="resetEmail"
                                    type="email"
                                    autoComplete="email"
                                    value={resetEmail}
                                    onChange={event => setResetEmail(event.target.value)}
                                    disabled={resetStage === "reset"}
                                    required
                                />
                            </>
                        )}

                        {resetStage === "reset" && (
                            <>
                                <label htmlFor="resetOtp">Email reset code</label>
                                <input
                                    id="resetOtp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={resetOtp}
                                    onChange={event => setResetOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                                    required
                                />

                                <label htmlFor="newPassword">New password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    minLength={6}
                                    value={newPassword}
                                    onChange={event => setNewPassword(event.target.value)}
                                    required
                                />
                            </>
                        )}

                        {resetMessage && <p className="success" role="status">{resetMessage}</p>}
                        {error && <p className="error" role="alert">{error}</p>}

                        {resetStage !== "done" ? (
                            <button className="primary-button full-width" type="submit" disabled={resetLoading}>
                                {resetLoading ? "Please wait..." : resetStage === "request" ? "Send Reset Code" : "Reset Password"}
                            </button>
                        ) : (
                            <button className="secondary-button full-width" type="button" onClick={returnToLogin}>
                                Back to Login
                            </button>
                        )}

                        {resetStage !== "done" && (
                            <button className="forgot-password-link reset-back-button" type="button" onClick={returnToLogin}>
                                Back to Login
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <span className="eyebrow">ABC COLLEGE PORTAL</span>
                        <h2>Student Login</h2>
                        <p className="muted">
                            Login to access the chatbot and enquiry form.
                        </p>

                        <label htmlFor="loginEmail">Email address</label>
                        <input
                            id="loginEmail"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="loginPassword">Password</label>
                        <input
                            id="loginPassword"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                        <div className="forgot-password-row">
                            <button className="forgot-password-link" type="button" onClick={openForgotPassword}>
                                Forgot password?
                            </button>
                        </div>

                        <div className="login-captcha">
                            <label className="captcha-checkbox">
                                <input
                                    type="checkbox"
                                    checked={captchaChecked}
                                    onChange={handleCaptchaCheck}
                                />
                                <span>I'm not a robot</span>
                            </label>

                            {captchaChecked && (
                                turnstileSiteKey ? (
                                    <Turnstile
                                        ref={captchaRef}
                                        siteKey={turnstileSiteKey}
                                        onSuccess={(token) => {
                                            setCaptchaToken(token);
                                            setError("");
                                        }}
                                        onExpire={() => {
                                            setCaptchaToken("");
                                            setCaptchaChecked(false);
                                            setError("CAPTCHA expired. Please check the box again.");
                                        }}
                                        onError={() => {
                                            setCaptchaToken("");
                                            setCaptchaChecked(false);
                                            setError("CAPTCHA could not be verified. Please try again.");
                                        }}
                                    />
                                ) : (
                                    <p className="error">
                                        CAPTCHA is not configured. Set VITE_TURNSTILE_SITE_KEY in backend/.env.
                                    </p>
                                )
                            )}
                        </div>

                        {error && <p className="error">{error}</p>}

                        <button
                            className="primary-button full-width"
                            type="submit"
                            disabled={!captchaChecked || !captchaToken}
                        >
                            Login
                        </button>

                        <p className="form-footer">
                            New student?{" "}
                            <Link to="/register">Create an account</Link>
                        </p>
                    </>
                )}
            </form>
        </main>
    );
}
