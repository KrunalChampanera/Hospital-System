import { useEffect, useState } from "react"
import { Container, Card, Table, Spinner, Alert, Badge, Button, Modal, Row, Col } from "react-bootstrap"
import MainLayout from "../layouts/MainLayout"
import api from "../services/api"

const AdminManagement = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [actionLoading, setActionLoading] = useState(null)

  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // { id, type: 'approve'|'decline', name }

  useEffect(() => { fetchRegistrations() }, [])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const res = await api.get("/registration")
      if (res.data.success) setRegistrations(res.data.data)
    } catch { setError("Failed to load registrations") }
    finally { setLoading(false) }
  }

  const handleAction = (id, type, name) => {
    setConfirmAction({ id, type, name })
    setShowConfirm(true)
  }

  const confirmDo = async () => {
    const { id, type } = confirmAction
    setShowConfirm(false)
    setActionLoading(id + type)
    setError(""); setSuccessMsg("")
    try {
      const res = await api.post(`/registration/${id}/${type}`)
      if (res.data.success) {
        setSuccessMsg(res.data.message)
        fetchRegistrations()
        setTimeout(() => setSuccessMsg(""), 4000)
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${type} registration`)
    } finally {
      setActionLoading(null)
    }
  }

  const statusBadge = (status) => {
    const map = {
      pending: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA", label: "Pending" },
      approved: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", label: "Approved" },
      declined: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "Declined" },
    }
    const s = map[status] || map.pending
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "4px 10px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "500",
        background: s.bg, color: s.color, border: `1px solid ${s.border}`
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color, display: "inline-block" }} />
        {s.label}
      </span>
    )
  }

  const counts = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === "pending").length,
    approved: registrations.filter(r => r.status === "approved").length,
    declined: registrations.filter(r => r.status === "declined").length,
  }

  return (
    <MainLayout>
      <Container fluid>
        {error && <Alert variant="danger" dismissible onClose={() => setError("")} className="mb-3"
          style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", borderRadius: "10px", fontSize: "13.5px" }}>
          <strong>Error:</strong> {error}
        </Alert>}
        {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg("")} className="mb-3"
          style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", borderRadius: "10px", fontSize: "13.5px" }}>
          {successMsg}
        </Alert>}

        {/* Stats */}
        <Row className="mb-4 g-3">
          {[
            { label: "Total", value: counts.total, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Pending", value: counts.pending, color: "#EA580C", bg: "#FFF7ED" },
            { label: "Approved", value: counts.approved, color: "#16A34A", bg: "#F0FDF4" },
            { label: "Declined", value: counts.declined, color: "#DC2626", bg: "#FEF2F2" },
          ].map(s => (
            <Col md={3} sm={6} key={s.label}>
              <Card style={{ border: "none", borderRadius: "12px", background: s.bg, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Card.Body className="py-3">
                  <div style={{ fontSize: "13px", color: s.color, fontWeight: "500" }}>{s.label} Registrations</div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Card style={{ border: "none", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                👥
              </div>
              <div>
                <h5 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A", margin: 0 }}>Admin Management</h5>
                <p style={{ fontSize: "13px", color: "#94A3B8", margin: "2px 0 0" }}>Manage admin registration requests</p>
              </div>
            </div>
          </div>

          <Card.Body className="p-0">
            {loading ? (
              <div style={{ padding: "64px 0", textAlign: "center" }}>
                <Spinner animation="border" style={{ color: "#2563EB", width: "28px", height: "28px" }} />
                <p style={{ marginTop: "12px", color: "#94A3B8", fontSize: "13.5px" }}>Loading registrations...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
                <p style={{ fontWeight: "500", color: "#1E293B", marginBottom: "4px" }}>No registrations yet</p>
                <p style={{ fontSize: "13px", color: "#94A3B8" }}>Admin registration requests will appear here</p>
              </div>
            ) : (
              <Table responsive className="mb-0" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <thead style={{ background: "#F8FAFC", fontSize: "11px", fontWeight: "600", color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  <tr>
                    <th style={{ padding: "12px 20px" }}>#</th>
                    <th style={{ padding: "12px" }}>Full Name</th>
                    <th style={{ padding: "12px" }}>Email</th>
                    <th style={{ padding: "12px" }}>Phone</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px 20px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, i) => (
                    <tr key={reg.id} style={{ borderBottom: "1px solid #F1F5F9", verticalAlign: "middle" }}>
                      <td style={{ padding: "14px 20px", fontSize: "13.5px", color: "#64748B" }}>{i + 1}</td>
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "34px", height: "34px", borderRadius: "50%",
                            background: "#EEF2FF", color: "#4F46E5",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: "600", fontSize: "13px", flexShrink: 0
                          }}>
                            {reg.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: "500", color: "#1E293B" }}>{reg.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px", fontSize: "13.5px", color: "#475569" }}>{reg.email}</td>
                      <td style={{ padding: "14px 12px", fontSize: "13.5px", color: "#475569" }}>{reg.phone}</td>
                      <td style={{ padding: "14px 12px" }}>{statusBadge(reg.status)}</td>
                      <td style={{ padding: "14px 20px" }}>
                        {reg.status === "pending" ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleAction(reg.id, "approve", reg.full_name)}
                              disabled={actionLoading === reg.id + "approve"}
                              style={{
                                height: "32px", padding: "0 14px", border: "none", borderRadius: "8px",
                                background: "#16A34A", color: "#fff", fontSize: "12.5px", fontWeight: "500",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                              }}
                            >
                              {actionLoading === reg.id + "approve"
                                ? <Spinner animation="border" size="sm" style={{ width: "12px", height: "12px" }} />
                                : "✓"} Approve
                            </button>
                            <button
                              onClick={() => handleAction(reg.id, "decline", reg.full_name)}
                              disabled={actionLoading === reg.id + "decline"}
                              style={{
                                height: "32px", padding: "0 14px", border: "none", borderRadius: "8px",
                                background: "#DC2626", color: "#fff", fontSize: "12.5px", fontWeight: "500",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                              }}
                            >
                              {actionLoading === reg.id + "decline"
                                ? <Spinner animation="border" size="sm" style={{ width: "12px", height: "12px" }} />
                                : "✕"} Decline
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "13px", color: "#94A3B8" }}>
                            {reg.status === "approved" ? "✅ Approved" : "❌ Declined"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Confirm Modal */}
        <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
          <Modal.Body style={{ padding: "32px 24px", textAlign: "center" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: confirmAction?.type === "approve" ? "#F0FDF4" : "#FEF2F2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: "22px"
            }}>
              {confirmAction?.type === "approve" ? "✅" : "❌"}
            </div>
            <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "8px" }}>
              {confirmAction?.type === "approve" ? "Approve Registration" : "Decline Registration"}
            </h6>
            <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0 }}>
              Are you sure you want to <strong>{confirmAction?.type}</strong> the registration for{" "}
              <strong style={{ color: "#1E293B" }}>{confirmAction?.name}</strong>?
              {confirmAction?.type === "approve"
                ? " Login credentials will be sent to their email."
                : " They will be notified via email and can retry after 1 hour."}
            </p>
          </Modal.Body>
          <Modal.Footer style={{ padding: "0 24px 24px", border: "none", justifyContent: "center", gap: "8px" }}>
            <button onClick={() => setShowConfirm(false)}
              style={{ height: "38px", padding: "0 20px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={confirmDo}
              style={{
                height: "38px", padding: "0 20px", border: "none", borderRadius: "9px",
                background: confirmAction?.type === "approve" ? "#16A34A" : "#DC2626",
                fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: "pointer"
              }}>
              Yes, {confirmAction?.type === "approve" ? "Approve" : "Decline"}
            </button>
          </Modal.Footer>
        </Modal>
      </Container>
    </MainLayout>
  )
}

export default AdminManagement
