import { useState, useEffect } from "react";
import axios from "axios";

export default function HodStud() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/student");
        setStudents(response.data);
        setFilteredStudents(response.data);

        // Extract unique departments
        const depts = ["All", ...new Set(response.data.map((s) => s.department))];
        setDepartments(depts);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on department and search
  useEffect(() => {
    let temp = [...students];

    if (activeDept !== "All") {
      temp = temp.filter((s) => s.department === activeDept);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(
        (s) =>
          s.fullName.toLowerCase().includes(term) ||
          s.ueid.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term)
      );
    }

    setFilteredStudents(temp);
  }, [students, activeDept, searchTerm]);

  return (
    <div className="student-container">
      <h2>All Students</h2>

      <div className="search">
        <div className="filter-buttons">
         <div>
             {departments.map((dept) => (
            <button
              key={dept}
              className={activeDept === dept ? "active" : ""}
              onClick={() => setActiveDept(dept)}
            >
              {dept}
            </button>
          ))}
         </div>

       <div className="filter">
         <input
          type="text"
          placeholder="Search by name, UEID or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
       </div>
         </div>
      </div>

      <div className="table-responsive">
        <table className="student-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>UEID</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student.fullName}</td>
                  <td>{student.department}</td>
                  <td>{student.email}</td>
                  <td>{student.ueid}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
