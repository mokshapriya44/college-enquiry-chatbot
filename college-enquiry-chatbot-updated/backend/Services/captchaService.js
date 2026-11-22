const crypto = require("crypto");
const svgCaptcha = require("svg-captcha");

const challenges = new Map();
const challengeLifetime = 5 * 60 * 1000;
const maxChallenges = 10000;

function createTextCaptcha() {
    const now = Date.now();

    for (const [id, challenge] of challenges) {
        if (challenge.expiresAt <= now) {
            challenges.delete(id);
        }
    }

    if (challenges.size >= maxChallenges) {
        throw new Error("Too many active CAPTCHA challenges.");
    }

    const captcha = svgCaptcha.create({
        size: 6,
        noise: 2,
        color: false,
        background: "#f5f7fa",
        ignoreChars: "0oO1iIlL5sS2Z8B6G",
        width: 190,
        height: 64
    });
    const id = crypto.randomBytes(24).toString("hex");

    challenges.set(id, {
        text: captcha.text,
        expiresAt: now + challengeLifetime
    });

    return {
        captchaId: id,
        image: Buffer.from(captcha.data).toString("base64")
    };
}

function verifyTextCaptcha(id, text) {
    if (!id || !text) {
        return false;
    }

    const challenge = challenges.get(id);
    challenges.delete(id);

    if (!challenge || challenge.expiresAt <= Date.now()) {
        return false;
    }

    const submitted = Buffer.from(String(text).trim().toLowerCase());
    const normalizedExpected = Buffer.from(challenge.text.toLowerCase());

    return normalizedExpected.length === submitted.length &&
        crypto.timingSafeEqual(normalizedExpected, submitted);
}

async function verifyTurnstile(token, remoteIp) {
    if (!token) {
        return false;
    }

    if (!process.env.TURNSTILE_SECRET_KEY) {
        throw new Error("TURNSTILE_SECRET_KEY is not configured.");
    }

    const formData = new URLSearchParams();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);

    if (remoteIp) {
        formData.append("remoteip", remoteIp);
    }

    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error(`Turnstile verification failed with status ${response.status}.`);
    }

    const result = await response.json();

    return result.success === true;
}

module.exports = {
    createTextCaptcha,
    verifyTextCaptcha,
    verifyTurnstile
};
