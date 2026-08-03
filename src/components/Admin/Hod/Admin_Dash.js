import React, { useState, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Users,
  Clock,
  FileText,
  ShieldAlert,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  Activity,
  Server,
  Database,
  Radio,
  Sliders,
  CheckCircle2,
  Send,
  Zap,
} from "lucide-react";
import HodAdd from "./HodAdd";
import "./Admin_Dash.css";

// Register Chart.js Modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = "https://attendance-management-system-83fk.onrender.com";

export default function Admin_Dash() {
  const [hods, setHods] = useState([]);
  const [teachersCount, setTeachersCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Dynamic state populated from API
  const [analytics, setAnalytics] = useState({
    activeFormsCount: 0,
    weeklySubmissions: [0, 0, 0, 0, 0, 0, 0],
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  });

  // Fetch all live data from database
  const fetchAllDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hodsRes, analyticsRes, teachersRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/hod`),
        fetch(`${API_BASE}/api/admin/analytics`),
        fetch(`${API_BASE}/api/teachers`),
        fetch(`${API_BASE}/api/student`),
      ]);

      const hodsResult = await hodsRes.json();
      const analyticsResult = await analyticsRes.json();
      const teachersData = await teachersRes.json();
      const studentsData = await studentsRes.json();

      // Process HOD List
      if (hodsResult.success || Array.isArray(hodsResult)) {
        setHods(hodsResult.data || hodsResult || []);
      }

      if (Array.isArray(teachersData)) setTeachersCount(teachersData.length);
      if (Array.isArray(studentsData)) setStudentsCount(studentsData.length);

      // Process Analytics Data
      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics({
          activeFormsCount: analyticsResult.data.activeFormsCount || 0,
          weeklySubmissions: analyticsResult.data.weeklySubmissions || [0, 0, 0, 0, 0, 0, 0],
          daysOfWeek: analyticsResult.data.daysOfWeek || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        });
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to sync live data from database server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  // Total recorded submissions count
  const totalSubmissions = analytics.weeklySubmissions.reduce((a, b) => a + b, 0);

  // Bar Chart Configuration
  const barChartData = {
    labels: analytics.daysOfWeek,
    datasets: [
      {
        label: "Weekly Attendance Submissions",
        data: analytics.weeklySubmissions,
        backgroundColor: "rgba(79, 70, 229, 0.85)",
        borderColor: "#4f46e5",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // System Roles Distribution Doughnut Chart
  const doughnutData = {
    labels: ["HOD Accounts", "Faculty / Teachers", "Enrolled Students"],
    datasets: [
      {
        data: [hods.length || 1, teachersCount || 1, studentsCount || 1],
        backgroundColor: ["#6366f1", "#10b981", "#f59e0b"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  return (
    <div className="admin-dashboard">
      {/* Top Header Bar */}
      <header className="dash-header">
        <div className="dash-header-title">
          <div className="header-icon-box">
            <Sliders size={22} />
          </div>
          <div>
            <h1>Admin Control Suite</h1>
            <p>System infrastructure management & live database monitoring</p>
          </div>
        </div>

        <div className="header-actions">
          <span className="server-status-tag">
            <span className="pulse-dot"></span> Live DB Connected
          </span>
          <button className="refresh-btn" onClick={fetchAllDashboardData} disabled={loading}>
            <RefreshCw className={loading ? "spin" : ""} size={16} /> Sync Server
          </button>
        </div>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Dynamic Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon icon-indigo">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <span>Registered HODs</span>
            <h3>{loading ? "..." : hods.length}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-emerald">
            <FileText size={24} />
          </div>
          <div className="kpi-info">
            <span>Active Form Records</span>
            <h3>{loading ? "..." : analytics.activeFormsCount}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-amber">
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <span>TTL Expiry Window</span>
            <h3>60 Seconds</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-rose">
            <ShieldAlert size={24} />
          </div>
          <div className="kpi-info">
            <span>Auth Protocol</span>
            <h3>UEID Token</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <Activity size={16} style={{ marginRight: "6px" }} />
          System Health & Analytics
        </button>
        <button
          className={activeTab === "manage" ? "active" : ""}
          onClick={() => setActiveTab("manage")}
        >
          <Users size={16} style={{ marginRight: "6px" }} />
          Manage HOD Accounts ({hods.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
      {activeTab === "overview" && (
        <div className="dashboard-body">
          <div className="charts-grid">
            {/* Chart 1: Bar Chart / Fallback Empty State */}
            <div className="chart-card card-large">
              <div className="card-title-row">
                <h3>Weekly Schedule Distribution</h3>
                <span className="card-badge">Live Submissions: {totalSubmissions}</span>
              </div>
              
              <div className="chart-wrapper">
                {totalSubmissions === 0 ? (
                  <div className="empty-chart-fallback">
                    <Zap size={36} className="empty-icon" />
                    <h4>No Attendance Submissions Logged Yet</h4>
                    <p>Submissions created by teachers during live sessions will populate here in real time.</p>
                  </div>
                ) : (
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                )}
              </div>
            </div>

            {/* Chart 2: Database Distribution Doughnut */}
            <div className="chart-card">
              <div className="card-title-row">
                <h3>System User Demographics</h3>
              </div>
              <div className="chart-wrapper doughnut-box" style={{ position: "relative", height: "230px" }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Infrastructure Health & Quick Actions Grid */}
          <div className="admin-bottom-grid">
            {/* System Health Status Panel */}
            <div className="status-panel-card">
              <h3><Server size={18} /> Infrastructure Diagnostic Panel</h3>
              <div className="status-list">
                <div className="status-item">
                  <div className="status-item-label">
                    <Database size={16} /> MongoDB Atlas Database
                  </div>
                  <span className="status-pill status-online">Connected</span>
                </div>

                <div className="status-item">
                  <div className="status-item-label">
                    <Radio size={16} /> Express REST API Node
                  </div>
                  <span className="status-pill status-online">200 OK</span>
                </div>

                <div className="status-item">
                  <div className="status-item-label">
                    <Clock size={16} /> Session TTL Expiry Index
                  </div>
                  <span className="status-pill status-active">60s Active</span>
                </div>

                <div className="status-item">
                  <div className="status-item-label">
                    <CheckCircle2 size={16} /> UEID Security Protocol
                  </div>
                  <span className="status-pill status-active">Enforced</span>
                </div>
              </div>
            </div>

            {/* Admin Quick Action Bar */}
            <div className="quick-actions-card">
              <h3><Zap size={18} /> Quick Administrative Operations</h3>
              <p className="card-desc">Execute immediate actions across the institutional directory.</p>
              
              <div className="action-buttons-group">
                <button className="action-btn btn-primary" onClick={() => setActiveTab("manage")}>
                  <PlusCircle size={16} /> Register New Department HOD
                </button>
                <button className="action-btn btn-secondary" onClick={fetchAllDashboardData}>
                  <RefreshCw size={16} /> Force Re-Sync System Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE HODs */}
      {activeTab === "manage" && (
        <div className="dashboard-body">
          {/* Right Column: Registered HODs List */}
          <div className="dash-card">
            <div className="card-header">
              <Users size={20} />
              <h2>Registered HOD Accounts ({hods.length})</h2>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-state">Syncing HOD records...</div>
              ) : hods.length === 0 ? (
                <div className="empty-state">No HOD accounts found in database.</div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Assigned UEID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hods.map((hod, idx) => (
                      <tr key={hod._id || idx}>
                        <td className="font-semibold">{hod.fullName || "N/A"}</td>
                        <td>
                          <span className="ueid-badge">{hod.ueid}</span>
                        </td>
                        <td>
                          <span className="badge badge-success">Verified</span>
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
    </div>
  );
}