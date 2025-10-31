import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Profile from "./mechanic/page/Profile";
import Dashboard from "./mechanic/Dashboard";
import Login from "./components/LoginForm";
import Logout from "./components/Logout";
import OTP from "./components/OtpPage";
import MechanicForm from "./components/MechanicForm";
import Protected from "./ProtectedRoute";
import MechanicVerification from "./mechanic/componets/admin/MechanicVerification";
import LegalPages from "./mechanic/page/LegalPages";
import JobDetailsPage from "@/mechanic/page/JobDetailsPage";
import UnverifiedPage from "./components/UnverifiedPage";
import EarningsSummary from "./components/EarningsSummary";

function App() {
  return (
    <div className="App transition-all duration-500 ease-in-out bg-white">
      <Routes>

        {/* 🔐 Protected Routes */}
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/form"
          element={
            <Protected>
              <MechanicForm />
            </Protected>
          }
        />

        <Route
          path="/kyc"
          element={
            <Protected>
              <MechanicVerification />
            </Protected>
          }
        />

        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />

        <Route
          path="/job/:id"
          element={
            <Protected>
              <JobDetailsPage />
            </Protected>
          }
        />

        {/* 📄 Public Routes */}
        <Route path="/legal" element={<LegalPages />} />
        <Route path="/un" element={<UnverifiedPage />} />
        <Route path="/job_completed" element={<EarningsSummary />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<OTP />} />
        <Route path="/logout" element={<Logout />} />

      </Routes>
    </div>
  );
}

export default App;
