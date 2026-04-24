import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"
import CreateHospital from "./pages/CreateHospital"
import HospitalList from "./pages/HospitalList"
import Profile from "./pages/Profile"
import Departments from "./pages/Departments"
import Designations from "./pages/Designations"
import DoctorDashboard from "./pages/DoctorDashboard"
import AdminManagement from "./pages/AdminManagement"
import AdminRegistration from "./pages/AdminRegistration"
import BookAppointment from "./pages/BookAppointment"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  if (!token) return <Navigate to="/" replace />
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/book" element={<BookAppointment />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="super_admin"><Dashboard /></ProtectedRoute>
        } />
        <Route path="/hospitals" element={
          <ProtectedRoute allowedRole="super_admin"><HospitalList /></ProtectedRoute>
        } />
        <Route path="/create-hospital" element={
          <ProtectedRoute allowedRole="super_admin"><CreateHospital /></ProtectedRoute>
        } />
                <Route path="/departments" element={
          <ProtectedRoute allowedRole="super_admin"><Departments /></ProtectedRoute>
        } />
        <Route path="/designations" element={
          <ProtectedRoute allowedRole="super_admin"><Designations /></ProtectedRoute>
        } />
        <Route path="/admin-management" element={
          <ProtectedRoute allowedRole="super_admin"><AdminManagement /></ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRole="super_admin"><Reports /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRole="super_admin"><Settings /></ProtectedRoute>
        } />
        <Route path="/register" element={<AdminRegistration />} />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
        } />

        <Route path="/doctor-dashboard" element={
          <ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
