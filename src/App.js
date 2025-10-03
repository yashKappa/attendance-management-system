import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Admin from "./components/Admin/Admin";
import AdminLogin from "./components/Admin/AdminLogin";
import TechLogin from "./components/Teacher/TechLogin";
import Dashboard from "./components/Teacher/Dashboard";
import HodLogin from "./components/Hod/HodLogin";
import HodDash from "./components/Hod/HodDash";
import StuDash from "./components/Student/StuDash";
import StuLogin from "./components/Student/StuLogin";

function App() {
  const [userType, setUserType] = useState(null); // "admin" | "teacher" | "student" | "hod"
  const [selectedLogin, setSelectedLogin] = useState("admin"); // which login form to show

  useEffect(() => {
    const adminLoggedIn = Cookies.get("adminLoggedIn");
    const teacherToken = Cookies.get("teacherToken");
    const studentUEID = Cookies.get("studentUEID");
    const hodToken = Cookies.get("hodToken");

    if (adminLoggedIn === "true") setUserType("admin");
    else if (teacherToken) setUserType("teacher");
    else if (studentUEID) setUserType("student");
    else if (hodToken) setUserType("hod");
  }, []);

  if (userType === "admin") return <Admin />;
  if (userType === "teacher") return <Dashboard />;
  if (userType === "student") return <StuDash />;
  if (userType === "hod") return <HodDash />;

  // Show login form selection
  return (
    <div className="login-container">
      <div>
        {selectedLogin === "admin" && <AdminLogin onLogin={() => setUserType("admin")} />}
        {selectedLogin === "teacher" && <TechLogin onLogin={() => setUserType("teacher")} />}
        {selectedLogin === "student" && <StuLogin onLogin={() => setUserType("student")} />}
        {selectedLogin === "hod" && <HodLogin onLogin={() => setUserType("hod")} />}
      </div>
    </div>
  );
}

export default App;
