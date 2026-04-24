import { useEffect, useState } from "react"
import { Container, Card, Table, Spinner, Alert, Modal, Form, Row, Col } from "react-bootstrap"
import api from "../services/api"

const UNITS = ["Tablets", "Capsules", "Syrup", "Injection", "Drops", "Cream", "Powder", "Other"]
const CATEGORIES = ["Antibiotic", "Painkiller", "Antiviral", "Antifungal", "Vitamin", "Steroid", "Cardiac", "Diabetic", "Other"]

const STATUS_STYLES = {
  "In Stock":          { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  "Low Stock":         { bg: "#FEFCE8", color: "#CA8A04", border: "#FDE68A" },
  "Out of Stock":      { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
}

const emptyForm = { name: "", category: "", quantity: "", unit: "Tablets", price: "", expiry_date: "" }

const AdminPharmacy = ({ hospitalId }) => {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (hospitalId) fetchMedicines() }, [hospitalId])

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/pharmacy/${hospitalId}`)
      if (res.data.success) setMedicines(res.data.data)
    } catch { setError("Failed to load medicines") }
    finally { setLoading(false) }
  }

  const openAdd = () => { setEditData(null); setForm(emptyForm); setError(""); setShowModal(true) }

  const openEdit = (m) => {
    setEditData(m)
    setForm({
      name: m.name, category: m.category || "", quantity: m.quantity,
      unit: m.unit, price: m.price, expiry_date: m.expiry_date ? m.expiry_date.split("T")[0] : ""
    })
    setError(""); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Medicine name is required")
    setSaving(true); setError("")
    try {
      if (editData) {
        await api.put(`/pharmacy/${editData.id}`, form)
        setSuccess("Medicine updated!")
      } else {
        await api.post("/pharmacy", { ...form, hospital_id: hospitalId })
        setSuccess("Medicine added!")
      }
      setShowModal(false); fetchMedicines()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.response?.data?.message || "Failed to save") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/pharmacy/${deleteTarget.id}`)
      setSuccess("Medicine deleted!"); setShowDeleteModal(false); fetchMedicines()
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Failed to delete") }
    finally { setDeleting(false) }
  }

  const filtered = medicines.filter(m => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.category?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "All" || m.status === filterStatus
    return matchSearch && matchStatus
  })

  const inStock = medicines.filter(m => m.status === "In Stock").length
  const lowStock = medicines.filter(m => m.status === "Low Stock").length
  const outOfStock = medicines.filter(m => m.status === "Out of Stock").length

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
          { label: "Total Medicines", value: medicines.length, bg: "#EFF6FF", color: "#2563EB", icon: "💊" },
          { label: "In Stock", value: inStock, bg: "#F0FDF4", color: "#16A34A", icon: "✅" },
          { label: "Low Stock", value: lowStock, bg: "#FEFCE8", color: "#CA8A04", icon: "⚠️" },
          { label: "Out of Stock", value: outOfStock, bg: "#FEF2F2", color: "#DC2626", icon: "❌" },
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
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>💊</div>
                <div>
                  <h5 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A", margin: 0 }}>Pharmacy Stock</h5>
                  <p style={{ fontSize: "13px", color: "#94A3B8", margin: "2px 0 0" }}>{medicines.length} medicine{medicines.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <input placeholder="Search medicine..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ height: "36px", padding: "0 12px", border: "1px solid #E2E8F0", borderRadius: "9px", fontSize: "13px", outline: "none", width: "180px" }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ height: "36px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "9px", fontSize: "13px", outline: "none" }}>
                  <option value="All">All Status</option>
                  <option>In Stock</option><option>Low Stock</option><option>Out of Stock</option>
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
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>💊</div>
              <p style={{ fontWeight: "500", color: "#1E293B", marginBottom: "4px" }}>No medicines found</p>
              <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>Add medicines to track your pharmacy stock</p>
              <button onClick={openAdd} style={{ background: "#2563EB", border: "none", borderRadius: "10px", padding: "0 18px", height: "36px", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: "pointer" }}>+ Add Medicine</button>
            </div>
          ) : (
            <Table responsive className="mb-0">
              <thead>
                <tr>
                  <th style={{ ...th, width: "4%" }}>#</th>
                  <th style={{ ...th, width: "20%" }}>Medicine</th>
                  <th style={{ ...th, width: "14%" }}>Category</th>
                  <th style={{ ...th, width: "10%" }}>Quantity</th>
                  <th style={{ ...th, width: "8%" }}>Unit</th>
                  <th style={{ ...th, width: "10%" }}>Price</th>
                  <th style={{ ...th, width: "12%" }}>Expiry</th>
                  <th style={{ ...th, width: "12%" }}>Status</th>
                  <th style={{ ...th, width: "10%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const ss = STATUS_STYLES[m.status] || STATUS_STYLES["In Stock"]
                  const isExpired = m.expiry_date && new Date(m.expiry_date) < new Date()
                  return (
                    <tr key={m.id}>
                      <td style={{ ...td, color: "#94A3B8" }}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: "500", color: "#1E293B" }}>{m.name}</td>
                      <td style={td}>{m.category || "—"}</td>
                      <td style={{ ...td, fontWeight: "600", color: m.quantity <= 10 ? "#DC2626" : "#1E293B" }}>{m.quantity}</td>
                      <td style={td}>{m.unit}</td>
                      <td style={td}>₹{parseFloat(m.price).toFixed(2)}</td>
                      <td style={td}>
                        {m.expiry_date ? (
                          <span style={{ color: isExpired ? "#DC2626" : "#475569", fontWeight: isExpired ? "600" : "normal" }}>
                            {isExpired ? "⚠️ " : ""}{new Date(m.expiry_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={td}>
                        <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "500" }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => openEdit(m)} style={{ height: "30px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", fontSize: "12px", cursor: "pointer" }}>✏️</button>
                          <button onClick={() => { setDeleteTarget(m); setShowDeleteModal(true) }} style={{ height: "30px", padding: "0 10px", border: "1px solid #FECACA", borderRadius: "8px", background: "#FEF2F2", color: "#EF4444", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
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
            <Modal.Title style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>{editData ? "Edit Medicine" : "Add Medicine"}</Modal.Title>
            <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>{editData ? "Update medicine details" : "Add a new medicine to stock"}</p>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 24px" }}>
          {error && <Alert variant="danger" style={{ fontSize: "13.5px", borderRadius: "10px" }}>{error}</Alert>}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Medicine Name <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                <Form.Control value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Paracetamol" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Category</Form.Label>
                <Form.Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                  <option value="">— Select —</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Quantity</Form.Label>
                <Form.Control type="number" min={0} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Unit</Form.Label>
                <Form.Select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Price (₹)</Form.Label>
                <Form.Control type="number" min={0} step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>Expiry Date</Form.Label>
                <Form.Control type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} style={{ borderRadius: "9px", fontSize: "13.5px", height: "40px" }} />
              </Form.Group>
            </Col>
          </Row>
          <div style={{ background: "#F8FAFC", borderRadius: "9px", padding: "10px 14px", fontSize: "12.5px", color: "#64748B" }}>
            💡 Status is auto-set: <strong>0</strong> = Out of Stock · <strong>1–10</strong> = Low Stock · <strong>11+</strong> = In Stock
          </div>
        </Modal.Body>
        <Modal.Footer style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", gap: "8px" }}>
          <button onClick={() => setShowModal(false)} style={{ height: "38px", padding: "0 18px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "9px", background: "#2563EB", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
            {saving && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
            {editData ? "Save Changes" : "Add Medicine"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Body style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "22px" }}>🗑️</div>
          <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "8px" }}>Delete Medicine</h6>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0 }}>Delete <strong style={{ color: "#1E293B" }}>{deleteTarget?.name}</strong>? This cannot be undone.</p>
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

export default AdminPharmacy
