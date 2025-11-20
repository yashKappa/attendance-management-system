import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function Attendance() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [studentUEID, setStudentUEID] = useState("");

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const ueid = Cookies.get("studentUEID");
                if (!ueid) {
                    setError("Student not logged in");
                    setLoading(false);
                    return;
                }
                setStudentUEID(ueid);

                // Get student _id from Student collection
                const studentRes = await axios.get("https://attendance-management-system-83fk.onrender.com/api/student");
                const student = studentRes.data.find((s) => s.ueid === ueid);
                if (!student) {
                    setError("Student not found");
                    setLoading(false);
                    return;
                }
                const studentId = student._id;

                // Get attendance records for this student
                const attendanceRes = await axios.get("https://attendance-management-system-83fk.onrender.com/api/studentAttendance");
                const studentRecords = attendanceRes.data.data.filter(
                    (rec) => rec.ueid === ueid || rec.studentId === studentId
                );

                setAttendance(studentRecords);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch attendance data");
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    const uniqueDates = [...new Set(attendance.map((a) => `${a.date} | ${a.day}`))];

    const recordsByDate = selectedDate
        ? attendance.filter((a) => `${a.date} | ${a.day}` === selectedDate)
        : [];

    return (
        <div className="student-container">
            <h2>My Attendance</h2>

            {studentUEID && (
                <p className="stu-ueid">
                    <strong>UEID:</strong> {studentUEID}
                </p>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!selectedDate && (
                <div className="date-section">
                    <h4>Select Date/Day:</h4>
                    <div className="day-section">
                        {uniqueDates.map((d) => (
                            <button className="date"
                                key={d}
                                onClick={() => setSelectedDate(d)}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="table-responsive">
                {loading ? (
                    <p style={{ textAlign: "center", padding: "15px" }}>
                        Loading attendance...
                    </p>
                ) : selectedDate ? (
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Teacher</th>
                                <th>Date</th>
                                <th>Day</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recordsByDate.length > 0 ? (
                                recordsByDate.map((rec) => (
                                    <tr key={rec._id}>
                                        <td>{rec.subject}</td>
                                        <td>{rec.status}</td>
                                        <td>{rec.teacherName || rec.teacherUEID}</td>
                                        <td>{rec.date}</td>
                                        <td>{rec.day}</td>
                                        <td>{rec.time}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center" }}>
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    !loading
                )}
            </div>

            {selectedDate && (
                <div className="close-buttons" style={{ marginTop: "10px" }}>
                    <button className="close" onClick={() => setSelectedDate(null)}>
                        Close Table
                    </button>
                </div>
            )}
        </div>
    );
}
