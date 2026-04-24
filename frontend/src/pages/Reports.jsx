import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge } from "react-bootstrap"
import MainLayout from "../layouts/MainLayout"
import api from "../services/api"

const Reports = () => {
  const [hospitals, setHospitals] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [h, d, des, reg] = await Promise.all([
          api.get("/hospital"),
          api.get("/department"),
          api.get("/designation"),
          api.get("/registration")
        ])
        if (h.data.success) setHospitals(h.data.data)
        if (d.data.success) setDepartments(d.data.data)
        if (des.data.success) setDesignations(des.data.data)
        if (reg.data.success) setRegistrations(reg.data.data)
      } catch { setError("Failed to load report data") }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const stats = [
    { label: "Total Hospitals", value: hospitals.length, icon: "🏥", bg: "#EFF6FF", color: "#2563EB" },
    { label: "Active Admins", value: hospitals.filter(h => h.admin_status === "Active").length, icon: "👤", bg: "#F0FDF4", color: "#16A34A" },
    { label: "Departments", value: departments.length, icon: "🏢", bg: "#FDF4FF", color: "#9333EA" },
    { label: "Designations", value: designations.length, icon: "🏷️", bg: "#FFF7ED", color: "#EA580C" },
    { label: "Pending Registrations", value: registrations.filter(r => r.status === "pending").length, icon: "⏳", bg: "#FEFCE8", color: "#CA8A04" },
    { label: "Approved Admins", value: registrations.filter(r => r.status === "approved").length, icon: "✅", bg: "#F0FDF4", color: "#16A34A" },
  ]

  const activeDepts = departments.filter(d => d.status === "Active").length
  const inactiveDepts = departments.filter(d => d.status === "Inactive").length
  const activeDesig = designations.filter(d => d.status === "Active").length
  const inactiveDesig = designations.filter(d => d.status === "Inactive").length

  if (loading) return (
    <MainLayout>
      <Container className="py-5 text-center"><Spinner animation="border" style={{ color: "#2563EB" }} /></Container>
    </MainLayout>
  )

  return (
    <MainLayout>
      <Container fluid>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

        {/* Header */}
        <div className="mb-4">
          <h4 style={{ fontWeight: "700", color: "#0F172A", margin: 0 }}>📊 Reports</h4>
          <p style={{ color: "#94A3B8", fontSize: "13px", margin: "4px 0 0" }}>Overview of your hospital management system</p>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          {stats.map((s) => (
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
          {/* Departments Summary */}
          <Col md={6}>
            <Card style={{ border: "none", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <Card.Body>
                <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>🏢 Departments Summary</h6>
                <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded" style={{ background: "#F0FDF4" }}>
                  <span style={{ fontSize: "13.5px", color: "#166534" }}>Active Departments</span>
                  <span style={{ fontWeight: "700", color: "#16A34A", fontSize: "18px" }}>{activeDepts}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: "#FFF7ED" }}>
                  <span style={{ fontSize: "13.5px", color: "#92400E" }}>Inactive Departments</span>
                  <span style={{ fontWeight: "700", color: "#EA580C", fontSize: "18px" }}>{inactiveDepts}</span>
                </div>
                <hr />
                <div style={{ fontSize: "13px", color: "#64748B" }}>Top Departments by Doctors:</div>
                <div className="mt-2">
                  {departments.sort((a, b) => (b.doctor_count || 0) - (a.doctor_count || 0)).slice(0, 5).map(d => (
                    <div key={d.id} className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontSize: "13.5px", color: "#1E293B" }}>{d.name}</span>
                      <span style={{ fontSize: "12px", background: "#EEF2FF", color: "#4F46E5", padding: "2px 10px", borderRadius: "20px" }}>
                        {d.doctor_count || 0} doctors
                      </span>
                    </div>
                  ))}
                  {departments.length === 0 && <p className="text-muted small">No departments yet.</p>}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Designations Summary */}
          <Col md={6}>
            <Card style={{ border: "none", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <Card.Body>
                <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>🏷️ Designations Summary</h6>
                <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded" style={{ background: "#F0FDF4" }}>
                  <span style={{ fontSize: "13.5px", color: "#166534" }}>Active Designations</span>
                  <span style={{ fontWeight: "700", color: "#16A34A", fontSize: "18px" }}>{activeDesig}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: "#FFF7ED" }}>
                  <span style={{ fontSize: "13.5px", color: "#92400E" }}>Inactive Designations</span>
                  <span style={{ fontWeight: "700", color: "#EA580C", fontSize: "18px" }}>{inactiveDesig}</span>
                </div>
                <hr />
                <div style={{ fontSize: "13px", color: "#64748B" }}>All Designations:</div>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {designations.slice(0, 8).map(d => (
                    <span key={d.id} style={{
                      background: d.status === "Active" ? "#F0FDF4" : "#F8FAFC",
                      color: d.status === "Active" ? "#16A34A" : "#64748B",
                      border: `1px solid ${d.status === "Active" ? "#BBF7D0" : "#E2E8F0"}`,
                      borderRadius: "20px", padding: "3px 12px", fontSize: "12.5px"
                    }}>{d.name}</span>
                  ))}
                  {designations.length === 0 && <p className="text-muted small">No designations yet.</p>}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Hospitals Table */}
        <Card style={{ border: "none", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <Card.Body>
            <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>🏥 Hospital Overview</h6>
            {hospitals.length === 0 ? (
              <p className="text-muted small">No hospitals registered yet.</p>
            ) : (
              <Table responsive className="mb-0" style={{ fontSize: "13.5px" }}>
                <thead style={{ background: "#F8FAFC", fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <tr>
                    <th style={{ padding: "10px 16px" }}>#</th>
                    <th style={{ padding: "10px 12px" }}>Hospital Name</th>
                    <th style={{ padding: "10px 12px" }}>Admin</th>
                    <th style={{ padding: "10px 12px" }}>City</th>
                    <th style={{ padding: "10px 12px" }}>State</th>
                    <th style={{ padding: "10px 12px" }}>Admin Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((h, i) => (
                    <tr key={h.id} style={{ borderBottom: "1px solid #F1F5F9", verticalAlign: "middle" }}>
                      <td style={{ padding: "12px 16px", color: "#94A3B8" }}>{i + 1}</td>
                      <td style={{ padding: "12px", fontWeight: "500", color: "#1E293B" }}>{h.clinic_name || "-"}</td>
                      <td style={{ padding: "12px", color: "#475569" }}>{h.admin_name || "-"}</td>
                      <td style={{ padding: "12px", color: "#475569" }}>{h.city || "-"}</td>
                      <td style={{ padding: "12px", color: "#475569" }}>{h.state || "-"}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                          background: h.admin_status === "Active" ? "#F0FDF4" : "#F8FAFC",
                          color: h.admin_status === "Active" ? "#16A34A" : "#64748B",
                          border: `1px solid ${h.admin_status === "Active" ? "#BBF7D0" : "#E2E8F0"}`
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: h.admin_status === "Active" ? "#22C55E" : "#94A3B8", display: "inline-block" }} />
                          {h.admin_status === "Active" ? "Online" : "Offline"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Recent Registrations */}
        <Card style={{ border: "none", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Card.Body>
            <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>📋 Recent Admin Registrations</h6>
            {registrations.length === 0 ? (
              <p className="text-muted small">No registrations yet.</p>
            ) : (
              <Table responsive className="mb-0" style={{ fontSize: "13.5px" }}>
                <thead style={{ background: "#F8FAFC", fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <tr>
                    <th style={{ padding: "10px 16px" }}>#</th>
                    <th style={{ padding: "10px 12px" }}>Name</th>
                    <th style={{ padding: "10px 12px" }}>Email</th>
                    <th style={{ padding: "10px 12px" }}>Phone</th>
                    <th style={{ padding: "10px 12px" }}>Status</th>
                    <th style={{ padding: "10px 12px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.slice(0, 10).map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #F1F5F9", verticalAlign: "middle" }}>
                      <td style={{ padding: "12px 16px", color: "#94A3B8" }}>{i + 1}</td>
                      <td style={{ padding: "12px", fontWeight: "500", color: "#1E293B" }}>{r.full_name}</td>
                      <td style={{ padding: "12px", color: "#475569" }}>{r.email}</td>
                      <td style={{ padding: "12px", color: "#475569" }}>{r.phone}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                          background: r.status === "approved" ? "#F0FDF4" : r.status === "pending" ? "#FEFCE8" : "#FEF2F2",
                          color: r.status === "approved" ? "#16A34A" : r.status === "pending" ? "#CA8A04" : "#DC2626",
                          border: `1px solid ${r.status === "approved" ? "#BBF7D0" : r.status === "pending" ? "#FDE68A" : "#FECACA"}`
                        }}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#94A3B8" }}>
                        {new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </MainLayout>
  )
}

export default Reports
