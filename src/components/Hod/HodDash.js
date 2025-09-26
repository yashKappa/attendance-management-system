import { useState } from "react";
import Cookies from "js-cookie";
import HodTeach from "./Hodteach";
import HodStud from "./Hodstud";
import HodForm from "./Hodform";

export default function HodDash({ onLogout }) {
  const [activeSection, setActiveSection] = useState("Details");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "Details":
      case "Teacher":
        return <HodTeach />;
      case "Student":
        return <HodStud />;
      case "Schedule":
        return <HodForm />;
      default:
        return <HodTeach />;
    }
  };

  const handleLogout = () => {
    Cookies.remove("hodToken");
    if (onLogout) onLogout();
  };

  const menuItems = [
    { name: "Teacher", icon: "fa-solid fa-chalkboard-teacher" },
    { name: "Student", icon: "fa-solid fa-user-graduate" },
    { name: "Schedule", icon: "fa-solid fa-calendar-alt" }, 
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
            <h2>HOD Panel</h2>
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
