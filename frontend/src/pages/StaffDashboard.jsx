import { useEffect, useState } from "react"
import { Container, Card, Row, Col, Badge, Nav, Spinner, Alert, Form, Button } from "react-bootstrap"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [staffData, setStaffData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [profileForm, setProfileForm] = useState({
    phone: "", dob: "", gender: "", blood_group: "",
    address: "", city: "", state: "", country: "", pincode: "",
    shift_start: "", shift_end: ""
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" })

  const [pwData, setPwData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState("")

  const [imgUploading, setImgUploading] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const formData = new FormData()
    formData.append("image", file)
    setImgUploading(true)
    try {
      const res = await api.post(`/staff/${user.id}/image`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      if (res.data.success) {
        setStaffData(prev => ({ ...prev, profile_image: res.data.filename }))
      }
    } catch { setProfileMsg({ type: "danger", text: "Failed to upload image" }) }
    setImgUploading(false)
  }

  const imgUrl = staffData?.profile_image ? `http://localhost:5000/uploads/${staffData.profile_image}` : null

  const navigate = useNavigate()

  const fetchStaff = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) return
    return api.get(`/staff/${user.id}`).then(res => {
      if (res.data.success) {
        const d = res.data.data
        setStaffData(d)
        setProfileForm({
          phone: d.phone || "", dob: d.dob ? d.dob.split("T")[0] : "",
          gender: d.gender || "", blood_group: d.blood_group || "",
          address: d.address || "", city: d.city || "",
          state: d.state || "", country: d.country || "", pincode: d.pincode || "",
          shift_start: d.shift_start || "", shift_end: d.shift_end || ""
        })
      }
    })
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) { setError("User data not found"); setLoading(false); return }
    fetchStaff()?.catch((err) => setError(err.response?.data?.message || "Failed to load profile"))
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

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true); setProfileMsg({ type: "", text: "" })
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    try {
      await api.put(`/staff/${user.id}/profile`, profileForm)
      await fetchStaff()
      setProfileMsg({ type: "success", text: "Profile updated successfully!" })
      setTimeout(() => setProfileMsg({ type: "", text: "" }), 3000)
    } catch (err) {
      setProfileMsg({ type: "danger", text: err.response?.data?.message || "Failed to update profile" })
    }
    setProfileSaving(false)
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
      const res = await api.post("/staff/change-password", { staffId: user.id, currentPassword: pwData.currentPassword, newPassword: pwData.newPassword })
      if (res.data.success) {
        setPwSuccess("Password changed! Please login again.")
        setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setTimeout(() => {
          localStorage.removeItem("token"); localStorage.removeItem("user"); localStorage.removeItem("role")
          navigate("/")
        }, 2000)
      }
    } catch (err) { setPwError(err.response?.data?.message || "Failed to change password") }
    setPwLoading(false)
  }

  const navLink = (tab, icon, label) => (
    <Nav.Link key={tab} onClick={() => setActiveTab(tab)}
      style={{
        cursor: "pointer", fontWeight: activeTab === tab ? "600" : "normal",
        color: activeTab === tab ? "#0d6efd" : "#333",
        background: activeTab === tab ? "#e8f0fe" : "transparent",
        borderRadius: "6px", marginBottom: "2px", padding: "8px 12px"
      }}>
      {icon} {label}
    </Nav.Link>
  )

  const infoRow = (label, value) => (
    <Col md={4} className="mb-3" key={label}>
      <div style={{ fontSize: ".72rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</div>
      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: ".88rem" }}>{value || "—"}</div>
    </Col>
  )

  const renderContent = () => {
    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>
    if (!staffData) return <Alert variant="warning">Profile not found. Contact your admin.</Alert>

    switch (activeTab) {
      case "overview":
        return (
          <>
            <h4 className="fw-bold mb-1">Staff Dashboard</h4>
            <p className="text-muted mb-4">Welcome, {staffData.name} 👋</p>
            <Row>
              {[
                ["Department", staffData.department_name],
                ["Designation", staffData.designation_name],
                ["Role", staffData.role],
                ["Employment", staffData.employment_type],
                ["Shift", staffData.shift_start && staffData.shift_end ? `${staffData.shift_start} – ${staffData.shift_end}` : null],
                ["Status", <Badge bg={staffData.status === "Active" ? "success" : "danger"}>{staffData.status}</Badge>],
              ].map(([label, val]) => (
                <Col md={4} className="mb-3" key={label}>
                  <Card className="shadow-sm border-0"><Card.Body>
                    <div className="text-muted small mb-1">{label}</div>
                    <h6 className="fw-bold mb-0">{val || "N/A"}</h6>
                  </Card.Body></Card>
                </Col>
              ))}
            </Row>
            <Row className="mt-2">
              {[
                ["Email", staffData.email],
                ["Phone", staffData.phone],
                ["Gender", staffData.gender],
                ["Blood Group", staffData.blood_group],
                ["Date of Birth", staffData.dob ? staffData.dob.split("T")[0] : null],
              ].map(([label, val]) => (
                <Col md={4} className="mb-3" key={label}>
                  <Card className="shadow-sm border-0"><Card.Body>
                    <div className="text-muted small mb-1">{label}</div>
                    <h6>{val || "Not set"}</h6>
                  </Card.Body></Card>
                </Col>
              ))}
            </Row>
          </>
        )

      case "profile":
        return (
          <>
            <h5 className="fw-bold mb-4">👤 My Profile</h5>

            {/* Read-only info */}
            <div style={{ background: "#f8faff", border: "1px solid #e5e8f0", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#1a56db", marginBottom: 12 }}>Work Assignment (set by admin)</div>
              <Row>
                {[
                  ["Department", staffData.department_name],
                  ["Designation", staffData.designation_name],
                  ["Role", staffData.role],
                  ["Employment Type", staffData.employment_type],
                  ["Status", staffData.status],
                ].map(([label, val]) => infoRow(label, val))}
              </Row>
            </div>

            {profileMsg.text && <Alert variant={profileMsg.type} style={{ borderRadius: 8, fontSize: ".86rem" }}>{profileMsg.text}</Alert>}

            {/* Profile Image Upload */}
            <div className="mb-4 d-flex align-items-center gap-3">
              {imgUrl
                ? <img src={imgUrl} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e8f0" }} />
                : <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#e8effd,#c7d7fa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#1a56db", border: "3px solid #e5e8f0" }}>
                    {staffData?.name?.[0]?.toUpperCase() || "S"}
                  </div>}
              <div>
                <label style={{ cursor: "pointer", background: "#1a56db", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: ".82rem", fontWeight: 600, display: "inline-block" }}>
                  {imgUploading ? "Uploading..." : "📷 Change Photo"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} disabled={imgUploading} />
                </label>
                <div style={{ fontSize: ".74rem", color: "#6b7280", marginTop: 4 }}>JPG, PNG, WEBP — max 10MB</div>
              </div>
            </div>
            <Form onSubmit={handleSaveProfile}>
              <div style={{ fontSize: ".74rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#1a56db", marginBottom: 12 }}>Personal Info</div>
              <Row className="g-3 mb-4">
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>Phone</Form.Label>
                  <Form.Control value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+91 98765 43210" style={{ borderRadius: 8 }} />
                </Col>
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>Date of Birth</Form.Label>
                  <Form.Control type="date" value={profileForm.dob} onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })} style={{ borderRadius: 8 }} />
                </Col>
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>Gender</Form.Label>
                  <Form.Select value={profileForm.gender} onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })} style={{ borderRadius: 8 }}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>Blood Group</Form.Label>
                  <Form.Select value={profileForm.blood_group} onChange={e => setProfileForm({ ...profileForm, blood_group: e.target.value })} style={{ borderRadius: 8 }}>
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>Shift Start</Form.Label>
                  <Form.Control type="time" value={profileForm.shift_start} onChange={e => setProfileForm({ ...profileForm, shift_start: e.target.value })} style={{ borderRadius: 8 }} />
                </Col>
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>Shift End</Form.Label>
                  <Form.Control type="time" value={profileForm.shift_end} onChange={e => setProfileForm({ ...profileForm, shift_end: e.target.value })} style={{ borderRadius: 8 }} />
                </Col>
              </Row>

              <div style={{ fontSize: ".74rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#1a56db", marginBottom: 12 }}>Address</div>
              <Row className="g-3 mb-4">
                <Col md={12}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>Address</Form.Label>
                  <Form.Control value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} placeholder="Street address" style={{ borderRadius: 8 }} />
                </Col>
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>City</Form.Label>
                  <Form.Control value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} placeholder="City" style={{ borderRadius: 8 }} />
                </Col>
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>State</Form.Label>
                  <Form.Control value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} placeholder="State" style={{ borderRadius: 8 }} />
                </Col>
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>Pincode</Form.Label>
                  <Form.Control value={profileForm.pincode} onChange={e => setProfileForm({ ...profileForm, pincode: e.target.value })} placeholder="Pincode" style={{ borderRadius: 8 }} />
                </Col>
                <Col md={4}>
                  <Form.Label style={{ fontSize: ".79rem", fontWeight: 600 }}>Country</Form.Label>
                  <Form.Control value={profileForm.country} onChange={e => setProfileForm({ ...profileForm, country: e.target.value })} placeholder="Country" style={{ borderRadius: 8 }} />
                </Col>
              </Row>

              <Button type="submit" variant="primary" disabled={profileSaving} style={{ borderRadius: 8, fontWeight: 600 }}>
                {profileSaving && <Spinner animation="border" size="sm" className="me-1" />}
                Save Changes
              </Button>
            </Form>
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
              <Button type="submit" variant="primary" disabled={pwLoading} style={{ borderRadius: 8, fontWeight: 600 }}>
                {pwLoading && <Spinner animation="border" size="sm" className="me-1" />}
                Change Password
              </Button>
            </Form>
          </>
        )

      default: return null
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      <div style={{ width: 250, minHeight: "100vh", background: "#fff", borderRight: "1px solid #ddd", padding: 20 }}>
        <div className="mb-4">
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Staff Portal</div>
          <div className="text-center mb-3">
            {imgUrl
              ? <img src={imgUrl} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e8f0" }} />
              : <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg,#e8effd,#c7d7fa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#1a56db", margin: "0 auto", border: "3px solid #e5e8f0" }}>
                  {staffData?.name?.[0]?.toUpperCase() || "S"}
                </div>}
          </div>
          <h6 style={{ fontWeight: 700, color: "#0F172A", margin: 0, fontSize: 15, textAlign: "center" }}>
            👤 {staffData?.name || "Loading..."}
          </h6>
          {staffData?.designation_name && (
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{staffData.designation_name}</div>
          )}
          {staffData?.department_name && (
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>🏢 {staffData.department_name}</div>
          )}
          {staffData?.employment_type && (
            <div style={{ fontSize: 11, marginTop: 4, display: "inline-block", background: staffData.employment_type === "Full Time" ? "#dcfce7" : "#fef9c3", color: staffData.employment_type === "Full Time" ? "#15803d" : "#854d0e", borderRadius: 4, padding: "1px 7px", fontWeight: 600 }}>
              {staffData.employment_type}
            </div>
          )}
        </div>
        <Nav className="flex-column">
          {navLink("overview", "📊", "Dashboard")}
          {navLink("profile", "👤", "My Profile")}
          {navLink("password", "🔒", "Change Password")}
          <hr />
          <Nav.Link style={{ color: "red", cursor: "pointer" }} onClick={handleLogout}>🚪 Logout</Nav.Link>
        </Nav>
      </div>

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

export default StaffDashboard
