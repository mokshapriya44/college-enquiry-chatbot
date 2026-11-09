// const db = require("../db");

// async function sendMessage(req, res) {
//     try {
//         const { message } = req.body;
//         if (typeof message !== "string" || !message.trim()) {
//             return res.status(400).json({ message: "Please enter a message." });
//         }
//         const userMessage = message.trim();
//         const normalized = userMessage.toLowerCase();
//         let botReply = "";

//         // First, answer course/fee/duration questions from the live MySQL courses table.
//         const [courses] = await db.query(
//             "SELECT course_name, description, fee, duration FROM courses ORDER BY course_name"
//         );
//         const matchedCourse = courses.find(c => normalized.includes(c.course_name.toLowerCase()));
//         if (matchedCourse && /(fee|fees|cost|price|duration|how long|about|details)/i.test(userMessage)) {
//             botReply = `${matchedCourse.course_name}\n${matchedCourse.description || ""}\nFee: ₹${Number(matchedCourse.fee).toLocaleString("en-IN")}\nDuration: ${matchedCourse.duration}`;
//         } else if (/(course|courses|programmes|programs)/i.test(userMessage)) {
//             botReply = "Courses currently offered:\n" + courses.map(c =>
//                 `${c.course_name} - ₹${Number(c.fee).toLocaleString("en-IN")} - ${c.duration}`
//             ).join("\n");
//         } else {
//             const [answers] = await db.query(
//                 `SELECT response FROM bot_responses
//                  WHERE ? LIKE CONCAT('%', LOWER(keyword), '%')
//                  ORDER BY CHAR_LENGTH(keyword) DESC LIMIT 1`,
//                 [normalized]
//             );
//             if (answers.length) botReply = answers[0].response;
//         }

//         // If no database answer exists, use Gemini. Ollama is not required.
//         if (!botReply && process.env.GEMINI_API_KEY) {
//             const prompt = `You are ABC College's enquiry assistant. Answer clearly and briefly.
// Use only these current course details when discussing ABC College:
// ${courses.map(c => `${c.course_name}: fee ₹${c.fee}, duration ${c.duration}, description ${c.description || ""}`).join("\n")}
// Do not invent college facts, fees, dates, or facilities. If unknown, say the college office should confirm.
// Question: ${userMessage}`;
//             const response = await fetch(
//                 "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + encodeURIComponent(process.env.GEMINI_API_KEY),
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
//                 }
//             );
//             const result = await response.json();
//             if (!response.ok) {
//                 console.error("Gemini error:", result);
//                 botReply = "I couldn't connect to the AI assistant right now. Please ask about courses, fees or duration.";
//             } else {
//                 botReply = result.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n").trim()
//                     || "Sorry, I could not generate an answer.";
//             }
//         }
//         if (!botReply) {
//             botReply = "I can help with available courses, fees, duration, admission and college timings. Please ask a college-related question.";
//         }

//         await db.query(
//             "INSERT INTO chat_history (student_id, user_message, bot_response) VALUES (?, ?, ?)",
//             [req.user.id, userMessage, botReply]
//         );
//         res.json({ userMessage, botReply });
//     } catch (error) {
//         console.error("Chat error:", error);
//         res.status(500).json({ message: "Could not process your message." });
//     }
// }

// async function getChatHistory(req, res) {
//     try {
//         const [rows] = await db.query(
//             `SELECT id AS chat_id, user_message, bot_response, created_at
//              FROM chat_history WHERE student_id = ? ORDER BY created_at ASC`,
//             [req.user.id]
//         );
//         res.json(rows);
//     } catch (error) {
//         res.status(500).json({ message: "Could not fetch chat history." });
//     }
// }

// module.exports = { sendMessage, getChatHistory };






const db = require("../db");

// SASI College name variations
const sasiAliases = [
    "sasi",
    "sasi college",
    "sasi institute of technology",
    "sasi institute of technology and engineering"
];

// Some known other colleges
const otherColleges = [
    "bits pilani",
    "iit",
    "nit",
    "srkr",
    "vishnu",
    "aditya college",
    "klu",
    "lpu",
    "vit",
    "amrita"
];

