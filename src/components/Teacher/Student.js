import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get teacher UEID from cookie
        const teacherUEID = Cookies.get("teacherToken");
        if (!teacherUEID) throw new Error("Teacher not logged in");

        // Get teacher info
        const teacherRes = await axios.get(`http://localhost:5000/api/teachers/${teacherUEID}`);
        const teacher = teacherRes.data.teacher;

        if (!teacher) throw new Error("Teacher not found");

        // Fetch students with matching course/department
        const studentsRes = await axios.get("http://localhost:5000/api/student");
        const allStudents = studentsRes.data;

        // Filter by department/course
        const matchedStudents = allStudents.filter(
          (s) => s.department === teacher.department
        );

        setStudents(matchedStudents);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <p>Loading students...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Students in your department</h2>
      <ul>
        {students.map((s) => (
          <li key={s._id}>{s.fullName} - {s.ueid}</li>
        ))}
      </ul>
    </div>
  );
}
