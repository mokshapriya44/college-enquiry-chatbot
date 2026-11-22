
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);
}

// Send OTP email
async function sendOTPEmail(email, otp, name) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        throw new Error("EMAIL_USER and EMAIL_APP_PASSWORD must be configured.");
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to ABC College | Verify Your Student Account",
        text: `Dear ${name},

Welcome to ABC College. Thank you for registering for the student portal.
To activate your account, enter this verification code:
${otp}

This code expires in 5 minutes. After verifying your email, sign in with your email and password to view course information, use the college chatbot, and submit an enquiry.

If you did not create this account, please ignore this email. For your security, never share this code with anyone.

Regards,
ABC College Student Support`,
        html: `
            <div style="max-width: 560px; margin: 0 auto; padding: 24px; color: #263746; font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="margin-bottom: 8px; color: #175f70;">Welcome to ABC College</h2>
                <p>Dear ${escapeHtml(name)},</p>
                <p>Thank you for registering for the ABC College student portal. To activate your account, enter this verification code:</p>
                <div style="margin: 22px 0; padding: 16px; border-radius: 8px; background: #eef7f7; text-align: center;">
                    <strong style="color: #175f70; font-size: 30px; letter-spacing: 7px;">${otp}</strong>
                </div>
                <p>This code expires in <strong>5 minutes</strong>.</p>
                <p>After verifying your email, sign in with your email and password to view course information, use the college chatbot, and submit an enquiry.</p>
                <p>If you did not create this account, please ignore this email. For your security, never share this code with anyone.</p>
                <p style="margin-top: 24px; color: #64748b;">Regards,<br />ABC College Student Support</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

async function sendPasswordResetOTPEmail(email, otp, name) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        throw new Error("EMAIL_USER and EMAIL_APP_PASSWORD must be configured.");
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "ABC College | Student Password Reset Code",
        text: `Hello ${name || "Student"},

We received a request to reset the password for your ABC College student account.
Enter this verification code on the Forgot Password page:
${otp}

This code expires in 5 minutes. After resetting your password, return to Student Login and sign in with your new password.

If you did not request a password reset, ignore this email. Your password will remain unchanged. Never share this code with anyone.

ABC College Student Support`,
        html: `
            <div style="max-width: 560px; margin: 0 auto; padding: 24px; color: #263746; font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="margin-bottom: 8px; color: #175f70;">ABC College</h2>
                <p>Hello ${escapeHtml(name || "Student")},</p>
                <p>We received a request to reset the password for your student account. Enter the verification code below on the <strong>Forgot Password</strong> page:</p>
                <div style="margin: 22px 0; padding: 16px; border-radius: 8px; background: #eef7f7; text-align: center;">
                    <strong style="color: #175f70; font-size: 30px; letter-spacing: 7px;">${otp}</strong>
                </div>
                <p>This code expires in <strong>5 minutes</strong>. After resetting your password, return to Student Login and sign in with your new password.</p>
                <p>If you did not request a password reset, you can ignore this email; your password will remain unchanged. Never share this code with anyone.</p>
                <p style="margin-top: 24px; color: #64748b;">ABC College Student Support</p>
            </div>
        `
    });
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };
