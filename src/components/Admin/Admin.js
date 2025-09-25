import { useState } from "react";
import Cookies from "js-cookie";
import Teacher from "./Teacher";
import Student from "./Student";
import HOD from "./HOD";
import "./Admin.css";

export default function Admin({ onLogout }) {
  const [activeSection, setActiveSection] = useState("Teacher");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "Teacher": return <Teacher />;
      case "Student": return <Student />;
      case "HOD": return <HOD />;
      default: return <Teacher />;
    }
  };

  const handleLogout = () => {
    Cookies.remove("adminLoggedIn");
    if (onLogout) onLogout();
  };

  const menuItems = [
    { name: "Teacher", icon: "fa-solid fa-chalkboard-teacher" },
    { name: "Student", icon: "fa-solid fa-user-graduate" },
    { name: "HOD", icon: "fa-solid fa-user-tie" },
  ];

  return (
    <div className="admin-container">
      {/* Hamburger for mobile */}
      <div className="hamburger" onClick={() => setSidebarOpen(true)}>
        <i className="fa fa-bars"></i>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <div className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Close button for mobile */}
        <div className="sidebar-close" onClick={() => setSidebarOpen(false)}>
          <i className="fa fa-times"></i>
        </div>

        <div>
          <h2>MSG-SGKM Admin Panel</h2>
          <img className="logo" src="logo.png" alt="logo" />
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

        <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="admin-main">{renderSection()}</div>
    </div>
  );
}
