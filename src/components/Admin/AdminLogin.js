// src/components/Admin/AdminLoginModern.jsx
import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import "./AdminLoginModern.css";

export default function AdminLoginModern() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // hardcoded admin credentials
  const ADMIN_USERNAME = "MSG-SGKM-ADMIN";
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      Cookies.set("adminToken", "true", { expires: 7 });
      navigate("/admin");
    } else {
      setError("Invalid username or password");
      // small shake animation trigger
      const card = document.querySelector(".glass-card");
      if (card) {
        card.classList.remove("shake");
        // force reflow
        void card.offsetWidth;
        card.classList.add("shake");
      }
    }
  };

  return (
    <div className="login-page">
      {/* subtle animated background shapes */}
      <div className="bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="glass-card">
        <div className="brand">
          <img
            src={`${process.env.PUBLIC_URL}/assets/logo.png`}
            alt="AMS logo"
            className="brand-logo"
          />
          <div className="brand-text">
            <h1>Attendance System</h1>
            <span className="sub">AMS — Admin Login</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error">{error}</div>}

          <label className="input-label">
            <span className="label-text">Username</span>
            <div className="input-wrap">
              <svg className="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path fill="currentColor" d="M12 12a5 5 0 1 0-0.001-10.001A5 5 0 0 0 12 12zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/>
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
              />
            </div>
          </label>

          <label className="input-label">
            <span className="label-text">Password</span>
            <div className="input-wrap">
              <svg className="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path fill="currentColor" d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z"/>
              </svg>
              <input
              className="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </label>

          <div className="actions">
            <button className="btn primary" type="submit">Sign in</button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setUsername("");
                setPassword("");
                setError(null);
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="extra-links">
          <Link to="/teacher-login" className="small-btn">Teacher</Link>
          <Link to="/hod-login" className="small-btn">Hod</Link>
          <Link to="/student-login" className="small-btn">Student</Link>
        </div>
      </div>

      <footer className="small-footer">
        © {new Date().getFullYear()} Attendance System — built with ❤️
      </footer>
    </div>
  );
}
