import { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Teacher from "./Teacher/Teacher";
import Student from "./Student/Student";
import Hod from "./Hod/Hod";
import Profile from "./Profile";
import "./Admin.css";


export default function Admin({ onLogout }) {
  const [activeSection, setActiveSection] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();


  const renderSection = () => {
    switch (activeSection) {
      case "Profile": return <Profile />
      case "Teacher": return <Teacher />;
      case "Student": return <Student />;
      case "Hod": return <Hod />;
      default: return <Profile />;
    }
  };

  const handleLogout = () => {
    Cookies.remove("adminLoggedIn");
    if (onLogout) onLogout();
    navigate("/admin-login");

  };

  const menuItems = [
    { name: "Profile", icon: "fa-solid fa-pie-chart"},
    { name: "Teacher", icon: "fa-solid fa-chalkboard-teacher" },
    { name: "Student", icon: "fa-solid fa-user-graduate" },
    { name: "Hod", icon: "fa-solid fa-user-tie" },
  ];

  return (
    <div className="admin-container">
      <div className="hamburger" onClick={() => setSidebarOpen(true)}>
        <img src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt="logo" />
        <i className="fa fa-bars"></i>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <div className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-close">
          <i className="fa fa-times" onClick={() => setSidebarOpen(false)}></i>
        </div>

        <div className="buttons">
          <div>
            <h2> Admin Panel</h2>
            <img className="logo" src={`${process.env.PUBLIC_URL}/logo.png`} alt="logo" />
            <ul>
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  className={activeSection === item.name ? "active" : ""}
                  onClick={() => { setActiveSection(item.name); setSidebarOpen(false); }}
                >
                  <i className={item.icon} style={{ marginRight: "10px" }}></i>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          <button className="admin-logout-btn" onClick={handleLogout}>Logout <i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
      </div>

      <div className="admin-main">{renderSection()}</div>
    </div>
  );
}
