import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Alert, Spinner, Form, Button, Badge } from "react-bootstrap"
import MainLayout from "../layouts/MainLayout"
import api from "../services/api"
import AdminDepartments from "./AdminDepartments"
import AdminDoctors from "./AdminDoctors"
import AdminNotices from "./AdminNotices"
import AdminAppointments from "./AdminAppointments"
import AdminReports from "./AdminReports"
import AdminSettings from "./AdminSettings"

const NO_HOSPITAL = (
  <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "10px", padding: "16px" }}>
    <p style={{ margin: 0, color: "#92400E" }}>⚠️ No hospital assigned. Contact Super Admin.</p>
  </div>
)

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [adminData, setAdminData] = useState(null)
  const [hospitalData, setHospitalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const [facilitiesList, setFacilitiesList] = useState([])
  const [editingFacility, setEditingFacility] = useState(null)
  const [editFacilityValue, setEditFacilityValue] = useState("")
  const [newFacility, setNewFacility] = useState("")
  const [savingFacilities, setSavingFacilities] = useState(false)
  const [logoFile, setLogoFile] = useState(null)

  const [activitiesList, setActivitiesList] = useState([])
  const [editingActivity, setEditingActivity] = useState(null)
  const [editActivityValue, setEditActivityValue] = useState("")
  const [newActivity, setNewActivity] = useState("")
  const [savingActivities, setSavingActivities] = useState(false)

  const [hoursForm, setHoursForm] = useState({
    opening_time: "", closing_time: "",
    weekend_open: false,
    weekend_opening_time: "", weekend_closing_time: ""
  })
  const [savingHours, setSavingHours] = useState(false)

  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [changingPassword, setChangingPassword] = useState(false)

  const [dashStats, setDashStats] = useState({ doctors: 0, activeDoctors: 0, departments: 0, notices: 0 })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) { setError("User data not found"); setLoading(false); return }
    fetchData(user.id)
  }, [])

  const fetchData = async (adminId) => {
    try {
      const adminRes = await api.get(`/auth/profile/${adminId}`)
      if (adminRes.data.success) setAdminData(adminRes.data.admin)
    } catch { setError("Failed to load profile") }

    try {
      const hospitalRes = await api.get(`/hospital/by-admin/${adminId}`)
      if (hospitalRes.data.success) {
        const h = hospitalRes.data.data
        setHospitalData(h)
        fetchDashStats(h.id)
        setFacilitiesList(h.facilities ? h.facilities.split(",").map(f => f.trim()).filter(Boolean) : [])
        setActivitiesList(h.activities ? h.activities.split(",").map(a => a.trim()).filter(Boolean) : [])
        setHoursForm({
          opening_time: h.opening_time || "",
          closing_time: h.closing_time || "",
          weekend_open: !!h.weekend_open,
          weekend_opening_time: h.weekend_opening_time || "",
          weekend_closing_time: h.weekend_closing_time || ""
        })
      }
    } catch { setHospitalData(null) }

    setLoading(false)
  }

  const fetchDashStats = async (hospitalId) => {
    try {
      const [d, dep, n] = await Promise.all([
        api.get(`/admin-doctor/hospital/${hospitalId}`),
        api.get(`/admin-department/${hospitalId}`),
        api.get(`/notice/${hospitalId}`)
      ])
      setDashStats({
        doctors: d.data.success ? d.data.data.length : 0,
        activeDoctors: d.data.success ? d.data.data.filter(x => x.status === "Active").length : 0,
        departments: dep.data.success ? dep.data.data.length : 0,
        notices: n.data.success ? n.data.data.filter(x => x.status === "Active").length : 0
      })
    } catch {}
  }

  const getAdminId = () => JSON.parse(localStorage.getItem("user") || "{}").id

  const saveFacilitiesToDB = async (list) => {
    await api.put(`/hospital/${hospitalData.id}/facilities`, { facilities: list.join(", ") })
  }

  const saveActivitiesToDB = async (list) => {
    await api.put(`/hospital/${hospitalData.id}/activities`, { activities: list.join(", ") })
  }

  const handleAddFacility = async () => {
    if (!newFacility.trim()) return
    const updated = [...facilitiesList, newFacility.trim()]
    setFacilitiesList(updated); setNewFacility("")
    try { await saveFacilitiesToDB(updated); setSuccessMsg("Facility added!"); setTimeout(() => setSuccessMsg(""), 2000) }
    catch { setError("Failed to add facility") }
  }

  const handleDeleteFacility = async (index) => {
    const updated = facilitiesList.filter((_, i) => i !== index)
    setFacilitiesList(updated)
    try { await saveFacilitiesToDB(updated); setSuccessMsg("Facility deleted!"); setTimeout(() => setSuccessMsg(""), 2000) }
    catch { setError("Failed to delete facility") }
  }

  const handleEditFacility = (index) => { setEditingFacility(index); setEditFacilityValue(facilitiesList[index]) }

  const handleSaveEditFacility = async (index) => {
    const updated = [...facilitiesList]
    updated[index] = editFacilityValue.trim()
    const filtered = updated.filter(Boolean)
    setFacilitiesList(filtered); setEditingFacility(null)
    try { await saveFacilitiesToDB(filtered); setSuccessMsg("Facility updated!"); setTimeout(() => setSuccessMsg(""), 2000) }
    catch { setError("Failed to update facility") }
  }

  const handleSaveFacilities = async () => {
    setSavingFacilities(true); setError(""); setSuccessMsg("")
    try {
      await saveFacilitiesToDB(facilitiesList)
      if (logoFile) {
        const fd = new FormData()
        fd.append("logo", logoFile)
        fd.append("facilities", facilitiesList.join(", "))
        await api.put(`/hospital/${hospitalData.id}/details`, fd, { headers: { "Content-Type": "multipart/form-data" } })
      }
      setSuccessMsg("Saved!"); fetchData(getAdminId())
    } catch (err) { setError(err.response?.data?.message || "Failed to save") }
    finally { setSavingFacilities(false) }
  }

  const handleAddActivity = async () => {
    if (!newActivity.trim()) return
    const updated = [...activitiesList, newActivity.trim()]
    setActivitiesList(updated); setNewActivity("")
    try { await saveActivitiesToDB(updated); setSuccessMsg("Activity added!"); setTimeout(() => setSuccessMsg(""), 2000) }
    catch { setError("Failed to add activity") }
  }

  const handleDeleteActivity = async (index) => {
    const updated = activitiesList.filter((_, i) => i !== index)
    setActivitiesList(updated)
    try { await saveActivitiesToDB(updated); setSuccessMsg("Activity deleted!"); setTimeout(() => setSuccessMsg(""), 2000) }
    catch { setError("Failed to delete activity") }
  }

  const handleEditActivity = (index) => { setEditingActivity(index); setEditActivityValue(activitiesList[index]) }

  const handleSaveEditActivity = async (index) => {
    const updated = [...activitiesList]
    updated[index] = editActivityValue.trim()
    const filtered = updated.filter(Boolean)
    setActivitiesList(filtered); setEditingActivity(null)
    try { await saveActivitiesToDB(filtered); setSuccessMsg("Activity updated!"); setTimeout(() => setSuccessMsg(""), 2000) }
    catch { setError("Failed to update activity") }
  }

  const handleSaveActivities = async () => {
    setSavingActivities(true); setError(""); setSuccessMsg("")
    try { await saveActivitiesToDB(activitiesList); setSuccessMsg("Activities saved!"); fetchData(getAdminId()) }
    catch (err) { setError(err.response?.data?.message || "Failed to save activities") }
    finally { setSavingActivities(false) }
  }

  const handleSaveHours = async (e) => {
    e.preventDefault()
    setSavingHours(true); setError(""); setSuccessMsg("")
    try { await api.put(`/hospital/${hospitalData.id}/hours`, hoursForm); setSuccessMsg("Hours saved!"); fetchData(getAdminId()) }
    catch (err) { setError(err.response?.data?.message || "Failed to save hours") }
    finally { setSavingHours(false) }
  }

  const handleClearHours = async () => {
    const cleared = { opening_time: "", closing_time: "", weekend_open: false, weekend_opening_time: "", weekend_closing_time: "" }
    setHoursForm(cleared)
    try { await api.put(`/hospital/${hospitalData.id}/hours`, cleared); setSuccessMsg("Hours cleared!"); setTimeout(() => setSuccessMsg(""), 2000) }
    catch { setError("Failed to clear hours") }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword)
      return setError("All fields are required")
    if (passwordData.newPassword !== passwordData.confirmPassword) return setError("Passwords do not match")
    if (passwordData.newPassword.length < 6) return setError("New password must be at least 6 characters")
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setChangingPassword(true); setError(""); setSuccessMsg("")
    try {
      const res = await api.post("/auth/change-password", { adminId: user.id, currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      if (res.data.success) { setSuccessMsg("Password changed successfully!"); setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }) }
    } catch (err) { setError(err.response?.data?.message || "Failed to change password") }
    finally { setChangingPassword(false) }
  }

  if (loading) return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab} hospitalName={hospitalData?.clinic_name}>
      <Container className="py-5 text-center"><Spinner animation="border" /></Container>
    </MainLayout>
  )

  const renderContent = () => {
    switch (activeTab) {

      case "overview": {
        const statCards = [
          { label: "Total Doctors", value: dashStats.doctors, icon: "👨⚕️", bg: "#EFF6FF", color: "#2563EB", tab: "doctors" },
          { label: "Active Doctors", value: dashStats.activeDoctors, icon: "✅", bg: "#F0FDF4", color: "#16A34A", tab: "doctors" },
          { label: "Departments", value: dashStats.departments, icon: "🏢", bg: "#FDF4FF", color: "#9333EA", tab: "departments" },
          { label: "Active Notices", value: dashStats.notices, icon: "📢", bg: "#FFF7ED", color: "#EA580C", tab: "notices" },
        ]
        return (
          <>
            <h4 className="fw-bold mb-1">Hospital Admin Dashboard</h4>
            <p className="text-muted mb-4">Welcome, {adminData?.name} 👋</p>
            {!hospitalData && (
              <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" }}>
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>⚠️ No Hospital Assigned</div>
                <p style={{ margin: 0, color: "#92400E", fontSize: "14px" }}>Your account is not linked to any hospital yet. Please contact the Super Admin.</p>
              </div>
            )}
            <Row className="mb-3">
              {statCards.map(s => (
                <Col md={3} sm={6} className="mb-3" key={s.label}>
                  <Card className="border-0 h-100" style={{ background: s.bg, borderRadius: "14px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                    onClick={() => setActiveTab(s.tab)}>
                    <Card.Body className="d-flex align-items-center gap-3 py-3">
                      <div style={{ fontSize: "28px" }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize: "12px", color: s.color, fontWeight: "500" }}>{s.label}</div>
                        <div style={{ fontSize: "26px", fontWeight: "700", color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <Row>
              <Col md={3} className="mb-3"><Card className="shadow-sm border-0 h-100"><Card.Body>
                <div className="text-muted small mb-1">Hospital</div>
                <h6 className="fw-bold">{hospitalData?.clinic_name || "N/A"}</h6>
              </Card.Body></Card></Col>
              <Col md={3} className="mb-3"><Card className="shadow-sm border-0 h-100"><Card.Body>
                <div className="text-muted small mb-1">Total Logins</div>
                <h2 className="fw-bold">{adminData?.login_count || 0}</h2>
              </Card.Body></Card></Col>
              <Col md={3} className="mb-3"><Card className="shadow-sm border-0 h-100"><Card.Body>
                <div className="text-muted small mb-1">Last Login</div>
                <p className="mb-0 small">{adminData?.last_login ? new Date(adminData.last_login).toLocaleString() : "Never"}</p>
              </Card.Body></Card></Col>
              <Col md={3} className="mb-3"><Card className="shadow-sm border-0 h-100"><Card.Body>
                <div className="text-muted small mb-1">Status</div>
                <Badge bg="success">{adminData?.status}</Badge>
              </Card.Body></Card></Col>
            </Row>
            <Row className="mt-2">
              <Col md={6} className="mb-3"><Card className="shadow-sm border-0"><Card.Body>
                <div className="text-muted small mb-1">City</div>
                <h6>{hospitalData?.city || "N/A"}</h6>
              </Card.Body></Card></Col>
              <Col md={6} className="mb-3"><Card className="shadow-sm border-0"><Card.Body>
                <div className="text-muted small mb-1">Opening Hours</div>
                <h6>{hospitalData?.opening_time && hospitalData?.closing_time ? `${hospitalData.opening_time} - ${hospitalData.closing_time}` : "Not set"}</h6>
              </Card.Body></Card></Col>
            </Row>
          </>
        )
      }

      case "info":
        return (
          <>
            <h5 className="fw-bold mb-4">🏥 Hospital Information</h5>
            {!hospitalData ? NO_HOSPITAL : (
              <>
                {hospitalData.logo && (
                  <div className="mb-4">
                    <img src={`http://localhost:5000${hospitalData.logo}`} alt="Hospital Logo"
                      style={{ height: "80px", objectFit: "contain", borderRadius: "8px", border: "1px solid #ddd", padding: "4px" }} />
                  </div>
                )}
                <Row>
                  {[
                    ["Hospital Name", hospitalData.clinic_name],
                    ["Address", hospitalData.address],
                    ["City", hospitalData.city],
                    ["State", hospitalData.state],
                    ["Country", hospitalData.country],
                    ["Pincode", hospitalData.pincode],
                    ["Status", hospitalData.status],
                    ["Opening Time", hospitalData.opening_time],
                    ["Closing Time", hospitalData.closing_time],
                    ["Weekend Open", hospitalData.weekend_open ? "Yes" : "No"],
                    ["Weekend Opening", hospitalData.weekend_opening_time],
                    ["Weekend Closing", hospitalData.weekend_closing_time],
                  ].map(([label, value]) => (
                    <Col md={6} className="mb-3" key={label}>
                      <div className="text-muted small">{label}</div>
                      <div className="fw-semibold">{value || "N/A"}</div>
                    </Col>
                  ))}
                </Row>
                <hr />
                <div className="mb-4">
                  <div className="fw-semibold mb-2">🛏️ Facilities</div>
                  {facilitiesList.length === 0 ? <p className="text-muted small">No facilities added yet.</p> : (
                    <div className="d-flex flex-wrap gap-2">
                      {facilitiesList.map((f, i) => (
                        <span key={i} style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", borderRadius: "20px", padding: "4px 14px", fontSize: "13px", fontWeight: "500" }}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="fw-semibold mb-2">📋 Activities</div>
                  {activitiesList.length === 0 ? <p className="text-muted small">No activities added yet.</p> : (
                    <div className="d-flex flex-wrap gap-2">
                      {activitiesList.map((a, i) => (
                        <span key={i} style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", borderRadius: "20px", padding: "4px 14px", fontSize: "13px", fontWeight: "500" }}>{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )

      case "facilities":
        return (
          <>
            <h5 className="fw-bold mb-4">🛏️ Hospital Facilities</h5>
            {!hospitalData ? NO_HOSPITAL : (
              <>
                <div className="d-flex gap-2 mb-4">
                  <Form.Control placeholder="Add new facility (e.g. ICU)" value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFacility())} />
                  <Button variant="success" onClick={handleAddFacility}>+ Add</Button>
                </div>
                {facilitiesList.length === 0 ? <p className="text-muted">No facilities added yet.</p> : (
                  <div className="mb-4">
                    {facilitiesList.map((facility, index) => (
                      <div key={index} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded bg-light">
                        {editingFacility === index ? (
                          <>
                            <Form.Control size="sm" value={editFacilityValue}
                              onChange={(e) => setEditFacilityValue(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEditFacility(index)} autoFocus />
                            <Button size="sm" variant="primary" onClick={() => handleSaveEditFacility(index)}>✓ Save</Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingFacility(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-grow-1 fw-semibold">{facility}</span>
                            <Button size="sm" variant="outline-warning" onClick={() => handleEditFacility(index)}>✏️ Edit</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDeleteFacility(index)}>🗑️ Delete</Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Hospital Logo</Form.Label>
                  {hospitalData.logo && (
                    <div className="mb-2">
                      <img src={`http://localhost:5000${hospitalData.logo}`} alt="Current Logo"
                        style={{ height: "60px", objectFit: "contain", border: "1px solid #ddd", borderRadius: "6px", padding: "4px" }} />
                      <div className="text-muted small mt-1">Current logo</div>
                    </div>
                  )}
                  <Form.Control type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                </Form.Group>
                <Button variant="primary" onClick={handleSaveFacilities} disabled={savingFacilities}>
                  {savingFacilities ? <Spinner animation="border" size="sm" className="me-1" /> : null} Save Logo
                </Button>
              </>
            )}
          </>
        )

      case "activities":
        return (
          <>
            <h5 className="fw-bold mb-4">📋 Hospital Activities</h5>
            {!hospitalData ? NO_HOSPITAL : (
              <>
                <div className="d-flex gap-2 mb-4">
                  <Form.Control placeholder="Add new activity (e.g. Blood Donation Drive)" value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddActivity())} />
                  <Button variant="success" onClick={handleAddActivity}>+ Add</Button>
                </div>
                {activitiesList.length === 0 ? <p className="text-muted">No activities added yet.</p> : (
                  <div className="mb-4">
                    {activitiesList.map((activity, index) => (
                      <div key={index} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded bg-light">
                        {editingActivity === index ? (
                          <>
                            <Form.Control size="sm" value={editActivityValue}
                              onChange={(e) => setEditActivityValue(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEditActivity(index)} autoFocus />
                            <Button size="sm" variant="primary" onClick={() => handleSaveEditActivity(index)}>✓ Save</Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingActivity(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-grow-1 fw-semibold">{activity}</span>
                            <Button size="sm" variant="outline-warning" onClick={() => handleEditActivity(index)}>✏️ Edit</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDeleteActivity(index)}>🗑️ Delete</Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {activitiesList.length > 0 && (
                  <div className="mb-4">
                    <div className="text-muted small mb-2">Preview:</div>
                    <div className="d-flex flex-wrap gap-2">
                      {activitiesList.map((a, i) => <Badge key={i} bg="info" text="dark" className="px-3 py-2">{a}</Badge>)}
                    </div>
                  </div>
                )}
                <Button variant="primary" onClick={handleSaveActivities} disabled={savingActivities}>
                  {savingActivities ? <Spinner animation="border" size="sm" className="me-1" /> : null} Save Activities
                </Button>
              </>
            )}
          </>
        )

      case "hours":
        return (
          <>
            <h5 className="fw-bold mb-4">🕐 Opening Hours</h5>
            {!hospitalData ? NO_HOSPITAL : (
              <Form onSubmit={handleSaveHours} style={{ maxWidth: "450px" }}>
                <Row className="mb-3">
                  <Col>
                    <Form.Label>Opening Time</Form.Label>
                    <Form.Control type="time" value={hoursForm.opening_time}
                      onChange={(e) => setHoursForm({ ...hoursForm, opening_time: e.target.value })} />
                  </Col>
                  <Col>
                    <Form.Label>Closing Time</Form.Label>
                    <Form.Control type="time" value={hoursForm.closing_time}
                      onChange={(e) => setHoursForm({ ...hoursForm, closing_time: e.target.value })} />
                  </Col>
                </Row>
                {hospitalData.opening_time && (
                  <div className="mb-3 p-2 bg-light border rounded d-flex align-items-center justify-content-between">
                    <span className="text-muted small">
                      Current: <strong>{hospitalData.opening_time} – {hospitalData.closing_time}</strong>
                      {hospitalData.weekend_open ? ` | Weekend: ${hospitalData.weekend_opening_time} – ${hospitalData.weekend_closing_time}` : " | Weekends closed"}
                    </span>
                    <Button size="sm" variant="outline-danger" onClick={handleClearHours}>🗑️ Clear</Button>
                  </div>
                )}
                <Form.Check type="switch" label="Open on Weekends"
                  checked={hoursForm.weekend_open}
                  onChange={(e) => setHoursForm({ ...hoursForm, weekend_open: e.target.checked })}
                  className="mb-3" />
                {hoursForm.weekend_open && (
                  <Row className="mb-3">
                    <Col>
                      <Form.Label>Weekend Opening</Form.Label>
                      <Form.Control type="time" value={hoursForm.weekend_opening_time}
                        onChange={(e) => setHoursForm({ ...hoursForm, weekend_opening_time: e.target.value })} />
                    </Col>
                    <Col>
                      <Form.Label>Weekend Closing</Form.Label>
                      <Form.Control type="time" value={hoursForm.weekend_closing_time}
                        onChange={(e) => setHoursForm({ ...hoursForm, weekend_closing_time: e.target.value })} />
                    </Col>
                  </Row>
                )}
                <Button type="submit" variant="primary" disabled={savingHours}>
                  {savingHours ? <Spinner animation="border" size="sm" className="me-1" /> : null} Save Hours
                </Button>
              </Form>
            )}
          </>
        )

      case "departments":
        return (
          <>
            <h5 className="fw-bold mb-4">🏢 Departments</h5>
            <AdminDepartments hospitalId={hospitalData?.id} />
          </>
        )

      case "doctors":
        return (
          <>
            <h5 className="fw-bold mb-4">👨‍⚕️ Doctors</h5>
            <AdminDoctors hospitalId={hospitalData?.id} />
          </>
        )

      case "notices":
        return <AdminNotices hospitalId={hospitalData?.id} />

      case "appointments":
        return <AdminAppointments hospitalId={hospitalData?.id} />

      case "reports":
        return <AdminReports hospitalId={hospitalData?.id} hospitalData={hospitalData} />

      case "settings":
        return <AdminSettings adminData={adminData} hospitalData={hospitalData} onRefresh={fetchData} />

      case "profile":
        return (
          <>
            <h5 className="fw-bold mb-4">👤 My Profile</h5>
            <Row>
              {[
                ["Name", adminData?.name],
                ["Email", adminData?.email],
                ["Status", adminData?.status],
                ["Total Logins", adminData?.login_count || 0],
                ["Last Login", adminData?.last_login ? new Date(adminData.last_login).toLocaleString() : "Never"]
              ].map(([label, value]) => (
                <Col md={6} className="mb-3" key={label}>
                  <div className="text-muted small">{label}</div>
                  <div className="fw-semibold">{value}</div>
                </Col>
              ))}
            </Row>
          </>
        )

      case "password":
        return (
          <>
            <h5 className="fw-bold mb-4">🔒 Change Password</h5>
            <Form onSubmit={handlePasswordChange} style={{ maxWidth: "400px" }}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control type="password" value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control type="password" value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password" />
              </Form.Group>
              <Button type="submit" variant="primary" disabled={changingPassword}>
                {changingPassword ? <Spinner animation="border" size="sm" className="me-1" /> : null} Change Password
              </Button>
            </Form>
          </>
        )

      default:
        return null
    }
  }

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab} hospitalName={hospitalData?.clinic_name}>
      <Container fluid>
        {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
        {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            {renderContent()}
          </Card.Body>
        </Card>
      </Container>
    </MainLayout>
  )
}

export default AdminDashboard
