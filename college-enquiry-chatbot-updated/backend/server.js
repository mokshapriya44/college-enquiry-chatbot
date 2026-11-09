require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL  }));
app.use(express.json());

app.get("/", (req, res) => res.send("ABC College Enquiry Chatbot API is running"));

app.use("/api/students", require("./Router/studentRouter"));
app.use("/student", require("./Router/studentRouter"));
app.use("/api/admin", require("./Router/adminRouter"));
app.use("/api/courses", require("./Router/courseRouter"));
app.use("/api/chat", require("./Router/chatRouter"));
app.use("/api/enquiries", require("./Router/enquiryRouter"));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error." });
});

console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
