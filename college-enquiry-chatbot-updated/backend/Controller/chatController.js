const db = require("../db");

async function sendMessage(req, res) {
    try {
        const { message } = req.body;
        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ message: "Please enter a message." });
        }
        const userMessage = message.trim();
        const normalized = userMessage.toLowerCase();
        let botReply = "";

        // First, answer course/fee/duration questions from the live MySQL courses table.
        const [courses] = await db.query(
            "SELECT course_name, description, fee, duration FROM courses ORDER BY course_name"
        );
        const matchedCourse = courses.find(c => normalized.includes(c.course_name.toLowerCase()));
        if (matchedCourse && /(fee|fees|cost|price|duration|how long|about|details)/i.test(userMessage)) {
            botReply = `${matchedCourse.course_name}\n${matchedCourse.description || ""}\nFee: ₹${Number(matchedCourse.fee).toLocaleString("en-IN")}\nDuration: ${matchedCourse.duration}`;
        } else if (/(course|courses|programmes|programs)/i.test(userMessage)) {
            botReply = "Courses currently offered:\n" + courses.map(c =>
                `${c.course_name} - ₹${Number(c.fee).toLocaleString("en-IN")} - ${c.duration}`
            ).join("\n");
        } else {
            const [answers] = await db.query(
                `SELECT response FROM bot_responses
                 WHERE ? LIKE CONCAT('%', LOWER(keyword), '%')
                 ORDER BY CHAR_LENGTH(keyword) DESC LIMIT 1`,
                [normalized]
            );
            if (answers.length) botReply = answers[0].response;
        }

        // If no database answer exists, use Gemini. Ollama is not required.
        if (!botReply && process.env.GEMINI_API_KEY) {
            const prompt = `You are ABC College's enquiry assistant. Answer clearly and briefly.
Use only these current course details when discussing ABC College:
${courses.map(c => `${c.course_name}: fee ₹${c.fee}, duration ${c.duration}, description ${c.description || ""}`).join("\n")}
Do not invent college facts, fees, dates, or facilities. If unknown, say the college office should confirm.
Question: ${userMessage}`;
            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + encodeURIComponent(process.env.GEMINI_API_KEY),
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                }
            );
            const result = await response.json();
            if (!response.ok) {
                console.error("Gemini error:", result);
                botReply = "I couldn't connect to the AI assistant right now. Please ask about courses, fees or duration.";
            } else {
                botReply = result.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n").trim()
                    || "Sorry, I could not generate an answer.";
            }
        }
        if (!botReply) {
            botReply = "I can help with available courses, fees, duration, admission and college timings. Please ask a college-related question.";
        }

        await db.query(
            "INSERT INTO chat_history (student_id, user_message, bot_response) VALUES (?, ?, ?)",
            [req.user.id, userMessage, botReply]
        );
        res.json({ userMessage, botReply });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ message: "Could not process your message." });
    }
}

async function getChatHistory(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT id AS chat_id, user_message, bot_response, created_at
             FROM chat_history WHERE student_id = ? ORDER BY created_at ASC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch chat history." });
    }
}

module.exports = { sendMessage, getChatHistory };
