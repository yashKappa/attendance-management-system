const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");


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
  date: { type: String },   
  day: { type: String },    
  time: { type: String },  
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

// -------------------- Teacher Login ------------------
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

    res.json({ success: true, token: teacher.ueid });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- Verify Teacher Token ------------------
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
          fullName: r.fullName,       
          email: r.email,             
          department: r.department,   
          subject: r.subject,         
          status: r.status,
          teacherId,
          teacherUEID: r.teacherUEID, 
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

    const hod = await Hod.findOne({ ueid });
    if (!hod) {
      return res.status(401).json({ success: false, message: "UEID not found" });
    }

    if (hod.password !== password) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    res.json({ success: true, token: hod.ueid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------- Optional: Verify HOD Token --------------------
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

const hodFormSchema = new mongoose.Schema({
  ueid: { type: String, required: true },
  time: { type: String, required: true },
  notes: { type: String, required: true },
  days: { type: [String], required: true }, 
  expireAt: { type: Date, default: Date.now, expires: 60 }, // TTL = 1 min
}, { timestamps: true });

const HodForm = mongoose.model("HodForm", hodFormSchema);
HodForm.createIndexes();

//------------------ HOD Form submission route --------------------
app.post("/api/hodform", async (req, res) => {
  try {
    const { ueid, time, notes, days } = req.body;

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
    const { ueid } = req.query; 
    const filter = ueid ? { ueid } : {};
    const forms = await HodForm.find(filter).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------ Delete a student ---------------------
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


// ------------------- Delete a teacher by ID -------------------
app.delete("/api/teachers/:id", async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Teacher not found" });
    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ----------- GET all attendance records with teacher name ----------------
app.get("/api/studentAttendance", async (req, res) => {
  try {
    const records = await StudentAttendance.find()
      .populate("teacherId", "fullName ueid") 
      .populate("studentId", "ueid fullName email department"); 

    const data = records.map((r) => ({
      _id: r._id,
      fullName: r.fullName,
      email: r.email,
      ueid: r.studentId?.ueid,
      department: r.department,
      subject: r.subject,
      status: r.status,
      teacherName: r.teacherId?.fullName,
      teacherUEID: r.teacherUEID,
      date: r.date,
      day: r.day,
      time: r.time,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

//----------------- Student Login -----------------

app.post("/api/student/login", async (req, res) => {
  try {
    const { ueid, password } = req.body;
    const student = await Student.findOne({ ueid });

    if (!student) {
      return res.json({ success: false, message: "Student not found" });
    }

    if (student.password !== password) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, token: student.ueid });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
    
  }
});

//-------------- store All student Notify ------------------

const studentNotifySchema = new mongoose.Schema({
  department: { type: String, required: true }, 
  ueid: { type: String, default: "" }, 
  message: { type: String, required: true },
  date: { type: String }, 
  day: { type: String }, 
  time: { type: String },
  expireAt: { type: Date, default: Date.now, expires: 60 }, 
}, { timestamps: true });

const StudentNotify = mongoose.model("StudentNotify", studentNotifySchema);
StudentNotify.createIndexes();


app.post("/api/studentNotify", async (req, res) => {
  try {
    const { department, ueid, message } = req.body;
    if (!department || !message) {
      return res.status(400).json({ success: false, message: "Department and message are required" });
    }

    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const day = now.toLocaleDateString("en-US", { weekday: "long" });
    const time = now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

    const newNotify = new StudentNotify({ department, ueid, message, date, day, time });
    await newNotify.save();

    res.json({ success: true, notification: newNotify });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//---------- Fetch all student Notify -----------

app.get("/api/studentNotify", async (req, res) => {
  try {
    const { department, ueid } = req.query;
    const filter = {};

    if (department && department !== "All") filter.department = department;
    if (ueid) filter.ueid = ueid;

    const notifications = await StudentNotify.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- TeachUEID Schema ----------------
const teachUeidSchema = new mongoose.Schema({
  teacherUEID: { type: String, required: true },
  notes: { type: String, required: true },
  date: { type: String },
  day: { type: String },
  time: { type: String },
  pinned: { type: Boolean, default: false }, // ✅ Added pinned field
}, { timestamps: true });

const TeachUEID = mongoose.model("TeachUEID", teachUeidSchema);

// ---------------- Add new record ----------------
app.post("/api/teachueid", async (req, res) => {
  try {
    const { teacherUEID, notes, date, day, time, pinned } = req.body;
    if (!teacherUEID || !notes) {
      return res.status(400).json({ success: false, message: "UEID and notes are required" });
    }

    const newRecord = new TeachUEID({ teacherUEID, notes, date, day, time, pinned });
    await newRecord.save();

    res.json({ success: true, record: newRecord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- Get all records by UEID ----------------
app.get("/api/teachueid/:ueid", async (req, res) => {
  try {
    // Sort so pinned notes come first
    const records = await TeachUEID.find({ teacherUEID: req.params.ueid }).sort({ pinned: -1, createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Toggle pin ----------------
app.patch("/api/teachueid/:id", async (req, res) => {
  try {
    const { pinned } = req.body;
    const record = await TeachUEID.findByIdAndUpdate(
      req.params.id,
      { pinned },
      { new: true }
    );
    res.json({ success: true, record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Delete record ----------------
app.delete("/api/teachueid/:id", async (req, res) => {
  try {
    await TeachUEID.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Record deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ---------------- Server ----------------
const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
