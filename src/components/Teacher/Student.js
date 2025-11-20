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
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState(""); // new state

  const fetchStudents = async (ueid = null) => {
  try {
    setLoading(true);
    const currentTeacherUEID = Cookies.get("teacherToken");
    if (!currentTeacherUEID) throw new Error("Teacher not logged in");

    // Pick target UEID: either from filter or current teacher
    const targetUEID = ueid || currentTeacherUEID;

    // Fetch teacher details by target UEID
    const teacherRes = await axios.get(
      `https://attendance-management-system-83fk.onrender.com/api/teachers/${targetUEID}`
    );
    const teacher = teacherRes.data.teacher;
    if (!teacher) throw new Error("Teacher not found");

    // ✅ Always update selectedTeacher (important for filtered case too)
    setSelectedTeacher(teacher);

    // Save teacher’s subject
    setTeacherSubjects(teacher.subject || "N/A");

    // Fetch all students
    const studentsRes = await axios.get("https://attendance-management-system-83fk.onrender.com/api/student");
    const allStudents = studentsRes.data;

    // Match only students in this teacher’s department
    const matchedStudents = allStudents.filter(
      (s) => s.department === teacher.department
    );

    setStudents(matchedStudents);

    // Reset attendance state
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
    setSelectedTeacher(null);
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

    if (!selectedTeacher) throw new Error("Teacher not found");

    // Get current date, day, and time
    const now = new Date();
    const date = now.toLocaleDateString();
    const day = now.toLocaleDateString("en-US", { weekday: "long" });
    const time = now.toLocaleTimeString();

    const records = students.map((s) => ({
      studentId: s._id,
      fullName: s.fullName,
      email: s.email,
      department: s.department,
      subject: selectedTeacher.subject || "N/A",   // ✅ use selectedTeacher
      status: attendance[s._id].present ? "present" : "absent",
      teacherUEID: selectedTeacher.UEID,           // ✅ use selectedTeacher
      date,
      day,
      time,
    }));

    const response = await axios.post(
      "https://attendance-management-system-83fk.onrender.com/api/attendance/save",
      { records, teacherId: selectedTeacher._id }   // ✅ correct teacherId
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
      <h2>Students Attendance</h2>

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
              <th>Subject</th> 
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
