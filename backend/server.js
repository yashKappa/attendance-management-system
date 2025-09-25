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


// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
