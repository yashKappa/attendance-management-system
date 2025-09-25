// src/components/hod/HodAdd.js
import { useState } from "react";
import Error from "../../Error/Error";
import "./Hod.css";

export default function HodAdd({ fetchHods }) {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [ueid, setUeid] = useState("");
  const [message, setMessage] = useState(null);

  // Generate UEID
  const generateUEID = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString();
    return `UEID-${timestamp}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUEID = generateUEID();
    setUeid(newUEID);

    const hodData = { fullName, password, ueid: newUEID };

    try {
      const response = await fetch("http://localhost:5000/api/hod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hodData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ text: "HOD added successfully!", type: "success" });
        fetchHods();
        setFullName("");
        setPassword("");
      } else {
        setMessage({ text: result.error || "Failed to add HOD", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Something went wrong while adding HOD.", type: "error" });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <>
      {message && <Error message={message.text} type={message.type} onClose={() => setMessage(null)} />}

      <form className="teacher-form" onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Add HOD</button>
        {ueid && <div className="generated-ueid">Generated UEID: {ueid}</div>}
      </form>
    </>
  );
}
