// src/components/hod/Hod.js
import { useState, useEffect } from "react";
import "./Hod.css";
import HodAdd from "./HodAdd";
import Error from "../../Error/Error";
import PopUp from "../../Error/PopUp";

export default function Hod() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [popup, setPopup] = useState({ visible: false, hodId: null });

  // Fetch all HODs
  const fetchHods = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("http://localhost:5000/api/hod");
      if (!response.ok) throw new Error("Failed to fetch HODs");
      const data = await response.json();
      setHods(data);
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message, type: "error" });
      setHods([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete HOD
  const deleteHod = async (id) => {
    try {
      if (!id) return;

      const response = await fetch(`http://localhost:5000/api/hod/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete HOD");
      }

      setHods((prev) => prev.filter((h) => h._id !== id));
      setMessage({ text: "HOD deleted successfully!", type: "success" });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message, type: "error" });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setPopup({ visible: false, hodId: null });
    }
  };

  const confirmDelete = (id) => setPopup({ visible: true, hodId: id });
  const cancelDelete = () => setPopup({ visible: false, hodId: null });

  useEffect(() => {
    fetchHods();
  }, []);

  return (
    <div className="student-container">
      <h2>HOD Section</h2>

      {!showAddForm && message && (
        <Error message={message.text} type={message.type} onClose={() => setMessage(null)} />
      )}

      {!showAddForm ? (
        <>
          <div className="controls">
            <button className="reload-btn" onClick={fetchHods}>⟳ Reload</button>
          </div>

          {loading && <p>Loading HODs...</p>}
          {!loading && hods.length === 0 && <p>No HOD found.</p>}

          {!loading && hods.length > 0 && (
            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>UEID</th>
                    <th>Full Name</th>
                    <th>Password</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hods.map((h) => (
                    <tr key={h._id}>
                      <td>{h.ueid}</td>
                      <td>{h.fullName}</td>
                      <td>{h.password}</td>
                      <td>
                        <button className="delete-btn" onClick={() => confirmDelete(h._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <HodAdd fetchHods={fetchHods} />
      )}

      <button className="fab" onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? "×" : "+"}
      </button>

      {popup.visible && (
        <PopUp
          message="Are you sure you want to delete this HOD?"
          onConfirm={() => deleteHod(popup.hodId)}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
