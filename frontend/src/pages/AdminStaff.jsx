import { useEffect, useState } from "react"
import { Modal, Form, Row, Col, Spinner, Alert, Button } from "react-bootstrap"
import api from "../services/api"
import usePincode from "../hooks/usePincode"

const css = `
  .sf-wrap { font-family: 'DM Sans', sans-serif; }
  .sf-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .sf-title { font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0; }
  .sf-title span { color: #1a56db; }
  .sf-subtitle { font-size: .78rem; color: #6b7280; margin: 2px 0 0; }
  .sf-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
  .sf-stat { background: #fff; border: 1px solid #e5e8f0; border-radius: 10px; padding: 10px 16px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 16px rgba(26,86,219,.08); }
  .sf-stat-val { font-weight: 800; font-size: 1.1rem; color: #0f172a; line-height: 1; }
  .sf-stat-lbl { font-size: .7rem; color: #6b7280; margin-top: 1px; }
  .sf-table-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 16px rgba(26,86,219,.08); border: 1px solid #e5e8f0; }
  .sf-table { margin: 0; font-size: .87rem; }
  .sf-table thead tr { background: #f8faff; }
  .sf-table thead th { font-weight: 700; font-size: .72rem; text-transform: uppercase; letter-spacing: .8px; color: #6b7280; border-bottom: 2px solid #e5e8f0; padding: 11px 14px; white-space: nowrap; }
  .sf-table tbody tr { border-bottom: 1px solid #e5e8f0; transition: background .15s; }
  .sf-table tbody tr:hover { background: #f8faff; }
  .sf-table tbody tr:last-child { border-bottom: none; }
  .sf-table td { padding: 11px 14px; vertical-align: middle; }
  .sf-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg,#e8effd,#c7d7fa); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #1a56db; border: 2px solid #e5e8f0; flex-shrink: 0; }
  .sf-name { font-weight: 600; color: #0f172a; font-size: .88rem; }
  .sf-meta { font-size: .74rem; color: #6b7280; }
  .badge-active { background: #dcfce7; color: #15803d; border-radius: 20px; padding: 3px 10px; font-size: .74rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
  .badge-inactive { background: #fee2e2; color: #b91c1c; border-radius: 20px; padding: 3px 10px; font-size: .74rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .dept-tag { background: #ebf0fd; color: #1a56db; border-radius: 6px; padding: 2px 9px; font-size: .76rem; font-weight: 600; }
  .emp-full { background: #dcfce7; color: #15803d; border-radius: 6px; padding: 2px 9px; font-size: .76rem; font-weight: 600; }
  .emp-part { background: #fef9c3; color: #854d0e; border-radius: 6px; padding: 2px 9px; font-size: .76rem; font-weight: 600; }
  .action-btns { display: flex; gap: 5px; }
  .btn-icon { width: 30px; height: 30px; border-radius: 7px; border: 1.5px solid #e5e8f0; background: #fff; display: flex; align-items: center; justify-content: center; font-size: .82rem; cursor: pointer; transition: all .15s; padding: 0; }
  .btn-icon:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,.1); }
  .btn-icon.del { border-color: #fecaca; background: #fff5f5; }
  .sf-search-wrap { position: relative; flex: 1; max-width: 300px; }
  .sf-search { border-radius: 9px; border: 1.5px solid #e5e8f0; padding: 7px 13px 7px 34px; font-size: .86rem; width: 100%; outline: none; transition: border-color .18s; }
  .sf-search:focus { border-color: #1a56db; }
  .sf-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); font-size: .85rem; color: #6b7280; pointer-events: none; }
  .btn-add { background: #1a56db; color: #fff; border: none; border-radius: 8px; padding: 8px 20px; font-weight: 700; font-size: .88rem; cursor: pointer; box-shadow: 0 2px 12px rgba(26,86,219,.25); transition: background .18s; }
  .btn-add:hover { background: #1245b5; }
  .sf-modal .modal-content { border-radius: 14px; border: none; box-shadow: 0 8px 32px rgba(26,86,219,.13); }
  .sf-modal .modal-header { background: linear-gradient(135deg,#1a56db,#0ea5e9); border-radius: 14px 14px 0 0; padding: 16px 22px; border-bottom: none; }
  .sf-modal .modal-title { font-weight: 800; color: #fff; font-size: 1.05rem; }
  .sf-modal .modal-header .btn-close { filter: invert(1) brightness(2); opacity: .8; }
  .sf-modal .form-label { font-size: .79rem; font-weight: 600; color: #374151; margin-bottom: 4px; }
  .sf-modal .form-control, .sf-modal .form-select { border-radius: 8px; border: 1.5px solid #e5e8f0; font-size: .86rem; padding: 7px 11px; }
  .sf-modal .form-control:focus, .sf-modal .form-select:focus { border-color: #1a56db; box-shadow: 0 0 0 3px rgba(26,86,219,.1); }
  .section-lbl { font-size: .74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1a56db; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; margin-top: 6px; }
  .section-lbl::after { content: ''; flex: 1; height: 1px; background: #ebf0fd; }
  .empty-state { text-align: center; padding: 50px 20px; color: #6b7280; }
  .shift-hint { font-size: .75rem; color: #6b7280; margin-top: 4px; }
`

