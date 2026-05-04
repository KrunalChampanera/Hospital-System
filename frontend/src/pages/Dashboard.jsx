import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge } from "react-bootstrap"
import MainLayout from "../layouts/MainLayout"
import api from "../services/api"

const Dashboard = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("/hospital")
      .then(res => { if (res.data.success) setHospitals(res.data.data || []) })
      .catch(err => setError(err.response?.data?.message || "Failed to load hospitals"))
      .finally(() => setLoading(false))
  }, [])

  const active = hospitals.filter(h => h.status === "Active").length
  const adminActive = hospitals.filter(h => h.admin_status === "Active").length

  const th = { background: "#F8FAFC", fontSize: "11px", fontWeight: "600", color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase", padding: "12px 16px" }
  const td = { padding: "13px 16px", verticalAlign: "middle", borderBottom: "1px solid #F1F5F9", fontSize: "13.5px", color: "#475569" }

  return (
    <MainLayout>
      <Container fluid>
        {error && <Alert variant="danger" dismissible onClose={() => setError("")} style={{ borderRadius: "10px", fontSize: "13.5px" }}>{error}</Alert>}

        <div className="mb-4">
          <h4 style={{ fontWeight: "700", color: "#0F172A", margin: 0 }}>Super Admin Dashboard</h4>
          <p style={{ color: "#94A3B8", fontSize: "13px", margin: "4px 0 0" }}>Welcome back 👋 Here's your system overview</p>
        </div>

        {/* Stats */}
        <Row className="g-3 mb-4">
          {[
            { label: "Total Hospitals", value: hospitals.length, icon: "🏥", bg: "#EFF6FF", color: "#2563EB" },
            { label: "Active Hospitals", value: active, icon: "✅", bg: "#F0FDF4", color: "#16A34A" },
            { label: "Active Admins", value: adminActive, icon: "👤", bg: "#FDF4FF", color: "#9333EA" },
            { label: "Inactive Hospitals", value: hospitals.length - active, icon: "⏸️", bg: "#FEF2F2", color: "#DC2626" },
          ].map(s => (
            <Col md={3} sm={6} key={s.label}>
              <Card style={{ border: "none", borderRadius: "14px", background: s.bg, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Card.Body className="d-flex align-items-center gap-3 py-3">
                  <div style={{ fontSize: "28px" }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: "12px", color: s.color, fontWeight: "500" }}>{s.label}</div>
                    <div style={{ fontSize: "26px", fontWeight: "700", color: s.color, lineHeight: 1.2 }}>
                      {loading ? <Spinner animation="border" size="sm" /> : s.value}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Hospitals Table */}
        <Card style={{ border: "none", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🏥</div>
              <div>
                <h5 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A", margin: 0 }}>All Hospitals</h5>
                <p style={{ fontSize: "13px", color: "#94A3B8", margin: "2px 0 0" }}>{hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""} registered</p>
              </div>
            </div>
          </div>

          <Card.Body className="p-0">
            {loading ? (
              <div style={{ padding: "64px 0", textAlign: "center" }}><Spinner animation="border" style={{ color: "#2563EB" }} /></div>
            ) : hospitals.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏥</div>
                <p style={{ fontWeight: "500", color: "#1E293B" }}>No hospitals registered yet</p>
              </div>
            ) : (
              <Table responsive className="mb-0">
                <thead>
                  <tr>
                    <th style={{ ...th, width: "4%" }}>#</th>
                    <th style={th}>Hospital</th>
                    <th style={th}>Admin</th>
                    <th style={th}>Location</th>
                    <th style={th}>Pincode</th>
                    <th style={th}>Admin Status</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((h, i) => (
                    <tr key={h.id}>
                      <td style={{ ...td, color: "#94A3B8" }}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: "600", color: "#1E293B" }}>{h.clinic_name || "—"}</td>
                      <td style={td}>{h.admin_name || "—"}</td>
                      <td style={td}>{[h.city, h.state, h.country].filter(Boolean).join(", ") || "—"}</td>
                      <td style={td}>{h.pincode || "—"}</td>
                      <td style={td}>
                        <span style={{
                          background: h.admin_status === "Active" ? "#F0FDF4" : "#FEF2F2",
                          color: h.admin_status === "Active" ? "#16A34A" : "#DC2626",
                          border: `1px solid ${h.admin_status === "Active" ? "#BBF7D0" : "#FECACA"}`,
                          borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "500"
                        }}>
                          {h.admin_status === "Active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{
                          background: h.status === "Active" ? "#F0FDF4" : "#FEF2F2",
                          color: h.status === "Active" ? "#16A34A" : "#DC2626",
                          border: `1px solid ${h.status === "Active" ? "#BBF7D0" : "#FECACA"}`,
                          borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "500"
                        }}>
                          {h.status || "Active"}
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
    </MainLayout>
  )
}

export default Dashboard
