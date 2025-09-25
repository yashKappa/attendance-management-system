import { useState } from "react";
import Cookies from "js-cookie";
import Data from "./Data";
import Student from "./Student";
import "./TeacherPanel.css";

export default function TeacherPanel({ onLogout }) {
  const [activeSection, setActiveSection] = useState("Data");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "Data": return <Data />;
      case "Student": return <Student />;
      default: return <Data />;
    }
  };

  const handleLogout = () => {
    Cookies.remove("teacherToken");
    if (onLogout) onLogout();
  };

  const menuItems = [
    { name: "Data", icon: "fa-solid fa-database" },
    { name: "Student", icon: "fa-solid fa-user-graduate" },
  ];

  return (
    <div className="admin-container">
      <div className="hamburger" onClick={() => setSidebarOpen(true)}>
        <i className="fa fa-bars"></i>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-close">
          <i className="fa fa-times" onClick={() => setSidebarOpen(false)}></i>
        </div>

        <div className="buttons">
          <div>
            <h2>Teacher Panel</h2>
            <img
              className="logo"
              src={`${process.env.PUBLIC_URL}/assets/logo.png`}
              alt="logo"
            />
            <ul>
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  className={activeSection === item.name ? "active" : ""}
                  onClick={() => {
                    setActiveSection(item.name);
                    setSidebarOpen(false);
                  }}
                >
                  <i className={item.icon} style={{ marginRight: "10px" }}></i>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>

      <div className="admin-main">{renderSection()}</div>
    </div>
  );
}
