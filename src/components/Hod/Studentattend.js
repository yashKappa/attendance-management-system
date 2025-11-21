// src/components/attendance/StudentAllAttend.js
import { useState, useEffect } from "react";
import axios from "axios";
import Defaulter from "./Defaulter";

export default function StudentAllAttend() {
    const [attendances, setAttendances] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [activeDept, setActiveDept] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [groupedDates, setGroupedDates] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState("All");
    const [showDefaulter, setShowDefaulter] = useState(false);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                const res = await axios.get("https://attendance-management-system-83fk.onrender.com/api/studentAttendance");
                const data = res.data.data;
                setAttendances(data);
                setFiltered(data);

                const depts = ["All", ...new Set(data.map((a) => a.department))];
                setDepartments(depts);

                const dates = [...new Set(data.map((a) => `${a.date} | ${a.day}`))];
                setGroupedDates(dates);

                const subs = ["All", ...new Set(data.map((a) => a.subject))];
                setSubjects(subs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    useEffect(() => {
        let temp = [...attendances];
        if (activeDept !== "All") {
            temp = temp.filter((a) => a.department === activeDept);
        }
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            temp = temp.filter(
                (a) =>
                    a.fullName.toLowerCase().includes(term) ||
                    a.ueid?.toLowerCase().includes(term) ||
                    a.teacherName?.toLowerCase().includes(term)
            );
        }
        setFiltered(temp);
    }, [attendances, activeDept, searchTerm]);

    useEffect(() => {
        if (selectedDate) {
            const recordsForDate = attendances.filter(
                (a) =>
                    `${a.date} | ${a.day}` === selectedDate &&
                    (activeDept === "All" ? true : a.department === activeDept)
            );

            const subs = ["All", ...new Set(recordsForDate.map((a) => a.subject))];
            setSubjects(subs);

            if (!subs.includes(activeSubject)) {
                setActiveSubject("All");
            }
        } else {
            const allSubs = ["All", ...new Set(attendances.map((a) => a.subject))];
            setSubjects(allSubs);
        }
    }, [attendances, selectedDate, activeDept, activeSubject]); // include activeSubject here


    const recordsByDate = selectedDate
        ? filtered.filter((a) => `${a.date} | ${a.day}` === selectedDate)
        : [];

    const recordsByDateAndSubject =
        activeSubject === "All"
            ? recordsByDate
            : recordsByDate.filter((a) => a.subject === activeSubject);


    return (
        <div className="student-container">
            <h2>All Student Attendance</h2>

            <div className="filter">
                <button
                    className="date"
                    onClick={() => {
                        setShowDefaulter(!showDefaulter);
                        setSelectedDate(null);
                        setActiveSubject("All");
                    }}
                >
                    {showDefaulter ? "Hide Defaulter List" : "Show Defaulter List"}
                </button>
            </div>

            {showDefaulter ? (
                <Defaulter attendances={attendances} activeDept={activeDept} />
            ) : (
                <>
                    {!selectedDate && (
                        <div className="search">
                            <div className="filter-buttons">
                                <div>
                                    {departments.map((dept) => (
                                        <button
                                            key={dept}
                                            className={activeDept === dept ? "active" : ""}
                                            onClick={() => setActiveDept(dept)}
                                        >
                                            {dept}
                                        </button>
                                    ))}
                                </div>

                                <div className="filter">
                                    <input
                                        type="text"
                                        placeholder="Search by name, UEID, or teacher..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedDate && (
                        <div className="dates-section" >
                            <h4>Select Date:</h4>
                            <div className="day-section">
                                {groupedDates.map((d) => (
                                    <button
                                        className="date"
                                        key={d}
                                        onClick={() => setSelectedDate(d)}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedDate && (
                        <div>
                            <div className="filter-buttons">
                                <div>
                                    {subjects.map((sub) => (
                                        <button
                                            key={sub}
                                            className={activeSubject === sub ? "active" : ""}
                                            onClick={() => setActiveSubject(sub)}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <button
                                        className="close"
                                        onClick={() => {
                                            setSelectedDate(null);
                                            setActiveSubject("All");
                                        }}
                                    >
                                        Close Table
                                    </button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="student-table">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Email</th>
                                            <th>Department</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Teacher</th>
                                            <th>Date</th>
                                            <th>Day</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="9">
                                                    <img
                                                        src={`${process.env.PUBLIC_URL}/assets/no.gif`}
                                                        className="loading"
                                                        alt="AMS logo"
                                                    /><br />
                                                    Loading...
                                                </td>
                                            </tr>
                                        ) : recordsByDateAndSubject.length > 0 ? (
                                            recordsByDateAndSubject.map((a) => (
                                                <tr key={a._id}>
                                                    <td>{a.fullName}</td>
                                                    <td>{a.email}</td>
                                                    <td>{a.department}</td>
                                                    <td>{a.subject}</td>
                                                    <td>{a.status}</td>
                                                    <td>{a.teacherName || a.teacherUEID}</td>
                                                    <td>{a.date}</td>
                                                    <td>{a.day}</td>
                                                    <td>{a.time}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9">
                                                    No records found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
