import { useEffect, useState } from "react"
import { Container, Card, Table, Spinner, Alert, Button, Modal, Form, Row, Col, Badge } from "react-bootstrap"
import api from "../services/api"

const ITEMS_PER_PAGE = 5

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flex: 1, minWidth: 130 }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{label}</div>
    </div>
  </div>
)

const AdminDepartments = ({ hospitalId }) => {
  const [rows, setRows] = useState([])
  const [activeDepts, setActiveDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ department_id: "", description: "", no_of_doctors: "", status: "Active" })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (hospitalId) { fetchRows(); fetchActiveDepts() }
  }, [hospitalId])

  const fetchRows = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin-department/${hospitalId}`)
      if (res.data.success) setRows(res.data.data)
    } catch { setError("Failed to load departments") }
    finally { setLoading(false) }
  }

  const fetchActiveDepts = async () => {
    try {
      const res = await api.get("/department/active")
      if (res.data.success) setActiveDepts(res.data.data)
    } catch { }
  }

  const openAdd = () => {
    setEditData(null)
    setForm({ department_id: "", description: "", no_of_doctors: "", no_of_beds: "", no_of_wards: "", status: "Active" })
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditData(row)
    setForm({
      department_id: row.department_id,
      description: row.description || "",
      no_of_doctors: row.no_of_doctors,
      status: row.status
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!editData && !form.department_id) return setError("Please select a department")
    setSaving(true); setError(""); setSuccessMsg("")
    try {
      if (editData) {
        await api.put(`/admin-department/${editData.id}`, form)
        setSuccessMsg("Department updated!")
      } else {
        await api.post("/admin-department", { ...form, hospital_id: hospitalId })
        setSuccessMsg("Department added!")
      }
      setShowModal(false); fetchRows()
    } catch (err) { setError(err.response?.data?.message || "Failed to save") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/admin-department/${deleteTarget.id}`)
      setSuccessMsg("Department deleted!"); setShowDeleteModal(false); fetchRows()
    } catch { setError("Failed to delete") }
    finally { setDeleting(false) }
  }

  const handleToggleStatus = async (row) => {
    const newStatus = row.status === "Active" ? "Inactive" : "Active"
    try {
      await api.patch(`/admin-department/${row.id}/status`, { status: newStatus })
      fetchRows()
    } catch { setError("Failed to update status") }
  }

  const filtered = rows.filter(r => r.department_name?.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const styles = {
    card: { border: "none", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" },
    header: { background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "20px 24px" },
    title: { fontSize: "18px", fontWeight: "600", color: "#0F172A", margin: 0 },
    subtitle: { fontSize: "13px", color: "#94A3B8", margin: "2px 0 0" },
    searchInput: { paddingLeft: "36px", height: "38px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13.5px", background: "#F8FAFC", width: "240px", outline: "none" },
    addBtn: { background: "#2563EB", border: "none", borderRadius: "10px", padding: "0 18px", height: "38px", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
    th: { background: "#F8FAFC", fontSize: "11px", fontWeight: "600", color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase", padding: "12px 14px" },
    td: { padding: "14px", verticalAlign: "middle", borderBottom: "1px solid #F1F5F9", fontSize: "13.5px", color: "#475569" },
    statusBadge: (active) => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "500", background: active ? "#F0FDF4" : "#FFF7ED", color: active ? "#16A34A" : "#EA580C", border: `1px solid ${active ? "#BBF7D0" : "#FED7AA"}` }),
    dot: (active) => ({ width: "6px", height: "6px", borderRadius: "50%", background: active ? "#22C55E" : "#FB923C", display: "inline-block" }),
    actionBtn: (color) => ({ height: "30px", padding: "0 12px", border: `1px solid ${color === "danger" ? "#FECACA" : "#E2E8F0"}`, borderRadius: "8px", background: color === "danger" ? "#FEF2F2" : "#fff", color: color === "danger" ? "#EF4444" : "#475569", fontSize: "12px", cursor: "pointer" }),
  }

  if (!hospitalId) return (
    <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "10px", padding: "16px" }}>
      <p style={{ margin: 0, color: "#92400E" }}>⚠️ No hospital assigned. Contact Super Admin.</p>
    </div>
  )

  return (
    <Container fluid>
      <style>{`
        .adept-search:focus { border-color: #93C5FD !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important; background: #fff !important; }
        .adept-row:hover { background: #FAFBFF; }
        .form-control:focus, .form-select:focus { border-color: #93C5FD; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .form-control, .form-select { border-radius: 9px; border-color: #E2E8F0; font-size: 13.5px; }
        .modal-content { border-radius: 16px; border: none; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
      `}</style>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")} style={{ borderRadius: "10px", fontSize: "13.5px" }}><strong>Error:</strong> {error}</Alert>}
      {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg("")} style={{ borderRadius: "10px", fontSize: "13.5px" }}>{successMsg}</Alert>}

      {/* Activity Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard icon="🏢" label="Total Departments" value={rows.length} color="#2563EB" />
        <StatCard icon="✅" label="Active" value={rows.filter(r => r.status === "Active").length} color="#16A34A" />
        <StatCard icon="⏸️" label="Inactive" value={rows.filter(r => r.status === "Inactive").length} color="#EA580C" />
        <StatCard icon="🩺" label="Total Doctors" value={rows.reduce((s, r) => s + (Number(r.no_of_doctors) || 0), 0)} color="#0EA5E9" />
        <StatCard icon="🏥" label="Total Wards" value={rows.reduce((s, r) => s + (Number(r.no_of_wards) || 0), 0)} color="#F59E0B" />
      </div>

      <Card style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <Row className="align-items-center g-3">
            <Col>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🏢</div>
                <div>
                  <h5 style={styles.title}>Departments</h5>
                  <p style={styles.subtitle}>{rows.length} department{rows.length !== 1 ? "s" : ""} assigned</p>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "14px", pointerEvents: "none" }}>🔍</span>
                  <input className="adept-search" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} style={styles.searchInput} />
                </div>
                <button style={styles.addBtn} onClick={openAdd}>
                  <span style={{ fontSize: "16px" }}>+</span> Add Department
                </button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Card.Body className="p-0">
          {loading ? (
            <div style={{ padding: "64px 0", textAlign: "center" }}>
              <Spinner animation="border" style={{ color: "#2563EB" }} />
              <p style={{ marginTop: "12px", color: "#94A3B8", fontSize: "13.5px" }}>Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏢</div>
              <p style={{ fontWeight: "500", color: "#1E293B", marginBottom: "4px" }}>{search ? "No results found" : "No departments yet"}</p>
              <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>{search ? `No match for "${search}"` : "Add a department to get started"}</p>
              {!search && <button style={{ ...styles.addBtn, margin: "0 auto" }} onClick={openAdd}>+ Add Department</button>}
            </div>
          ) : (
            <Table responsive className="mb-0" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: "22%" }}>Department</th>
                  <th style={{ ...styles.th, width: "25%" }}>Description</th>
                  <th style={{ ...styles.th, width: "10%" }}>Doctors</th>
                  <th style={{ ...styles.th, width: "13%" }}>Status</th>
                  <th style={{ ...styles.th, width: "10%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(row => (
                  <tr key={row.id} className="adept-row">
                    <td style={{ ...styles.td, fontWeight: "500", color: "#1E293B" }}>{row.department_name}</td>
                    <td style={{ ...styles.td, color: "#64748B" }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {row.description || <span style={{ color: "#CBD5E1" }}>—</span>}
                      </span>
                    </td>
                    <td style={styles.td}>{row.no_of_doctors}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(row.status === "Active")} onClick={() => handleToggleStatus(row)} title="Click to toggle" role="button">
                        <span style={styles.dot(row.status === "Active")} />
                        {row.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={styles.actionBtn("edit")} onClick={() => openEdit(row)}>✏️ Edit</button>
                        <button style={styles.actionBtn("danger")} onClick={() => { setDeleteTarget(row); setShowDeleteModal(true) }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "14px 20px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#94A3B8" }}>
                Showing <strong style={{ color: "#475569" }}>{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong style={{ color: "#475569" }}>{filtered.length}</strong>
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  style={{ height: "32px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", fontSize: "13px", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1 }}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                    style={{ width: "32px", height: "32px", border: currentPage === i + 1 ? "none" : "1px solid #E2E8F0", borderRadius: "8px", background: currentPage === i + 1 ? "#2563EB" : "#fff", color: currentPage === i + 1 ? "#fff" : "#475569", fontSize: "13px", cursor: "pointer" }}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  style={{ height: "32px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", fontSize: "13px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1 }}>Next →</button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
        <Modal.Header closeButton style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <Modal.Title style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>
              {editData ? "Edit Department" : "Add Department"}
            </Modal.Title>
            <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>
              {editData ? "Update department details" : "Select a department and fill in details"}
            </p>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 24px" }}>
          {!editData && (
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                Department <span style={{ color: "#EF4444" }}>*</span>
              </Form.Label>
              <Form.Select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} style={{ height: "40px" }}>
                <option value="">— Select Department —</option>
                {activeDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Form.Select>
            </Form.Group>
          )}
          {editData && (
            <div className="mb-3 p-2 rounded" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", fontSize: "13.5px", color: "#475569" }}>
              <strong style={{ color: "#1E293B" }}>Department:</strong> {editData.department_name}
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Description</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Describe this department..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: "none" }} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>No. of Doctors</Form.Label>
            <Form.Control type="number" min="0" value={form.no_of_doctors} onChange={e => setForm({ ...form, no_of_doctors: e.target.value })} style={{ height: "40px" }} />
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Status</Form.Label>
            <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ height: "40px" }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", gap: "8px" }}>
          <button onClick={() => setShowModal(false)} style={{ height: "38px", padding: "0 18px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "9px", background: "#2563EB", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
            {saving && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
            {editData ? "Save Changes" : "Add Department"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Body style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "22px" }}>🗑️</div>
          <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "8px" }}>Delete Department</h6>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0 }}>
            Remove <strong style={{ color: "#1E293B" }}>{deleteTarget?.department_name}</strong> from your hospital? This cannot be undone.
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

export default AdminDepartments
