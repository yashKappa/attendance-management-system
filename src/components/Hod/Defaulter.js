import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import emailjs from "@emailjs/browser";
import Error from "../Error/Error"; 

export default function Defaulter({ refreshKey }) {
    const [defaulters, setDefaulters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("All");
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState("All");
    const [notes, setNotes] = useState({});
    const [message, setMessage] = useState(""); // ✅ message text
    const [messageType, setMessageType] = useState("success"); // success or error

    useEffect(() => {
        const fetchDefaulters = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:5000/api/studentAttendance");
                const data = res.data.data;

                const dataWithMonth = data.map(a => ({
                    ...a,
                    month: dayjs(a.date).format("MMMM YYYY")
                }));

                const uniqueMonths = ["All", ...new Set(dataWithMonth.map(a => a.month))];
                setMonths(uniqueMonths);

                const studentStats = {};
                dataWithMonth.forEach(a => {
                    const key = a.ueid || a.email;
                    if (!studentStats[key]) {
                        studentStats[key] = {
                            fullName: a.fullName,
                            email: a.email,
                            department: a.department,
                            total: 0,
                            present: 0,
                            month: a.month
                        };
                    }
                    studentStats[key].total += 1;
                    if (a.status.toLowerCase() === "present") studentStats[key].present += 1;
                });

                const defaultersList = Object.values(studentStats)
                    .map(s => ({
                        ...s,
                        percentage: ((s.present / s.total) * 100 || 0).toFixed(2)
                    }))
                    .filter(s => s.percentage < 75);

                setDefaulters(defaultersList);
                const uniqueDepts = ["All", ...new Set(defaultersList.map(s => s.department))];
                setDepartments(uniqueDepts);
            } catch (err) {
                console.error("Error fetching defaulter list:", err);
                setMessage("Failed to fetch defaulters. Check console for details.");
                setMessageType("error");
            } finally {
                setLoading(false);
            }
        };

        fetchDefaulters();
    }, [refreshKey]);

    const sendMail = (student) => {
        const templateParams = {
            title: `Attendance Alert: ${student.fullName}`,
            name: student.fullName,
            email: student.email,
            department: student.department,
            total: student.total,
            present: student.present,
            percentage: student.percentage,
            message: notes[student.email] || "No extra note"
        };

        emailjs.send(
            "service_bjfvyin",
            "template_x9ik89i",
            templateParams,
            "gkrWAPa8psVVZhdbT"
        )
        .then((res) => {
            console.log("Email sent successfully!", res.status, res.text);
            setMessage(`Attendance email sent to ${student.fullName}'s parents`);
            setMessageType("success");
            setNotes(prevNotes => ({ ...prevNotes, [student.email]: "" })); // reset textarea
        })
        .catch((err) => {
            console.error("Error sending email:", err);
            setMessage("Failed to send email. Check console for details.");
            setMessageType("error");
        });
    };

    const filteredDefaulters = defaulters.filter(d => {
        const monthMatch = selectedMonth === "All" || d.month === selectedMonth;
        const deptMatch = selectedDept === "All" || d.department === selectedDept;
        return monthMatch && deptMatch;
    });

    return (
        <div className="defaulter-container">
            <h2>🚨 Defaulter List (Below 75%)</h2>

            {/* Error/Success Message */}
            <Error message={message} type={messageType} onClose={() => setMessage("")} />

            {/* Month Filter */}
            <div className="filter">
                {months.map((month, idx) => (
                    <button
                        key={idx}
                        className={selectedMonth === month ? "active" : ""}
                        onClick={() => setSelectedMonth(month)}
                    >
                        {month}
                    </button>
                ))}
            </div>

            {/* Department Filter */}
            <div className="filter" style={{ marginTop: "10px" }}>
                {departments.map((dept, idx) => (
                    <button
                        key={idx}
                        className={selectedDept === dept ? "active" : ""}
                        onClick={() => setSelectedDept(dept)}
                    >
                        {dept}
                    </button>
                ))}
            </div>

            {/* Attendance Table */}
            <div className="table-responsive" style={{ marginTop: "15px" }}>
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Total Classes</th>
                            <th>Present</th>
                            <th>Attendance %</th>
                            <th>Mail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>Loading...</td>
                            </tr>
                        ) : filteredDefaulters.length > 0 ? (
                            filteredDefaulters.map((d, idx) => (
                                <tr key={idx}>
                                    <td>{d.fullName}</td>
                                    <td>{d.email}</td>
                                    <td>{d.department}</td>
                                    <td>{d.total}</td>
                                    <td>{d.present}</td>
                                    <td>{d.percentage}%</td>
                                    <td>
                                        <textarea
                                            className="mail-text"
                                            placeholder="Extra note"
                                            value={notes[d.email] || ""}
                                            onChange={(e) =>
                                                setNotes({ ...notes, [d.email]: e.target.value })
                                            }
                                        />
                                        <div className="mail">
                                        <button onClick={() => sendMail(d)}>Mail</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>🎉 No defaulters found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
