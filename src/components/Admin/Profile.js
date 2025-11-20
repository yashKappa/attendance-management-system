import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie} from "@fortawesome/free-solid-svg-icons";

const Profile = () => {
  const [departmentsData, setDepartmentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teachers and students
        const [teacherRes, studentRes] = await Promise.all([
          axios.get("https://attendance-management-system-83fk.onrender.com/api/teachers"),
          axios.get("https://attendance-management-system-83fk.onrender.com/api/student"),
        ]);

        const teachers = teacherRes.data;
        const students = studentRes.data;

        // Get all unique departments dynamically
        const allDepartments = Array.from(
          new Set([
            ...teachers.map((t) => t.department),
            ...students.map((s) => s.department),
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

  if (loading) return <p style={{ textAlign: "center" }}>Loading data...</p>;

  const totalTeachers = departmentsData.reduce((sum, d) => sum + d.teacherCount, 0);
  const totalStudents = departmentsData.reduce((sum, d) => sum + d.studentCount, 0);

  return (
    <div className="profile-container">
        <h2><FontAwesomeIcon icon={faUserTie} /> Student, Teacher Data Panel</h2>

      <div className="summary-card">
        <h4>Total Departments: {departmentsData.length}</h4>
        <h4>Total Teachers: {totalTeachers}</h4>
        <h4>Total Students: {totalStudents}</h4>
      </div>

      <div className="departments-grid">
        {departmentsData.map((dept) => (
          <div className="department-card" key={dept.name}>
            <h3>{dept.name}</h3>
            <p>Total Teachers: {dept.teacherCount}</p>
            <p>Total Students: {dept.studentCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
