import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import AdminLogin from "./components/Admin/AdminLogin";
import TechLogin from "./components/Teacher/TechLogin";
import Dashboard from "./components/Teacher/Dashboard";
import Admin from "./components/Admin/Admin";
import HodLogin from "./components/Hod/HodLogin";
import Hod from "./components/Hod/HodDash";
import StuLogin from "./components/Student/StuLogin";
import StuDash from "./components/Student/StuDash";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/teacher-login" element={<TechLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/hod-login" element={<HodLogin />} />
      <Route path="/hod" element={<Hod />} />
      <Route path="/stuDash" element={<StuDash />} />
      <Route path="/student-login" element={<StuLogin />} />
    </Routes>
  </Router>
);
