import { useEffect, useState } from "react"
import { Nav } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"

const Sidebar = ({ activeTab, onTabChange, hospitalName }) => {
  const navigate = useNavigate()
  const [role, setRole] = useState(null)

  useEffect(() => {
    setRole(localStorage.getItem("role"))
  }, [])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("role")
      navigate("/")
    }
  }

  const navLink = (tab, icon, label) => (
    <Nav.Link
      key={tab}
      onClick={() => onTabChange && onTabChange(tab)}
      style={{
        cursor: "pointer",
        fontWeight: activeTab === tab ? "600" : "normal",
        color: activeTab === tab ? "#0d6efd" : "#333",
        background: activeTab === tab ? "#e8f0fe" : "transparent",
        borderRadius: "6px",
        marginBottom: "2px",
        padding: "8px 12px"
      }}
    >
      {icon} {label}
    </Nav.Link>
  )

  return (
    <div style={{ width: "250px", minHeight: "100vh", background: "#fff", borderRight: "1px solid #ddd", padding: "20px", overflowY: "auto" }}>
      {role === "admin" ? (
        <div className="mb-4">
          <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Hospital</div>
          <h6 style={{ fontWeight: "700", color: "#0F172A", margin: 0, fontSize: "15px" }}>
            🏥 {hospitalName || "Loading..."}
          </h6>
        </div>
      ) : (
        <h5 className="mb-4">💙 Clinicare</h5>
      )}

      <Nav className="flex-column">
        {role === "super_admin" && (
          <>
            <Nav.Link as={Link} to="/dashboard">📊 Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/hospitals">🏥 Hospitals</Nav.Link>
            <Nav.Link as={Link} to="/create-hospital">➕ Register Hospital</Nav.Link>
            <Nav.Link as={Link} to="/departments">🏢 Departments</Nav.Link>
            <Nav.Link as={Link} to="/designations">🏷️ Designations</Nav.Link>
            <hr />
            <Nav.Link as={Link} to="/admin-management">👥 Admin Management</Nav.Link>
            <Nav.Link as={Link} to="/reports">📊 Reports</Nav.Link>
            <Nav.Link as={Link} to="/settings">⚙️ Settings</Nav.Link>
          </>
        )}

        {role === "admin" && (
          <>
            {navLink("overview", "📊", "Dashboard")}
            {navLink("info", "🏥", "Hospital Info")}
            {navLink("facilities", "🛏️", "Facilities")}
            {navLink("activities", "📋", "Activities")}
            {navLink("hours", "🕐", "Opening Hours")}
            {navLink("departments", "🏢", "Departments")}
            {navLink("doctors", "👨⚕️", "Doctors")}
            {navLink("staff", "👥", "Staff")}
            <hr />
            {navLink("reports", "📊", "Reports")}
            {navLink("settings", "⚙️", "Settings")}
            <hr />
            {navLink("profile", "👤", "My Profile")}
            {navLink("password", "🔒", "Change Password")}
          </>
        )}

        <hr />
        <Nav.Link style={{ color: "red", cursor: "pointer" }} onClick={handleLogout}>
          🚪 Logout
        </Nav.Link>
      </Nav>
    </div>
  )
}

export default Sidebar
