// import React,{ useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { apiRequest } from "../api";

// export default function Register() {
//     const [form, setForm] = useState({name: "", email: "", phone: "",
//  password: ""
//     });
//     const [message, setMessage] = useState("");
//     const [error, setError] = useState("");
//     const navigate = useNavigate();

//     function handleChange(event) {
//         setForm({ ...form, [event.target.name]: event.target.value });
//     }

//     async function handleSubmit(event) {    //form submit ayyaka, page reload avvakunda prevent chesedi.
//         event.preventDefault();
//         setMessage("");
//         setError("");

//         try {                  //api Request function ni call chesi, backend ki POST request pampistundi, form data ni JSON format lo body lo pass chestundi.
//             const data = await apiRequest("/students/register", {
//                 method: "POST",
//                 body: JSON.stringify(form)  //ante user enter chesina form details (name, email, phone, password) ni JSON string ga convert chesi backend server ki pampistunnam.
//             });
//             setMessage(data.message);
//             setTimeout(() => navigate("/student-login"), 900);
//         } catch (err) {
//             setError(err.message);
//         }
//     }

//     return (
//         <main className="page-center">
//             <form className="form-card" onSubmit={handleSubmit}>
//                 <span className="eyebrow">GET STARTED</span>
//                 <h2>Student Registration</h2>
//                 <p className="muted">Create your account to use the college chatbot.</p>

//                 <label>Full name</label>         
//                 <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />

//                 <label>Email address</label>
//                 <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />

//                 <label>Phone number</label>
//                 <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" required />

//                 <label>Password</label>
//                 <input name="password" type="password" minLength="6" value={form.password} onChange={handleChange} placeholder="Minimum 6 characters" required />

                    
//                 {message && <p className="success">{message}</p>}
//                 {error && <p className="error">{error}</p>}

//                 <button className="primary-button full-width" type="submit">Register</button>
//                 <p className="form-footer">Already registered? <Link to="/student-login">Login</Link></p>
//             </form>
//         </main>
//     );
// }


