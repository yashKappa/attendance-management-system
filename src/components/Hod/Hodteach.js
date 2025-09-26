import { useState, useEffect } from "react";
import axios from "axios";

export default function HodTeach() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState("All");

  // Fetch all teachers from backend
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/teachers");
        setTeachers(response.data);
        setFilteredTeachers(response.data);

        // Extract unique departments
        const depts = ["All", ...new Set(response.data.map((t) => t.department))];
        setDepartments(depts);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };

    fetchTeachers();
  }, []);

  // Filter teachers based on department and search input
  useEffect(() => {
    let temp = [...teachers];

    // Department filter
    if (activeDept !== "All") {
      temp = temp.filter((t) => t.department === activeDept);
    }

    // Search filter
    if (search.trim() !== "") {
      const term = search.toLowerCase();
      temp = temp.filter(
        (t) =>
          t.fullName.toLowerCase().includes(term) ||
          t.department.toLowerCase().includes(term) ||
          t.subject.toLowerCase().includes(term) ||
          t.ueid.toLowerCase().includes(term)
      );
    }

    setFilteredTeachers(temp);
  }, [teachers, activeDept, search]);

  return (
    <div className="student-container">
      <h2>All Teachers</h2>

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
          placeholder="Search by name, department, subject, or UEID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
              <th>Subject</th>
              <th>UEID</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{teacher.fullName}</td>
                  <td>{teacher.department}</td>
                  <td>{teacher.subject}</td>
                  <td>{teacher.ueid}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No teachers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
