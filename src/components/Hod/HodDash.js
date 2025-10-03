import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import HodTeach from "./Hodteach";
import HodStud from "./Hodstud";
import HodForm from "./Hodform";
import StudentAttend from "./Studentattend";
import StudentNotify from "./StudentNotify";
import Profile from "../Admin/Profile";

export default function HodDash({ onLogout }) {
  const [activeSection, setActiveSection] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const renderSection = () => {
    switch (activeSection) {
      case "Profile":
        return <Profile />;
      case "Teacher":
        return <HodTeach />;
      case "Student":
        return <HodStud />;
      case "Attendence":
        return <StudentAttend />
      case "Schedule":
        return <HodForm />;
      case "Students Notify":
        return <StudentNotify />
      default:
        return <Profile />;
    }
  };

 const handleLogout = () => {
    Cookies.remove("hodToken");

    if (onLogout) onLogout();

    navigate("/hod-login");
  };

  const menuItems = [
    { name: "Profile", icon: "fa-solid fa-pie-chart" },
    { name: "Teacher", icon: "fa-solid fa-chalkboard-teacher" },
    { name: "Student", icon: "fa-solid fa-user-graduate" },
    { name: "Attendence", icon: "fa-solid fa-user-graduate" },
    { name: "Schedule", icon: "fa-solid fa-calendar-alt" }, 
    { name: "Students Notify", icon: "fa-solid fa-calendar-alt" }, 
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
