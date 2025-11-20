import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import "../Admin/AdminLoginModern.css"; // same CSS file

export default function TeacherLoginModern() {
  const [ueid, setUeid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(
        "https://attendance-management-system-83fk.onrender.com/api/teachers/login",
        { ueid, password }
      );

      if (response.data.success) {
        Cookies.set("teacherToken", response.data.token, { expires: 7 });
        navigate("/dashboard");
      } {
        setError(response.data.message || "Login failed");

        const card = document.querySelector(".glass-card");
        if (card) {
          card.classList.remove("shake");
          void card.offsetWidth;
          card.classList.add("shake");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
    }
  };

  return (
    <div className="login-page">
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="glass-card">
        <div className="brand">
          <img
            src={`${process.env.PUBLIC_URL}/assets/logo.png`}
            alt="logo"
            className="brand-logo"
          />
          <div className="brand-text">
            <h1>Attendance System</h1>
            <span className="sub">AMS — Teacher Login</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error">{error}</div>}

          <label className="input-label">
            <span className="label-text">UEID</span>
            <div className="input-wrap">
              <svg width="18" height="18" className="icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 12a5 5 0 1 0-0.001-10.001A5 5 0 0 0 12 12zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"
                />
              </svg>

              <input
                type="text"
                value={ueid}
                onChange={(e) => setUeid(e.target.value)}
                placeholder="Enter UEID"
                required
              />
            </div>
          </label>

          <label className="input-label">
            <span className="label-text">Password</span>
            <div className="input-wrap">
              <svg width="18" height="18" className="icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z"
                />
              </svg>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </label>

          <div className="actions">
            <button type="submit" className="btn primary">Login</button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setUeid("");
                setPassword("");
                setError(null);
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="extra-links">
          <Link to="/admin-login" className="small-btn">Admin</Link>
          <Link to="/student-login" className="small-btn">Student</Link>
          <Link to="/hod-login" className="small-btn">HOD</Link>
        </div>
      </div>

      <footer className="small-footer">
        © {new Date().getFullYear()} Attendance System
      </footer>
    </div>
  );
}
