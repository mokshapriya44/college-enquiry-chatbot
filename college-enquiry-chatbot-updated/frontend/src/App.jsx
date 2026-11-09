
import React from "react";
import {
    Link,
    Navigate,
    Route,
    Routes,
    useNavigate,
    useLocation
} from "react-router-dom";

import { getUser, logout } from "./api";

import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Chatbot from "./pages/Chatbot";
import Courses from "./pages/Courses";
import EnquiryForm from "./pages/EnquiryForm";
import EnquiryDetails from "./pages/EnquiryDetails";
import AdminDashboard from "./pages/AdminDashboard";

// Student route protection
function StudentRoute({ children }) {
    const user = getUser();

    return user?.role === "student"
        ? children
        : <Navigate to="/student-login" replace />;
}

// Admin route protection
function AdminRoute({ children }) {
    const user = getUser();

    return user?.role === "admin"
        ? children
        : <Navigate to="/admin-login" replace />;
}

// Public pages protection
function PublicOnly({ children }) {
    const user = getUser();

    if (user?.role === "student") {
        return <Navigate to="/chat" replace />;
    }

    if (user?.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

// Navbar
function Navbar() {
    const user = getUser();
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === "/";

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <nav className="navbar portal-navbar">
            <Link className="brand" to="/">
                <span className="brand-mark">ABC</span>
                <span>College</span>
            </Link>
            <div className="nav-links">
                {isHome && (
                    <>
                        {/* <Link to="/student-login">Student Login</Link>
                        <Link to="/admin-login">Admin Login</Link> */}
                    </>
                )}
                {!isHome && user?.role === "student" && (
                    <>
                        <Link className={location.pathname === "/chat" ? "active" : ""} to="/chat">Chatbot</Link>
                        <Link className={location.pathname === "/enquiry" ? "active" : ""} to="/enquiry">Enquiry Form</Link>
                        <button className="nav-button" onClick={handleLogout}>Logout</button>
                    </>
                )}
                {!isHome && user?.role === "admin" && (
                    <>
                        <Link className={location.pathname === "/admin/dashboard" ? "active" : ""} to="/admin/dashboard">Dashboard</Link>
                        <Link className={location.pathname === "/admin/courses" ? "active" : ""} to="/admin/courses">Courses</Link>
                        <Link className={location.pathname === "/admin/enquiries" ? "active" : ""} to="/admin/enquiries">Enquiry Details</Link>
                        <button className="nav-button" onClick={handleLogout}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

// Home page
function Home() {
    return (
        <main className="home-hero">
            <img
                className="home-image"
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=90"
                alt="ABC College campus building"
            />
            <div className="home-copy">
                <span className="eyebrow">STUDENT SUPPORT & ADMISSIONS</span>
                <h1>Welcome to ABC College</h1>
                <p>Find the right course, get clear admission information, and reach our team whenever you need guidance.</p>
                <div className="hero-actions">
                    <Link className="primary-button" to="/student-login">Student Login</Link>
                    <Link className="secondary-button" to="/admin-login">Admin Login</Link>
                </div>
            </div>
        </main>
    );
}

// Main App
export default function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/student-login" element={<PublicOnly><Login /></PublicOnly>} />
                <Route path="/login" element={<Navigate to="/student-login" replace />}/>
                <Route path="/admin-login" element={<PublicOnly><AdminLogin /></PublicOnly>} />
                <Route path="/register" element={<PublicOnly><Register /></PublicOnly>}/>
                <Route path="/chat" element={<StudentRoute><Chatbot /></StudentRoute>} />
                <Route path="/enquiry" element={<StudentRoute><EnquiryForm /></StudentRoute>}/>
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>}/>
                <Route path="/admin/courses" element={<AdminRoute><Courses /></AdminRoute>}/>
                <Route path="/admin/enquiries" element={<AdminRoute><EnquiryDetails /></AdminRoute>} />
                <Route path="*" element={<Navigate to="/" replace />}/>
            </Routes>
        </>
    );
}
