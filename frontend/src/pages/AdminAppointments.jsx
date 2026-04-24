import { useEffect, useState } from "react"
import { Container, Card, Table, Spinner, Alert, Modal, Form, Row, Col, Badge } from "react-bootstrap"
import api from "../services/api"

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"]
const STATUS_STYLES = {
  Pending:   { bg: "#FEFCE8", color: "#CA8A04", border: "#FDE68A" },
  Confirmed: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  Completed: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  Cancelled: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
}
const TYPE_STYLES = {
  Online:  { bg: "#F0FDF4", color: "#059669" },
  Offline: { bg: "#EFF6FF", color: "#2563EB" },
}

const emptyForm = {
  doctor_id: "", patient_name: "", patient_phone: "", patient_age: "",
  patient_gender: "", appointment_date: "", appointment_time: "",
  type: "Offline", status: "Pending", notes: ""
}

const AdminAppointments = ({ hospitalId }) => {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterDoctor, setFilterDoctor] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (hospitalId) { fetchAppointments(); fetchDoctors() } }, [hospitalId])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/appointment/hospital/${hospitalId}`)
      if (res.data.success) setAppointments(res.data.data)
    } catch { setError("Failed to load appointments") }
    finally { setLoading(false) }
  }

  const fetchDoctors = async () => {
    try {
      const res = await api.get(`/admin-doctor/hospital/${hospitalId}`)
      if (res.data.success) setDoctors(res.data.data.filter(d => d.status === "Active"))
    } catch {}
  }

  const openAdd = () => { setEditData(null); setForm(emptyForm); setError(""); setShowModal(true) }

  const openEdit = (a) => {
    setEditData(a)
    setForm({
      doctor_id: a.doctor_id, patient_name: a.patient_name, patient_phone: a.patient_phone || "",
      patient_age: a.patient_age || "", patient_gender: a.patient_gender || "",
      appointment_date: a.appointment_date?.split("T")[0] || "",
      appointment_time: a.appointment_time || "", type: a.type, status: a.status, notes: a.notes || ""
    })
    setError(""); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.doctor_id || !form.patient_name.trim() || !form.appointment_date || !form.appointment_time)
      return setError("Doctor, patient name, date and time are required")
    setSaving(true); setError("")
    try {
      if (editData) {
        await api.put(`/appointment/${editData.id}`, form)
        setSuccess("Appointment updated!")
      } else {
        await api.post("/appointment", { ...form, hospital_id: hospitalId })
        setSuccess("Appointment created!")
      }
      setShowModal(false); fetchAppointments()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.response?.data?.message || "Failed to save") }
    finally { setSaving(false) }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/appointment/${id}/status`, { status })
      fetchAppointments()
    } catch { setError("Failed to update status") }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/appointment/${deleteTarget.id}`)
      setSuccess("Appointment deleted!"); setShowDeleteModal(false); fetchAppointments()
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Failed to delete") }
    finally { setDeleting(false) }
  }

  const filtered = appointments.filter(a => {
    const matchSearch = a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "All" || a.status === filterStatus
    const matchDoctor = filterDoctor === "All" || String(a.doctor_id) === String(filterDoctor)
    return matchSearch && matchStatus && matchDoctor
  })

  const th = { background: "#F8FAFC", fontSize: "11px", fontWeight: "600", color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase", padding: "12px 14px" }
  const td = { padding: "13px 14px", verticalAlign: "middle", borderBottom: "1px solid #F1F5F9", fontSize: "13.5px", color: "#475569" }

  if (!hospitalId) return (
    <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "10px", padding: "16px" }}>
      <p style={{ margin: 0, color: "#92400E" }}>⚠️ No hospital assigned.</p>
    </div>
  )

  return (
    <Container fluid>
      {error && <Alert variant="danger" dismissible onClose={() => setError("")} style={{ borderRadius: "10px", fontSize: "13.5px" }}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")} style={{ borderRadius: "10px", fontSize: "13.5px" }}>{success}</Alert>}

      <Card style={{ border: "none", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "20px 24px" }}>
          <Row className="align-items-center g-3">
            <Col>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📅</div>
                <div>
                  <h5 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A", margin: 0 }}>Appointments</h5>
                  <p style={{ fontSize: "13px", color: "#94A3B8", margin: "2px 0 0" }}>{appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <input placeholder="Search patient / doctor..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ height: "36px", padding: "0 12px", border: "1px solid #E2E8F0", borderRadius: "9px", fontSize: "13px", outline: "none", width: "200px" }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ height: "36px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "9px", fontSize: "13px", outline: "none" }}>
                  <option value="All">All Status</option>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}
                  style={{ height: "36px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "9px", fontSize: "13px", outline: "none" }}>
                  <option value="All">All Doctors</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button onClick={openAdd} style={{ background: "#2563EB", border: "none", borderRadius: "10px", padding: "0 18px", height: "36px", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px" }}>+</span> Add
                </button>
              </div>
            </Col>
          </Row>
        </div>

        <Card.Body className="p-0">
          {loading ? (
            <div style={{ padding: "64px 0", textAlign: "center" }}><Spinner animation="border" style={{ color: "#2563EB" }} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📅</div>
              <p style={{ fontWeight: "500", color: "#1E293B", marginBottom: "4px" }}>No appointments found</p>
              <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>Add a new appointment to get started</p>
              <button onClick={openAdd} style={{ background: "#2563EB", border: "none", borderRadius: "10px", padding: "0 18px", height: "36px", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: "pointer" }}>+ Add Appointment</button>
            </div>
          ) : (
            <Table responsive className="mb-0">
              <thead>
                <tr>
                  <th style={{ ...th, width: "4%" }}>#</th>
                  <th style={{ ...th, width: "18%" }}>Patient</th>
                  <th style={{ ...th, width: "16%" }}>Doctor</th>
                  <th style={{ ...th, width: "12%" }}>Date</th>
                  <th style={{ ...th, width: "9%" }}>Time</th>
                  <th style={{ ...th, width: "8%" }}>Type</th>
                  <th style={{ ...th, width: "12%" }}>Status</th>
                  <th style={{ ...th, width: "21%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const ss = STATUS_STYLES[a.status] || STATUS_STYLES.Pending
                  const ts = TYPE_STYLES[a.type] || TYPE_STYLES.Offline
                  return (
                    <tr key={a.id}>
                      <td style={{ ...td, color: "#94A3B8" }}>{i + 1}</td>
                      <td style={td}>
                        <div style={{ fontWeight: "500", color: "#1E293B" }}>{a.patient_name}</div>
                        <div style={{ fontSize: "12px", color: "#94A3B8" }}>{a.patient_phone || "—"} {a.patient_age ? `· ${a.patient_age}y` : ""} {a.patient_gender ? `· ${a.patient_gender}` : ""}</div>
                      </td>
                      <td style={{ ...td, fontWeight: "500", color: "#1E293B" }}>{a.doctor_name || "—"}</td>
                      <td style={td}>{a.appointment_date ? new Date(a.appointment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                      <td style={td}>{a.appointment_time || "—"}</td>
                      <td style={td}>
                        <span style={{ background: ts.bg, color: ts.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "500" }}>{a.type}</span>
                      </td>
                      <td style={td}>
                        <select value={a.status} onChange={e => handleStatusChange(a.id, e.target.value)}
                          style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, borderRadius: "20px", padding: "3px 8px", fontSize: "12px", fontWeight: "500", cursor: "pointer", outline: "none" }}>
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => openEdit(a)} style={{ height: "30px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", fontSize: "12px", cursor: "pointer" }}>✏️ Edit</button>
                          <button onClick={() => { setDeleteTarget(a); setShowDeleteModal(true) }} style={{ height: "30px", padding: "0 10px", border: "1px solid #FECACA", borderRadius: "8px", background: "#FEF2F2", color: "#EF4444", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <Modal.Title style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>{editData ? "Edit Appointment" : "Add Appointment"}</Modal.Title>
            <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>{editData ? "Update appointment details" : "Book a new appointment"}</p>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 24px" }}>
          {error && <Alert variant="danger" style={{ fontSize: "13.5px", borderRadius: "10px" }}>{error}</Alert>}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Doctor <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                <Form.Select value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                  <option value="">— Select Doctor —</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Patient Name <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                <Form.Control value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} placeholder="Full name" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Phone</Form.Label>
                <Form.Control value={form.patient_phone} onChange={e => setForm({ ...form, patient_phone: e.target.value })} placeholder="Phone number" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Age</Form.Label>
                <Form.Control type="number" min={0} value={form.patient_age} onChange={e => setForm({ ...form, patient_age: e.target.value })} placeholder="Age" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Gender</Form.Label>
                <Form.Select value={form.patient_gender} onChange={e => setForm({ ...form, patient_gender: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Date <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                <Form.Control type="date" value={form.appointment_date} onChange={e => setForm({ ...form, appointment_date: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Time <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                <Form.Control type="time" value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Type</Form.Label>
                <Form.Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                  <option>Online</option><option>Offline</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {editData && (
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Status</Form.Label>
                  <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Notes</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." style={{ borderRadius: "9px", fontSize: "13.5px", resize: "none" }} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", gap: "8px" }}>
          <button onClick={() => setShowModal(false)} style={{ height: "38px", padding: "0 18px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "9px", background: "#2563EB", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
            {saving && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
            {editData ? "Save Changes" : "Book Appointment"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Body style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "22px" }}>🗑️</div>
          <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "8px" }}>Delete Appointment</h6>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0 }}>Delete appointment for <strong style={{ color: "#1E293B" }}>{deleteTarget?.patient_name}</strong>? This cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer style={{ padding: "0 24px 24px", border: "none", justifyContent: "center", gap: "8px" }}>
          <button onClick={() => setShowDeleteModal(false)} style={{ height: "38px", padding: "0 20px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{ height: "38px", padding: "0 20px", border: "none", borderRadius: "9px", background: "#EF4444", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
            {deleting && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default AdminAppointments
