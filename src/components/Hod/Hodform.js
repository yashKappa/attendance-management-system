import { useState } from "react";
import axios from "axios";
import Error from "../Error/Error";
import './HodForm.css';

export default function HodForm() {
  const [ueid, setUeid] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleDayChange = (e) => {
    const day = e.target.value;
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!ueid || !time || !notes || days.length === 0) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/hodform", {
        ueid,
        time,
        notes,
        days
      });

      if (response.data.success) {
        setMessage("Form submitted successfully!");
        setUeid("");
        setTime("");
        setNotes("");
        setDays([]);
      } else {
        setError(response.data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div className="form-container">
      <h2>Teacher Form</h2>

      <Error message={message} type="success" onClose={() => setMessage(null)} />

      <Error message={error} type="error" onClose={() => setError(null)} />

      <form onSubmit={handleSubmit}>
        <div>
          <label>UEID:</label>
          <input
            type="text"
            value={ueid}
            onChange={(e) => setUeid(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Time:</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
        </div>

        <div className="weekdays">
          {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(day => (
            <label key={day}>
              <input
                type="checkbox"
                value={day}
                checked={days.includes(day)}
                onChange={handleDayChange}
              />
              {day}
            </label>
          ))}
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
