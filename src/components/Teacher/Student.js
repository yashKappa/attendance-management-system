import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Error from "../Error/Error";
import "./TeacherPanel.css";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // search by name/email/department
  const [teacherUEIDFilter, setTeacherUEIDFilter] = useState(""); // filter by another teacher's UEID

  const [teacherSubjects, setTeacherSubjects] = useState(""); // new state

  const fetchStudents = async (ueid = null) => {
    try {
      setLoading(true);
      const currentTeacherUEID = Cookies.get("teacherToken");
      if (!currentTeacherUEID) throw new Error("Teacher not logged in");

      const targetUEID = ueid || currentTeacherUEID;

      const teacherRes = await axios.get(
        `http://localhost:5000/api/teachers/${targetUEID}`
      );
      const teacher = teacherRes.data.teacher;
      if (!teacher) throw new Error("Teacher not found");

      // Save teacher's subjects (cluster subject)
      setTeacherSubjects(teacher.subject || "N/A");

      const studentsRes = await axios.get("http://localhost:5000/api/student");
      const allStudents = studentsRes.data;

      const matchedStudents = allStudents.filter(
        (s) => s.department === teacher.department
      );

      setStudents(matchedStudents);

      const initialAttendance = {};
      matchedStudents.forEach((s) => {
        initialAttendance[s._id] = { present: false, absent: false };
      });
      setAttendance(initialAttendance);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStudents([]);
      setTeacherSubjects("");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchStudents(); // fetch current teacher's students by default
  }, []);

  const handleAttendanceChange = (id, type) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: {
        present: type === "present" ? !prev[id].present : false,
        absent: type === "absent" ? !prev[id].absent : false,
      },
    }));
  };

const handleSubmitAttendance = async () => {
  try {
    for (let s of students) {
      const record = attendance[s._id];
      if (!record.present && !record.absent) {
        setError(`Please mark Present or Absent for ${s.fullName}`);
        setSuccess(null);
        return;
      }
    }

    const currentTeacherUEID = Cookies.get("teacherToken");
    if (!currentTeacherUEID) throw new Error("Teacher not logged in");

    const teacherRes = await axios.get(
      `http://localhost:5000/api/teachers/${currentTeacherUEID}`
    );
    const teacher = teacherRes.data.teacher;
    if (!teacher) throw new Error("Teacher not found");

    // Get current date, day, and time
    const now = new Date();
    const date = now.toLocaleDateString();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const time = now.toLocaleTimeString();

    const records = students.map((s) => ({
      studentId: s._id,
      fullName: s.fullName,
      email: s.email,
      department: s.department,
      subject: teacher.subject || "N/A",
      status: attendance[s._id].present ? "present" : "absent",
      teacherUEID: teacher.UEID, // <-- include teacher's UEID
      date,
      day,
      time,
    }));

    const response = await axios.post(
      "http://localhost:5000/api/attendance/save",
      { records, teacherId: teacher._id }
    );

    if (response.data.success) {
      setSuccess("Attendance saved successfully!");
      setError(null);

      // Reset checkboxes
      const resetAttendance = {};
      students.forEach((s) => {
        resetAttendance[s._id] = { present: false, absent: false };
      });
      setAttendance(resetAttendance);

    } else {
      setError("Failed to save attendance");
      setSuccess(null);
    }
  } catch (err) {
    console.error(err);
    setError("Error submitting attendance: " + err.message);
    setSuccess(null);
  }
};


  const filteredStudents = students.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.department.toLowerCase().includes(query)
    );
  });


  return (
    <div className="student-container">
      <h2>Students in Department</h2>

      <Error message={error} type="error" onClose={() => setError(null)} />
      <Error message={success} type="success" onClose={() => setSuccess(null)} />

      {/* Search and UEID filter */}
      <div className="search">
        <input
          type="text"
          placeholder="Search by name, email, or department"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="ueid">
          <input
            type="text"
            placeholder="Enter Teacher UEID"
            value={teacherUEIDFilter}
            onChange={(e) => setTeacherUEIDFilter(e.target.value)}
          />
          <button onClick={() => fetchStudents(teacherUEIDFilter)}>Fetch</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="student-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Subject</th> {/* New column */}
              <th>Department</th>
              <th>Email</th>
              <th>Present</th>
              <th>Absent</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Loading students...
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((s, index) => (
                <tr key={s._id}>
                  <td>{index + 1}</td>
                  <td>{s.fullName}</td>
                  <td>{teacherSubjects}</td> {/* Show teacher's subject */}
                  <td>{s.department}</td>
                  <td>{s.email}</td>
                  <td>
                    <input
                      className="present"
                      type="checkbox"
                      checked={attendance[s._id]?.present || false}
                      onChange={() => handleAttendanceChange(s._id, "present")}
                    />
                  </td>
                  <td>
                    <input
                      className="absent"
                      type="checkbox"
                      checked={attendance[s._id]?.absent || false}
                      onChange={() => handleAttendanceChange(s._id, "absent")}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="submit-btn" style={{ marginTop: "20px", textAlign: "center" }}>
        <button onClick={handleSubmitAttendance}>Submit Attendance</button>
      </div>
    </div>
  );
}
