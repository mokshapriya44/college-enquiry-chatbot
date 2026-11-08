const API_URL = import.meta.env.VITE_API_URL || "https://college-enquiry-chatbot-ugvo.onrender.com";

export function getToken() {
    return localStorage.getItem("token");
}
export function getUser() {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
}
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}
export async function apiRequest(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
}