function isOtherCollegeQuestion(message) {
    const text = message.toLowerCase();

    // Explicitly mentioned SASI means SASI question
    if (sasiAliases.some(name => text.includes(name))) {
        return false;
    }

    // Check known other college names
    return otherColleges.some(name => {
        return new RegExp(
            `\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i"
        ).test(text);
    });
}


// Send Chat Message
async function sendMessage(req, res) {
    try {
        const { message } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                message: "Please enter a message."
            });
        }

        const userMessage = message.trim();
        const normalized = userMessage.toLowerCase();

        let botReply = "";

        // Block known other colleges
        if (isOtherCollegeQuestion(userMessage)) {
            botReply =
                "Sorry! I can provide information only about SASI College. For details about other colleges, please search on Google.";

        } else {

            // Get courses from MySQL
            const [courses] = await db.query(
                `SELECT course_name, description, fee, duration
                 FROM courses
                 ORDER BY course_name`
            );

            // Check course details
            const matchedCourse = courses.find(c =>
                normalized.includes(c.course_name.toLowerCase())
            );

            if (
                matchedCourse &&
                /(fee|fees|cost|price|duration|how long|about|details|annual|yearly|per year)/i.test(userMessage)
            ) {
                botReply = `
${matchedCourse.course_name}

${matchedCourse.description || ""}

Fee: ₹${Number(matchedCourse.fee).toLocaleString("en-IN")}

Duration: ${matchedCourse.duration}
                `.trim();

            } else if (
                /(course|courses|programmes|programs)/i.test(userMessage)
            ) {
                botReply = "Courses currently offered at SASI College:\n" +
                    courses.map(c =>
                        `${c.course_name} - ₹${Number(c.fee).toLocaleString("en-IN")} - ${c.duration}`
                    ).join("\n");

            } else {

                // Check predefined responses
                const [answers] = await db.query(
                    `SELECT response FROM bot_responses
                     WHERE ? LIKE CONCAT('%', LOWER(keyword), '%')
                     ORDER BY CHAR_LENGTH(keyword) DESC
                     LIMIT 1`,
                    [normalized]
                );

                if (answers.length) {
                    botReply = answers[0].response;
                }
            }

            // Gemini API for other SASI-related questions
            if (!botReply && process.env.GEMINI_API_KEY) {

                const courseDetails = courses.map(c => `
Course: ${c.course_name}
Description: ${c.description || "Not available"}
Fee: ${c.fee}
Duration: ${c.duration}
                `).join("\n");

                const prompt = `
You are the official SASI College Enquiry Assistant.

You must answer ONLY questions related to SASI College.

STRICT RULES:

1. Never provide information about any other college or university.

2. If the student asks about another college, reply:
"Sorry! I can provide information only about SASI College. For details about other colleges, please search on Google."

3. If the student does not mention a college name,
assume they are asking about SASI College.

4. Understand different ways students ask the same question.

Examples:
- College fee entha?
- What is the college fee?
- What is the annual fee?
- Fee per year entha?
- How much should I pay every year?

Understand all these as fee-related questions.

5. Answer questions about courses, fees, admissions,
placements, facilities, timings and college details.

6. Use the database information below for course details.
Never invent fees, durations or course information.

SASI COLLEGE DATABASE DETAILS:

${courseDetails}

7. If information is not available, reply:
"This information is currently unavailable.
Please contact SASI College for confirmation."

8. Give simple and clear answers.
9. Do not provide information about other colleges.
10. Do not make up facts.

Student Question: ${userMessage}
                `;

                const response = await fetch(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-goog-api-key": process.env.GEMINI_API_KEY
                        },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        { text: prompt }
                                    ]
                                }
                            ]
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    console.error("Gemini API Error:", result);

                    botReply =
                        "Gemini API connection failed. Please try again.";

                } else {
                    botReply = result.candidates?.[0]?.content?.parts
                        ?.map(p => p.text || "")
                        .join("\n")
                        .trim() ||
                        "Sorry, I could not generate an answer.";
                }
            }
        }

        if (!botReply) {
            botReply =
                "I can help you with SASI College courses, fees, admissions, placements and facilities. Please ask your question.";
        }

        // Save chat history
        await db.query(
            `INSERT INTO chat_history
             (student_id, user_message, bot_response)
             VALUES (?, ?, ?)`,
            [req.user.id, userMessage, botReply]
        );

        res.json({
            userMessage,
            botReply
        });

    } catch (error) {
        console.error("Chat error:", error);

        res.status(500).json({
            message: "Could not process your message."
        });
    }
}


// Get Chat History
async function getChatHistory(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT id AS chat_id, user_message, bot_response, created_at
             FROM chat_history
             WHERE student_id = ?
             ORDER BY created_at ASC`,
            [req.user.id]
        );

        res.json(rows);

    } catch (error) {
        console.error("Chat history error:", error);

        res.status(500).json({
            message: "Could not get chat history."
        });
    }
}


// Delete Chat History
async function deleteChatHistory(req, res) {
    try {
        await db.query(
            "DELETE FROM chat_history WHERE student_id = ?",
            [req.user.id]
        );

        res.json({
            message: "Chat history deleted successfully."
        });

    } catch (error) {
        console.error("Delete history error:", error);

        res.status(500).json({
            message: "Could not delete chat history."
        });
    }
}

module.exports = {
    sendMessage,
    getChatHistory,
    deleteChatHistory
};
