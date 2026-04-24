import { useEffect, useState } from "react"
import { Container, Card, Table, Spinner, Alert, Modal, Form, Row, Col, Badge } from "react-bootstrap"
import api from "../services/api"

const PRIORITY_STYLES = {
  High:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  Medium: { bg: "#FEFCE8", color: "#CA8A04", border: "#FDE68A" },
  Low:    { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
}

const AdminNotices = ({ hospitalId }) => {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ title: "", message: "", priority: "Medium", status: "Active" })

  useEffect(() => { if (hospitalId) fetchNotices() }, [hospitalId])

  const fetchNotices = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/notice/${hospitalId}`)
      if (res.data.success) setNotices(res.data.data)
    } catch { setError("Failed to load notices") }
    finally { setLoading(false) }
  }

  const openAdd = () => {
    setEditData(null)
    setForm({ title: "", message: "", priority: "Medium", status: "Active" })
    setShowModal(true)
  }

  const openEdit = (n) => {
    setEditData(n)
    setForm({ title: n.title, message: n.message, priority: n.priority, status: n.status })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) return setError("Title and message are required")
    setSaving(true); setError("")
    try {
      if (editData) {
        await api.put(`/notice/${editData.id}`, form)
        setSuccess("Notice updated!")
      } else {
        await api.post("/notice", { ...form, hospital_id: hospitalId })
        setSuccess("Notice created!")
      }
      setShowModal(false)
      fetchNotices()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.response?.data?.message || "Failed to save") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/notice/${deleteTarget.id}`)
      setSuccess("Notice deleted!")
      setShowDeleteModal(false)
      fetchNotices()
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Failed to delete") }
    finally { setDeleting(false) }
  }

  const handleToggleStatus = async (n) => {
    const newStatus = n.status === "Active" ? "Inactive" : "Active"
    try {
      await api.patch(`/notice/${n.id}/status`, { status: newStatus })
      fetchNotices()
    } catch { setError("Failed to update status") }
  }

  const card = { border: "none", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }
  const th = { background: "#F8FAFC", fontSize: "11px", fontWeight: "600", color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase", padding: "12px 16px" }
  const td = { padding: "14px 16px", verticalAlign: "middle", borderBottom: "1px solid #F1F5F9", fontSize: "13.5px", color: "#475569" }

  if (!hospitalId) return (
    <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "10px", padding: "16px" }}>
      <p style={{ margin: 0, color: "#92400E" }}>⚠️ No hospital assigned.</p>
    </div>
  )

  return (
    <Container fluid>
      {error && <Alert variant="danger" dismissible onClose={() => setError("")} style={{ borderRadius: "10px", fontSize: "13.5px" }}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")} style={{ borderRadius: "10px", fontSize: "13.5px" }}>{success}</Alert>}

      <Card style={card}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "20px 24px" }}>
          <Row className="align-items-center g-3">
            <Col>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📢</div>
                <div>
                  <h5 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A", margin: 0 }}>Notice Board</h5>
                  <p style={{ fontSize: "13px", color: "#94A3B8", margin: "2px 0 0" }}>{notices.length} notice{notices.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <button onClick={openAdd} style={{ background: "#2563EB", border: "none", borderRadius: "10px", padding: "0 18px", height: "38px", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "16px" }}>+</span> Add Notice
              </button>
            </Col>
          </Row>
        </div>

        <Card.Body className="p-0">
          {loading ? (
            <div style={{ padding: "64px 0", textAlign: "center" }}>
              <Spinner animation="border" style={{ color: "#2563EB" }} />
            </div>
          ) : notices.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📢</div>
              <p style={{ fontWeight: "500", color: "#1E293B", marginBottom: "4px" }}>No notices yet</p>
              <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>Add a notice to inform your hospital staff</p>
              <button onClick={openAdd} style={{ background: "#2563EB", border: "none", borderRadius: "10px", padding: "0 18px", height: "38px", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: "pointer" }}>+ Add Notice</button>
            </div>
          ) : (
            <Table responsive className="mb-0">
              <thead>
                <tr>
                  <th style={{ ...th, width: "5%" }}>#</th>
                  <th style={{ ...th, width: "25%" }}>Title</th>
                  <th style={{ ...th, width: "35%" }}>Message</th>
                  <th style={{ ...th, width: "10%" }}>Priority</th>
                  <th style={{ ...th, width: "10%" }}>Status</th>
                  <th style={{ ...th, width: "15%" }}>Date</th>
                  <th style={{ ...th, width: "10%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n, i) => {
                  const p = PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.Medium
                  return (
                    <tr key={n.id}>
                      <td style={{ ...td, color: "#94A3B8" }}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: "500", color: "#1E293B" }}>{n.title}</td>
                      <td style={{ ...td }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {n.message}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}`, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "500" }}>
                          {n.priority}
                        </span>
                      </td>
                      <td style={td}>
                        <span
                          onClick={() => handleToggleStatus(n)}
                          role="button"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            background: n.status === "Active" ? "#F0FDF4" : "#FFF7ED",
                            color: n.status === "Active" ? "#16A34A" : "#EA580C",
                            border: `1px solid ${n.status === "Active" ? "#BBF7D0" : "#FED7AA"}`,
                            borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "500", cursor: "pointer"
                          }}
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: n.status === "Active" ? "#22C55E" : "#FB923C", display: "inline-block" }} />
                          {n.status}
                        </span>
                      </td>
                      <td style={{ ...td, color: "#94A3B8" }}>
                        {new Date(n.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => openEdit(n)} style={{ height: "30px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", fontSize: "12px", cursor: "pointer" }}>✏️</button>
                          <button onClick={() => { setDeleteTarget(n); setShowDeleteModal(true) }} style={{ height: "30px", padding: "0 10px", border: "1px solid #FECACA", borderRadius: "8px", background: "#FEF2F2", color: "#EF4444", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
        <Modal.Header closeButton style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <Modal.Title style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>
              {editData ? "Edit Notice" : "Add Notice"}
            </Modal.Title>
            <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>
              {editData ? "Update notice details" : "Create a new notice for your hospital"}
            </p>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 24px" }}>
          {error && <Alert variant="danger" style={{ fontSize: "13.5px", borderRadius: "10px" }}>{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Title <span style={{ color: "#EF4444" }}>*</span></Form.Label>
            <Form.Control value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Staff Meeting Tomorrow" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Message <span style={{ color: "#EF4444" }}>*</span></Form.Label>
            <Form.Control as="textarea" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Write the notice details here..." style={{ borderRadius: "9px", fontSize: "13.5px", resize: "none" }} />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Priority</Form.Label>
                <Form.Select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {editData && (
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Status</Form.Label>
                  <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", gap: "8px" }}>
          <button onClick={() => setShowModal(false)} style={{ height: "38px", padding: "0 18px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "9px", background: "#2563EB", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
            {saving && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
            {editData ? "Save Changes" : "Add Notice"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Body style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "22px" }}>🗑️</div>
          <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "8px" }}>Delete Notice</h6>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0 }}>
            Delete <strong style={{ color: "#1E293B" }}>{deleteTarget?.title}</strong>? This cannot be undone.
          </p>
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

export default AdminNotices
