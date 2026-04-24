import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Form, Alert, Spinner } from "react-bootstrap"
import api from "../services/api"

const emptyForm = {
  patient_name: "", patient_phone: "", patient_age: "",
  patient_gender: "", appointment_date: "", appointment_time: "",
  type: "Offline", notes: ""
}

const BookAppointment = () => {
  const [hospitals, setHospitals] = useState([])
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get("/hospital/public/list")
      .then(res => { if (res.data.success) setHospitals(res.data.data) })
      .catch(() => setError("Failed to load hospitals"))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectHospital = async (hospital) => {
    setSelectedHospital(hospital)
    setSelectedDoctor(null)
    setDoctors([])
    setDoctorsLoading(true)
    try {
      const res = await api.get(`/hospital/public/${hospital.id}/doctors`)
      if (res.data.success) setDoctors(res.data.data)
    } catch { setError("Failed to load doctors") }
    finally { setDoctorsLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!form.patient_name.trim() || !form.appointment_date || !form.appointment_time)
      return setError("Patient name, date and time are required")
    setSaving(true)
    try {
      const res = await api.post("/appointment/public", {
        ...form,
        hospital_id: selectedHospital.id,
        doctor_id: selectedDoctor.id
      })
      if (res.data.success) setSuccess(true)
    } catch (err) { setError(err.response?.data?.message || "Failed to book appointment") }
    finally { setSaving(false) }
  }

  const cardStyle = { border: "none", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", cursor: "pointer" }

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "48px 32px", background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 420 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h4 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Appointment Booked!</h4>
        <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
          Your appointment with <strong>Dr. {selectedDoctor?.name}</strong> at <strong>{selectedHospital?.clinic_name}</strong> has been submitted. The hospital will confirm shortly.
        </p>
        <button onClick={() => { setSuccess(false); setSelectedDoctor(null); setForm(emptyForm) }}
          style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontWeight: 500, cursor: "pointer", fontSize: 14 }}>
          Book Another
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "16px 0" }}>
        <Container>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>💙</span>
            <div>
              <h5 style={{ margin: 0, fontWeight: 700, color: "#0F172A" }}>Clinicare</h5>
              <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>Book an Appointment</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {error && <Alert variant="danger" dismissible onClose={() => setError("")} style={{ borderRadius: 10, fontSize: 13.5 }}>{error}</Alert>}

        {/* Step 1: Select Hospital */}
        {!selectedHospital && (
          <>
            <div className="mb-4">
              <h5 style={{ fontWeight: 700, color: "#0F172A" }}>Select a Hospital</h5>
              <p style={{ color: "#94A3B8", fontSize: 13 }}>Choose the hospital you'd like to visit</p>
            </div>
            {loading ? (
              <div className="text-center py-5"><Spinner animation="border" style={{ color: "#2563EB" }} /></div>
            ) : hospitals.length === 0 ? (
              <p className="text-muted">No hospitals available at the moment.</p>
            ) : (
              <Row className="g-3">
                {hospitals.map(h => (
                  <Col md={4} sm={6} key={h.id}>
                    <Card style={cardStyle} onClick={() => handleSelectHospital(h)}
                      className="h-100"
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.15)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)"}>
                      <Card.Body className="p-4">
                        {h.logo
                          ? <img src={`http://localhost:5000${h.logo}`} alt="logo" style={{ height: 48, objectFit: "contain", marginBottom: 12, borderRadius: 6 }} />
                          : <div style={{ fontSize: 36, marginBottom: 12 }}>🏥</div>}
                        <h6 style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{h.clinic_name}</h6>
                        <p style={{ fontSize: 12.5, color: "#64748B", margin: 0 }}>{[h.city, h.state].filter(Boolean).join(", ")}</p>
                        {h.opening_time && (
                          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 6, marginBottom: 0 }}>
                            🕐 {h.opening_time} – {h.closing_time}
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}

        {/* Step 2: Select Doctor */}
        {selectedHospital && !selectedDoctor && (
          <>
            <div className="mb-4 d-flex align-items-center gap-3">
              <button onClick={() => setSelectedHospital(null)}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", color: "#475569" }}>
                ← Back
              </button>
              <div>
                <h5 style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>Select a Doctor</h5>
                <p style={{ color: "#94A3B8", fontSize: 13, margin: 0 }}>{selectedHospital.clinic_name}</p>
              </div>
            </div>
            {doctorsLoading ? (
              <div className="text-center py-5"><Spinner animation="border" style={{ color: "#2563EB" }} /></div>
            ) : doctors.length === 0 ? (
              <p className="text-muted">No available doctors at this hospital.</p>
            ) : (
              <Row className="g-3">
                {doctors.map(d => (
                  <Col md={4} sm={6} key={d.id}>
                    <Card style={cardStyle} onClick={() => setSelectedDoctor(d)}
                      className="h-100"
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.15)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)"}>
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          {d.photo
                            ? <img src={`http://localhost:5000${d.photo}`} alt="doctor" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid #E2E8F0" }} />
                            : <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👨‍⚕️</div>}
                          <div>
                            <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 14 }}>Dr. {d.name}</div>
                            <div style={{ fontSize: 12, color: "#64748B" }}>{d.designation_name || d.department_name || "—"}</div>
                          </div>
                        </div>
                        {d.department_name && <p style={{ fontSize: 12.5, color: "#94A3B8", margin: "0 0 6px" }}>🏢 {d.department_name}</p>}
                        {d.years_of_experience > 0 && <p style={{ fontSize: 12.5, color: "#94A3B8", margin: "0 0 6px" }}>⭐ {d.years_of_experience} yrs experience</p>}
                        <div className="d-flex gap-2 mt-2 flex-wrap">
                          {d.online_consultation ? <span style={{ background: "#F0FDF4", color: "#059669", border: "1px solid #BBF7D0", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 500 }}>🌐 Online ₹{d.online_fee}</span> : null}
                          {d.offline_consultation ? <span style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 500 }}>🏥 Offline ₹{d.offline_fee}</span> : null}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}

        {/* Step 3: Booking Form */}
        {selectedHospital && selectedDoctor && (
          <>
            <div className="mb-4 d-flex align-items-center gap-3">
              <button onClick={() => setSelectedDoctor(null)}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", color: "#475569" }}>
                ← Back
              </button>
              <div>
                <h5 style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>Book Appointment</h5>
                <p style={{ color: "#94A3B8", fontSize: 13, margin: 0 }}>Dr. {selectedDoctor.name} · {selectedHospital.clinic_name}</p>
              </div>
            </div>

            <Row className="g-4">
              <Col lg={4}>
                <Card style={{ ...cardStyle, cursor: "default" }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      {selectedDoctor.photo
                        ? <img src={`http://localhost:5000${selectedDoctor.photo}`} alt="doctor" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "2px solid #E2E8F0" }} />
                        : <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>👨‍⚕️</div>}
                      <div>
                        <div style={{ fontWeight: 700, color: "#0F172A" }}>Dr. {selectedDoctor.name}</div>
                        <div style={{ fontSize: 12.5, color: "#64748B" }}>{selectedDoctor.designation_name || "—"}</div>
                      </div>
                    </div>
                    {selectedDoctor.department_name && <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>🏢 {selectedDoctor.department_name}</div>}
                    {selectedDoctor.years_of_experience > 0 && <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>⭐ {selectedDoctor.years_of_experience} yrs experience</div>}
                    {selectedDoctor.bio && <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 8, marginBottom: 0 }}>{selectedDoctor.bio}</p>}
                    <hr />
                    <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 600, marginBottom: 6 }}>Consultation Fees</div>
                    {selectedDoctor.online_consultation ? <div style={{ fontSize: 13, color: "#059669", marginBottom: 4 }}>🌐 Online: ₹{selectedDoctor.online_fee}</div> : null}
                    {selectedDoctor.offline_consultation ? <div style={{ fontSize: 13, color: "#2563EB" }}>🏥 Offline: ₹{selectedDoctor.offline_fee}</div> : null}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={8}>
                <Card style={{ ...cardStyle, cursor: "default" }}>
                  <Card.Body className="p-4">
                    <h6 style={{ fontWeight: 600, color: "#0F172A", marginBottom: 20 }}>Patient Details</h6>
                    {error && <Alert variant="danger" style={{ fontSize: 13.5, borderRadius: 10 }}>{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: 13, fontWeight: 500 }}>Full Name <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                            <Form.Control value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })}
                              placeholder="Your full name" style={{ borderRadius: 9, fontSize: 13.5, height: 40 }} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: 13, fontWeight: 500 }}>Phone</Form.Label>
                            <Form.Control value={form.patient_phone} onChange={e => setForm({ ...form, patient_phone: e.target.value })}
                              placeholder="Phone number" style={{ borderRadius: 9, fontSize: 13.5, height: 40 }} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: 13, fontWeight: 500 }}>Age</Form.Label>
                            <Form.Control type="number" min={0} value={form.patient_age} onChange={e => setForm({ ...form, patient_age: e.target.value })}
                              placeholder="Age" style={{ borderRadius: 9, fontSize: 13.5, height: 40 }} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: 13, fontWeight: 500 }}>Gender</Form.Label>
                            <Form.Select value={form.patient_gender} onChange={e => setForm({ ...form, patient_gender: e.target.value })}
                              style={{ borderRadius: 9, fontSize: 13.5, height: 40 }}>
                              <option value="">Select</option>
                              <option>Male</option><option>Female</option><option>Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: 13, fontWeight: 500 }}>Type</Form.Label>
                            <Form.Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                              style={{ borderRadius: 9, fontSize: 13.5, height: 40 }}>
                              {selectedDoctor.online_consultation && <option value="Online">Online</option>}
                              {selectedDoctor.offline_consultation && <option value="Offline">Offline</option>}
                              {!selectedDoctor.online_consultation && !selectedDoctor.offline_consultation && <option value="Offline">Offline</option>}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: 13, fontWeight: 500 }}>Date <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                            <Form.Control type="date" value={form.appointment_date} min={new Date().toISOString().split("T")[0]}
                              onChange={e => setForm({ ...form, appointment_date: e.target.value })}
                              style={{ borderRadius: 9, fontSize: 13.5, height: 40 }} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: 13, fontWeight: 500 }}>Time <span style={{ color: "#EF4444" }}>*</span></Form.Label>
                            <Form.Control type="time" value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })}
                              style={{ borderRadius: 9, fontSize: 13.5, height: 40 }} />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-4">
                            <Form.Label style={{ fontSize: 13, fontWeight: 500 }}>Notes / Symptoms</Form.Label>
                            <Form.Control as="textarea" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                              placeholder="Describe your symptoms or any notes for the doctor..."
                              style={{ borderRadius: 9, fontSize: 13.5, resize: "none" }} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <button type="submit" disabled={saving} style={{
                        background: "#2563EB", color: "#fff", border: "none", borderRadius: 10,
                        padding: "0 28px", height: 42, fontSize: 14, fontWeight: 500,
                        cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1,
                        display: "flex", alignItems: "center", gap: 8
                      }}>
                        {saving && <Spinner animation="border" size="sm" style={{ width: 14, height: 14 }} />}
                        Confirm Booking
                      </button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  )
}

export default BookAppointment
