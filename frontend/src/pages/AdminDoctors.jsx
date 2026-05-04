import { useEffect, useState } from "react"
import {
  Table, Button, Badge, Modal, Form, Row, Col, Spinner, Alert, Image
} from "react-bootstrap"
import api from "../services/api"
import usePincode from "../hooks/usePincode"

// ─── Design tokens ───────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  :root {
    --bg:         #f4f6fb;
    --card:       #ffffff;
    --primary:    #1a56db;
    --primary-lt: #ebf0fd;
    --accent:     #0ea5e9;
    --success:    #16a34a;
    --danger:     #dc2626;
    --muted:      #6b7280;
    --border:     #e5e8f0;
    --shadow:     0 2px 16px rgba(26,86,219,.08);
    --shadow-md:  0 8px 32px rgba(26,86,219,.13);
    --radius:     14px;
    --radius-sm:  8px;
    --font-head:  'Syne', sans-serif;
    --font-body:  'DM Sans', sans-serif;
  }

  .ad-wrap { font-family: var(--font-body); }

  .ad-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .ad-title { font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; color: #0f172a; letter-spacing: -.3px; margin: 0; }
  .ad-title span { color: var(--primary); }
  .ad-subtitle { font-size: .78rem; color: var(--muted); margin: 2px 0 0; }

  .ad-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
  .ad-stat { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 10px 16px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow); }
  .ad-stat-icon { font-size: 1.2rem; }
  .ad-stat-val { font-family: var(--font-head); font-weight: 800; font-size: 1.1rem; color: #0f172a; line-height: 1; }
  .ad-stat-lbl { font-size: .7rem; color: var(--muted); margin-top: 1px; }

  .btn-add { background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); padding: 8px 20px; font-family: var(--font-head); font-weight: 700; font-size: .88rem; letter-spacing: .3px; transition: background .18s, box-shadow .18s, transform .12s; box-shadow: 0 2px 12px rgba(26,86,219,.25); cursor: pointer; }
  .btn-add:hover { background: #1245b5; box-shadow: 0 4px 20px rgba(26,86,219,.35); transform: translateY(-1px); }

  .ad-table-card { background: var(--card); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .ad-table { margin: 0; font-size: .87rem; }
  .ad-table thead tr { background: #f8faff; }
  .ad-table thead th { font-family: var(--font-head); font-weight: 700; font-size: .72rem; text-transform: uppercase; letter-spacing: .8px; color: var(--muted); border-bottom: 2px solid var(--border); padding: 11px 14px; white-space: nowrap; }
  .ad-table tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
  .ad-table tbody tr:hover { background: #f8faff; }
  .ad-table tbody tr:last-child { border-bottom: none; }
  .ad-table td { padding: 11px 14px; vertical-align: middle; }

  .doc-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); }
  .doc-avatar-placeholder { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#e8effd,#c7d7fa); display: flex; align-items: center; justify-content: center; font-size: 13px; font-family: var(--font-head); font-weight: 800; color: var(--primary); border: 2px solid var(--border); }
  .doc-name { font-weight: 600; color: #0f172a; font-size: .88rem; }
  .doc-meta { font-size: .74rem; color: var(--muted); }

  .badge-status { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: .74rem; font-weight: 600; font-family: var(--font-body); white-space: nowrap; }
  .badge-status.clickable { cursor: pointer; transition: opacity .15s; user-select: none; }
  .badge-status.clickable:hover { opacity: .8; }
  .badge-active   { background: #dcfce7; color: #15803d; }
  .badge-inactive { background: #fee2e2; color: #b91c1c; }
  .badge-avail    { background: #dbeafe; color: #1d4ed8; }
  .badge-unavail  { background: #f3f4f6; color: #6b7280; }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  .fee-tag { display: inline-flex; align-items: center; gap: 3px; background: var(--primary-lt); color: var(--primary); border-radius: 6px; padding: 2px 8px; font-size: .75rem; font-weight: 600; margin-right: 3px; }

  .action-btns { display: flex; gap: 5px; }
  .btn-icon { width: 30px; height: 30px; border-radius: 7px; border: 1.5px solid var(--border); background: var(--card); display: flex; align-items: center; justify-content: center; font-size: .82rem; cursor: pointer; transition: all .15s; padding: 0; line-height: 1; }
  .btn-icon:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,.1); }
  .btn-icon.view { border-color: #bae6fd; background: #f0f9ff; }
  .btn-icon.edit { border-color: #fde68a; background: #fffbeb; }
  .btn-icon.mail { border-color: #bbf7d0; background: #f0fdf4; }
  .btn-icon.del  { border-color: #fecaca; background: #fff5f5; }

  .ad-search-wrap { position: relative; flex: 1; max-width: 300px; }
  .ad-search { border-radius: 9px; border: 1.5px solid var(--border); padding: 7px 13px 7px 34px; font-size: .86rem; width: 100%; outline: none; transition: border-color .18s; background: var(--card); font-family: var(--font-body); }
  .ad-search:focus { border-color: var(--primary); }
  .ad-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); font-size: .85rem; color: var(--muted); pointer-events: none; }

  .ad-modal .modal-content { border-radius: var(--radius); border: none; box-shadow: var(--shadow-md); font-family: var(--font-body); }
  .ad-modal .modal-header { background: linear-gradient(135deg, #1a56db 0%, #0ea5e9 100%); border-radius: var(--radius) var(--radius) 0 0; padding: 16px 22px; border-bottom: none; }
  .ad-modal .modal-title { font-family: var(--font-head); font-weight: 800; color: #fff; font-size: 1.05rem; }
  .ad-modal .modal-header .btn-close { filter: invert(1) brightness(2); opacity: .8; }
  .ad-modal .modal-footer { border-top: 1px solid var(--border); padding: 13px 20px; gap: 8px; }
  .ad-modal .form-label { font-size: .79rem; font-weight: 600; color: #374151; margin-bottom: 4px; }
  .ad-modal .form-control, .ad-modal .form-select { border-radius: var(--radius-sm); border: 1.5px solid var(--border); font-size: .86rem; padding: 7px 11px; transition: border-color .18s, box-shadow .18s; font-family: var(--font-body); }
  .ad-modal .form-control:focus, .ad-modal .form-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(26,86,219,.1); }
  .ad-modal .form-check-input:checked { background-color: var(--primary); border-color: var(--primary); }

  .section-label { font-family: var(--font-head); font-size: .74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); display: flex; align-items: center; gap: 8px; margin-bottom: 12px; margin-top: 6px; }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--primary-lt); }

  .photo-ring { width: 90px; height: 90px; border-radius: 50%; overflow: hidden; margin: 0 auto 8px; border: 3px solid var(--primary-lt); box-shadow: 0 0 0 2px var(--primary); background: linear-gradient(135deg,#e8effd,#c7d7fa); display: flex; align-items: center; justify-content: center; font-size: 34px; position: relative; cursor: pointer; }
  .photo-ring img { width: 100%; height: 100%; object-fit: cover; }
  .photo-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(26,86,219,.7); color: #fff; font-size: .65rem; text-align: center; padding: 4px; font-weight: 700; letter-spacing: .3px; }

  .edu-row { background: #f8faff; border-radius: 9px; padding: 11px; border: 1px solid var(--border); margin-bottom: 7px; }

  .view-info-block { background: #f8faff; border-radius: 10px; padding: 14px; border: 1px solid var(--border); margin-bottom: 14px; }
  .view-field-lbl { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); margin-bottom: 2px; }
  .view-field-val { font-size: .88rem; font-weight: 500; color: #111827; }

  .empty-state { text-align: center; padding: 50px 20px; color: var(--muted); }
  .empty-state .icon { font-size: 2.5rem; margin-bottom: 10px; opacity: .4; }
  .ad-alert { border-radius: var(--radius-sm); border: none; font-size: .86rem; font-weight: 500; }
  .btn-primary-custom { background: var(--primary); color: #fff; border: none; border-radius: 8px; padding: 8px 22px; font-family: var(--font-head); font-weight: 700; font-size: .88rem; display: inline-flex; align-items: center; gap: 7px; cursor: pointer; transition: background .18s; }
  .btn-primary-custom:hover { background: #1245b5; }
  .btn-primary-custom:disabled { opacity: .65; cursor: not-allowed; }
`

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const GENDERS = ["Male", "Female", "Other"]
const emptyEdu = { degree: "", institution: "", start_year: "", end_year: "" }
const emptyForm = {
  name: "", email: "", phone: "", dob: "", gender: "", blood_group: "",
  years_of_experience: "", department_id: "", designation_id: "",
  medical_license_number: "", languages_spoken: "", bio: "",
  address1: "", address2: "", city: "", state: "", pincode: "", country: "",
  online_consultation: false, online_fee: "", offline_consultation: false, offline_fee: "",
  status: "Active", available: true, education: [{ ...emptyEdu }]
}

const avatarInitials = (name = "") =>
  name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

const AdminDoctors = ({ hospitalId }) => {
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showView, setShowView] = useState(false)
  const [editId, setEditId] = useState(null)
  const [viewDoc, setViewDoc] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { pincodeLoading, pincodeError, handlePincodeChange } = usePincode(setForm)

  useEffect(() => {
    if (hospitalId) {
      fetchDoctors()
      fetchDepartments()
      fetchDesignations()
    }
  }, [hospitalId])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin-doctor/hospital/${hospitalId}`)
      if (res.data.success) setDoctors(res.data.data)
    } catch { setError("Failed to load doctors") }
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

  const openCreate = () => {
    setEditId(null); setForm(emptyForm); setPhotoFile(null); setPhotoPreview(null); setError(""); setShowForm(true)
  }

  const openEdit = (doc) => {
    setEditId(doc.id)
    let edu = [{ ...emptyEdu }]
    try { edu = doc.education ? (typeof doc.education === "string" ? JSON.parse(doc.education) : doc.education) : [{ ...emptyEdu }] } catch {}
    setForm({
      name: doc.name || "", email: doc.email || "", phone: doc.phone || "",
      dob: doc.dob ? doc.dob.split("T")[0] : "", gender: doc.gender || "",
      blood_group: doc.blood_group || "", years_of_experience: doc.years_of_experience || "",
      department_id: doc.department_id || "", designation_id: doc.designation_id || "",
      medical_license_number: doc.medical_license_number || "",
      languages_spoken: doc.languages_spoken || "", bio: doc.bio || "",
      address1: doc.address1 || "", address2: doc.address2 || "",
      city: doc.city || "", state: doc.state || "", pincode: doc.pincode || "", country: doc.country || "",
      online_consultation: !!doc.online_consultation, online_fee: doc.online_fee || "",
      offline_consultation: !!doc.offline_consultation, offline_fee: doc.offline_fee || "",
      status: doc.status || "Active", available: doc.available !== 0,
      education: edu.length ? edu : [{ ...emptyEdu }]
    })
    setPhotoFile(null)
    setPhotoPreview(doc.photo ? `http://localhost:5000${doc.photo}` : null)
    setError(""); setShowForm(true)
  }

  const openView = (doc) => { setViewDoc(doc); setShowView(true) }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)) }
  }

  const handleEduChange = (i, field, val) => {
    const updated = [...form.education]
    updated[i] = { ...updated[i], [field]: val }
    setForm({ ...form, education: updated })
  }

  const addEdu = () => setForm({ ...form, education: [...form.education, { ...emptyEdu }] })
  const removeEdu = (i) => setForm({ ...form, education: form.education.filter((_, idx) => idx !== i) })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError("Name is required")
    setSaving(true); setError("")
    try {
      const fd = new FormData()
      fd.append("hospital_id", hospitalId)
      Object.entries(form).forEach(([k, v]) => {
        if (k === "education") fd.append(k, JSON.stringify(v))
        else fd.append(k, v)
      })
      if (photoFile) fd.append("photo", photoFile)

      if (editId) await api.put(`/admin-doctor/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } })
      else await api.post("/admin-doctor", fd, { headers: { "Content-Type": "multipart/form-data" } })

      setSuccess(editId ? "Doctor updated!" : (form.email ? "Doctor created & credentials sent to email!" : "Doctor created!"))
      setShowForm(false)
      fetchDoctors()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.response?.data?.message || "Failed to save") }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this doctor?")) return
    try {
      await api.delete(`/admin-doctor/${id}`)
      setSuccess("Doctor deleted!"); fetchDoctors()
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Failed to delete") }
  }

  const handleToggleStatus = async (doc) => {
    const newStatus = doc.status === "Active" ? "Inactive" : "Active"
    try {
      await api.patch(`/admin-doctor/${doc.id}/status`, { status: newStatus })
      fetchDoctors()
    } catch { setError("Failed to update status") }
  }

  const handleSendCredentials = async (doc) => {
    if (!doc.email) return setError("Doctor has no email set")
    if (!window.confirm(`Send login credentials to ${doc.email}?`)) return
    try {
      await api.post(`/admin-doctor/${doc.id}/send-credentials`)
      setSuccess(`Credentials sent to ${doc.email}`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.response?.data?.message || "Failed to send credentials") }
  }

  const getEdu = (doc) => {
    try { return doc.education ? (typeof doc.education === "string" ? JSON.parse(doc.education) : doc.education) : [] } catch { return [] }
  }

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    (d.department_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.designation_name || "").toLowerCase().includes(search.toLowerCase())
  )

  if (!hospitalId) return <p className="text-muted">No hospital assigned.</p>

  return (
    <>
      <style>{css}</style>
      <div className="ad-wrap">
        {error && <Alert variant="danger" dismissible onClose={() => setError("")} className="ad-alert mb-3">{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess("")} className="ad-alert mb-3">✅ {success}</Alert>}

        {/* Header */}
        <div className="ad-header">
          <div>
            <h1 className="ad-title">Doctor <span>Management</span></h1>
            <p className="ad-subtitle">Manage hospital doctors, credentials and schedules</p>
          </div>
          <button className="btn-add" onClick={openCreate}>＋ Add Doctor</button>
        </div>

        {/* Stats */}
        <div className="ad-stats">
          {[
            { icon: "🩺", val: doctors.length, lbl: "Total Doctors" },
            { icon: "✅", val: doctors.filter(d => d.status === "Active").length, lbl: "Active" },
            { icon: "📅", val: doctors.filter(d => d.available).length, lbl: "Available" },
            { icon: "🏥", val: departments.length, lbl: "Departments" },
          ].map(s => (
            <div className="ad-stat" key={s.lbl}>
              <div className="ad-stat-icon">{s.icon}</div>
              <div>
                <div className="ad-stat-val">{s.val}</div>
                <div className="ad-stat-lbl">{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="ad-table-card">
          <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div className="ad-search-wrap">
              <span className="ad-search-icon">🔍</span>
              <input className="ad-search" placeholder="Search doctors, department…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: "auto", fontSize: ".78rem", color: "var(--muted)", fontWeight: 500 }}>
              {filtered.length} of {doctors.length} doctors
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table ad-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th style={{ width: 46, paddingRight: 0 }}></th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Contact</th>
                    <th>Fees</th>
                    <th>Available</th>
                    <th>Status</th>
                    <th style={{ width: 130 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9}>
                      <div className="empty-state">
                        <div className="icon">🩺</div>
                        <p style={{ margin: 0, fontSize: ".88rem" }}>No doctors found{search ? ` for "${search}"` : ""}.</p>
                      </div>
                    </td></tr>
                  ) : filtered.map((doc, i) => (
                    <tr key={doc.id}>
                      <td style={{ color: "var(--muted)", fontWeight: 600, fontSize: ".78rem" }}>{i + 1}</td>
                      <td style={{ paddingRight: 0 }}>
                        {doc.photo
                          ? <img src={`http://localhost:5000${doc.photo}`} className="doc-avatar" alt="" />
                          : <div className="doc-avatar-placeholder">{avatarInitials(doc.name)}</div>}
                      </td>
                      <td>
                        <div className="doc-name">{doc.name}</div>
                        <div className="doc-meta">{doc.designation_name || "—"}</div>
                      </td>
                      <td>
                        {doc.department_name
                          ? <span style={{ background: "var(--primary-lt)", color: "var(--primary)", borderRadius: 6, padding: "2px 9px", fontSize: ".76rem", fontWeight: 600 }}>{doc.department_name}</span>
                          : <span style={{ color: "var(--muted)" }}>—</span>}
                      </td>
                      <td>
                        <div style={{ fontSize: ".83rem", fontWeight: 500 }}>{doc.phone || "—"}</div>
                        <div style={{ fontSize: ".73rem", color: "var(--muted)" }}>{doc.email || ""}</div>
                      </td>
                      <td>
                        {doc.online_consultation ? <span className="fee-tag">🌐 ₹{doc.online_fee}</span> : null}
                        {doc.offline_consultation ? <span className="fee-tag">🏥 ₹{doc.offline_fee}</span> : null}
                        {!doc.online_consultation && !doc.offline_consultation ? <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>—</span> : null}
                      </td>
                      <td>
                        <span className={`badge-status ${doc.available ? "badge-avail" : "badge-unavail"}`}>
                          <span className="badge-dot" />{doc.available ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge-status clickable ${doc.status === "Active" ? "badge-active" : "badge-inactive"}`}
                          onClick={() => handleToggleStatus(doc)}
                          title="Click to toggle status"
                        >
                          <span className="badge-dot" />{doc.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon view" title="View" onClick={() => openView(doc)}>👁️</button>
                          <button className="btn-icon edit" title="Edit" onClick={() => openEdit(doc)}>✏️</button>
                          <button className="btn-icon mail" title="Send Credentials" onClick={() => handleSendCredentials(doc)}>📧</button>
                          <button className="btn-icon del" title="Delete" onClick={() => handleDelete(doc.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
        <Modal show={showForm} onHide={() => setShowForm(false)} size="xl" backdrop="static" className="ad-modal">
          <Modal.Header closeButton>
            <Modal.Title>{editId ? "✏️ Edit Doctor" : "＋ Add Doctor"}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ maxHeight: "74vh", overflowY: "auto", padding: "22px 24px" }}>
              {error && <Alert variant="danger" className="ad-alert mb-3">{error}</Alert>}

              {/* Photo */}
              <div className="text-center mb-4">
                <label style={{ cursor: "pointer" }}>
                  <div className="photo-ring">
                    {photoPreview ? <img src={photoPreview} alt="preview" /> : <span>👤</span>}
                    <div className="photo-overlay">Change Photo</div>
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                </label>
                <div style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 4 }}>Click to upload photo</div>
              </div>

              {/* Personal Info */}
              <div className="section-label">Personal Information</div>
              <Row className="mb-3 g-3">
                <Col md={4}><Form.Label>Full Name *</Form.Label><Form.Control value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Doe" /></Col>
                <Col md={4}><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="doctor@hospital.com" /></Col>
                <Col md={4}><Form.Label>Phone</Form.Label><Form.Control value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></Col>
                <Col md={3}><Form.Label>Date of Birth</Form.Label><Form.Control type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></Col>
                <Col md={3}><Form.Label>Gender</Form.Label>
                  <Form.Select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select gender</option>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </Form.Select>
                </Col>
                <Col md={3}><Form.Label>Blood Group</Form.Label>
                  <Form.Select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                  </Form.Select>
                </Col>
                <Col md={3}><Form.Label>Years of Experience</Form.Label><Form.Control type="number" min={0} value={form.years_of_experience} onChange={e => setForm({ ...form, years_of_experience: e.target.value })} placeholder="0" /></Col>
                <Col md={4}><Form.Label>Department</Form.Label>
                  <Form.Select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Form.Select>
                </Col>
                <Col md={4}><Form.Label>Designation</Form.Label>
                  <Form.Select value={form.designation_id} onChange={e => setForm({ ...form, designation_id: e.target.value })}>
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Form.Select>
                </Col>
                <Col md={4}><Form.Label>Medical License No.</Form.Label><Form.Control value={form.medical_license_number} onChange={e => setForm({ ...form, medical_license_number: e.target.value })} placeholder="MH-12345" /></Col>
                <Col md={6}><Form.Label>Languages Spoken</Form.Label><Form.Control value={form.languages_spoken} onChange={e => setForm({ ...form, languages_spoken: e.target.value })} placeholder="English, Hindi, Gujarati" /></Col>
                <Col md={6}><Form.Label>Bio</Form.Label><Form.Control as="textarea" rows={2} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Short professional summary…" /></Col>
              </Row>

              {/* Address */}
              <div className="section-label">Address Information</div>
              <Row className="mb-3 g-3">
                <Col md={6}><Form.Label>Address Line 1</Form.Label><Form.Control value={form.address1} onChange={e => setForm({ ...form, address1: e.target.value })} /></Col>
                <Col md={6}><Form.Label>Address Line 2</Form.Label><Form.Control value={form.address2} onChange={e => setForm({ ...form, address2: e.target.value })} /></Col>
                <Col md={4}>
                  <Form.Label>Pin Code</Form.Label>
                  <div style={{ position: "relative" }}>
                    <Form.Control value={form.pincode} onChange={handlePincodeChange} placeholder="Enter pin code" />
                    {pincodeLoading && <Spinner animation="border" size="sm" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--primary)" }} />}
                  </div>
                  {pincodeError && <div style={{ color: "var(--danger)", fontSize: ".75rem", marginTop: 3 }}>{pincodeError}</div>}
                </Col>
                <Col md={4}>
                  <Form.Label>City</Form.Label>
                  <Form.Control value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Auto-filled" style={{ background: form.city ? "#f0fff4" : "" }} />
                </Col>
                <Col md={4}>
                  <Form.Label>State</Form.Label>
                  <Form.Control value={form.state || ""} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Auto-filled" style={{ background: form.state ? "#f0fff4" : "" }} />
                </Col>
                <Col md={4}>
                  <Form.Label>Country</Form.Label>
                  <Form.Control value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Auto-filled" style={{ background: form.country ? "#f0fff4" : "" }} />
                </Col>
              </Row>

              {/* Appointment */}
              <div className="section-label">Consultation & Fees</div>
              <Row className="mb-3 g-3 align-items-center">
                <Col md={2}>
                  <Form.Check type="switch" id="sw-online" label="Online" checked={form.online_consultation}
                    onChange={e => setForm({ ...form, online_consultation: e.target.checked })} />
                </Col>
                {form.online_consultation && (
                  <Col md={3}><Form.Label>Online Fee (₹)</Form.Label><Form.Control type="number" min={0} value={form.online_fee} onChange={e => setForm({ ...form, online_fee: e.target.value })} placeholder="500" /></Col>
                )}
                <Col md={2}>
                  <Form.Check type="switch" id="sw-offline" label="Offline" checked={form.offline_consultation}
                    onChange={e => setForm({ ...form, offline_consultation: e.target.checked })} />
                </Col>
                {form.offline_consultation && (
                  <Col md={3}><Form.Label>Offline Fee (₹)</Form.Label><Form.Control type="number" min={0} value={form.offline_fee} onChange={e => setForm({ ...form, offline_fee: e.target.value })} placeholder="1000" /></Col>
                )}
              </Row>

              {/* Education */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="section-label" style={{ marginBottom: 0, flex: 1 }}>Education</div>
                <button type="button" style={{ background: "var(--primary-lt)", color: "var(--primary)", border: "none", borderRadius: 7, padding: "4px 13px", fontSize: ".78rem", fontWeight: 700, cursor: "pointer", marginLeft: 10, fontFamily: "var(--font-head)" }} onClick={addEdu}>+ Add</button>
              </div>
              {form.education.map((edu, i) => (
                <div key={i} className="edu-row">
                  <Row className="g-2 align-items-end">
                    <Col md={3}><Form.Label className="small">Degree</Form.Label><Form.Control size="sm" value={edu.degree} onChange={e => handleEduChange(i, "degree", e.target.value)} placeholder="MBBS, MD…" /></Col>
                    <Col md={4}><Form.Label className="small">Institution</Form.Label><Form.Control size="sm" value={edu.institution} onChange={e => handleEduChange(i, "institution", e.target.value)} placeholder="University / College" /></Col>
                    <Col md={2}><Form.Label className="small">Start Year</Form.Label><Form.Control size="sm" type="number" value={edu.start_year} onChange={e => handleEduChange(i, "start_year", e.target.value)} placeholder="2010" /></Col>
                    <Col md={2}><Form.Label className="small">End Year</Form.Label><Form.Control size="sm" type="number" value={edu.end_year} onChange={e => handleEduChange(i, "end_year", e.target.value)} placeholder="2016" /></Col>
                    <Col md={1} className="text-end">
                      {form.education.length > 1 && (
                        <button type="button" style={{ background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontWeight: 700, fontSize: ".85rem" }} onClick={() => removeEdu(i)}>✕</button>
                      )}
                    </Col>
                  </Row>
                </div>
              ))}

              {/* Status */}
              <div className="section-label mt-3">Settings</div>
              <Row className="g-3 align-items-center">
                <Col md={4}><Form.Label>Status</Form.Label>
                  <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option><option>Inactive</option>
                  </Form.Select>
                </Col>
                <Col md={5} className="d-flex align-items-end" style={{ paddingBottom: 4 }}>
                  <Form.Check type="switch" id="sw-avail" label="Available for Appointments" checked={form.available}
                    onChange={e => setForm({ ...form, available: e.target.checked })} />
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={() => setShowForm(false)} style={{ borderRadius: 8, fontWeight: 600 }}>Cancel</Button>
              <button type="submit" className="btn-primary-custom" disabled={saving}>
                {saving && <Spinner animation="border" size="sm" />}
                {editId ? "Update Doctor" : "Create Doctor"}
              </button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* ── View Modal ───────────────────────────────────────────────────── */}
        <Modal show={showView} onHide={() => setShowView(false)} size="lg" className="ad-modal">
          <Modal.Header closeButton>
            <Modal.Title>👁️ Doctor Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "75vh", overflowY: "auto", padding: "22px 24px" }}>
            {viewDoc && (
              <>
                <div style={{ textAlign: "center", marginBottom: 22 }}>
                  <div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 12px", border: "3px solid var(--primary)", overflow: "hidden", background: "linear-gradient(135deg,#e8effd,#c7d7fa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontFamily: "var(--font-head)", fontWeight: 800, color: "var(--primary)" }}>
                    {viewDoc.photo
                      ? <img src={`http://localhost:5000${viewDoc.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      : avatarInitials(viewDoc.name)}
                  </div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.15rem", color: "#0f172a" }}>{viewDoc.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 2 }}>
                    {viewDoc.designation_name || ""}{viewDoc.department_name ? ` · ${viewDoc.department_name}` : ""}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8 }}>
                    <span className={`badge-status ${viewDoc.status === "Active" ? "badge-active" : "badge-inactive"}`}><span className="badge-dot" />{viewDoc.status}</span>
                    <span className={`badge-status ${viewDoc.available ? "badge-avail" : "badge-unavail"}`}><span className="badge-dot" />{viewDoc.available ? "Available" : "Unavailable"}</span>
                  </div>
                </div>

                <div className="section-label">Personal Information</div>
                <div className="view-info-block">
                  <Row className="g-2">
                    {[
                      ["Email", viewDoc.email], ["Phone", viewDoc.phone],
                      ["Date of Birth", viewDoc.dob ? viewDoc.dob.split("T")[0] : null], ["Gender", viewDoc.gender],
                      ["Blood Group", viewDoc.blood_group], ["Experience", viewDoc.years_of_experience ? `${viewDoc.years_of_experience} years` : null],
                      ["License No.", viewDoc.medical_license_number], ["Languages", viewDoc.languages_spoken],
                    ].map(([lbl, val]) => (
                      <Col md={6} key={lbl}>
                        <div className="view-field-lbl">{lbl}</div>
                        <div className="view-field-val">{val || "—"}</div>
                      </Col>
                    ))}
                    {viewDoc.bio && (
                      <Col md={12}>
                        <div className="view-field-lbl">Bio</div>
                        <div className="view-field-val">{viewDoc.bio}</div>
                      </Col>
                    )}
                  </Row>
                </div>

                <div className="section-label">Address</div>
                <div className="view-info-block">
                  <Row className="g-2">
                    {[["Address 1", viewDoc.address1], ["Address 2", viewDoc.address2], ["City", viewDoc.city], ["Pin Code", viewDoc.pincode], ["Country", viewDoc.country]].map(([lbl, val]) => (
                      <Col md={4} key={lbl}>
                        <div className="view-field-lbl">{lbl}</div>
                        <div className="view-field-val">{val || "—"}</div>
                      </Col>
                    ))}
                  </Row>
                </div>

                <div className="section-label">Consultation</div>
                <div className="view-info-block">
                  <Row>
                    <Col md={6}>
                      <div className="view-field-lbl">Online</div>
                      <div className="view-field-val">{viewDoc.online_consultation ? `✅ ₹${viewDoc.online_fee}` : "❌ Not offered"}</div>
                    </Col>
                    <Col md={6}>
                      <div className="view-field-lbl">Offline / In-person</div>
                      <div className="view-field-val">{viewDoc.offline_consultation ? `✅ ₹${viewDoc.offline_fee}` : "❌ Not offered"}</div>
                    </Col>
                  </Row>
                </div>

                {getEdu(viewDoc).length > 0 && (
                  <>
                    <div className="section-label">Education</div>
                    <div style={{ overflowX: "auto" }}>
                      <table className="table ad-table" style={{ borderRadius: 10, overflow: "hidden" }}>
                        <thead><tr><th>Degree</th><th>Institution</th><th>From</th><th>To</th></tr></thead>
                        <tbody>
                          {getEdu(viewDoc).map((e, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{e.degree || "—"}</td>
                              <td>{e.institution || "—"}</td>
                              <td>{e.start_year || "—"}</td>
                              <td>{e.end_year || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowView(false)} style={{ borderRadius: 8, fontWeight: 600 }}>Close</Button>
            {viewDoc && (
              <button onClick={() => { setShowView(false); openEdit(viewDoc) }} className="btn-primary-custom">
                ✏️ Edit Doctor
              </button>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    </>
  )
}

export default AdminDoctors