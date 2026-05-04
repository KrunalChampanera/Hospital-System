import { useState } from "react"
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import api from "../services/api"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) return setError("All fields are required")
    if (newPassword !== confirmPassword) return setError("Passwords do not match")
    if (newPassword.length < 6) return setError("Password must be at least 6 characters")

    setLoading(true); setError(""); setSuccess("")
    try {
      const res = await api.post("/staff/reset-password", { token, newPassword })
      if (res.data.success) {
        setSuccess(res.data.message)
        setTimeout(() => navigate("/"), 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password")
    }
    setLoading(false)
  }

  if (!token) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <Alert variant="danger">Invalid reset link. <Link to="/forgot-password">Request a new one</Link>.</Alert>
    </div>
  )

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={5} sm={8} xs={11}>
            <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="mb-3" style={{ fontSize: "48px", fontWeight: "bold", color: "#667eea" }}>🔑</div>
                  <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>Reset Password</h2>
                  <p className="text-muted mb-4">Enter your new password below</p>
                </div>

                {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
                {success && <Alert variant="success">{success} Redirecting to login...</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-control-lg"
                      style={{ borderRadius: "8px", padding: "12px 15px", border: "1px solid #e2e8f0" }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-control-lg"
                      style={{ borderRadius: "8px", padding: "12px 15px", border: "1px solid #e2e8f0" }}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={loading || !!success}
                    className="w-100 fw-bold"
                    style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", borderRadius: "8px", padding: "12px", fontSize: "16px" }}
                  >
                    {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />Resetting...</> : "Reset Password"}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <Link to="/" style={{ color: "#667eea", textDecoration: "none", fontWeight: "600" }}>← Back to Login</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ResetPassword
