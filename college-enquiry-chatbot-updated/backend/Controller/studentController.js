// const db = require("../db");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// function createToken(payload) {  
//     return jwt.sign(payload, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN || "1d"
//     });
// }

// async function registerStudent(req, res) {
//     try {
//         const { name, email, phone, password } = req.body;
//         if (!name || !email || !phone || !password) {
//             return res.status(400).json({ message: "All fields are required." });
//         }
//         if (String(password).length < 6) {
//             return res.status(400).json({ message: "Password must contain at least 6 characters." });
//         }
//         const [existing] = await db.query("SELECT id FROM students WHERE email = ?", [email]);
//         if (existing.length) 
//             return res.status(409).json({ message: "Email is already registered." });

//         const passwordHash = await bcrypt.hash(password, 10);
//         const [result] = await db.query(
//             "INSERT INTO students (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
//             [name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash]
//         );
//         res.status(201).json({
//              message: "Registration successful. Please log in.", studentId: result.insertId });
//     } catch (error) {
//         console.error("Registration error:", error);
//         res.status(500).json({ message: "Server error during registration." });
//     }
// }

// async function loginStudent(req, res) {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

//         const [rows] = await db.query(
//             "SELECT id, name, email, phone, password_hash FROM students WHERE email = ?",
//             [email.toLowerCase().trim()]
//         );
//         if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
//             return res.status(401).json({ message: "Invalid email or password." });
//         }
//   //login details correct ga unte, student details tho token generate chesi, success message tho patu client ki return chestundi.
//         const student = rows[0];
//         const token = createToken({ //Token & Response Generation: Antha correct ga unte, createToken() dwara student details (id, name, email, role: "student") tho token generate chesi, success message tho patu client ki return chestundi.
//             id: student.id,
//              name: student.name,
//               email: student.email,  
//                role: "student"
//              });
//         res.json({
//             message: "Student login successful.", 
//             token,
//             user: { id: student.id,
//                  name: student.name,
//                   email: student.email,
//                    role: "student" 
//                 }
//         });
//     } catch (error) {
//         console.error("Student login error:", error);
//         res.status(500).json({ message: "Server error during login." });
//     }
// }

// async function getProfile(req, res) {
//     try {
//         const [rows] = await db.query(
//             "SELECT id, name, email, phone, created_at FROM students WHERE id = ?",
//             [req.user.id]
//         );
//         if (!rows.length)
//              return res.status(404).json({ message: "Student not found." });
//         res.json(rows[0]);
//     } catch (error) {
//         res.status(500).json({ message: "Could not get profile." });
//     }
// }

// module.exports = { registerStudent, loginStudent, getProfile };



const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {sendOTPEmail,sendPasswordResetOTPEmail} = require("../Services/emailService");
const {createTextCaptcha,verifyTextCaptcha,verifyTurnstile} = require("../Services/captchaService");

function createToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    });
}

// Generate 6 digit OTP
function generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

function getRegistrationCaptcha(req, res) {
    try {
        res.set("Cache-Control", "no-store");
        res.json(createTextCaptcha());
    } catch (error) {
        console.error("CAPTCHA generation error:", error);
        res.status(500).json({
            message: "Could not load CAPTCHA. Please try again."
        });
    }
}

// Student Registration
async function registerStudent(req, res) {
    try {
        const { name, email, phone, password, captchaId, captchaText } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const studentPhone = String(phone).trim();
        if (!/^\d{10}$/.test(studentPhone)) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters."
            });
        }

        if (!verifyTextCaptcha(captchaId, captchaText)) {
            return res.status(400).json({
                message: "CAPTCHA did not match or has expired."
            });
        }

        const studentEmail = email.toLowerCase().trim();

        const [existing] = await db.query(
            "SELECT id FROM students WHERE email = ?",
            [studentEmail]
        );

        if (existing.length) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO students
            (name, email, phone, password_hash, email_verified)
            VALUES (?, ?, ?, ?, FALSE)`,
            [name.trim(), studentEmail, studentPhone, passwordHash]
        );

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        await db.query(
            `INSERT INTO email_otps
            (email, otp_hash, expires_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
            [studentEmail, otpHash]
        );

        try {
            await sendOTPEmail(studentEmail, otp, name.trim());
        } catch (emailError) {
            await db.query(
                "DELETE FROM email_otps WHERE email = ?",
                [studentEmail]
            );
            await db.query(
                "DELETE FROM students WHERE id = ?",
                [result.insertId]
            );
            console.error("OTP email delivery error:", emailError);
            return res.status(503).json({
                message: "We couldn't send the OTP email. Check EMAIL_USER and EMAIL_APP_PASSWORD in backend/.env, then try again."
            });
        }

        res.status(201).json({
            message: "OTP sent to your email. Please verify your email.",
            studentId: result.insertId
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
}

// Verify Email OTP
async function verifyEmailOTP(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required."
            });
        }

        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({
                message: "OTP must contain exactly 6 digits."
            });
        }

        const studentEmail = email.toLowerCase().trim();

       const [rows] = await db.query(
    `SELECT otp_hash, expires_at,
     (expires_at < NOW()) AS is_expired
     FROM email_otps
     WHERE email = ?`,
    [studentEmail]
);
        if (!rows.length) {
            return res.status(400).json({
                message: "OTP not found. Please register again."
            });
        }

        const otpData = rows[0];
