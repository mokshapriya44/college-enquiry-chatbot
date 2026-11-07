import React,{ useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function Chatbot() {
    const savedStudent = JSON.parse(localStorage.getItem("user") || "{}");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadHistory() {
            try {
                const history = await apiRequest("/chat/history");
                setMessages(history.flatMap((item) => [
                    { sender: "user", text: item.user_message },
                    { sender: "bot", text: item.bot_response }
                ]));
            } catch (err) {
                setError(err.message);
            }
        }
        loadHistory();
    }, []);

    async function sendMessage(event) {
        event.preventDefault();
        if (!message.trim() || loading) return;

        const currentMessage = message.trim();
        setMessages((previous) => [...previous, { sender: "user", text: currentMessage }]);
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const data = await apiRequest("/chat", {
                method: "POST",
                body: JSON.stringify({ message: currentMessage })
            });
            setMessages((previous) => [...previous, { sender: "bot", text: data.botReply }]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="chat-page">
            <section className="chat-card">
                <header className="chat-header">
                    <div className="bot-avatar">AI</div>
                    <div>
                        <h2>College Enquiry Assistant</h2>
                        <span className="online">● Online</span>
                    </div>
                </header>

                <div className="chat-body">
                    <div className="bot-message">
                        Hello {savedStudent.name || "Student"}! Welcome to ABC College. Ask me about courses, fees, duration, admission or timings.
                    </div>

                    {messages.map((item, index) => (
                        <div key={index} className={`message-row ${item.sender}`}>
                            <div className={item.sender === "user" ? "user-message" : "bot-message"}>
                                {item.text}
                            </div>
                        </div>
                    ))}

                    {loading && <div className="bot-message">Typing...</div>}
                    {error && <p className="error">{error}</p>}
                </div>

                <form className="chat-input-row" onSubmit={sendMessage}>
                    <input
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Type your question..."
                    />
                    <button className="primary-button" type="submit" disabled={loading}>Send</button>
                </form>
            </section>
        </main>
    );
}
