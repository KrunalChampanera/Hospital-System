import { useState } from "react"
import { Container, Row, Col, Card, Form, Alert, Spinner } from "react-bootstrap"
import api from "../services/api"

const AdminSettings = ({ adminData, hospitalData, onRefresh }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const [profile, setProfile] = useState({ name: adminData?.name || "", email: adminData?.email || "" })
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" })
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" })

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!profile.name.trim() || !profile.email.trim()) {
      setProfileMsg({ type: "danger", text: "Name and email are required" }); return
    }
    setSavingProfile(true); setProfileMsg({ type: "", text: "" })
    try {
      await api.put(`/auth/profile/${user.id}`, { name: profile.name, email: profile.email })
      const updated = { ...user, name: profile.name, email: profile.email }
      localStorage.setItem("user", JSON.stringify(updated))
      setProfileMsg({ type: "success", text: "Profile updated successfully!" })
      if (onRefresh) onRefresh(user.id)
      setTimeout(() => setProfileMsg({ type: "", text: "" }), 3000)
    } catch (err) {
      setProfileMsg({ type: "danger", text: err.response?.data?.message || "Failed to update profile" })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordMsg({ type: "danger", text: "All fields are required" }); return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: "danger", text: "New passwords do not match" }); return
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ type: "danger", text: "New password must be at least 6 characters" }); return
    }
    setSavingPassword(true); setPasswordMsg({ type: "", text: "" })
    try {
      const res = await api.post("/auth/change-password", {
        adminId: user.id,
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      if (res.data.success) {
        setPasswordMsg({ type: "success", text: "Password changed successfully!" })
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setTimeout(() => setPasswordMsg({ type: "", text: "" }), 3000)
      }
    } catch (err) {
      setPasswordMsg({ type: "danger", text: err.response?.data?.message || "Failed to change password" })
    } finally {
      setSavingPassword(false)
    }
  }

  const sectionStyle = { border: "none", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }
  const labelStyle = { fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }
  const inputStyle = { borderRadius: "9px", fontSize: "13.5px", height: "40px" }

  return (
    <Container fluid>
      <div className="mb-4">
        <h4 style={{ fontWeight: "700", color: "#0F172A", margin: 0 }}>⚙️ Settings</h4>
        <p style={{ color: "#94A3B8", fontSize: "13px", margin: "4px 0 0" }}>Manage your account and hospital preferences</p>
      </div>

      <Row className="g-4">
        {/* Left Column */}
        <Col lg={7}>

          {/* Profile Settings */}
          <Card style={sectionStyle} className="mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👤</div>
                <div>
                  <h6 style={{ fontWeight: "600", color: "#0F172A", margin: 0 }}>Profile Information</h6>
                  <p style={{ fontSize: "12.5px", color: "#94A3B8", margin: 0 }}>Update your name and email</p>
                </div>
              </div>

              {profileMsg.text && (
                <Alert variant={profileMsg.type} className="mb-3" style={{ fontSize: "13.5px", borderRadius: "10px" }}>
                  {profileMsg.text}
                </Alert>
              )}

              <Form onSubmit={handleSaveProfile}>
                <Form.Group className="mb-3">
                  <Form.Label style={labelStyle}>Full Name</Form.Label>
                  <Form.Control
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your name"
                    style={inputStyle}
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label style={labelStyle}>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="Enter your email"
                    style={inputStyle}
                  />
                </Form.Group>
                <button type="submit" disabled={savingProfile} style={{
                  height: "38px", padding: "0 20px", border: "none", borderRadius: "9px",
                  background: "#2563EB", color: "#fff", fontSize: "13.5px", fontWeight: "500",
                  cursor: savingProfile ? "not-allowed" : "pointer", opacity: savingProfile ? 0.8 : 1,
                  display: "flex", alignItems: "center", gap: "6px"
                }}>
                  {savingProfile && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
                  Save Profile
                </button>
              </Form>
            </Card.Body>
          </Card>

          {/* Change Password */}
          <Card style={sectionStyle}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🔒</div>
                <div>
                  <h6 style={{ fontWeight: "600", color: "#0F172A", margin: 0 }}>Change Password</h6>
                  <p style={{ fontSize: "12.5px", color: "#94A3B8", margin: 0 }}>Update your login password</p>
                </div>
              </div>

              {passwordMsg.text && (
                <Alert variant={passwordMsg.type} className="mb-3" style={{ fontSize: "13.5px", borderRadius: "10px" }}>
                  {passwordMsg.text}
                </Alert>
              )}

              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3">
                  <Form.Label style={labelStyle}>Current Password</Form.Label>
                  <Form.Control type="password" value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    placeholder="Enter current password" style={inputStyle} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={labelStyle}>New Password</Form.Label>
                  <Form.Control type="password" value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Enter new password" style={inputStyle} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label style={labelStyle}>Confirm New Password</Form.Label>
                  <Form.Control type="password" value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Confirm new password" style={inputStyle} />
                </Form.Group>
                <button type="submit" disabled={savingPassword} style={{
                  height: "38px", padding: "0 20px", border: "none", borderRadius: "9px",
                  background: "#DC2626", color: "#fff", fontSize: "13.5px", fontWeight: "500",
                  cursor: savingPassword ? "not-allowed" : "pointer", opacity: savingPassword ? 0.8 : 1,
                  display: "flex", alignItems: "center", gap: "6px"
                }}>
                  {savingPassword && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
                  Change Password
                </button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column */}
        <Col lg={5}>

          {/* Account Info */}
          <Card style={sectionStyle} className="mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🛡️</div>
                <div>
                  <h6 style={{ fontWeight: "600", color: "#0F172A", margin: 0 }}>Account Info</h6>
                  <p style={{ fontSize: "12.5px", color: "#94A3B8", margin: 0 }}>Your current account details</p>
                </div>
              </div>
              {[
                ["Name", adminData?.name || user.name || "—"],
                ["Email", adminData?.email || user.email || "—"],
                ["Role", "Hospital Admin"],
                ["Status", adminData?.status || "Active"],
                ["Total Logins", adminData?.login_count || 0],
                ["Last Login", adminData?.last_login ? new Date(adminData.last_login).toLocaleString() : "Never"],
              ].map(([label, value]) => (
                <div key={label} className="d-flex justify-content-between align-items-center mb-3 pb-2"
                  style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>{label}</span>
                  <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#1E293B" }}>
                    {label === "Status"
                      ? <span style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: "20px", padding: "2px 10px", fontSize: "12px" }}>{value}</span>
                      : label === "Role"
                        ? <span style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", borderRadius: "20px", padding: "2px 10px", fontSize: "12px" }}>Hospital Admin</span>
                        : value}
                  </span>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Hospital Info */}
          <Card style={sectionStyle}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🏥</div>
                <div>
                  <h6 style={{ fontWeight: "600", color: "#0F172A", margin: 0 }}>Hospital Info</h6>
                  <p style={{ fontSize: "12.5px", color: "#94A3B8", margin: 0 }}>Your assigned hospital details</p>
                </div>
              </div>
              {[
                ["Hospital Name", hospitalData?.clinic_name],
                ["City", hospitalData?.city],
                ["State", hospitalData?.state],
                ["Country", hospitalData?.country],
                ["Pincode", hospitalData?.pincode],
                ["Status", hospitalData?.status || "Active"],
              ].map(([label, value]) => (
                <div key={label} className="d-flex justify-content-between align-items-center mb-3 pb-2"
                  style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>{label}</span>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#475569" }}>{value || "N/A"}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default AdminSettings
