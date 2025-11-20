import React, { useState } from "react";
import axios from "axios";
import Error from "../Error/Error"; 

export default function StudentNotify() {
  const [department, setDepartment] = useState("All");
  const [ueid, setUeid] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://attendance-management-system-83fk.onrender.com/api/studentNotify", {
        department,
        ueid,
        message,
      });

      if (res.data.success) {
        setFeedback({ message: "Notification sent successfully!", type: "success" });
        setMessage("");
        setUeid("");
        setDepartment("All");
      }
    } catch (err) {
      console.error(err);
      setFeedback({ message: "Failed to send notification", type: "error" });
    }
  };

  return (
    <div className="form-container">
      <h2>Send Student Notification</h2>

      {/* Success/Error messages */}
      <Error
        message={feedback.message}
        type={feedback.type}
        onClose={() => setFeedback({ message: "", type: "" })}
      />

      <form onSubmit={handleSubmit}>
        <div>
          <label>Department:</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
            <option value="All">All</option>
            <option value="CS">CS</option>
            <option value="IT">IT</option>
          </select>
        </div>

        <div>
          <label>UEID (optional):</label>
          <input
            type="text"
            value={ueid}
            placeholder="Enter student UEID or leave blank"
            onChange={(e) => setUeid(e.target.value)}
          />
        </div>

        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Enter your message"
            required
          ></textarea>
        </div>

        <button type="submit">Send Notification</button>
      </form>
    </div>
  );
}
