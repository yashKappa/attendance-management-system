import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function HodForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHodForms = async () => {
      setLoading(true);

      const ueid = Cookies.get("teacherToken"); // Read UEID from cookie
      if (!ueid) {
        console.warn("UEID not found in cookies");
        setForms([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/hodforms?ueid=${ueid}`);
        setForms(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching HOD forms:", err);
        setForms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHodForms();
  }, []);

  return (
    <div className="student-container">
      <h2>HOD Form Submissions</h2>
      <div className="table-responsive">
        <table className="student-table">
          <thead>
            <tr>
              <th>UEID</th>
              <th>Time</th>
              <th>Notes</th>
              <th>Weekly Days</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                  Loading HOD forms...
                </td>
              </tr>
            ) : forms.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                  No data found
                </td>
              </tr>
            ) : (
              forms.map((form) => (
                <tr key={form._id}>
                  <td>{form.ueid}</td>
                  <td>{form.time}</td>
                  <td>{form.notes}</td>
                  <td>{(form.days || []).join(", ")}</td>
                  <td>{new Date(form.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
