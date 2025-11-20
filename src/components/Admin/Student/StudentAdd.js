// src/components/student/StudentAdd.js
import { useState } from "react";
import Error from "../../Error/Error"; 
import "./Student.css";

export default function StudentAdd({ fetchStudent }) {
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ueid, setUeid] = useState("");
  const [message, setMessage] = useState(null);

  // Generate unique UEID
  const generateUEID = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString();
    return `UEID-${timestamp}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUEID = generateUEID();
    setUeid(newUEID);

    const studentData = { fullName, department, email, password, ueid: newUEID };

    try {
      const response = await fetch("https://attendance-management-system-83fk.onrender.com/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ text: "Student added successfully!", type: "success" });
        fetchStudent(); // Refresh student list
        // Reset form
        setFullName(""); 
        setDepartment(""); 
        setEmail("");
        setPassword("");
      } else {
        setMessage({ text: result.error || "Failed to add student", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Something went wrong while adding student.", type: "error" });
    }

    // Auto hide message after 5s
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <>
      {message && (
        <Error 
          message={message.text} 
          type={message.type} 
          onClose={() => setMessage(null)} 
        />
      )}

      <form className="teacher-form" onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label>Course:</label>
          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)} 
            required
          >
            <option value="">Select Course</option>
            <option value="IT">B.Sc.IT</option>
            <option value="CS">B.Sc.CS</option>
            <option value="BMS">BMS</option>
          </select>
        </div>

        <div>
          <label>Parents Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit">Add Student</button>

        {ueid && <div className="generated-ueid">Generated UEID: {ueid}</div>}
      </form>
    </>
  );
}
