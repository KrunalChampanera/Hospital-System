import { useEffect, useState } from "react"
import { Container, Card, Table, Spinner, Alert, Modal, Form, Dropdown, Row, Col } from "react-bootstrap"
import MainLayout from "../layouts/MainLayout"
import api from "../services/api"

const ITEMS_PER_PAGE = 5

const Designations = () => {
  const [designations, setDesignations] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({ name: "", status: "Inactive" })
  const [saving, setSaving] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchDesignations() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(designations.filter(d => d.name.toLowerCase().includes(q)))
    setCurrentPage(1)
  }, [search, designations])

  const fetchDesignations = async () => {
    setLoading(true)
    try {
      const res = await api.get("/designation")
      if (res.data.success) { setDesignations(res.data.data); setFiltered(res.data.data) }
    } catch { setError("Failed to load designations") }
    finally { setLoading(false) }
  }

  const openAddModal = () => {
    setEditData(null)
    setForm({ name: "", status: "Inactive" })
    setShowModal(true)
  }

  const openEditModal = (d) => {
    setEditData(d)
    setForm({ name: d.name, status: d.status })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Designation name is required"); return }
    setSaving(true); setError(""); setSuccessMsg("")
    try {
      if (editData) {
        await api.put(`/designation/${editData.id}`, form)
        setSuccessMsg("Designation updated!")
      } else {
        await api.post("/designation", form)
        setSuccessMsg("Designation created!")
      }
      setShowModal(false)
      fetchDesignations()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save designation")
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/designation/${deleteTarget.id}`)
      setSuccessMsg("Designation deleted!")
      setShowDeleteModal(false)
      fetchDesignations()
    } catch { setError("Failed to delete designation") }
    finally { setDeleting(false) }
  }

  const handleToggleStatus = async (d) => {
    const newStatus = d.status === "Active" ? "Inactive" : "Active"
    try {
      await api.patch(`/designation/${d.id}/status`, { status: newStatus })
      fetchDesignations()
    } catch { setError("Failed to update status") }
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const avatarColors = [
    { bg: "#EEF2FF", color: "#4F46E5" }, { bg: "#FDF2F8", color: "#DB2777" },
    { bg: "#ECFDF5", color: "#059669" }, { bg: "#FFF7ED", color: "#EA580C" },
    { bg: "#EFF6FF", color: "#2563EB" }, { bg: "#FAF5FF", color: "#7C3AED" },
  ]
  const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]

  const styles = {
    card: { border: "none", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" },
    cardHeader: { background: "#ffffff", borderBottom: "1px solid #F1F5F9", padding: "20px 24px" },
    pageTitle: { fontSize: "18px", fontWeight: "600", color: "#0F172A", margin: 0 },
    pageSubtitle: { fontSize: "13px", color: "#94A3B8", margin: "2px 0 0" },
    searchWrapper: { position: "relative", width: "260px" },
    searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "14px", pointerEvents: "none", zIndex: 1 },
    searchInput: { paddingLeft: "36px", height: "38px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13.5px", color: "#1E293B", background: "#F8FAFC", width: "100%", outline: "none" },
    addBtn: { background: "#2563EB", border: "none", borderRadius: "10px", padding: "0 18px", height: "38px", fontSize: "13.5px", fontWeight: "500", color: "#fff", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", whiteSpace: "nowrap" },
    tableHead: { background: "#F8FAFC", fontSize: "11px", fontWeight: "600", color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase" },
    tableRow: { borderBottom: "1px solid #F1F5F9", verticalAlign: "middle" },
    avatar: (name) => ({ width: "38px", height: "38px", borderRadius: "10px", background: getAvatarColor(name).bg, color: getAvatarColor(name).color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "14px", flexShrink: 0 }),
    metaText: { fontSize: "13.5px", color: "#64748B" },
    statusBadge: (active) => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "500", background: active ? "#F0FDF4" : "#FFF7ED", color: active ? "#16A34A" : "#EA580C", border: `1px solid ${active ? "#BBF7D0" : "#FED7AA"}` }),
    statusDot: (active) => ({ width: "6px", height: "6px", borderRadius: "50%", background: active ? "#22C55E" : "#FB923C", display: "inline-block" }),
    actionBtn: { width: "32px", height: "32px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 },
    emptyState: { padding: "60px 24px", textAlign: "center" },
    emptyIcon: { width: "56px", height: "56px", borderRadius: "14px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "22px" },
    paginationWrapper: { padding: "14px 20px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" },
    pageBtn: (active) => ({ width: "32px", height: "32px", border: active ? "none" : "1px solid #E2E8F0", borderRadius: "8px", background: active ? "#2563EB" : "#fff", color: active ? "#fff" : "#475569", fontSize: "13px", fontWeight: active ? "600" : "400", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }),
  }

  return (
    <MainLayout>
      <style>{`
        .desig-search:focus { border-color: #93C5FD !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important; background: #fff !important; }
        .desig-add-btn:hover { background: #1D4ED8 !important; }
        .desig-table tbody tr:hover { background: #FAFBFF; }
        .desig-action-btn:hover { background: #F8FAFC !important; border-color: #CBD5E1 !important; }
        .page-btn-nav:hover:not(:disabled) { background: #F1F5F9 !important; }
        .page-btn-nav:disabled { opacity: 0.35; cursor: not-allowed; }
        .desig-dropdown .dropdown-item { font-size: 13.5px; border-radius: 6px; margin: 1px 4px; padding: 7px 10px; }
        .desig-dropdown .dropdown-item:hover { background: #F1F5F9; }
        .desig-dropdown .dropdown-menu { border: 1px solid #E2E8F0; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); padding: 6px; min-width: 170px; }
        .modal-content { border-radius: 16px; border: none; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .form-control:focus, .form-select:focus { border-color: #93C5FD; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .form-control, .form-select { border-radius: 9px; border-color: #E2E8F0; font-size: 13.5px; }
      `}</style>

      <Container fluid>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")} className="mb-3"
            style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", borderRadius: "10px", fontSize: "13.5px" }}>
            <strong>Error:</strong> {error}
          </Alert>
        )}
        {successMsg && (
          <Alert variant="success" dismissible onClose={() => setSuccessMsg("")} className="mb-3"
            style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", borderRadius: "10px", fontSize: "13.5px" }}>
            {successMsg}
          </Alert>
        )}

        <Card style={styles.card}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <Row className="align-items-center g-3">
              <Col>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#FDF2F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    🏷️
                  </div>
                  <div>
                    <h5 style={styles.pageTitle}>Designations</h5>
                    <p style={styles.pageSubtitle}>{designations.length} total designations</p>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={styles.searchWrapper}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                      className="desig-search"
                      placeholder="Search designations..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={styles.searchInput}
                    />
                  </div>
                  <button className="desig-add-btn" style={styles.addBtn} onClick={openAddModal}>
                    <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
                    Add Designation
                  </button>
                </div>
              </Col>
            </Row>
          </div>

          {/* Table */}
          <Card.Body className="p-0">
            {loading ? (
              <div style={{ padding: "64px 0", textAlign: "center" }}>
                <Spinner animation="border" style={{ color: "#2563EB", width: "28px", height: "28px" }} />
                <p style={{ marginTop: "12px", color: "#94A3B8", fontSize: "13.5px" }}>Loading designations...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🏷️</div>
                <p style={{ fontWeight: "500", color: "#1E293B", marginBottom: "4px" }}>
                  {search ? "No results found" : "No designations yet"}
                </p>
                <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>
                  {search ? `No designations match "${search}"` : "Add your first designation to get started"}
                </p>
                {!search && (
                  <button className="desig-add-btn" style={{ ...styles.addBtn, margin: "0 auto" }} onClick={openAddModal}>
                    + Add Designation
                  </button>
                )}
              </div>
            ) : (
              <Table responsive className="mb-0 desig-table" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "36px" }} />
                  <col />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "80px" }} />
                </colgroup>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={{ padding: "12px 8px 12px 20px" }}><Form.Check type="checkbox" style={{ marginTop: 0 }} /></th>
                    <th style={{ padding: "12px 12px" }}>Designation</th>
                    <th style={{ padding: "12px 12px" }}>Created</th>
                    <th style={{ padding: "12px 12px" }}>Status</th>
                    <th style={{ padding: "12px 20px 12px 12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((d) => (
                    <tr key={d.id} style={styles.tableRow}>
                      <td style={{ padding: "14px 8px 14px 20px" }}><Form.Check type="checkbox" style={{ marginTop: 0 }} /></td>
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={styles.avatar(d.name)}>{d.name?.charAt(0).toUpperCase()}</div>
                          <p style={{ fontSize: "14px", fontWeight: "500", color: "#1E293B", margin: 0 }}>{d.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <span style={styles.metaText}>
                          {new Date(d.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <span style={styles.statusBadge(d.status === "Active")}>
                          <span style={styles.statusDot(d.status === "Active")} />
                          {d.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px 14px 12px" }}>
                        <Dropdown align="end" className="desig-dropdown">
                          <Dropdown.Toggle as="button" className="desig-action-btn" style={styles.actionBtn} id={`dd-${d.id}`}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="3" r="1.2" fill="#64748B" />
                              <circle cx="8" cy="8" r="1.2" fill="#64748B" />
                              <circle cx="8" cy="13" r="1.2" fill="#64748B" />
                            </svg>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => openEditModal(d)}><span style={{ marginRight: "8px" }}>✏️</span> Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleToggleStatus(d)}>
                              {d.status === "Active"
                                ? <><span style={{ marginRight: "8px" }}>⏸️</span> Set Inactive</>
                                : <><span style={{ marginRight: "8px" }}>▶️</span> Set Active</>}
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item style={{ color: "#EF4444" }} onClick={() => { setDeleteTarget(d); setShowDeleteModal(true) }}>
                              <span style={{ marginRight: "8px" }}>🗑️</span> Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {totalPages > 1 && (
              <div style={styles.paginationWrapper}>
                <span style={{ fontSize: "13px", color: "#94A3B8" }}>
                  Showing <strong style={{ color: "#475569" }}>{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong style={{ color: "#475569" }}>{filtered.length}</strong>
                </span>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <button className="page-btn-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                    style={{ ...styles.pageBtn(false), width: "auto", padding: "0 10px", fontSize: "13px" }}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} style={styles.pageBtn(currentPage === i + 1)} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="page-btn-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                    style={{ ...styles.pageBtn(false), width: "auto", padding: "0 10px", fontSize: "13px" }}>Next →</button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Add / Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="sm">
          <Modal.Header closeButton style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <Modal.Title style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>
                {editData ? "Edit Designation" : "Add New Designation"}
              </Modal.Title>
              <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>
                {editData ? "Update designation name below" : "Enter the designation name"}
              </p>
            </div>
          </Modal.Header>
          <Modal.Body style={{ padding: "20px 24px" }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                Designation Name <span style={{ color: "#EF4444" }}>*</span>
              </Form.Label>
              <Form.Control
                placeholder="e.g. Doctor, Nurse, Surgeon..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                style={{ height: "40px" }}
                autoFocus
              />
            </Form.Group>
            {editData && (
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Status</Form.Label>
                <Form.Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ height: "40px" }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", gap: "8px" }}>
            <button onClick={() => setShowModal(false)}
              style={{ height: "38px", padding: "0 18px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "9px", background: "#2563EB", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
              {saving && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
              {editData ? "Save Changes" : "Create Designation"}
            </button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
          <Modal.Body style={{ padding: "32px 24px", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "22px" }}>🗑️</div>
            <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "8px" }}>Delete Designation</h6>
            <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0 }}>
              Are you sure you want to delete <strong style={{ color: "#1E293B" }}>{deleteTarget?.name}</strong>? This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer style={{ padding: "0 24px 24px", border: "none", justifyContent: "center", gap: "8px" }}>
            <button onClick={() => setShowDeleteModal(false)}
              style={{ height: "38px", padding: "0 20px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              style={{ height: "38px", padding: "0 20px", border: "none", borderRadius: "9px", background: "#EF4444", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
              {deleting && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
              Delete
            </button>
          </Modal.Footer>
        </Modal>
      </Container>
    </MainLayout>
  )
}

export default Designations
