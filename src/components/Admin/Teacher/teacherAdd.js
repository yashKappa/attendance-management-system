import { useState } from "react";
import Error from "../../message/Error"; // Use the shared Error component
import "./Teacher.css";

export default function TeacherAdd({ fetchTeachers }) {
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [password, setPassword] = useState("");
  const [ueid, setUeid] = useState("");
  const [message, setMessage] = useState(null); // local state for error/success

  const generateUEID = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString();
    return `UEID-${timestamp}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUEID = generateUEID();
    setUeid(newUEID);

    const teacherData = { fullName, department, subject, password, ueid: newUEID };

    try {
      const response = await fetch("http://localhost:5000/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ text: "Teacher added successfully!", type: "success" });
        fetchTeachers(); // refresh teacher list
        setFullName(""); setDepartment(""); setSubject(""); setPassword("");

      } else {
        setMessage({ text: result.error || "Failed to add teacher", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Something went wrong while adding teacher.", type: "error" });
    }

    // auto-hide after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <>
      {/* Show success or error message */}
      {message && <Error message={message.text} type={message.type} onClose={() => setMessage(null)} />}

      <form className="teacher-form" onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div>
          <label>Department:</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
            <option value="">Select Dept</option>
            <option value="IT">IT</option>
            <option value="CS">CS</option>
            <option value="BMS">BMS</option>
          </select>
        </div>

        <div>
          <label>Subject:</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>

        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit">Add Teacher</button>

        {ueid && <div className="generated-ueid">Generated UEID: {ueid}</div>}
      </form>
    </>
  );
}
