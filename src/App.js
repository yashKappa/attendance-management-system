import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Admin from "./components/Admin/Admin";
import AdminLogin from "./components/Admin/AdminLogin";
import TechLogin from "./components/Teacher/TechLogin";
import Dashboard from "./components/Teacher/Dashboard";

function App() {
  const [userType, setUserType] = useState(null); // "admin" or "teacher"

  useEffect(() => {
    const adminLoggedIn = Cookies.get("adminLoggedIn");
    const teacherToken = Cookies.get("teacherToken");

    if (adminLoggedIn === "true") {
      setUserType("admin");
    } else if (teacherToken) {
      setUserType("teacher");
    }
  }, []);

  return (
    <div>
      {userType === "admin" ? (
        <Admin />
      ) : userType === "teacher" ? (
        <Dashboard />
      ) : (
        <TechLogin onLogin={() => setUserType("teacher")} />
      )}
    </div>
  );
}

export default App;
