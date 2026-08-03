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
import { Line, Doughnut } from "react-chartjs-2";
import {
  User,
  Bell,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  BookOpen,
  Award,
  RefreshCw,
  LogOut,
  AlertCircle,
  TrendingUp,
  Filter,
  Megaphone,
  UserCheck,
} from "lucide-react";
import "./Student_Dash.css";

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

export default function Student_Dash({ studentUEID = "", onLogout }) {
  // Dropdown / Selection States
  const [selectedDept, setSelectedDept] = useState("All");
  const [departmentList, setDepartmentList] = useState([]);
  const [deptStudents, setDeptStudents] = useState([]);
  const [selectedUEID, setSelectedUEID] = useState(studentUEID);

  // Status States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Selected Student Details
  const [studentInfo, setStudentInfo] = useState({
    fullName: "Select a Student",
    email: "-",
    department: "-",
    ueid: "-",
    mongoId: null,
  });

  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [subjectFilter, setSubjectFilter] = useState("All");
  
  // Notification Sub-Filter State: 'all' | 'personal' | 'broadcast'
  const [notifySubTab, setNotifySubTab] = useState("all");

  // 1. Fetch Students List
  useEffect(() => {
    const fetchInitialStudents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/student`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const depts = ["All", ...new Set(data.map((s) => s.department).filter(Boolean))];
          setDepartmentList(depts);
          setDeptStudents(data);

          const targetUEID = studentUEID || data[0]?.ueid;
          if (targetUEID) {
            setSelectedUEID(targetUEID);
          }
        }
      } catch (err) {
        console.error("Error fetching initial students:", err);
      }
    };

    fetchInitialStudents();
  }, [studentUEID]);

  // 2. Department Change Handler
  const handleDepartmentChange = async (newDept) => {
    setSelectedDept(newDept);
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
        if (data.length > 0) {
          setSelectedUEID(data[0].ueid);
        } else {
          setSelectedUEID("");
        }
      }
    } catch (err) {
      console.error("Error fetching department students:", err);
    }
  };

  // 3. Fetch Raw Data
  const fetchStudentData = useCallback(async () => {
    if (!selectedUEID) {
      setLoading(false);
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      // 3a. Get Student Profile
      const studentRes = await fetch(`${API_BASE}/api/student?ueid=${encodeURIComponent(selectedUEID)}`);
      const studentData = await studentRes.json();

      let mongoStudentId = null;
      let studentName = "";
      let targetDept = "General";

      if (Array.isArray(studentData) && studentData.length > 0) {
        const found =
          studentData.find((s) => String(s.ueid).trim() === String(selectedUEID).trim()) || studentData[0];

        mongoStudentId = found._id;
        studentName = found.fullName || "";
        targetDept = found.department || "General";

        setStudentInfo({
          fullName: studentName || "Student Profile",
          email: found.email || "N/A",
          department: targetDept,
          ueid: found.ueid || selectedUEID,
          mongoId: mongoStudentId,
        });
      }

      // 3b. Fetch all attendance records
      const attRes = await fetch(`${API_BASE}/api/studentAttendance`);
      const attData = await attRes.json();

      let rawRecords = [];
      if (attData.success && Array.isArray(attData.data)) {
        rawRecords = attData.data;
      } else if (Array.isArray(attData)) {
        rawRecords = attData;
      }

      setAllAttendanceRecords(rawRecords);

      // 3c. Fetch Raw Notifications List
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
      console.error("Failed to sync dashboard data:", err);
      setError("Server connection failed. Could not sync student records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedUEID]);

  useEffect(() => {
    setSubjectFilter("All");
    fetchStudentData();
  }, [selectedUEID, fetchStudentData]);

  // 4. ATTENDANCE MATCHING ENGINE
  const currentStudentAttendance = useMemo(() => {
    if (!selectedUEID) return [];

    const targetMongoId = studentInfo.mongoId ? String(studentInfo.mongoId).trim() : null;
    const targetUEID = String(selectedUEID).trim().toLowerCase();
    const targetName = studentInfo.fullName ? studentInfo.fullName.trim().toLowerCase() : "";

    return allAttendanceRecords.filter((rec) => {
      if (targetMongoId && rec.studentId) {
        let recMongoId = typeof rec.studentId === "object" 
          ? (rec.studentId._id || rec.studentId.$oid || rec.studentId)
          : rec.studentId;

        if (recMongoId && String(recMongoId).trim() === targetMongoId) return true;
      }

      const recUEID = rec.ueid || rec.studentUEID;
      if (recUEID && String(recUEID).trim().toLowerCase() === targetUEID) return true;

      if (rec.fullName && targetName && targetName !== "select a student") {
        if (rec.fullName.trim().toLowerCase() === targetName) return true;
      }

      return false;
    });
  }, [allAttendanceRecords, selectedUEID, studentInfo.mongoId, studentInfo.fullName]);

  // 5. NOTIFICATION CATEGORIZATION (PERSONAL VS BROADCAST)
  const { personalNotifications, broadcastNotifications, totalNotifications } = useMemo(() => {
    if (!selectedUEID) return { personalNotifications: [], broadcastNotifications: [], totalNotifications: [] };

    const targetMongoId = studentInfo.mongoId ? String(studentInfo.mongoId).trim() : null;
    const targetUEID = String(selectedUEID).trim().toLowerCase();
    const targetDept = studentInfo.department ? studentInfo.department.trim().toLowerCase() : "";

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

      // Check if explicitly assigned to this specific student
      const isPersonalById = targetMongoId && noteMongoId && String(noteMongoId).trim() === targetMongoId;
      const isPersonalByUEID = noteUEID && String(noteUEID).trim().toLowerCase() === targetUEID;

      if (isPersonalById || isPersonalByUEID) {
        personal.push({ ...note, isPersonal: true });
      } else if (!noteMongoId && !noteUEID) {
        // Broadcast notification: Check department alignment
        const noteDept = note.department ? note.department.trim().toLowerCase() : "all";
        if (!note.department || noteDept === "all" || noteDept === targetDept) {
          broadcast.push({ ...note, isPersonal: false });
        }
      }
    });

    return {
      personalNotifications: personal,
      broadcastNotifications: broadcast,
      totalNotifications: [...personal, ...broadcast],
    };
  }, [allNotifications, selectedUEID, studentInfo.mongoId, studentInfo.department]);

  // Selected Notifications based on Sub-Tab
  const displayedNotifications = useMemo(() => {
    if (notifySubTab === "personal") return personalNotifications;
    if (notifySubTab === "broadcast") return broadcastNotifications;
    return totalNotifications;
  }, [notifySubTab, personalNotifications, broadcastNotifications, totalNotifications]);

  // KPI Calculations
  const filteredRecords = useMemo(() => {
    return subjectFilter === "All"
      ? currentStudentAttendance
      : currentStudentAttendance.filter((rec) => rec.subject === subjectFilter);
  }, [currentStudentAttendance, subjectFilter]);

  const totalClasses = filteredRecords.length;

  const totalPresent = useMemo(() => {
    return filteredRecords.filter(
      (r) => r.status && String(r.status).trim().toLowerCase() === "present"
    ).length;
  }, [filteredRecords]);

  const totalAbsent = useMemo(() => {
    return filteredRecords.filter(
      (r) => r.status && String(r.status).trim().toLowerCase() === "absent"
    ).length;
  }, [filteredRecords]);

  const attendancePercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : "0.0";

  const uniqueSubjects = useMemo(() => {
    return ["All", ...new Set(currentStudentAttendance.map((r) => r.subject).filter(Boolean))];
  }, [currentStudentAttendance]);

  // Charts Config
  const doughnutData = useMemo(
    () => ({
      labels: ["Present", "Absent"],
      datasets: [
        {
          data: [totalPresent, totalAbsent],
          backgroundColor: ["#10b981", "#ef4444"],
          borderColor: ["#059669", "#dc2626"],
          borderWidth: 1,
        },
      ],
    }),
    [totalPresent, totalAbsent]
  );

  const chartTrend = useMemo(() => {
    const dateMap = {};
    currentStudentAttendance.forEach((rec) => {
      if (!rec.date) return;
      if (!dateMap[rec.date]) dateMap[rec.date] = { present: 0, total: 0 };
      dateMap[rec.date].total += 1;
      if (rec.status && String(rec.status).trim().toLowerCase() === "present") {
        dateMap[rec.date].present += 1;
      }
    });

    const dates = Object.keys(dateMap).sort().slice(-7);
    const percentages = dates.map((d) => ((dateMap[d].present / dateMap[d].total) * 100).toFixed(0));

    return { dates, percentages };
  }, [currentStudentAttendance]);

  const lineData = useMemo(
    () => ({
      labels: chartTrend.dates.length > 0 ? chartTrend.dates : ["Session 1", "Session 2", "Session 3"],
      datasets: [
        {
          label: "Attendance Rate (%)",
          data: chartTrend.percentages.length > 0 ? chartTrend.percentages : [0, 0, 0],
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
        },
      ],
    }),
    [chartTrend]
  );

  return (
    <div className="student-dash">
      {/* Header */}
      <header className="dash-header">
        <div className="sd-brand">
          <BookOpen className="brand-icon" size={28} />
          <div>
            <h1>Student Learning Portal</h1>
            <p>Track academic attendance, schedule & announcements</p>
          </div>
        </div>

        <div className="sd-selector-group" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Department Filter */}
          <div className="sd-select-box">
            <Filter size={15} />
            <select value={selectedDept} onChange={(e) => handleDepartmentChange(e.target.value)}>
              {departmentList.map((dept, idx) => (
                <option key={idx} value={dept}>
                  Dept: {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Student Selector */}
          <div className="sd-select-box">
            <User size={15} />
            <select value={selectedUEID} onChange={(e) => setSelectedUEID(e.target.value)}>
              {deptStudents.length === 0 ? (
                <option value="">No Students Found</option>
              ) : (
                deptStudents.map((stu) => (
                  <option key={stu._id || stu.ueid} value={stu.ueid}>
                    {stu.fullName} ({stu.ueid})
                  </option>
                ))
              )}
            </select>
          </div>

          <button className="sd-refresh-btn" onClick={fetchStudentData} disabled={refreshing}>
            <RefreshCw className={refreshing ? "spin" : ""} size={16} /> Sync
          </button>

          {onLogout && (
            <button className="sd-logout-btn" onClick={onLogout}>
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="sd-error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <section className="sd-profile-card">
        <div className="sd-avatar">
          <User size={36} />
        </div>
        <div className="sd-profile-info">
          <h2>{studentInfo.fullName}</h2>
          <div className="sd-profile-badges">
            <span className="sd-badge badge-ueid">UEID: {studentInfo.ueid}</span>
            <span className="sd-badge badge-dept">Dept: {studentInfo.department}</span>
            {studentInfo.email && <span className="sd-badge badge-email">{studentInfo.email}</span>}
          </div>
        </div>
        <div className="sd-overall-badge">
          <Award size={24} />
          <div>
            <span className="pct-label">Overall Attendance</span>
            <span className={`pct-val ${Number(attendancePercentage) >= 75 ? "text-good" : "text-warn"}`}>
              {attendancePercentage}%
            </span>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="sd-kpi-grid">
        <div className="sd-kpi-card">
          <div className="kpi-icon icon-emerald">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span>Attended Classes</span>
            <h3>{totalPresent} Records</h3>
          </div>
        </div>

        <div className="sd-kpi-card">
          <div className="kpi-icon icon-rose">
            <XCircle size={24} />
          </div>
          <div>
            <span>Absences</span>
            <h3>{totalAbsent} Sessions</h3>
          </div>
        </div>

        <div className="sd-kpi-card">
          <div className="kpi-icon icon-indigo">
            <Calendar size={24} />
          </div>
          <div>
            <span>Total Logged Sessions</span>
            <h3>{totalClasses} Classes</h3>
          </div>
        </div>

        <div className="sd-kpi-card">
          <div className="kpi-icon icon-amber">
            <Bell size={24} />
          </div>
          <div>
            <span>Notifications</span>
            <h3>
              {personalNotifications.length} Personal / {broadcastNotifications.length} Dept
            </h3>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="sd-tabs">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
          Overview & Charts
        </button>
        <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>
          Attendance Log
        </button>
        <button className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
          Notifications ({totalNotifications.length})
        </button>
      </nav>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="sd-tab-content">
          <div className="sd-charts-grid">
            <div className="sd-chart-card">
              <div className="card-title">
                <TrendingUp size={18} />
                <h3>Attendance Ratio Breakdown</h3>
              </div>
              <div className="chart-container doughnut-box" style={{ height: "260px", position: "relative" }}>
                {totalClasses === 0 ? (
                  <p className="no-data-msg">No attendance records found for this student.</p>
                ) : (
                  <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, responsive: true }} />
                )}
              </div>
            </div>

            <div className="sd-chart-card">
              <div className="card-title">
                <Calendar size={18} />
                <h3>Recent Attendance Progress</h3>
              </div>
              <div className="chart-container" style={{ height: "260px", position: "relative" }}>
                {currentStudentAttendance.length === 0 ? (
                  <p className="no-data-msg">No session trends available.</p>
                ) : (
                  <Line data={lineData} options={{ maintainAspectRatio: false, responsive: true }} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED LOG */}
      {activeTab === "history" && (
        <div className="sd-tab-content">
          <div className="sd-table-card">
            <div className="sd-table-header">
              <h3>Attendance Records</h3>
              <div className="sd-filter">
                <label>Filter by Subject:</label>
                <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                  {uniqueSubjects.map((sub, idx) => (
                    <option key={idx} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sd-table-wrapper">
              {loading ? (
                <div className="sd-loading">Loading records from database...</div>
              ) : filteredRecords.length === 0 ? (
                <div className="sd-empty">No attendance records found for this criteria.</div>
              ) : (
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Date & Day</th>
                      <th>Time Slot</th>
                      <th>Teacher</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody className="sd-table-body">
                    {filteredRecords.map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td className="font-strong">{item.subject || "N/A"}</td>
                        <td>
                          {item.date || "N/A"} <span className="day-tag">{item.day}</span>
                        </td>
                        <td>
                          <span className="time-badge">
                            <Clock size={12} /> {item.time || "N/A"}
                          </span>
                        </td>
                        <td>{item.teacherName || item.teacherUEID || "Faculty"}</td>
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS (SEPARATED PERSONAL VS BROADCAST) */}
      {activeTab === "notifications" && (
        <div className="sd-tab-content">
          {/* Sub-navigation Filters for Notifications */}
          <div className="sd-notify-subtabs" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              className={`sd-subtab-btn ${notifySubTab === "all" ? "active" : ""}`}
              onClick={() => setNotifySubTab("all")}
            >
              All Alerts ({totalNotifications.length})
            </button>
            <button
              className={`sd-subtab-btn ${notifySubTab === "personal" ? "active" : ""}`}
              onClick={() => setNotifySubTab("personal")}
            >
              <UserCheck size={14} style={{ marginRight: "4px" }} />
              Personal Alerts ({personalNotifications.length})
            </button>
            <button
              className={`sd-subtab-btn ${notifySubTab === "broadcast" ? "active" : ""}`}
              onClick={() => setNotifySubTab("broadcast")}
            >
              <Megaphone size={14} style={{ marginRight: "4px" }} />
              Department Announcements ({broadcastNotifications.length})
            </button>
          </div>

          <div className="sd-notifications-list">
            {displayedNotifications.length === 0 ? (
              <div className="sd-empty">
                {notifySubTab === "personal"
                  ? "No personal notifications directly addressed to your account."
                  : notifySubTab === "broadcast"
                  ? "No departmental broadcast notices found."
                  : "No active notifications or announcements."}
              </div>
            ) : (
              displayedNotifications.map((note) => (
                <div
                  key={note._id || Math.random()}
                  className={`sd-notification-card ${note.isPersonal ? "personal-card" : "broadcast-card"}`}
                >
                  <div className="note-icon">
                    {note.isPersonal ? <UserCheck size={20} className="icon-personal" /> : <Megaphone size={20} className="icon-broadcast" />}
                  </div>
                  <div className="note-content">
                    <div className="note-meta">
                      <span className={`note-type-tag ${note.isPersonal ? "tag-personal" : "tag-broadcast"}`}>
                        {note.isPersonal ? "Personal Alert" : "Broadcast"}
                      </span>
                      <span className="note-dept">Dept: {note.department || "General"}</span>
                      <span className="note-time">
                        {note.date} {note.time && `at ${note.time}`} {note.day && `(${note.day})`}
                      </span>
                    </div>
                    <p className="note-msg">{note.message}</p>
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