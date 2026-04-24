import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap"
import api from "../services/api"

const AdminReports = ({ hospitalId, hospitalData }) => {
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!hospitalId) return
    const fetchAll = async () => {
      try {
        const [d, dep] = await Promise.all([
          api.get(`/admin-doctor/hospital/${hospitalId}`),
          api.get(`/admin-department/${hospitalId}`)
        ])
        if (d.data.success) setDoctors(d.data.data)
        if (dep.data.success) setDepartments(dep.data.data)
      } catch { setError("Failed to load report data") }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [hospitalId])

  if (!hospitalId) return (
    <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "10px", padding: "16px" }}>
      <p style={{ margin: 0, color: "#92400E" }}>⚠️ No hospital assigned. Contact Super Admin.</p>
    </div>
  )

  if (loading) return <div className="text-center py-5"><Spinner animation="border" style={{ color: "#2563EB" }} /></div>

  const activeDoctors = doctors.filter(d => d.status === "Active").length
  const inactiveDoctors = doctors.filter(d => d.status === "Inactive").length
  const availableDoctors = doctors.filter(d => d.available).length
  const onlineDoctors = doctors.filter(d => d.online_consultation).length
  const offlineDoctors = doctors.filter(d => d.offline_consultation).length
  const activeDepts = departments.filter(d => d.status === "Active").length
  const inactiveDepts = departments.filter(d => d.status === "Inactive").length

  const stats = [
    { label: "Total Doctors", value: doctors.length, icon: "👨‍⚕️", bg: "#EFF6FF", color: "#2563EB" },
    { label: "Active Doctors", value: activeDoctors, icon: "✅", bg: "#F0FDF4", color: "#16A34A" },
    { label: "Inactive Doctors", value: inactiveDoctors, icon: "⏸️", bg: "#FEF2F2", color: "#DC2626" },
    { label: "Available Now", value: availableDoctors, icon: "🟢", bg: "#ECFDF5", color: "#059669" },
    { label: "Total Departments", value: departments.length, icon: "🏢", bg: "#FDF4FF", color: "#9333EA" },
    { label: "Active Departments", value: activeDepts, icon: "🏥", bg: "#FFF7ED", color: "#EA580C" },
  ]

  const sectionCard = { border: "none", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }

  return (
    <Container fluid>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <div className="mb-4">
        <h4 style={{ fontWeight: "700", color: "#0F172A", margin: 0 }}>📊 Reports</h4>
        <p style={{ color: "#94A3B8", fontSize: "13px", margin: "4px 0 0" }}>
          Overview of {hospitalData?.clinic_name || "your hospital"}
        </p>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        {stats.map(s => (
          <Col md={4} sm={6} key={s.label}>
            <Card style={{ border: "none", borderRadius: "14px", background: s.bg, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <Card.Body className="d-flex align-items-center gap-3 py-3">
                <div style={{ fontSize: "28px" }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: "13px", color: s.color, fontWeight: "500" }}>{s.label}</div>
                  <div style={{ fontSize: "26px", fontWeight: "700", color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        {/* Doctors Summary */}
        <Col md={6}>
          <Card style={sectionCard}>
            <Card.Body>
              <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>👨‍⚕️ Doctors Summary</h6>
              {[
                { label: "Active Doctors", value: activeDoctors, bg: "#F0FDF4", color: "#16A34A" },
                { label: "Inactive Doctors", value: inactiveDoctors, bg: "#FEF2F2", color: "#DC2626" },
                { label: "Available for Appointments", value: availableDoctors, bg: "#EFF6FF", color: "#2563EB" },
                { label: "Online Consultation", value: onlineDoctors, bg: "#F0FDF4", color: "#059669" },
                { label: "Offline Consultation", value: offlineDoctors, bg: "#FFF7ED", color: "#EA580C" },
              ].map(item => (
                <div key={item.label} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded" style={{ background: item.bg }}>
                  <span style={{ fontSize: "13.5px", color: item.color }}>{item.label}</span>
                  <span style={{ fontWeight: "700", color: item.color, fontSize: "18px" }}>{item.value}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Departments Summary */}
        <Col md={6}>
          <Card style={sectionCard}>
            <Card.Body>
              <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>🏢 Departments Summary</h6>
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded" style={{ background: "#F0FDF4" }}>
                <span style={{ fontSize: "13.5px", color: "#166534" }}>Active Departments</span>
                <span style={{ fontWeight: "700", color: "#16A34A", fontSize: "18px" }}>{activeDepts}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded" style={{ background: "#FFF7ED" }}>
                <span style={{ fontSize: "13.5px", color: "#92400E" }}>Inactive Departments</span>
                <span style={{ fontWeight: "700", color: "#EA580C", fontSize: "18px" }}>{inactiveDepts}</span>
              </div>
              <hr />
              <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "8px" }}>Departments with Doctor Count:</div>
              {departments.length === 0 ? (
                <p className="text-muted small">No departments yet.</p>
              ) : departments.map(d => (
                <div key={d.id} className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: "13.5px", color: "#1E293B" }}>{d.department_name}</span>
                  <span style={{ fontSize: "12px", background: "#EEF2FF", color: "#4F46E5", padding: "2px 10px", borderRadius: "20px" }}>
                    {d.no_of_doctors} doctors
                  </span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Hospital Info Card */}
      <Card style={{ ...sectionCard, marginBottom: "24px" }}>
        <Card.Body>
          <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>🏥 Hospital Overview</h6>
          <Row>
            {[
              ["Hospital Name", hospitalData?.clinic_name],
              ["City", hospitalData?.city],
              ["State", hospitalData?.state],
              ["Country", hospitalData?.country],
              ["Opening Hours", hospitalData?.opening_time && hospitalData?.closing_time ? `${hospitalData.opening_time} – ${hospitalData.closing_time}` : "Not set"],
              ["Weekend Open", hospitalData?.weekend_open ? `Yes (${hospitalData.weekend_opening_time} – ${hospitalData.weekend_closing_time})` : "No"],
            ].map(([label, value]) => (
              <Col md={4} className="mb-3" key={label}>
                <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#1E293B" }}>{value || "N/A"}</div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Doctors Table */}
      <Card style={sectionCard}>
        <Card.Body>
          <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>👨‍⚕️ Doctors List</h6>
          {doctors.length === 0 ? (
            <p className="text-muted small">No doctors added yet.</p>
          ) : (
            <Table responsive className="mb-0" style={{ fontSize: "13.5px" }}>
              <thead style={{ background: "#F8FAFC", fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <tr>
                  <th style={{ padding: "10px 16px" }}>#</th>
                  <th style={{ padding: "10px 12px" }}>Name</th>
                  <th style={{ padding: "10px 12px" }}>Department</th>
                  <th style={{ padding: "10px 12px" }}>Designation</th>
                  <th style={{ padding: "10px 12px" }}>Phone</th>
                  <th style={{ padding: "10px 12px" }}>Consultation</th>
                  <th style={{ padding: "10px 12px" }}>Available</th>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc, i) => (
                  <tr key={doc.id} style={{ borderBottom: "1px solid #F1F5F9", verticalAlign: "middle" }}>
                    <td style={{ padding: "12px 16px", color: "#94A3B8" }}>{i + 1}</td>
                    <td style={{ padding: "12px", fontWeight: "500", color: "#1E293B" }}>{doc.name}</td>
                    <td style={{ padding: "12px", color: "#475569" }}>{doc.department_name || "—"}</td>
                    <td style={{ padding: "12px", color: "#475569" }}>{doc.designation_name || "—"}</td>
                    <td style={{ padding: "12px", color: "#475569" }}>{doc.phone || "—"}</td>
                    <td style={{ padding: "12px" }}>
                      {doc.online_consultation ? <span className="me-1">🌐 ₹{doc.online_fee}</span> : null}
                      {doc.offline_consultation ? <span>🏥 ₹{doc.offline_fee}</span> : null}
                      {!doc.online_consultation && !doc.offline_consultation ? "—" : null}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                        background: doc.available ? "#F0FDF4" : "#F8FAFC",
                        color: doc.available ? "#16A34A" : "#64748B",
                        border: `1px solid ${doc.available ? "#BBF7D0" : "#E2E8F0"}`
                      }}>
                        {doc.available ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                        background: doc.status === "Active" ? "#F0FDF4" : "#FEF2F2",
                        color: doc.status === "Active" ? "#16A34A" : "#DC2626",
                        border: `1px solid ${doc.status === "Active" ? "#BBF7D0" : "#FECACA"}`
                      }}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default AdminReports
