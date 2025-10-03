import React, { useEffect, useState } from "react";
import axios from "axios";

// Helper to get cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

const TechProfile = () => {
  const [ueid, setUeid] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const teacherUEID = getCookie("teacherToken");
    if (teacherUEID) {
      const ueidValue = teacherUEID.split("-").slice(1).join("-");
      setUeid(ueidValue);
      fetchRecords(ueidValue);
    }
  }, []);

  const fetchRecords = async (teacherUEID) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/teachueid/${teacherUEID}`);
      // Sort records so pinned notes appear first
      const sorted = res.data.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setRecords(sorted);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  const handleAdd = async () => {
    if (!inputValue) return alert("Please enter some data");

    try {
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const day = now.toLocaleDateString("en-US", { weekday: "long" });
      const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      await axios.post("http://localhost:5000/api/teachueid", {
        teacherUEID: ueid,
        notes: inputValue,
        date,
        day,
        time,
        pinned: false, // default pinned is false
      });

      setInputValue("");
      fetchRecords(ueid);
    } catch (err) {
      console.error("Error adding data:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/teachueid/${id}`);
      fetchRecords(ueid);
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  const handlePinToggle = async (id, pinned) => {
    try {
      await axios.patch(`http://localhost:5000/api/teachueid/${id}`, {
        pinned: !pinned,
      });
      fetchRecords(ueid);
    } catch (err) {
      console.error("Error toggling pin:", err);
    }
  };

  return (
    <div className="techprofile-container">
      <h2>🎓 Teacher Profile</h2>
      <p>
        <strong>UEID:</strong> {ueid || "Loading..."}
      </p>

      <div className="form-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter notes..."
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      <h3>Records:</h3>
      {records.length === 0 ? (
        <p>No records found</p>
      ) : (
        <ul>
          {records.map((r) => (
            <li key={r._id}>
              <div className="tech-data">
                <div>
                  <strong>Note:</strong> {r.notes} | <strong>Time:</strong> {r.time} |{" "}
                  <strong>Day:</strong> {r.day} {r.pinned}
                </div>
                <div className="pin-data">
                  <button
                    className="pin-btn"
                    onClick={() => handlePinToggle(r._id, r.pinned)}
                  >
                    {r.pinned ? "📌 Unpin" : "Pin"}
                  </button>
                  <button className="close" onClick={() => handleDelete(r._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TechProfile;