if (otpData.is_expired) {
            await db.query(
                "DELETE FROM email_otps WHERE email = ?",
                [studentEmail]
            );

            return res.status(400).json({
                message: "OTP expired. Please register again."
            });
        }

        const isValid = await bcrypt.compare(
            String(otp),
            otpData.otp_hash
        );

        if (!isValid) {
            return res.status(400).json({
                message: "Invalid OTP. Please try again."
            });
        }

        await db.query(
            "UPDATE students SET email_verified = TRUE WHERE email = ?",
            [studentEmail]
        );

        res.json({
            message: "Email verified successfully. You can now login."
        });

    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({
            message: "Email verification failed."
        });
    }
}

async function requestPasswordReset(req, res) {
    const genericMessage = "If a verified student account exists for that email, a password reset code has been sent.";

    try {
        const { email } = req.body;
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ message: "Please enter your email address." });
        }

        const studentEmail = email.toLowerCase().trim();
        const [students] = await db.query(
            "SELECT name FROM students WHERE email = ? AND email_verified = TRUE",
            [studentEmail]
        );
        if (!students.length) {
            return res.json({ message: genericMessage });
        }

        const [recentRequests] = await db.query(
            `SELECT email FROM password_reset_otps
             WHERE email = ?
               AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)`,
            [studentEmail]
        );
        if (recentRequests.length) {
            return res.json({ message: genericMessage });
        }

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        await db.query(
            `INSERT INTO password_reset_otps
             (email, otp_hash, expires_at, attempts, created_at)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 0, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE
                 otp_hash = VALUES(otp_hash),
                 expires_at = VALUES(expires_at),
                 attempts = 0,
                 created_at = CURRENT_TIMESTAMP`,
            [studentEmail, otpHash]
        );

        try {
            await sendPasswordResetOTPEmail(studentEmail, otp, students[0].name);
        } catch (emailError) {
            await db.query("DELETE FROM password_reset_otps WHERE email = ?", [studentEmail]);
            console.error("Password reset email delivery error:", emailError);
            return res.status(503).json({
                message: "Could not send the password reset email. Please try again later."
            });
        }

        return res.json({ message: genericMessage });
    } catch (error) {
        console.error("Password reset request error:", error);
        return res.status(500).json({
            message: "Could not request a password reset. Please try again."
        });
    }
}

async function resetPassword(req, res) {
    let connection;

    try {
        const { email, otp, newPassword } = req.body;
        if (typeof email !== "string" || !email.trim() || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, reset code, and new password are required."
            });
        }
        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({ message: "Reset code must contain 6 digits." });
        }
        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters."
            });
        }

        const studentEmail = email.toLowerCase().trim();
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT otp_hash, attempts, (expires_at < NOW()) AS is_expired
             FROM password_reset_otps
             WHERE email = ?
             FOR UPDATE`,
            [studentEmail]
        );
        if (!rows.length) {
            await connection.rollback();
            return res.status(400).json({
                message: "Reset code is invalid or expired. Request a new code."
            });
        }

        const resetRequest = rows[0];
        if (resetRequest.is_expired || resetRequest.attempts >= 5) {
            await connection.query("DELETE FROM password_reset_otps WHERE email = ?", [studentEmail]);
            await connection.commit();
            return res.status(400).json({
                message: "Reset code is invalid or expired. Request a new code."
            });
        }

        const isValid = await bcrypt.compare(String(otp), resetRequest.otp_hash);
        if (!isValid) {
            await connection.query(
                "UPDATE password_reset_otps SET attempts = attempts + 1 WHERE email = ?",
                [studentEmail]
            );
            await connection.commit();
            return res.status(400).json({ message: "Invalid reset code. Please try again." });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        const [updated] = await connection.query(
            "UPDATE students SET password_hash = ? WHERE email = ? AND email_verified = TRUE",
            [passwordHash, studentEmail]
        );
        await connection.query("DELETE FROM password_reset_otps WHERE email = ?", [studentEmail]);
        await connection.commit();

        if (!updated.affectedRows) {
            return res.status(400).json({
                message: "Could not reset this account. Please request a new code."
            });
        }

        return res.json({ message: "Password reset successfully. You can now log in." });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Password reset error:", error);
        return res.status(500).json({
            message: "Could not reset your password. Please try again."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Student Login
async function loginStudent(req, res) {
    try {
        const { email, password, captchaChecked, captchaToken } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        if (captchaChecked !== true ||
            !(await verifyTurnstile(captchaToken, req.ip))) {
            return res.status(400).json({
                message: "Please complete the CAPTCHA verification."
            });
        }

        const [rows] = await db.query(
            `SELECT id, name, email, phone, password_hash,
             email_verified
             FROM students WHERE email = ?`,
            [email.toLowerCase().trim()]
        );

        if (!rows.length ||
            !(await bcrypt.compare(password, rows[0].password_hash))) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const student = rows[0];

        if (!student.email_verified) {
            return res.status(403).json({
                message: "Please verify your email before login."
            });
        }

        const token = createToken({
            id: student.id,
            name: student.name,
            email: student.email,
            role: "student"
        });

        res.json({
            message: "Student login successful.",
            token,
            user: {
                id: student.id,
                name: student.name,
                email: student.email,
                role: "student"
            }
        });

    } catch (error) {
        console.error("Student login error:", error);
        res.status(500).json({
            message: "Server error during login."
        });
    }
}

// Get Student Profile
async function getProfile(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT id, name, email, phone, created_at
             FROM students WHERE id = ?`,
            [req.user.id]
        );

        if (!rows.length) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({
            message: "Could not get profile."
        });
    }
}

module.exports = {
    getRegistrationCaptcha,
    registerStudent,
    verifyEmailOTP,
    requestPasswordReset,
    resetPassword,
    loginStudent,
    getProfile
};
