// src/components/student/Student.js
import { useState, useEffect } from "react";
import "./Student.css";
import StudentAdd from "./StudentAdd";
import Error from "../../Error/Error";
import PopUp from "../../Error/PopUp";

export default function Student() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [popup, setPopup] = useState({ visible: false, studentId: null });

  // Fetch all students
  const fetchStudent = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("http://localhost:5000/api/student");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message, type: "error" });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const deleteStudent = async (id) => {
    try {
      if (!id) return;

      const response = await fetch(`http://localhost:5000/api/student/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete student");
      }

      setStudents((prev) => prev.filter((s) => s._id !== id));
      setMessage({ text: "Student deleted successfully!", type: "success" });
      setTimeout(() => setMessage(null), 5000);

    } catch (err) {
      console.error(err);
      setMessage({ text: err.message, type: "error" });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setPopup({ visible: false, studentId: null });
    }
  };

  const confirmDelete = (id) => setPopup({ visible: true, studentId: id });
  const cancelDelete = () => setPopup({ visible: false, studentId: null });

  useEffect(() => {
    fetchStudent();
  }, []);

  return (
    <div className="student-container">
      <h2>Student Section</h2>

      {/* Error or Success Message */}
      {!showAddForm && message && (
        <Error 
          message={message.text} 
          type={message.type} 
          onClose={() => setMessage(null)} 
        />
      )}

      {!showAddForm ? (
        <>
          <div className="controls">
            <button className="reload-btn" onClick={fetchStudent}>
              ⟳ Reload
            </button>
          </div>

          <div className="table-responsive">
            <table className="student-table">
              <thead>
                <tr>
                  <th>UEID</th>
                  <th>Full Name</th>
                  <th>Course</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>Loading students...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>No students found</td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s._id}>
                      <td>{s.ueid}</td>
                      <td>{s.fullName}</td>
                      <td>{s.department}</td>
                      <td>{s.email}</td>
                      <td>
                        <button className="delete-btn" onClick={() => confirmDelete(s._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <StudentAdd fetchStudent={fetchStudent} />
      )}

      {/* Floating Add Button */}
      <button
        className="fab"
        onClick={() => setShowAddForm(!showAddForm)}
        title="Add Student"
      >
        {showAddForm ? "×" : "+"}
      </button>

      {/* Delete Confirmation PopUp */}
      {popup.visible && (
        <PopUp
          message="Are you sure you want to delete this student?"
          onConfirm={() => deleteStudent(popup.studentId)}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
