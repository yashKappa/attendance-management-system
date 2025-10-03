// src/components/student/Notification.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Error from "../Error/Error";

export default function Notification() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [personalNotifications, setPersonalNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All"); // "All" or "Personal"

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const studentUEID = Cookies.get("studentUEID");
        if (!studentUEID) {
          setError("Student not logged in");
          return;
        }

        const res = await axios.get("http://localhost:5000/api/studentNotify");
        if (res.data.success) {
          const notifications = res.data.notifications;

          // Personal section: notifications that have this student's UEID
          const personalSection = notifications.filter((n) => n.ueid === studentUEID);

          // All section: notifications for everyone (department = All) and ueid not set
          const allSection = notifications.filter((n) => n.department === "All" && !n.ueid);

          setPersonalNotifications(personalSection);
          setAllNotifications(allSection);
        } else {
          setError("Failed to fetch notifications");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch notifications");
      }
    };

    fetchNotifications();
  }, []);

  const renderTable = (notifications) => {
    if (notifications.length === 0) {
      return <p>No notifications available.</p>;
    }

    return (
      <div className="table-responsive">
        <table className="student-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Time</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n._id}>
                <td>{n.date}</td>
                <td>{n.day}</td>
                <td>{n.time}</td>
                <td>{n.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="student-container">
      <div className="notifications-container">
        <h2>Student Notifications</h2>
        <Error message={error} type="error" onClose={() => setError(null)} />

        {/* Tab buttons */}
        <div className="filter">
          <button
            className={activeTab === "All" ? "active" : ""}
            onClick={() => setActiveTab("All")}
          >
            All
          </button>
          <button
            className={activeTab === "Personal" ? "active" : ""}
            onClick={() => setActiveTab("Personal")}
          >
            Personal
          </button>
        </div>

        {activeTab === "All" && (
          <section>
            <h3>All Notifications</h3>
            {renderTable(allNotifications)}
          </section>
        )}

        {activeTab === "Personal" && (
          <section>
            <h3>Personal Notifications</h3>
            {renderTable(personalNotifications)}
          </section>
        )}
      </div>
    </div>
  );
}
