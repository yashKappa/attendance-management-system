// src/components/student/StuDash.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Attendance from "./Attendance";
import Notification from "./Notification";

export default function StuDash({ onLogout }) {
  const [activeSection, setActiveSection] = useState("Attendance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const renderSection = () => {
    switch (activeSection) {
      case "Attendance":
        return <Attendance />;
      case "Notification":
        return <Notification />;
      default:
        return <Attendance />;
    }
  };

  const handleLogout = () => {
    Cookies.remove("studentUEID");
    if (onLogout) onLogout();
    navigate("/stu-login");
  };

  const menuItems = [
    { name: "Attendance", icon: "fa-solid fa-user-check" },
    { name: "Notification", icon: "fa-solid fa-bell" },
  ];

  return (
    <div className="admin-container">
         <div className="hamburger" onClick={() => setSidebarOpen(true)}>
        <img src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt="logo"/>
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
            <h2>Student Panel</h2>
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
