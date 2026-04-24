import { useEffect, useState } from "react"
import {
  Table, Button, Badge, Modal, Form, Row, Col, Spinner, Alert, Image
} from "react-bootstrap"
import api from "../services/api"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const GENDERS = ["Male", "Female", "Other"]

const emptyEdu = { degree: "", institution: "", start_year: "", end_year: "" }

const emptyForm = {
  name: "", email: "", phone: "", dob: "", gender: "", blood_group: "",
  years_of_experience: "", department_id: "", designation_id: "",
  medical_license_number: "", languages_spoken: "", bio: "",
  address1: "", address2: "", city: "", pincode: "", country: "",
  online_consultation: false, online_fee: "", offline_consultation: false, offline_fee: "",
  status: "Active", available: true, education: [{ ...emptyEdu }]
}

const AdminDoctors = ({ hospitalId }) => {
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
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
      const res = await api.get(`/admin-department/${hospitalId}`)
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
    setEditId(null)
    setForm(emptyForm)
    setPhotoFile(null)
    setPhotoPreview(null)
    setError("")
    setShowForm(true)
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
      city: doc.city || "", pincode: doc.pincode || "", country: doc.country || "",
      online_consultation: !!doc.online_consultation, online_fee: doc.online_fee || "",
      offline_consultation: !!doc.offline_consultation, offline_fee: doc.offline_fee || "",
      status: doc.status || "Active", available: doc.available !== 0,
      education: edu.length ? edu : [{ ...emptyEdu }]
    })
    setPhotoFile(null)
    setPhotoPreview(doc.photo ? `http://localhost:5000${doc.photo}` : null)
    setError("")
    setShowForm(true)
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

  if (!hospitalId) return <p className="text-muted">No hospital assigned.</p>

  return (
    <div>
      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Doctors List</h6>
        <Button size="sm" variant="primary" onClick={openCreate}>+ Add Doctor</Button>
      </div>

      {loading ? <div className="text-center py-4"><Spinner animation="border" /></div> : (
        <div style={{ overflowX: "auto" }}>
          <Table bordered hover size="sm" className="align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Fees</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr><td colSpan={10} className="text-center text-muted">No doctors found</td></tr>
              ) : doctors.map((doc, i) => (
                <tr key={doc.id}>
                  <td>{i + 1}</td>
                  <td>
                    {doc.photo
                      ? <Image src={`http://localhost:5000${doc.photo}`} roundedCircle width={36} height={36} style={{ objectFit: "cover" }} />
                      : <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>}
                  </td>
                  <td className="fw-semibold">{doc.name}</td>
                  <td>{doc.designation_name || "—"}</td>
                  <td>{doc.department_name || "—"}</td>
                  <td>{doc.phone || "—"}</td>
                  <td>
                    {doc.online_consultation ? <span className="me-1">🌐 ₹{doc.online_fee}</span> : null}
                    {doc.offline_consultation ? <span>🏥 ₹{doc.offline_fee}</span> : null}
                    {!doc.online_consultation && !doc.offline_consultation ? "—" : null}
                  </td>
                  <td>
                    <Badge bg={doc.available ? "success" : "secondary"}>
                      {doc.available ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      bg={doc.status === "Active" ? "success" : "danger"}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleToggleStatus(doc)}
                    >{doc.status}</Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-info" className="me-1" onClick={() => openView(doc)}>👁️</Button>
                    <Button size="sm" variant="outline-warning" className="me-1" onClick={() => openEdit(doc)}>✏️</Button>
                    <Button size="sm" variant="outline-success" className="me-1" onClick={() => handleSendCredentials(doc)} title="Send Login Credentials">📧</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(doc.id)}>🗑️</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="xl" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Doctor" : "Add Doctor"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ maxHeight: "75vh", overflowY: "auto" }}>
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Photo */}
            <div className="mb-4 text-center">
              <div style={{ width: 90, height: 90, borderRadius: "50%", overflow: "hidden", margin: "0 auto 8px", border: "2px solid #ddd", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 36 }}>👤</span>}
              </div>
              <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} style={{ maxWidth: 220, margin: "0 auto" }} />
            </div>

            {/* Personal Info */}
            <div className="fw-semibold mb-2 text-primary">Personal Information</div>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Full Name *</Form.Label><Form.Control value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Doe" /></Col>
              <Col md={4}><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Col>
              <Col md={4}><Form.Label>Phone</Form.Label><Form.Control value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Col>
            </Row>
            <Row className="mb-3">
              <Col md={3}><Form.Label>Date of Birth</Form.Label><Form.Control type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></Col>
              <Col md={3}><Form.Label>Gender</Form.Label>
                <Form.Select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </Form.Select>
              </Col>
              <Col md={3}><Form.Label>Blood Group</Form.Label>
                <Form.Select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                </Form.Select>
              </Col>
              <Col md={3}><Form.Label>Years of Experience</Form.Label><Form.Control type="number" min={0} value={form.years_of_experience} onChange={e => setForm({ ...form, years_of_experience: e.target.value })} /></Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>Department</Form.Label>
                <Form.Select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}><Form.Label>Designation</Form.Label>
                <Form.Select value={form.designation_id} onChange={e => setForm({ ...form, designation_id: e.target.value })}>
                  <option value="">Select Designation</option>
                  {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}><Form.Label>Medical License No.</Form.Label><Form.Control value={form.medical_license_number} onChange={e => setForm({ ...form, medical_license_number: e.target.value })} /></Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}><Form.Label>Languages Spoken</Form.Label><Form.Control value={form.languages_spoken} onChange={e => setForm({ ...form, languages_spoken: e.target.value })} placeholder="e.g. English, Hindi" /></Col>
              <Col md={6}><Form.Label>Bio</Form.Label><Form.Control as="textarea" rows={2} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></Col>
            </Row>

            <hr />
            {/* Address */}
            <div className="fw-semibold mb-2 text-primary">Address Information</div>
            <Row className="mb-3">
              <Col md={6}><Form.Label>Address Line 1</Form.Label><Form.Control value={form.address1} onChange={e => setForm({ ...form, address1: e.target.value })} /></Col>
              <Col md={6}><Form.Label>Address Line 2</Form.Label><Form.Control value={form.address2} onChange={e => setForm({ ...form, address2: e.target.value })} /></Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><Form.Label>City</Form.Label><Form.Control value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></Col>
              <Col md={4}><Form.Label>Pin Code</Form.Label><Form.Control value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} /></Col>
              <Col md={4}><Form.Label>Country</Form.Label><Form.Control value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></Col>
            </Row>

            <hr />
            {/* Appointment */}
            <div className="fw-semibold mb-2 text-primary">Appointment Information</div>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Check type="switch" label="Online Consultation" checked={form.online_consultation}
                  onChange={e => setForm({ ...form, online_consultation: e.target.checked })} />
              </Col>
              {form.online_consultation && (
                <Col md={3}><Form.Label>Online Fee (₹)</Form.Label><Form.Control type="number" min={0} value={form.online_fee} onChange={e => setForm({ ...form, online_fee: e.target.value })} /></Col>
              )}
              <Col md={3}>
                <Form.Check type="switch" label="Offline Consultation" checked={form.offline_consultation}
                  onChange={e => setForm({ ...form, offline_consultation: e.target.checked })} />
              </Col>
              {form.offline_consultation && (
                <Col md={3}><Form.Label>Offline Fee (₹)</Form.Label><Form.Control type="number" min={0} value={form.offline_fee} onChange={e => setForm({ ...form, offline_fee: e.target.value })} /></Col>
              )}
            </Row>

            <hr />
            {/* Education */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-semibold text-primary">Education Information</div>
              <Button size="sm" variant="outline-primary" onClick={addEdu}>+ Add</Button>
            </div>
            {form.education.map((edu, i) => (
              <Row key={i} className="mb-2 align-items-end">
                <Col md={3}><Form.Label className="small">Degree</Form.Label><Form.Control size="sm" value={edu.degree} onChange={e => handleEduChange(i, "degree", e.target.value)} placeholder="MBBS, MD..." /></Col>
                <Col md={4}><Form.Label className="small">Institution</Form.Label><Form.Control size="sm" value={edu.institution} onChange={e => handleEduChange(i, "institution", e.target.value)} placeholder="University / College" /></Col>
                <Col md={2}><Form.Label className="small">Start Year</Form.Label><Form.Control size="sm" type="number" value={edu.start_year} onChange={e => handleEduChange(i, "start_year", e.target.value)} placeholder="2010" /></Col>
                <Col md={2}><Form.Label className="small">End Year</Form.Label><Form.Control size="sm" type="number" value={edu.end_year} onChange={e => handleEduChange(i, "end_year", e.target.value)} placeholder="2016" /></Col>
                <Col md={1}>{form.education.length > 1 && <Button size="sm" variant="outline-danger" onClick={() => removeEdu(i)}>✕</Button>}</Col>
              </Row>
            ))}

            <hr />
            {/* Status */}
            <Row>
              <Col md={4}><Form.Label>Status</Form.Label>
                <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Active</option><option>Inactive</option>
                </Form.Select>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Form.Check type="switch" label="Available for Appointments" checked={form.available}
                  onChange={e => setForm({ ...form, available: e.target.checked })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Spinner animation="border" size="sm" className="me-1" /> : null}
              {editId ? "Update Doctor" : "Create Doctor"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal show={showView} onHide={() => setShowView(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Doctor Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "75vh", overflowY: "auto" }}>
          {viewDoc && (
            <>
              <div className="text-center mb-4">
                {viewDoc.photo
                  ? <Image src={`http://localhost:5000${viewDoc.photo}`} roundedCircle width={90} height={90} style={{ objectFit: "cover", border: "3px solid #ddd" }} />
                  : <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto" }}>👤</div>}
                <h5 className="mt-2 mb-0 fw-bold">{viewDoc.name}</h5>
                <div className="text-muted small">{viewDoc.designation_name || ""} {viewDoc.department_name ? `| ${viewDoc.department_name}` : ""}</div>
                <div className="mt-1">
                  <Badge bg={viewDoc.status === "Active" ? "success" : "danger"} className="me-1">{viewDoc.status}</Badge>
                  <Badge bg={viewDoc.available ? "info" : "secondary"}>{viewDoc.available ? "Available" : "Unavailable"}</Badge>
                </div>
              </div>

              <div className="fw-semibold text-primary mb-2">Personal Information</div>
              <Row className="mb-3">
                {[
                  ["Email", viewDoc.email], ["Phone", viewDoc.phone],
                  ["DOB", viewDoc.dob ? viewDoc.dob.split("T")[0] : null], ["Gender", viewDoc.gender],
                  ["Blood Group", viewDoc.blood_group], ["Experience", viewDoc.years_of_experience ? `${viewDoc.years_of_experience} yrs` : null],
                  ["License No.", viewDoc.medical_license_number], ["Languages", viewDoc.languages_spoken],
                ].map(([label, val]) => (
                  <Col md={6} className="mb-2" key={label}>
                    <div className="text-muted small">{label}</div>
                    <div className="fw-semibold">{val || "—"}</div>
                  </Col>
                ))}
                {viewDoc.bio && <Col md={12} className="mb-2"><div className="text-muted small">Bio</div><div>{viewDoc.bio}</div></Col>}
              </Row>

              <div className="fw-semibold text-primary mb-2">Address</div>
              <Row className="mb-3">
                {[
                  ["Address 1", viewDoc.address1], ["Address 2", viewDoc.address2],
                  ["City", viewDoc.city], ["Pin Code", viewDoc.pincode], ["Country", viewDoc.country]
                ].map(([label, val]) => (
                  <Col md={4} className="mb-2" key={label}>
                    <div className="text-muted small">{label}</div>
                    <div className="fw-semibold">{val || "—"}</div>
                  </Col>
                ))}
              </Row>

              <div className="fw-semibold text-primary mb-2">Appointment</div>
              <Row className="mb-3">
                <Col md={6}><div className="text-muted small">Online Consultation</div>
                  <div>{viewDoc.online_consultation ? `✅ ₹${viewDoc.online_fee}` : "❌ Not available"}</div></Col>
                <Col md={6}><div className="text-muted small">Offline Consultation</div>
                  <div>{viewDoc.offline_consultation ? `✅ ₹${viewDoc.offline_fee}` : "❌ Not available"}</div></Col>
              </Row>

              {getEdu(viewDoc).length > 0 && (
                <>
                  <div className="fw-semibold text-primary mb-2">Education</div>
                  <Table bordered size="sm" className="mb-3">
                    <thead className="table-light"><tr><th>Degree</th><th>Institution</th><th>Start</th><th>End</th></tr></thead>
                    <tbody>
                      {getEdu(viewDoc).map((e, i) => (
                        <tr key={i}>
                          <td>{e.degree || "—"}</td><td>{e.institution || "—"}</td>
                          <td>{e.start_year || "—"}</td><td>{e.end_year || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowView(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AdminDoctors
