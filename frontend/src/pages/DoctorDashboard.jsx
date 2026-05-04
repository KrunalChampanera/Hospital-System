import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Badge, Nav, Spinner, Alert, Form, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [doctorData, setDoctorData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [appointments, setAppointments] = useState([])
  const [apptLoading, setApptLoading] = useState(false)
  const [pwData, setPwData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) { setError("User data not found"); setLoading(false); return }
    api.get(`/admin-doctor/${user.id}`)
      .then(res => {
        if (res.data.success) {
          setDoctorData(res.data.data)
          if (res.data.data?.id) {
            setApptLoading(true)
            api.get(`/appointment/doctor/${res.data.data.id}`)
              .then(r => { if (r.data.success) setAppointments(r.data.data) })
              .catch(() => {})
              .finally(() => setApptLoading(false))
          }
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("role")
      navigate("/")
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError(""); setPwSuccess("")
    if (!pwData.currentPassword || !pwData.newPassword || !pwData.confirmPassword)
      return setPwError("All fields are required")
    if (pwData.newPassword !== pwData.confirmPassword)
      return setPwError("Passwords do not match")
    if (pwData.newPassword.length < 6)
      return setPwError("New password must be at least 6 characters")
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setPwLoading(true)
    try {
      const res = await api.post("/auth/doctor/change-password", { doctorId: user.id, currentPassword: pwData.currentPassword, newPassword: pwData.newPassword })
      if (res.data.success) {
        setPwSuccess("Password changed successfully! Please login again.")
        setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setTimeout(() => {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          localStorage.removeItem("role")
          navigate("/")
        }, 2000)
      }
    } catch (err) { setPwError(err.response?.data?.message || "Failed to change password") }
    setPwLoading(false)
  }

  const getEdu = () => {
    try { return doctorData?.education ? (typeof doctorData.education === "string" ? JSON.parse(doctorData.education) : doctorData.education) : [] } catch { return [] }
  }

  const navLink = (tab, icon, label) => (
    <Nav.Link key={tab} onClick={() => setActiveTab(tab)}
      style={{
        cursor: "pointer", fontWeight: activeTab === tab ? "600" : "normal",
        color: activeTab === tab ? "#0d6efd" : "#333",
        background: activeTab === tab ? "#e8f0fe" : "transparent",
        borderRadius: "6px", marginBottom: "2px", padding: "8px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
      <span>{icon} {label}</span>
    </Nav.Link>
  )

  const renderContent = () => {
    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>
    if (!doctorData) return <Alert variant="warning">Profile not found. Contact your admin.</Alert>

    switch (activeTab) {
      case "overview":
        return (
          <>
            <h4 className="fw-bold mb-1">Doctor Dashboard</h4>
            <p className="text-muted mb-4">Welcome, Dr. {doctorData.name} 👋</p>
            <Row>
              <Col md={3} className="mb-3"><Card className="shadow-sm border-0"><Card.Body>
                <div className="text-muted small mb-1">Department</div>
                <h6 className="fw-bold">{doctorData.department_name || "N/A"}</h6>
              </Card.Body></Card></Col>
              <Col md={3} className="mb-3"><Card className="shadow-sm border-0"><Card.Body>
                <div className="text-muted small mb-1">Designation</div>
                <h6 className="fw-bold">{doctorData.designation_name || "N/A"}</h6>
              </Card.Body></Card></Col>
              <Col md={3} className="mb-3"><Card className="shadow-sm border-0"><Card.Body>
                <div className="text-muted small mb-1">Experience</div>
                <h6 className="fw-bold">{doctorData.years_of_experience ? `${doctorData.years_of_experience} yrs` : "N/A"}</h6>
              </Card.Body></Card></Col>
              <Col md={3} className="mb-3"><Card className="shadow-sm border-0"><Card.Body>
                <div className="text-muted small mb-1">Status</div>
                <Badge bg={doctorData.status === "Active" ? "success" : "danger"}>{doctorData.status}</Badge>
              </Card.Body></Card></Col>
            </Row>
            <Row className="mt-2">
              <Col md={6} className="mb-3"><Card className="shadow-sm border-0"><Card.Body>
                <div className="text-muted small mb-1">Online Consultation</div>
                <h6>{doctorData.online_consultation ? `✅ ₹${doctorData.online_fee}` : "❌ Not available"}</h6>
              </Card.Body></Card></Col>
              <Col md={6} className="mb-3"><Card className="shadow-sm border-0"><Card.Body>
                <div className="text-muted small mb-1">Offline Consultation</div>
                <h6>{doctorData.offline_consultation ? `✅ ₹${doctorData.offline_fee}` : "❌ Not available"}</h6>
              </Card.Body></Card></Col>
            </Row>
          </>
        )

      case "profile":
        return (
          <>
            <h5 className="fw-bold mb-4">👤 My Profile</h5>
            <div className="text-center mb-4">
              {doctorData.photo
                ? <img src={`http://localhost:5000${doctorData.photo}`} alt="profile" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid #ddd" }} />
                : <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto" }}>👤</div>}
              <h5 className="mt-2 fw-bold">{doctorData.name}</h5>
              <div className="text-muted small">{doctorData.designation_name} {doctorData.department_name ? `| ${doctorData.department_name}` : ""}</div>
            </div>
            <Row>
              {[
                ["Email", doctorData.email], ["Phone", doctorData.phone],
                ["Date of Birth", doctorData.dob ? doctorData.dob.split("T")[0] : null],
                ["Gender", doctorData.gender], ["Blood Group", doctorData.blood_group],
                ["License No.", doctorData.medical_license_number],
                ["Languages", doctorData.languages_spoken],
                ["Address", [doctorData.address1, doctorData.city, doctorData.country].filter(Boolean).join(", ")]
              ].map(([label, val]) => (
                <Col md={6} className="mb-3" key={label}>
                  <div className="text-muted small">{label}</div>
                  <div className="fw-semibold">{val || "—"}</div>
                </Col>
              ))}
              {doctorData.bio && <Col md={12} className="mb-3"><div className="text-muted small">Bio</div><div>{doctorData.bio}</div></Col>}
            </Row>
            {getEdu().length > 0 && (
              <>
                <div className="fw-semibold text-primary mb-2 mt-2">Education</div>
                {getEdu().map((e, i) => (
                  <div key={i} className="mb-1 p-2 border rounded bg-light">
                    <strong>{e.degree}</strong> — {e.institution} ({e.start_year}–{e.end_year})
                  </div>
                ))}
              </>
            )}
          </>
        )

      case "password":
        return (
          <>
            <h5 className="fw-bold mb-4">🔒 Change Password</h5>
            {pwError && <Alert variant="danger" dismissible onClose={() => setPwError("")}>{pwError}</Alert>}
            {pwSuccess && <Alert variant="success" dismissible onClose={() => setPwSuccess("")}>{pwSuccess}</Alert>}
            <Form onSubmit={handleChangePassword} style={{ maxWidth: 400 }}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control type="password" value={pwData.currentPassword}
                  onChange={e => setPwData({ ...pwData, currentPassword: e.target.value })}
                  placeholder="Enter current password" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" value={pwData.newPassword}
                  onChange={e => setPwData({ ...pwData, newPassword: e.target.value })}
                  placeholder="Enter new password" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control type="password" value={pwData.confirmPassword}
                  onChange={e => setPwData({ ...pwData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password" />
              </Form.Group>
              <Button type="submit" variant="primary" disabled={pwLoading}>
                {pwLoading ? <Spinner animation="border" size="sm" className="me-1" /> : null} Change Password
              </Button>
            </Form>
          </>
        )

      case "appointments": {
        const STATUS_STYLES = {
          Pending:   { bg: "#FEFCE8", color: "#CA8A04", border: "#FDE68A" },
          Confirmed: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
          Completed: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
          Cancelled: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
        }
        return (
          <>
            <h5 className="fw-bold mb-1">📅 My Appointments</h5>
            <p className="text-muted mb-4" style={{ fontSize: 13 }}>Appointments assigned to you</p>
            {apptLoading ? (
              <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
                <p style={{ color: "#94A3B8", fontSize: 14 }}>No appointments yet</p>
              </div>
            ) : appointments.map(a => {
              const ss = STATUS_STYLES[a.status] || STATUS_STYLES.Pending
              return (
                <Card key={a.id} className="mb-3 border-0" style={{ borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold" style={{ color: "#0F172A", fontSize: 14 }}>{a.patient_name}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                          {a.patient_phone || ""}{a.patient_age ? ` · ${a.patient_age}y` : ""}{a.patient_gender ? ` · ${a.patient_gender}` : ""}
                        </div>
                      </div>
                      <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", marginLeft: 8 }}>{a.status}</span>
                    </div>
                    <div className="d-flex gap-3 mt-2" style={{ fontSize: 12.5, color: "#64748B" }}>
                      <span>📆 {a.appointment_date ? new Date(a.appointment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
                      <span>🕒 {a.appointment_time || "—"}</span>
                      <span>{a.type === "Online" ? "🌐" : "🏥"} {a.type}</span>
                    </div>
                    {a.notes && <div style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 6 }}>📝 {a.notes}</div>}
                  </Card.Body>
                </Card>
              )
            })}
          </>
        )
      }

      default: return null
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Sidebar */}
      <div style={{ width: 250, minHeight: "100vh", background: "#fff", borderRight: "1px solid #ddd", padding: 20 }}>
        <div className="mb-4">
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Doctor Portal</div>
          <h6 style={{ fontWeight: 700, color: "#0F172A", margin: 0, fontSize: 15 }}>
            👨‍⚕️ {doctorData?.name || "Loading..."}
          </h6>
        </div>
        <Nav className="flex-column">
          {navLink("overview", "📊", "Dashboard")}
          {navLink("appointments", "📅", "Appointments")}
          {navLink("profile", "👤", "My Profile")}
          {navLink("password", "🔒", "Change Password")}
          <hr />
          <Nav.Link style={{ color: "red", cursor: "pointer" }} onClick={handleLogout}>🚪 Logout</Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 24 }}>
        <Container fluid>
          {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">{renderContent()}</Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  )
}

export default DoctorDashboard
