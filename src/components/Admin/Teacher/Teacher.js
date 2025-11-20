import { useState, useEffect, useMemo } from "react";
import "./Teacher.css";
import TeacherAdd from "./teacherAdd";
import Error from "../../Error/Error";
import PopUp from "../../Error/PopUp";

export default function Teacher() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [popup, setPopup] = useState({ visible: false, teacherId: null });

  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all teachers
  const fetchTeachers = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("https://attendance-management-system-83fk.onrender.com/api/teachers");
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data);

      // Extract unique departments
      const depts = ["All", ...new Set(data.map((t) => t.department?.trim()))];
      setDepartments(depts);

    } catch (err) {
      console.error(err);
      setMessage(err.message);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete teacher
  const deleteTeacher = async (id) => {
    try {
      if (!id) return;

      const response = await fetch(`https://attendance-management-system-83fk.onrender.com/api/teachers/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete teacher");
      }

      setTeachers((prev) => prev.filter((t) => t._id !== id));
      setMessage("Teacher deleted successfully!");
      setTimeout(() => setMessage(null), 5000);

    } catch (err) {
      console.error(err);
      setMessage(err.message);
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setPopup({ visible: false, teacherId: null });
    }
  };

  const confirmDelete = (id) => setPopup({ visible: true, teacherId: id });
  const cancelDelete = () => setPopup({ visible: false, teacherId: null });

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Filtered teachers based on department and search
  const filteredTeachers = useMemo(() => {
    let temp = [...teachers];

    if (activeDept !== "All") {
      temp = temp.filter((t) => t.department === activeDept);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(
        (t) =>
          t.fullName?.toLowerCase().includes(term) ||
          t.ueid?.toLowerCase().includes(term) ||
          t.subject?.toLowerCase().includes(term)
      );
    }

    return temp;
  }, [teachers, activeDept, searchTerm]);

  return (
    <div className="student-container">
      <h2>Teacher Section</h2>

      {/* Error or Success Message */}
      {!showAddForm && message && (
        <Error 
          message={message} 
          type={message.includes("successfully") ? "success" : "error"} 
          onClose={() => setMessage(null)} 
        />
      )}

      {!showAddForm ? (
        <>
          <div className="controls">
            <button className="reload-btn" onClick={fetchTeachers}>
              ⟳ Reload
            </button>
          </div>

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
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>UEID</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Subject</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>Loading teachers...</td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>No teachers found</td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td>{teacher.ueid}</td>
                      <td>{teacher.fullName}</td>
                      <td>{teacher.department}</td>
                      <td>{teacher.subject}</td>
                      <td>{teacher.password}</td>
                      <td>
                        <button className="delete-btn" onClick={() => confirmDelete(teacher._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <TeacherAdd fetchTeachers={fetchTeachers} />
      )}

      <button
        className="fab"
        onClick={() => setShowAddForm(!showAddForm)}
        title="Add Teacher"
      >
        {showAddForm ? "×" : "+"}
      </button>

      {popup.visible && (
        <PopUp
          message="Are you sure you want to delete this teacher?"
          onConfirm={() => deleteTeacher(popup.teacherId)}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
