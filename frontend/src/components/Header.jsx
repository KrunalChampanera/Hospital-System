import { Navbar } from "react-bootstrap"

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Hospital Admin",
  doctor: "Doctor"
}

const Header = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const role = localStorage.getItem("role")

  return (
    <Navbar bg="white" className="px-4" style={{ borderBottom: "1px solid #E2E8F0", minHeight: "56px" }}>
      <div className="ms-auto d-flex align-items-center gap-3">
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#0F172A" }}>{user.name || "User"}</div>
          <div style={{ fontSize: "11px", color: "#94A3B8" }}>{ROLE_LABELS[role] || role}</div>
        </div>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>👤</div>
      </div>
    </Navbar>
  )
}

export default Header
