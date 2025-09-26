import { useState, useEffect } from "react";
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

  const fetchTeachers = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("http://localhost:5000/api/teachers");
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      if (!id) return;

      const response = await fetch(`http://localhost:5000/api/teachers/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete teacher");
      }

      setTeachers((prev) => prev.filter((t) => t._id !== id));
      setMessage("Teacher deleted successfully!");
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setPopup({ visible: false, teacherId: null });
    }
  };

  const confirmDelete = (id) => setPopup({ visible: true, teacherId: id });
  const cancelDelete = () => setPopup({ visible: false, teacherId: null });

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="teacher-container">
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
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>No teachers found</td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
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
