import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function HodForms() {
  const [forms, setForms] = useState([]); // full fetched data
  const [filteredForms, setFilteredForms] = useState([]); // filtered data for table
  const [loading, setLoading] = useState(true);
  const [ueidSearch, setUeidSearch] = useState(""); // server-side UEID search
  const [tableSearch, setTableSearch] = useState(""); // client-side table filter

  // Fetch function (server-side)
  const fetchHodForms = async (ueid) => {
    if (!ueid) {
      setForms([]);
      setFilteredForms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://attendance-management-system-83fk.onrender.com/api/hodforms?ueid=${ueid}`
      );
      const data = Array.isArray(response.data) ? response.data : [];
      setForms(data);
      setFilteredForms(data);
    } catch (err) {
      console.error("Error fetching HOD forms:", err);
      setForms([]);
      setFilteredForms([]);
    } finally {
      setLoading(false);
    }
  };

  // On mount → load UEID from cookie
  useEffect(() => {
    const cookieUEID = Cookies.get("teacherToken");
    if (cookieUEID) {
      setUeidSearch(cookieUEID);
      fetchHodForms(cookieUEID);
    } else {
      setLoading(false);
    }
  }, []);

  // Dynamically fetch from server when UEID search changes (debounced)
  useEffect(() => {
    if (ueidSearch.trim() === "") {
      setForms([]);
      setFilteredForms([]);
      return;
    }

    const delay = setTimeout(() => {
      fetchHodForms(ueidSearch);
    }, 500); // debounce 500ms

    return () => clearTimeout(delay);
  }, [ueidSearch]);

  // Client-side table filter
  useEffect(() => {
    const search = tableSearch.toLowerCase();
    const filtered = forms.filter((form) =>
      form.ueid.toLowerCase().includes(search) ||
      (form.notes && form.notes.toLowerCase().includes(search)) ||
      (form.time && form.time.toLowerCase().includes(search))
    );
    setFilteredForms(filtered);
  }, [tableSearch, forms]);

  return (
    <div className="student-container">
      <h2>Message</h2>

      <div className="search">
        <input
          type="text"
          placeholder="Fetch by UEID"
          value={ueidSearch}
          onChange={(e) => setUeidSearch(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />
        <input
          type="text"
          placeholder="Search table"
          value={tableSearch}
          onChange={(e) => setTableSearch(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />
      </div>

      <div className="table-responsive">
        <table className="student-table">
          <thead>
            <tr>
              <th>UEID</th>
              <th>Time</th>
              <th>Notes</th>
              <th>Days</th>
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
            ) : filteredForms.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                  No data found
                </td>
              </tr>
            ) : (
              filteredForms.map((form) => (
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