import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    const [otp, setOtp] = useState(Array(6).fill(""));
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [captcha, setCaptcha] = useState(null);
    const [captchaText, setCaptchaText] = useState("");
    const [captchaLoading, setCaptchaLoading] = useState(true);

    const otpRefs = useRef([]);
    const navigate = useNavigate();

    async function loadCaptcha() {
        setCaptcha(null);
        setCaptchaText("");
        setCaptchaLoading(true);

        try {
            const data = await apiRequest("/students/captcha");
            setCaptcha(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCaptchaLoading(false);
        }
    }

    useEffect(() => {
        loadCaptcha();
    }, []);

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    function handleOtpChange(index, event) {
        const enteredDigits = event.target.value.replace(/\D/g, "").slice(0, 6 - index);
        const nextDigits = [...otp];

        if (!enteredDigits) {
            nextDigits[index] = "";
            setOtp(nextDigits);
            return;
        }

        enteredDigits.split("").forEach((digit, offset) => {
            nextDigits[index + offset] = digit;
        });

        setOtp(nextDigits);
        otpRefs.current[Math.min(index + enteredDigits.length, 5)]?.focus();
    }

    function handleOtpPaste(index, event) {
        const pastedDigits = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6 - index);

        if (!pastedDigits) {
            return;
        }

        event.preventDefault();
        const nextDigits = [...otp];
        pastedDigits.split("").forEach((digit, offset) => {
            nextDigits[index + offset] = digit;
        });
        setOtp(nextDigits);
        otpRefs.current[Math.min(index + pastedDigits.length, 5)]?.focus();
    }

    function handleOtpKeyDown(index, event) {
        if (event.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        } else if (event.key === "ArrowLeft" && index > 0) {
            otpRefs.current[index - 1]?.focus();
        } else if (event.key === "ArrowRight" && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    }

    // Registration
    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            const data = await apiRequest("/students/register", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    captchaId: captcha.captchaId,
                    captchaText
                })
            });

            setError("");
            setOtpSent(true);
            setCaptcha(null);
            setMessage(data.message);

        } catch (err) {
            setError(
                err.message.toLowerCase().includes("captcha")
                    ? "The CAPTCHA did not match or expired. A new code is ready—enter it and try again."
                    : err.message
            );
            await loadCaptcha();
        }
    }

    // OTP Verification
    async function handleVerifyOTP(event) {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            const data = await apiRequest("/students/verify-email", {
                method: "POST",
                body: JSON.stringify({
                    email: form.email,
                    otp: otp.join("")
                })
            });

            setMessage(data.message);

            setTimeout(() => {
                navigate("/student-login");
            }, 1500);

        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="page-center">
            <form
                className="form-card"
                onSubmit={otpSent ? handleVerifyOTP : handleSubmit}
            >
                <span className="eyebrow">GET STARTED</span>

                <h2>
                    {otpSent ? "Verify Your Email" : "Student Registration"}
                </h2>

                <p className="muted">
                    {otpSent ? `Enter the OTP sent to ${form.email}`: "Create your account to use the college chatbot."}
                </p>

                {!otpSent ? (
                    <>
                        <label>Full name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />

                        <label>Email address</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />

                        <label>Phone number</label>
                        <input
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            value={form.phone}
                            onChange={event => setForm(previous => ({
                                ...previous,
                                phone: event.target.value.replace(/\D/g, "").slice(0, 10)
                            }))}
                            placeholder="Enter 10-digit phone number"
                            title="Enter exactly 10 digits."
                            required
                        />

                        <label>Password</label>
                        <input
                            name="password"
                            type="password"
                            minLength="6"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Minimum 6 characters"
                            required
                        />

                        <div className="captcha-section">
                            <label>Verification</label>
                            <div className="captcha-image-row">
                                {captchaLoading ? (
                                    <span className="muted">Loading CAPTCHA...</span>
                                ) : captcha ? (
                                    <img
                                        className="captcha-image"
                                        src={`data:image/svg+xml;base64,${captcha.image}`}
                                        alt="CAPTCHA code"
                                    />
                                ) : (
                                    <span className="error">CAPTCHA could not load.</span>
                                )}
                                <button
                                    className="captcha-refresh"
                                    type="button"
                                    aria-label="Refresh CAPTCHA"
                                    onClick={() => {
                                        setError("");
                                        loadCaptcha();
                                    }}
                                    disabled={captchaLoading}
                                >
                                    ↻
                                </button>
                                <input
                                    className="captcha-answer"
                                    type="text"
                                    value={captchaText}
                                    onChange={(event) => setCaptchaText(event.target.value)}
                                    placeholder="Enter code"
                                    aria-label="Enter the CAPTCHA code"
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    minLength="6"
                                    maxLength="6"
                                    pattern="[A-Za-z0-9]{6}"
                                    required
                                />
                            </div>
                            <p className="captcha-help">
                                Enter the characters shown above. Uppercase or lowercase is accepted.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <label>Verification code</label>
                        <div
                            className="otp-code-boxes"
                            role="group"
                            aria-label="Enter the six-digit email verification code"
                        >
                            {Array.from({ length: 6 }, (_, index) => (
                                <input
                                    key={index}
                                    ref={(element) => {
                                        otpRefs.current[index] = element;
                                    }}
                                    className="otp-digit"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={index === 0 ? "one-time-code" : "off"}
                                    pattern="[0-9]"
                                    maxLength="6"
                                    value={otp[index] || ""}
                                    onChange={(event) => handleOtpChange(index, event)}
                                    onPaste={(event) => handleOtpPaste(index, event)}
                                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                                    aria-label={`OTP digit ${index + 1}`}
                                    required
                                />
                            ))}
                        </div>
                    </>
                )}

                {message && (
                    <p className="success">{message}</p>
                )}

                {error && (
                    <p className="error">{error}</p>
                )}

                <button
                    className="primary-button full-width"
                    type="submit"
                    disabled={!otpSent && (!captcha || captchaLoading)}
                >
                    {otpSent ? "Verify OTP" : "Register"}
                </button>

                {!otpSent && (
                    <p className="form-footer">
                        Already registered?{" "}
                        <Link to="/student-login">Login</Link>
                    </p>
                )}
            </form>
        </main>
    );
}
