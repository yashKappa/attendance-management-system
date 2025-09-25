import { useState } from "react";
import Cookies from "js-cookie";
import "./AdminLogin.css";
import { useNavigate, Link } from "react-router-dom";

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_USERNAME = "MSG-SGKM-ADMIN";
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setError("");
      Cookies.set("adminLoggedIn", "true", { expires: 1 });
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <div className="logo1">
        <img src={`${process.env.PUBLIC_URL}/assets/logo1.png`} alt="logo" />
        </div>
        <h2>Admin Login</h2>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <div className="login"> 
             <button type="submit">Login</button>
        </div>
       <p className="login-link">
                           <Link to="/teacher-login">
                               <button>Teacher Login</button>
                           </Link>
                           <Link to="/">
                               <button>Student Login</button>
                           </Link>
                       </p>
      </form>
    </div>
  );
}
