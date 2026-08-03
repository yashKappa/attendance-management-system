import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  User,
  Users,
  Bell,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  BookOpen,
  RefreshCw,
  LogOut,
  AlertCircle,
  TrendingUp,
  Filter,
  Megaphone,
  UserCheck,
} from "lucide-react";
import "./Teacher_Dash.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = "https://attendance-management-system-83fk.onrender.com";

export default function Teacher_Dash({ teacherUEID = "", onLogout }) {
  // Department & Student Selection
  const [selectedDept, setSelectedDept] = useState("All");
  const [departmentList, setDepartmentList] = useState([]);
  const [deptStudents, setDeptStudents] = useState([]);
  const [selectedStudentUEID, setSelectedStudentUEID] = useState("All");

  // Raw API Data States
  const [allStudents, setAllStudents] = useState([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);

  // Filters & Tabs
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [notifySubTab, setNotifySubTab] = useState("all");

  // Status States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Master Lists (Departments & Students)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/student`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setAllStudents(data);
          const depts = ["All", ...new Set(data.map((s) => s.department).filter(Boolean))];
          setDepartmentList(depts);
          setDeptStudents(data);
        }
      } catch (err) {
        console.error("Error fetching student registry:", err);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Department Change Handler
  const handleDepartmentChange = async (newDept) => {
    setSelectedDept(newDept);
    setSelectedStudentUEID("All");
    setSubjectFilter("All");

    try {
      const url =
        newDept === "All"
          ? `${API_BASE}/api/student`
          : `${API_BASE}/api/student?department=${encodeURIComponent(newDept)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data)) {
        setDeptStudents(data);
      }
    } catch (err) {
      console.error("Error updating department list:", err);
    }
  };
  

  // 3. Sync Dashboard Data (Attendance & Notifications)
  const fetchDashboardData = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      // 3a. Fetch Attendance Records
      const attRes = await fetch(`${API_BASE}/api/studentAttendance`);
      const attData = await attRes.json();
      let rawRecords = [];
      if (attData.success && Array.isArray(attData.data)) {
        rawRecords = attData.data;
      } else if (Array.isArray(attData)) {
        rawRecords = attData;
      }
      setAllAttendanceRecords(rawRecords);

      // 3b. Fetch Notifications
      const notifyRes = await fetch(`${API_BASE}/api/studentNotify`);
      const notifyData = await notifyRes.json();
      let rawNotify = [];
      if (notifyData.success && Array.isArray(notifyData.notifications)) {
        rawNotify = notifyData.notifications;
      } else if (Array.isArray(notifyData)) {
        rawNotify = notifyData;
      }
      setAllNotifications(rawNotify);
    } catch (err) {
      console.error("Failed to sync teacher dashboard:", err);
      setError("Server connection failed. Could not fetch latest records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // -------------------------------------------------------------
  // DEPARTMENT-FILTERED ATTENDANCE BASE
  // -------------------------------------------------------------
  const departmentFilteredAttendance = useMemo(() => {
    return allAttendanceRecords.filter((rec) => {
      if (selectedDept === "All") return true;

      // Check record department directly or fallback through student object mapping
      const targetStudentObj = deptStudents.find(
        (s) => String(s.ueid) === String(rec.ueid || rec.studentUEID)
      );
      const recDept = rec.department || targetStudentObj?.department;

      return recDept && recDept.trim().toLowerCase() === selectedDept.trim().toLowerCase();
    });
  }, [allAttendanceRecords, selectedDept, deptStudents]);

  // -------------------------------------------------------------
  // DYNAMIC SUBJECTS FOR SELECTED DEPARTMENT
  // -------------------------------------------------------------
  const uniqueSubjects = useMemo(() => {
    const subjects = departmentFilteredAttendance
      .map((r) => r.subject)
      .filter(Boolean);
    return ["All", ...new Set(subjects)];
  }, [departmentFilteredAttendance]);

  // Reset subject filter if current choice is unavailable in newly selected department
  useEffect(() => {
    if (subjectFilter !== "All" && !uniqueSubjects.includes(subjectFilter)) {
      setSubjectFilter("All");
    }
  }, [uniqueSubjects, subjectFilter]);

  // -------------------------------------------------------------
  // COMBINED MATCHING ENGINE (Dept + Student + Subject)
  // -------------------------------------------------------------
  const filteredAttendance = useMemo(() => {
    const targetStudentObj = deptStudents.find((s) => String(s.ueid) === String(selectedStudentUEID));
    const targetMongoId = targetStudentObj?._id ? String(targetStudentObj._id).trim() : null;
    const targetUEID = selectedStudentUEID !== "All" ? String(selectedStudentUEID).trim().toLowerCase() : null;
    const targetName = targetStudentObj?.fullName ? targetStudentObj.fullName.trim().toLowerCase() : "";

    return departmentFilteredAttendance.filter((rec) => {
      // Step A: Specific Student Filter
      if (selectedStudentUEID !== "All") {
        let isMatch = false;

        if (targetMongoId && rec.studentId) {
          let recMongoId = typeof rec.studentId === "object"
            ? (rec.studentId._id || rec.studentId.$oid || rec.studentId)
            : rec.studentId;

          if (recMongoId && String(recMongoId).trim() === targetMongoId) isMatch = true;
        }

        const recUEID = rec.ueid || rec.studentUEID;
        if (recUEID && String(recUEID).trim().toLowerCase() === targetUEID) isMatch = true;

        if (rec.fullName && targetName) {
          if (rec.fullName.trim().toLowerCase() === targetName) isMatch = true;
        }

        if (!isMatch) return false;
      }

      // Step B: Subject Filter
      if (subjectFilter !== "All") {
        if (!rec.subject || rec.subject.trim().toLowerCase() !== subjectFilter.trim().toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [departmentFilteredAttendance, selectedStudentUEID, deptStudents, subjectFilter]);

  // 5. NOTIFICATION CATEGORIZATION & FILTERING
  const { personalNotifications, broadcastNotifications, totalNotifications } = useMemo(() => {
    const targetDept = selectedDept.toLowerCase();
    const targetStudentObj = deptStudents.find((s) => String(s.ueid) === String(selectedStudentUEID));
    const targetMongoId = targetStudentObj?._id ? String(targetStudentObj._id).trim() : null;

    const personal = [];
    const broadcast = [];

    allNotifications.forEach((note) => {
      const rawTargetId = note.studentId || note.recipientId || note.userId || note.student;
      let noteMongoId = null;

      if (rawTargetId) {
        noteMongoId = typeof rawTargetId === "object"
          ? (rawTargetId._id || rawTargetId.$oid || rawTargetId)
          : rawTargetId;
      }

      const noteUEID = note.ueid || note.studentUEID;

      const isPersonalById = targetMongoId && noteMongoId && String(noteMongoId).trim() === targetMongoId;
      const isPersonalByUEID = selectedStudentUEID !== "All" && noteUEID && String(noteUEID).trim().toLowerCase() === selectedStudentUEID.toLowerCase();

      if (isPersonalById || isPersonalByUEID) {
        personal.push({ ...note, isPersonal: true });
      } else if (!noteMongoId && !noteUEID) {
        const noteDept = note.department ? note.department.trim().toLowerCase() : "all";
        if (targetDept === "all" || noteDept === "all" || noteDept === targetDept) {
          broadcast.push({ ...note, isPersonal: false });
        }
      }
    });

    return {
      personalNotifications: personal,
      broadcastNotifications: broadcast,
      totalNotifications: [...personal, ...broadcast],
    };
  }, [allNotifications, selectedDept, selectedStudentUEID, deptStudents]);

  const displayedNotifications = useMemo(() => {
    if (notifySubTab === "personal") return personalNotifications;
    if (notifySubTab === "broadcast") return broadcastNotifications;
    return totalNotifications;
  }, [notifySubTab, personalNotifications, broadcastNotifications, totalNotifications]);

  // KPI Calculations
  const totalLogs = filteredAttendance.length;
  const totalPresent = filteredAttendance.filter(
    (r) => r.status && String(r.status).trim().toLowerCase() === "present"
  ).length;
  const totalAbsent = filteredAttendance.filter(
    (r) => r.status && String(r.status).trim().toLowerCase() === "absent"
  ).length;
  const avgAttendance = totalLogs > 0 ? ((totalPresent / totalLogs) * 100).toFixed(1) : "0.0";

  // Chart Calculations
  const subjectChartData = useMemo(() => {
    const subjectMap = {};

    filteredAttendance.forEach((rec) => {
      const sub = rec.subject || "General";
      if (!subjectMap[sub]) {
        subjectMap[sub] = { present: 0, absent: 0 };
      }
      if (String(rec.status).trim().toLowerCase() === "present") {
        subjectMap[sub].present += 1;
      } else {
        subjectMap[sub].absent += 1;
      }
    });

    const labels = Object.keys(subjectMap);
    return {
      labels,
      datasets: [
        {
          label: "Present",
          data: labels.map((key) => subjectMap[key].present),
          backgroundColor: "#10b981",
          borderRadius: 6,
        },
        {
          label: "Absent",
          data: labels.map((key) => subjectMap[key].absent),
          backgroundColor: "#f43f5e",
          borderRadius: 6,
        },
      ],
    };
  }, [filteredAttendance]);

  const trendChartData = useMemo(() => {
    const dateMap = {};

    filteredAttendance.forEach((rec) => {
      const dateKey = rec.date || "Unknown";
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { total: 0, present: 0 };
      }
      dateMap[dateKey].total += 1;
      if (String(rec.status).trim().toLowerCase() === "present") {
        dateMap[dateKey].present += 1;
      }
    });

    const dates = Object.keys(dateMap).sort();
    const percentages = dates.map((d) =>
      ((dateMap[d].present / dateMap[d].total) * 100).toFixed(1)
    );

    return {
      labels: dates,
      datasets: [
        {
          label: "Attendance Rate (%)",
          data: percentages,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
        },
      ],
    };
  }, [filteredAttendance]);

  return (
    <div className="teacher-dash">
      {/* Header Controls */}
      <header className="dash-header">
        <div className="td-brand">
          <BookOpen className="brand-icon" size={28} />
          <div>
            <h1>Faculty Analytics Portal</h1>
            <p>Monitor student attendance trends and department insights</p>
          </div>
        </div>

        <div className="td-selector-group" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="td-select-box">
            <Filter size={15} />
            <select value={selectedDept} onChange={(e) => handleDepartmentChange(e.target.value)}>
              {departmentList.map((dept, idx) => (
                <option key={idx} value={dept}>
                  Dept: {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="td-select-box">
            <User size={15} />
            <select value={selectedStudentUEID} onChange={(e) => setSelectedStudentUEID(e.target.value)}>
              <option value="All">All Students ({deptStudents.length})</option>
              {deptStudents.map((stu) => (
                <option key={stu._id || stu.ueid} value={stu.ueid}>
                  {stu.fullName} ({stu.ueid})
                </option>
              ))}
            </select>
          </div>

          <button className="td-refresh-btn" onClick={fetchDashboardData} disabled={refreshing}>
            <RefreshCw className={refreshing ? "spin" : ""} size={16} /> Sync
          </button>

          {onLogout && (
            <button className="td-logout-btn" onClick={onLogout}>
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="td-error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Summary */}
      <section className="td-kpi-grid">
        <div className="td-kpi-card">
          <div className="kpi-icon icon-indigo">
            <Users size={24} />
          </div>
          <div>
            <span>Active Enrolments</span>
            <h3>{deptStudents.length} Students</h3>
          </div>
        </div>

        <div className="td-kpi-card">
          <div className="kpi-icon icon-emerald">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span>Present Instances</span>
            <h3>{totalPresent} Records</h3>
          </div>
        </div>

        <div className="td-kpi-card">
          <div className="kpi-icon icon-rose">
            <XCircle size={24} />
          </div>
          <div>
            <span>Absences Logged</span>
            <h3>{totalAbsent} Sessions</h3>
          </div>
        </div>

        <div className="td-kpi-card">
          <div className="kpi-icon icon-amber">
            <TrendingUp size={24} />
          </div>
          <div>
            <span>Average Attendance</span>
            <h3>{avgAttendance}%</h3>
          </div>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <nav className="td-tabs">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
          Analytics Overview
        </button>
        <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>
          Class Attendance Log ({filteredAttendance.length})
        </button>
        <button className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
          Announcements ({totalNotifications.length})
        </button>
      </nav>

      {/* ANALYTICS OVERVIEW TAB CONTENT */}
      {activeTab === "overview" && (
        <div className="td-tab-content">
          {loading ? (
            <div className="td-loading">Loading Analytics Visualizations...</div>
          ) : filteredAttendance.length === 0 ? (
            <div className="td-empty">No data available to display analytics charts.</div>
          ) : (
            <div className="td-charts-grid">
              <div className="td-chart-card">
                <h3>Attendance Trend (% over time)</h3>
                <div className="chart-container">
                  <Line
                    data={trendChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { min: 0, max: 100, title: { display: true, text: "Percentage (%)" } },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="td-chart-card">
                <h3>Subject Performance Breakdown</h3>
                <div className="chart-container">
                  <Bar
                    data={subjectChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: "Number of Sessions" } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATTENDANCE RECORDS TABLE TAB */}
{/* ATTENDANCE RECORDS TABLE TAB */}
{activeTab === "history" && (
  <div className="td-tab-content">
    <div className="td-table-card">
      <div className="td-table-header">
        <h3>Attendance Activity Log</h3>
        
        {/* Controls Container */}
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          {/* Department Filter Dropdown */}
          <div className="td-filter">
            <label>Department:</label>
            <select
              value={selectedDept}
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              {departmentList.map((dept, idx) => (
                <option key={idx} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter Dropdown */}
          <div className="td-filter">
            <label>Filter Subject:</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              {uniqueSubjects.map((sub, idx) => (
                <option key={idx} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="td-table-wrapper">
        {loading ? (
          <div className="td-loading">Fetching database records...</div>
        ) : filteredAttendance.length === 0 ? (
          <div className="td-empty">
            No matching records found for current selection.
          </div>
        ) : (
          <div className="td-table-scroll">
            <table className="td-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>UEID</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td className="font-strong">{item.fullName || "N/A"}</td>
                    <td>{item.ueid || item.studentUEID || "-"}</td>
                    <td>{item.subject || "N/A"}</td>
                    <td>{item.date || "N/A"}</td>
                    <td>
                      <span className="time-badge">
                        <Clock size={12} /> {item.time || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          String(item.status).trim().toLowerCase() === "present"
                            ? "pill-present"
                            : "pill-absent"
                        }`}
                      >
                        {String(item.status).trim().toLowerCase() === "present" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
)}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <div className="td-tab-content">
          <div className="td-notify-subtabs" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              className={`td-subtab-btn ${notifySubTab === "all" ? "active" : ""}`}
              onClick={() => setNotifySubTab("all")}
            >
              All Alerts ({totalNotifications.length})
            </button>
            <button
              className={`td-subtab-btn ${notifySubTab === "personal" ? "active" : ""}`}
              onClick={() => setNotifySubTab("personal")}
            >
              <UserCheck size={14} style={{ marginRight: "4px" }} />
              Student Direct Alerts ({personalNotifications.length})
            </button>
            <button
              className={`td-subtab-btn ${notifySubTab === "broadcast" ? "active" : ""}`}
              onClick={() => setNotifySubTab("broadcast")}
            >
              <Megaphone size={14} style={{ marginRight: "4px" }} />
              Department Broadcasts ({broadcastNotifications.length})
            </button>
          </div>

          <div className="td-notifications-list">
            {displayedNotifications.length === 0 ? (
              <div className="td-empty">No alerts found under this category.</div>
            ) : (
              displayedNotifications.map((note) => (
                <div
                  key={note._id || Math.random()}
                  className={`td-notification-card ${note.isPersonal ? "personal-card" : "broadcast-card"}`}
                >
                  <div className="note-content">
                    <span className="note-type-tag">
                      {note.isPersonal ? "Personal Alert" : "Broadcast"}
                    </span>
                    <p className="note-msg">{note.message}</p>
                    <span className="note-time">
                      {note.date} {note.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}