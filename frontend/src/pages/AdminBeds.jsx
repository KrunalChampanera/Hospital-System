import { useEffect, useState } from "react"
import { Container, Card, Table, Spinner, Alert, Modal, Form, Row, Col } from "react-bootstrap"
import api from "../services/api"

const BED_TYPES = ["General", "ICU", "Private", "Semi-Private", "Emergency"]
const STATUS_STYLES = {
  "Available":          { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  "Occupied":           { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  "Under Maintenance":  { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
}

const emptyForm = { bed_number: "", ward: "", type: "General", status: "Available", patient_name: "", admitted_date: "", notes: "" }

const AdminBeds = ({ hospitalId }) => {
  const [beds, setBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterType, setFilterType] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (hospitalId) fetchBeds() }, [hospitalId])

  const fetchBeds = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/bed/${hospitalId}`)
      if (res.data.success) setBeds(res.data.data)
    } catch { setError("Failed to load beds") }
    finally { setLoading(false) }
  }

  const openAdd = () => { setEditData(null); setForm(emptyForm); setError(""); setShowModal(true) }

  const openEdit = (b) => {
    setEditData(b)
    setForm({
      bed_number: b.bed_number, ward: b.ward || "", type: b.type,
      status: b.status, patient_name: b.patient_name || "",
      admitted_date: b.admitted_date ? b.admitted_date.split("T")[0] : "",
      notes: b.notes || ""
    })
    setError(""); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.bed_number.trim()) return setError("Bed number is required")
    if (form.status === "Occupied" && !form.patient_name.trim()) return setError("Patient name is required when bed is Occupied")
    setSaving(true); setError("")
    try {
      if (editData) {
        await api.put(`/bed/${editData.id}`, form)
        setSuccess("Bed updated!")
      } else {
        await api.post("/bed", { ...form, hospital_id: hospitalId })
        setSuccess("Bed added!")
      }
      setShowModal(false); fetchBeds()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.response?.data?.message || "Failed to save") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/bed/${deleteTarget.id}`)
      setSuccess("Bed deleted!"); setShowDeleteModal(false); fetchBeds()
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Failed to delete") }
    finally { setDeleting(false) }
  }

  const filtered = beds.filter(b => {
    const matchSearch = b.bed_number?.toLowerCase().includes(search.toLowerCase()) ||
      b.ward?.toLowerCase().includes(search.toLowerCase()) ||
      b.patient_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "All" || b.status === filterStatus
    const matchType = filterType === "All" || b.type === filterType
    return matchSearch && matchStatus && matchType
  })

  const available = beds.filter(b => b.status === "Available").length
  const occupied = beds.filter(b => b.status === "Occupied").length
  const maintenance = beds.filter(b => b.status === "Under Maintenance").length

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

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: "Total Beds", value: beds.length, bg: "#EFF6FF", color: "#2563EB", icon: "🛏️" },
          { label: "Available", value: available, bg: "#F0FDF4", color: "#16A34A", icon: "✅" },
          { label: "Occupied", value: occupied, bg: "#FEF2F2", color: "#DC2626", icon: "🔴" },
          { label: "Maintenance", value: maintenance, bg: "#F8FAFC", color: "#64748B", icon: "🔧" },
        ].map(s => (
          <Col md={3} sm={6} key={s.label}>
            <Card style={{ border: "none", borderRadius: "14px", background: s.bg, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <Card.Body className="d-flex align-items-center gap-3 py-3">
                <div style={{ fontSize: "26px" }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: "12px", color: s.color, fontWeight: "500" }}>{s.label}</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ border: "none", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "20px 24px" }}>
          <Row className="align-items-center g-3">
            <Col>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🛏️</div>
                <div>
                  <h5 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A", margin: 0 }}>Bed Management</h5>
                  <p style={{ fontSize: "13px", color: "#94A3B8", margin: "2px 0 0" }}>{beds.length} bed{beds.length !== 1 ? "s" : ""} · {available} available</p>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <input placeholder="Search bed / ward / patient..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ height: "36px", padding: "0 12px", border: "1px solid #E2E8F0", borderRadius: "9px", fontSize: "13px", outline: "none", width: "200px" }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ height: "36px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "9px", fontSize: "13px", outline: "none" }}>
                  <option value="All">All Status</option>
                  <option>Available</option><option>Occupied</option><option>Under Maintenance</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  style={{ height: "36px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "9px", fontSize: "13px", outline: "none" }}>
                  <option value="All">All Types</option>
                  {BED_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={openAdd} style={{ background: "#2563EB", border: "none", borderRadius: "10px", padding: "0 18px", height: "36px", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px" }}>+</span> Add Bed
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
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🛏️</div>
              <p style={{ fontWeight: "500", color: "#1E293B", marginBottom: "4px" }}>No beds found</p>
              <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>Add beds to start tracking availability</p>
              <button onClick={openAdd} style={{ background: "#2563EB", border: "none", borderRadius: "10px", padding: "0 18px", height: "36px", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: "pointer" }}>+ Add Bed</button>
            </div>
          ) : (
            <Table responsive className="mb-0">
              <thead>
                <tr>
                  <th style={{ ...th, width: "4%" }}>#</th>
                  <th style={{ ...th, width: "10%" }}>Bed No.</th>
                  <th style={{ ...th, width: "12%" }}>Ward</th>
                  <th style={{ ...th, width: "12%" }}>Type</th>
                  <th style={{ ...th, width: "14%" }}>Status</th>
                  <th style={{ ...th, width: "18%" }}>Patient</th>
                  <th style={{ ...th, width: "12%" }}>Admitted</th>
                  <th style={{ ...th, width: "18%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const ss = STATUS_STYLES[b.status] || STATUS_STYLES["Available"]
                  return (
                    <tr key={b.id}>
                      <td style={{ ...td, color: "#94A3B8" }}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: "700", color: "#1E293B" }}>{b.bed_number}</td>
                      <td style={td}>{b.ward || "—"}</td>
                      <td style={td}>
                        <span style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "500" }}>
                          {b.type}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "500" }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ ...td, fontWeight: b.patient_name ? "500" : "normal", color: b.patient_name ? "#1E293B" : "#94A3B8" }}>
                        {b.patient_name || "—"}
                      </td>
                      <td style={td}>
                        {b.admitted_date ? new Date(b.admitted_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => openEdit(b)} style={{ height: "30px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", fontSize: "12px", cursor: "pointer" }}>✏️ Edit</button>
                          <button onClick={() => { setDeleteTarget(b); setShowDeleteModal(true) }} style={{ height: "30px", padding: "0 10px", border: "1px solid #FECACA", borderRadius: "8px", background: "#FEF2F2", color: "#EF4444", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <Modal.Title style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>{editData ? "Edit Bed" : "Add Bed"}</Modal.Title>
            <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>{editData ? "Update bed details" : "Add a new bed to the hospital"}</p>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 24px" }}>
          {error && <Alert variant="danger" style={{ fontSize: "13.5px", borderRadius: "10px" }}>{error}</Alert>}
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Bed Number <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                <Form.Control value={form.bed_number} onChange={e => setForm({ ...form, bed_number: e.target.value })} placeholder="e.g. B-101" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Ward</Form.Label>
                <Form.Control value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} placeholder="e.g. General Ward" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Type</Form.Label>
                <Form.Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                  {BED_TYPES.map(t => <option key={t}>{t}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Status</Form.Label>
                <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value, patient_name: e.target.value !== "Occupied" ? "" : form.patient_name, admitted_date: e.target.value !== "Occupied" ? "" : form.admitted_date })}
                  style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                  <option>Available</option><option>Occupied</option><option>Under Maintenance</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {form.status === "Occupied" && (
              <>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Patient Name <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                    <Form.Control value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} placeholder="Patient full name" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Admitted Date</Form.Label>
                    <Form.Control type="date" value={form.admitted_date} onChange={e => setForm({ ...form, admitted_date: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
                  </Form.Group>
                </Col>
              </>
            )}
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Notes</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." style={{ borderRadius: "9px", fontSize: "13.5px", resize: "none" }} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", gap: "8px" }}>
          <button onClick={() => setShowModal(false)} style={{ height: "38px", padding: "0 18px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "9px", background: "#2563EB", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
            {saving && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
            {editData ? "Save Changes" : "Add Bed"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Body style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "22px" }}>🗑️</div>
          <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "8px" }}>Delete Bed</h6>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0 }}>Delete bed <strong style={{ color: "#1E293B" }}>{deleteTarget?.bed_number}</strong>? This cannot be undone.</p>
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

export default AdminBeds
