import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  TrendingUp,
  Sliders,
} from "lucide-react";
import Admin_Dash from "./Hod/Admin_Dash";
import Student_Dash from "./Student/Student_Dash";
import Teacher_Dash from "./Teacher/Teacher_Dash";
import "./Admin.css"; // Ensure your CSS is imported

const Profile = () => {
  const [departmentsData, setDepartmentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teachers and students
        const [teacherRes, studentRes] = await Promise.all([
          axios.get(
            "https://attendance-management-system-83fk.onrender.com/api/teachers"
          ),
          axios.get(
            "https://attendance-management-system-83fk.onrender.com/api/student"
          ),
        ]);

        const teachers = teacherRes.data || [];
        const students = studentRes.data || [];

        // Get all unique departments dynamically
        const allDepartments = Array.from(
          new Set([
            ...teachers.map((t) => t.department).filter(Boolean),
            ...students.map((s) => s.department).filter(Boolean),
          ])
        );

        // Create data per department
        const deptData = allDepartments.map((dept) => ({
          name: dept,
          teacherCount: teachers.filter((t) => t.department === dept).length,
          studentCount: students.filter((s) => s.department === dept).length,
        }));

        setDepartmentsData(deptData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalTeachers = departmentsData.reduce(
    (sum, d) => sum + d.teacherCount,
    0
  );
  const totalStudents = departmentsData.reduce(
    (sum, d) => sum + d.studentCount,
    0
  );
  const totalUsers = totalTeachers + totalStudents;

  return (
    <div className="profile-container">
      {loading ? (
        <div className="loader">
          <img
            src={`${process.env.PUBLIC_URL}/assets/no.gif`}
            alt="Loading..."
            className="loading"
          />
          <h3>Loading Dashboard...</h3>
        </div>
      ) : (
        <>
          {/* ================= HERO HEADER SECTION ================= */}
          <div className="dashboard-hero-header">
            <div className="hero-text-content">
              <span className="hero-badge">
                <TrendingUp size={14} /> System Analytics Overview
              </span>
              <h1>Institutional Directory & Metrics</h1>
              <p>
                Real-time breakdown of academic departments, faculty distribution, and student demographics.
              </p>
            </div>

            {/* Metric Summary Cards Bar */}
            <div className="hero-summary-grid">
              <div className="metric-card">
                <div className="metric-icon icon-blue">
                  <Building2 size={22} />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{departmentsData.length}</span>
                  <span className="metric-label">Departments</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon icon-purple">
                  <UserCheck size={22} />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{totalTeachers}</span>
                  <span className="metric-label">Faculty Members</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon icon-emerald">
                  <GraduationCap size={22} />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{totalStudents}</span>
                  <span className="metric-label">Enrolled Students</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon icon-amber">
                  <Users size={22} />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{totalUsers}</span>
                  <span className="metric-label">Total Portal Users</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= DEPARTMENTS GRID ================= */}
          <div className="department-section">

      <header className="dash-header">
               <div className="dash-header-title">
          <div className="header-icon-box">
            <Sliders size={22} />
          </div>
          <div>
            <h1>Departments Distribution</h1>
            <p>Visualizing student distribution across different departments</p>
          </div>
        </div>
        </header>

            <div className="departments-grid">
              {departmentsData.map((dept) => {
                const progress = totalStudents
                  ? Math.round((dept.studentCount / totalStudents) * 100)
                  : 0;

                return (
                  <div className="department-card" key={dept.name}>
                    <div className="department-header">
                      <h3>{dept.name}</h3>
                      <span className="dept-percentage-pill">{progress}%</span>
                    </div>

                    <div className="department-info">
                      <div className="info-badge">
                        👨‍🏫 <strong>{dept.teacherCount}</strong>
                        <small> Teachers</small>
                      </div>

                      <div className="info-badge">
                        👨‍🎓 <strong>{dept.studentCount}</strong>
                        <small> Students</small>
                      </div>
                    </div>

                    <div className="progress">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Admin_Dash />
          <Teacher_Dash />
          <Student_Dash />
        </>
      )}
    </div>
  );
};

export default Profile;
