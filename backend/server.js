const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const router = express.Router();


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(bodyParser.json());

// ---------------- MongoDB connection ----------------
const username = "Yash";
const password = encodeURIComponent("YashKappa");
const cluster = "msg-sgkm-data.kwumq8p.mongodb.net";
const dbName = "teachers";

const mongoURI = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

// ---------------- Schemas ----------------
const teacherSchema = new mongoose.Schema({
  fullName: String,
  department: String,
  subject: String,
  password: String,
  ueid: String,
});
const Teacher = mongoose.model("Teacher", teacherSchema);

const studentSchema = new mongoose.Schema({
  fullName: String,
  department: String,
  password: String,
  email: String,
  ueid: String,
});
const Student = mongoose.model("Student", studentSchema);

const hodSchema = new mongoose.Schema({
  fullName: String,
  password: String,
  ueid: String,
});
const Hod = mongoose.model("Hod", hodSchema);

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  fullName: { type: String },
  email: { type: String },
  department: { type: String },
  subject: { type: String },
  status: { type: String, enum: ["present", "absent"], required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  teacherUEID: { type: String },
  date: { type: String },   // e.g., "2025-09-26"
  day: { type: String },    // e.g., "Friday"
  time: { type: String },   // e.g., "05:30 PM"
}, { timestamps: true });

const StudentAttendance = mongoose.model("StudentAttendance", attendanceSchema);


// ---------------- Teacher Routes ----------------
app.post("/api/teachers", async (req, res) => {
  try {
    const newTeacher = new Teacher(req.body);
    await newTeacher.save();
    res.json({ success: true, teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/teachers", async (req, res) => {
  const teachers = await Teacher.find();
  res.json(teachers);
});

app.get("/api/teachers/:ueid", async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ ueid: req.params.ueid });
    if (!teacher) return res.json({ success: false, message: "Teacher not found" });
    res.json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Teacher Login
app.post("/api/teachers/login", async (req, res) => {
  try {
    const { ueid, password } = req.body;

    const teacher = await Teacher.findOne({ ueid });
    if (!teacher) {
      return res.status(401).json({ success: false, message: "UEID not found" });
    }

    if (teacher.password !== password) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    // ✅ use UEID as token (simple demo)
    res.json({ success: true, token: teacher.ueid });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Verify Teacher Token
app.get("/api/teachers/verify/:token", async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ ueid: req.params.token }); // ✅ fixed
    if (!teacher) return res.json({ success: false, message: "Invalid token" });

    res.json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Student Routes ----------------
app.post("/api/student", async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.json({ success: true, student: newStudent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/student", async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    const students = await Student.find(filter);
    res.json(students);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- HOD Routes ----------------
app.post("/api/hod", async (req, res) => {
  try {
    const newHod = new Hod(req.body);
    await newHod.save();
    res.json({ success: true, hod: newHod });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/hod", async (req, res) => {
  try {
    const hods = await Hod.find();
    res.json(hods);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- Attendance Routes ----------------
app.post("/api/attendance/save", async (req, res) => {
  try {
    const { records, teacherId } = req.body;

    if (!records || records.length === 0) {
      return res.status(400).json({ success: false, message: "No attendance data" });
    }

    const savedRecords = await Promise.all(
      records.map((r) =>
        StudentAttendance.create({
          studentId: r.studentId,
          fullName: r.fullName,       // student full name
          email: r.email,             // student email
          department: r.department,   // student department
          subject: r.subject,         // teacher subject
          status: r.status,
          teacherId,
          teacherUEID: r.teacherUEID, // teacher UEID
          date: r.date,
          day: r.day,
          time: r.time,
        })
      )
    );

    res.json({ success: true, savedRecords });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ---------------- Socket.IO ----------------
io.on("connection", (socket) => {
  console.log("Client connected");

  const teacherStream = Teacher.watch();
  teacherStream.on("change", async () => {
    const teachers = await Teacher.find();
    socket.emit("teachersUpdated", teachers);
  });

  const studentStream = Student.watch();
  studentStream.on("change", async () => {
    const students = await Student.find();
    socket.emit("studentsUpdated", students);
  });

  const hodStream = Hod.watch();
  hodStream.on("change", async () => {
    const hods = await Hod.find();
    socket.emit("hodsUpdated", hods);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    teacherStream.close();
    studentStream.close();
    hodStream.close();
  });
});

// ---------------- Hod Login ----------------

// ---------------- HOD Login Route ----------------
app.post("/api/hods/login", async (req, res) => {
  try {
    const { ueid, password } = req.body;

    // Find HOD by UEID
    const hod = await Hod.findOne({ ueid });
    if (!hod) {
      return res.status(401).json({ success: false, message: "UEID not found" });
    }

    // Check password
    if (hod.password !== password) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    // Use UEID as token (simple demo, you can replace with JWT)
    res.json({ success: true, token: hod.ueid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Optional: Verify HOD Token
app.get("/api/hods/verify/:token", async (req, res) => {
  try {
    const hod = await Hod.findOne({ ueid: req.params.token });
    if (!hod) return res.json({ success: false, message: "Invalid token" });

    res.json({ success: true, hod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Hod teacher Form ---------------

// Updated HOD Form Schema
const hodFormSchema = new mongoose.Schema({
  ueid: { type: String, required: true },
  time: { type: String, required: true },
  notes: { type: String, required: true },
  days: { type: [String], required: true }, // Array of selected weekdays
}, { timestamps: true });

const HodForm = mongoose.model("HodForm", hodFormSchema);

// HOD Form submission route
app.post("/api/hodform", async (req, res) => {
  try {
    const { ueid, time, notes, days } = req.body;

    // Validation
    if (!ueid || !time || !notes || !days || days.length === 0) {
      return res.status(400).json({ success: false, message: "All fields including weekly days are required" });
    }

    const newForm = new HodForm({ ueid, time, notes, days });
    await newForm.save();

    res.json({ success: true, form: newForm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- fetch teacher schedule -------------

app.get("/api/hodforms", async (req, res) => {
  try {
    const { ueid } = req.query; // get UEID from query param
    const filter = ueid ? { ueid } : {};
    const forms = await HodForm.find(filter).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a student
app.delete("/api/student/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/hod/:id", async (req, res) => {
  try {
    const deleted = await Hod.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "HOD not found" });
    res.json({ success: true, message: "HOD deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Delete a teacher by ID
app.delete("/api/teachers/:id", async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Teacher not found" });
    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Server ----------------
const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
