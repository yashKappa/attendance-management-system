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

// MongoDB connection
const username = "Yash";
const password = encodeURIComponent("YashKappa");
const cluster = "msg-sgkm-data.kwumq8p.mongodb.net";
const dbName = "teachers";

const mongoURI = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Schema
const teacherSchema = new mongoose.Schema({
  fullName: String,
  department: String,
  subject: String,
  password: String,
  ueid: String,
});

const Teacher = mongoose.model("Teacher", teacherSchema);

// Routes
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

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("Client connected");

  // Listen to MongoDB changes
  const changeStream = Teacher.watch();

  changeStream.on("change", async (change) => {
    const teachers = await Teacher.find();
    socket.emit("teachersUpdated", teachers);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    changeStream.close();
  });
});

// DELETE a teacher by ID
app.delete("/api/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

/****************** Student ****************/

const studentSchema = new mongoose.Schema({
  fullName: String,
  department: String,
  password: String,
  email: String,
  ueid: String,
});

const Student = mongoose.model("Student", studentSchema);

// Routes
app.post("/api/student", async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.json({ success: true, Student: newStudent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/student", async (req, res) => {
  const student = await Student.find();
  res.json(student);
});

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("Client connected");

  // Listen to MongoDB changes
  const changeStream = Student.watch();

  changeStream.on("change", async (change) => {
    const student = await Student.find();
    socket.emit("StudentUpdated", student);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    changeStream.close();
  });
});

// DELETE a teacher by ID
app.delete("/api/student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


/*********************** HOD *****************/


const hodSchema = new mongoose.Schema({
  fullName: String,
  password: String,
  ueid: String,
});

const Hod = mongoose.model("Hod", hodSchema);

// Create HOD
app.post("/api/hod", async (req, res) => {
  try {
    const newHod = new Hod(req.body);
    await newHod.save();
    res.json({ success: true, hod: newHod });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all HODs
app.get("/api/hod", async (req, res) => {
  try {
    const hods = await Hod.find();
    res.json(hods);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete HOD
app.delete("/api/hod/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHod = await Hod.findByIdAndDelete(id);
    if (!deletedHod) return res.status(404).json({ message: "HOD not found" });
    res.json({ message: "HOD deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("Client connected");

  const changeStream = Hod.watch();

  changeStream.on("change", async () => {
    const hods = await Hod.find();
    socket.emit("HodUpdated", hods);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    changeStream.close();
  });
});


// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