const initials = (name = "") => name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

const emptyForm = {
  name: "", email: "", phone: "", department_id: "", designation_id: "", status: "Active",
  dob: "", gender: "", blood_group: "", address: "", city: "", state: "", country: "", pincode: "",
  shift_start: "", shift_end: ""
}

const getEmploymentPreview = (start, end) => {
  if (!start || !end) return null
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const hours = (eh * 60 + em - (sh * 60 + sm)) / 60
  if (hours <= 0) return null
  return `${hours.toFixed(1)}h → ${hours >= 6 ? "Full Time" : "Part Time"}`
}

const AdminStaff = ({ hospitalId }) => {
  const [staff, setStaff] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [createdCreds, setCreatedCreds] = useState(null)
  const { pincodeLoading, pincodeError, handlePincodeChange } = usePincode(setForm)

  useEffect(() => {
    if (hospitalId) { fetchStaff(); fetchDepartments(); fetchDesignations() }
  }, [hospitalId])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/staff/hospital/${hospitalId}`)
      if (res.data.success) setStaff(res.data.data)
    } catch { setError("Failed to load staff") }
    setLoading(false)
  }

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/department/active")
      if (res.data.success) setDepartments(res.data.data)
    } catch {}
  }

  const fetchDesignations = async () => {
    try {
      const res = await api.get("/designation")
      if (res.data.success) setDesignations(res.data.data.filter(d => d.status === "Active"))
    } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError("Name is required")
    setSaving(true); setError("")
    try {
      const res = await api.post("/staff", { ...form, hospital_id: hospitalId })
      setCreatedCreds({ name: form.name, email: form.email, password: res.data.password })
      setShowForm(false); setForm(emptyForm); fetchStaff()
    } catch (err) { setError(err.response?.data?.message || "Failed to create staff") }
    setSaving(false)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete staff member "${name}"?`)) return
    try {
      await api.delete(`/staff/${id}`)
      setSuccess("Staff deleted!"); fetchStaff()
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Failed to delete staff") }
  }

  const handleToggleStatus = async (s) => {
    const newStatus = s.status === "Active" ? "Inactive" : "Active"
    try {
      await api.patch(`/staff/${s.id}/status`, { status: newStatus })
      fetchStaff()
    } catch { setError("Failed to update status") }
  }

  const filtered = staff.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    (s.department_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.designation_name || "").toLowerCase().includes(search.toLowerCase())
  )

  const empPreview = getEmploymentPreview(form.shift_start, form.shift_end)

  if (!hospitalId) return <p className="text-muted">No hospital assigned.</p>

  return (
    <>
      <style>{css}</style>
      <div className="sf-wrap">
        {error && <Alert variant="danger" dismissible onClose={() => setError("")} style={{ borderRadius: 8, fontSize: ".86rem" }}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess("")} style={{ borderRadius: 8, fontSize: ".86rem" }}>✅ {success}</Alert>}

        <div className="sf-header">
          <div>
            <h1 className="sf-title">Staff <span>Management</span></h1>
            <p className="sf-subtitle">Manage hospital staff members and their assignments</p>
          </div>
          <button className="btn-add" onClick={() => { setForm(emptyForm); setError(""); setShowForm(true) }}>＋ Add Staff</button>
        </div>

        <div className="sf-stats">
          {[
            { icon: "👥", val: staff.length, lbl: "Total Staff" },
            { icon: "✅", val: staff.filter(s => s.status === "Active").length, lbl: "Active" },
            { icon: "⏸️", val: staff.filter(s => s.status === "Inactive").length, lbl: "Inactive" },
            { icon: "🕐", val: staff.filter(s => s.employment_type === "Full Time").length, lbl: "Full Time" },
            { icon: "🕓", val: staff.filter(s => s.employment_type === "Part Time").length, lbl: "Part Time" },
          ].map(s => (
            <div className="sf-stat" key={s.lbl}>
              <div style={{ fontSize: "1.2rem" }}>{s.icon}</div>
              <div><div className="sf-stat-val">{s.val}</div><div className="sf-stat-lbl">{s.lbl}</div></div>
            </div>
          ))}
        </div>

        <div className="sf-table-card">
          <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid #e5e8f0", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div className="sf-search-wrap">
              <span className="sf-search-icon">🔍</span>
              <input className="sf-search" placeholder="Search staff, department, designation…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: "auto", fontSize: ".78rem", color: "#6b7280", fontWeight: 500 }}>
              {filtered.length} of {staff.length} staff
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table sf-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th style={{ width: 46 }}></th>
                    <th>Staff Member</th>
                    <th>Designation / Role</th>
                    <th>Department</th>
                    <th>Shift</th>
                    <th>Employment</th>
                    <th>Status</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9}>
                      <div className="empty-state">
                        <div style={{ fontSize: "2.5rem", marginBottom: 10, opacity: .4 }}>👥</div>
                        <p style={{ margin: 0, fontSize: ".88rem" }}>No staff found{search ? ` for "${search}"` : ""}.</p>
                      </div>
                    </td></tr>
                  ) : filtered.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ color: "#6b7280", fontWeight: 600, fontSize: ".78rem" }}>{i + 1}</td>
                      <td>
                        {s.profile_image
                          ? <img src={`http://localhost:5000/uploads/${s.profile_image}`} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e8f0" }} />
                          : <div className="sf-avatar">{initials(s.name)}</div>}
                      </td>
                      <td>
                        <div className="sf-name">{s.name}</div>
                        <div className="sf-meta">{s.email || "—"}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: ".83rem", fontWeight: 600, color: "#0f172a" }}>{s.designation_name || "—"}</div>
                        <div style={{ fontSize: ".74rem", color: "#6b7280" }}>{s.role || ""}</div>
                      </td>
                      <td>
                        {s.department_name
                          ? <span className="dept-tag">{s.department_name}</span>
                          : <span style={{ color: "#6b7280" }}>—</span>}
                      </td>
                      <td>
                        <div style={{ fontSize: ".83rem" }}>
                          {s.shift_start && s.shift_end ? `${s.shift_start} – ${s.shift_end}` : "—"}
                        </div>
                      </td>
                      <td>
                        {s.employment_type
                          ? <span className={s.employment_type === "Full Time" ? "emp-full" : "emp-part"}>{s.employment_type}</span>
                          : <span style={{ color: "#6b7280" }}>—</span>}
                      </td>
                      <td>
                        <span
                          className={s.status === "Active" ? "badge-active" : "badge-inactive"}
                          onClick={() => handleToggleStatus(s)}
                          title="Click to toggle"
                        >
                          <span className="badge-dot" />{s.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon del" title="Delete" onClick={() => handleDelete(s.id, s.name)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Staff Modal */}
        <Modal show={showForm} onHide={() => setShowForm(false)} size="lg" backdrop="static" className="sf-modal">
          <Modal.Header closeButton>
            <Modal.Title>＋ Add Staff Member</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ padding: "22px 24px", maxHeight: "70vh", overflowY: "auto" }}>
              {error && <Alert variant="danger" style={{ borderRadius: 8, fontSize: ".86rem" }}>{error}</Alert>}

              <div className="section-lbl">Basic Information</div>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="staff@hospital.com" />
                </Col>
                <Col md={4}>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </Col>
                <Col md={4}>
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                </Col>
                <Col md={4}>
                  <Form.Label>Gender</Form.Label>
                  <Form.Select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
                  </Form.Select>
                </Col>
              </Row>

              <div className="section-lbl">Work Assignment</div>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Label>Department</Form.Label>
                  <Form.Select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Designation</Form.Label>
                  <Form.Select value={form.designation_id} onChange={e => setForm({ ...form, designation_id: e.target.value })}>
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label>Shift Start</Form.Label>
                  <Form.Control type="time" value={form.shift_start} onChange={e => setForm({ ...form, shift_start: e.target.value })} />
                </Col>
                <Col md={4}>
                  <Form.Label>Shift End</Form.Label>
                  <Form.Control type="time" value={form.shift_end} onChange={e => setForm({ ...form, shift_end: e.target.value })} />
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  {empPreview && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 12px", fontSize: ".82rem", color: "#15803d", fontWeight: 600, width: "100%" }}>
                      ⏱ {empPreview}
                    </div>
                  )}
                </Col>
                <Col md={4}>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="section-lbl">Address</div>
              <Row className="g-3 mb-3">
                <Col md={12}>
                  <Form.Label>Address</Form.Label>
                  <Form.Control value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
                </Col>
                <Col md={4}>
                  <Form.Label>Pincode</Form.Label>
                  <div style={{ position: "relative" }}>
                    <Form.Control value={form.pincode} onChange={handlePincodeChange} placeholder="Enter pincode" />
                    {pincodeLoading && <Spinner animation="border" size="sm" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#1a56db" }} />}
                  </div>
                  {pincodeError && <div style={{ color: "#dc2626", fontSize: ".75rem", marginTop: 3 }}>{pincodeError}</div>}
                </Col>
                <Col md={4}>
                  <Form.Label>City</Form.Label>
                  <Form.Control value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Auto-filled" style={{ background: form.city ? "#f0fff4" : "" }} />
                </Col>
                <Col md={4}>
                  <Form.Label>State</Form.Label>
                  <Form.Control value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Auto-filled" style={{ background: form.state ? "#f0fff4" : "" }} />
                </Col>
                <Col md={4}>
                  <Form.Label>Country</Form.Label>
                  <Form.Control value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Auto-filled" style={{ background: form.country ? "#f0fff4" : "" }} />
                </Col>
              </Row>


            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={() => setShowForm(false)} style={{ borderRadius: 8, fontWeight: 600 }}>Cancel</Button>
              <button type="submit" className="btn-add" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                {saving && <Spinner animation="border" size="sm" />}
                Create Staff
              </button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Credentials Modal */}
        <Modal show={!!createdCreds} onHide={() => setCreatedCreds(null)} centered className="sf-modal">
          <Modal.Header closeButton>
            <Modal.Title>✅ Staff Created — Login Credentials</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "24px" }}>
            <p style={{ fontSize: ".88rem", color: "#374151", marginBottom: 16 }}>
              Share these credentials with <strong>{createdCreds?.name}</strong>:
            </p>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "16px 20px", fontFamily: "monospace" }}>
              <div style={{ marginBottom: 8 }}><span style={{ color: "#6b7280", fontSize: ".8rem" }}>EMAIL</span><br /><strong>{createdCreds?.email || "—"}</strong></div>
              <div><span style={{ color: "#6b7280", fontSize: ".8rem" }}>PASSWORD</span><br /><strong style={{ fontSize: "1.4rem", letterSpacing: 3, color: "#0369a1" }}>{createdCreds?.password}</strong></div>
            </div>
            <p style={{ fontSize: ".78rem", color: "#ef4444", marginTop: 12, marginBottom: 0 }}>⚠️ Copy this password now — it won't be shown again.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setCreatedCreds(null)} style={{ borderRadius: 8, fontWeight: 600 }}>Done</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  )
}

export default AdminStaff
