import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";

export default function HodLogin() {
  const [ueid, setUeid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/api/hods/login", {
        ueid,
        password,
      });

      if (response.data.success) {
        // Set cookie for auto-login (valid for 7 days)
        Cookies.set("hodToken", response.data.token, { expires: 7 });

        // Redirect to HOD Dashboard (Hod.js)
        navigate("/hod");
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="logo1">
          <img src={`${process.env.PUBLIC_URL}/assets/logo1.png`} alt="logo" />
        </div>
        <h2>HOD Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div>
            <label>UEID:</label>
            <input
              type="text"
              value={ueid}
              onChange={(e) => setUeid(e.target.value)}
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
          <Link to="/admin-login">
            <button>Admin Login</button>
          </Link>
          <Link to="/teacher-login">
            <button>Teacher Login</button>
          </Link>
        </p>
      </div>
    </div>
  );
}
