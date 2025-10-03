// src/components/admin/AdminLogin.js
import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
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
      // Save cookie for persistence
      Cookies.set("adminToken", "true", { expires: 7 });
      // Redirect to Admin Dashboard
      navigate("/admin");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="logo1">
          <img src={`${process.env.PUBLIC_URL}/assets/logo1.png`} alt="logo" />
        </div>
        <h2>Admin Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login">
            <button type="submit">Login</button>
          </div>
        </form>

        <p className="login-link">
          <Link to="/teacher-login">
            <button>Teacher</button>
          </Link>
          <Link to="/hod-login">
            <button>Hod</button>
          </Link>
          <Link to="/student-login">
            <button>Student</button>
          </Link>
        </p>
      </div>
    </div>
  );
}
