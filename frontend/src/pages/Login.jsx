import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const navigate = useNavigate()

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) {
      setEmailError("Email is required")
      return false
    } else if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email")
      return false
    }
    setEmailError("")
    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(email)) return
    if (!password) {
      setError("Password is required")
      return
    }

    setLoading(true)
    try {
      const res = await api.post("/auth/login", { email, password })
      if (res.data.success) {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("role", res.data.role)
        localStorage.setItem("user", JSON.stringify(res.data.user))

        if (res.data.role === "super_admin") {
          navigate("/dashboard")
        } else if (res.data.role === "admin") {
          navigate("/admin-dashboard")
        } else if (res.data.role === "doctor") {
          navigate("/doctor-dashboard")
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password")
      setPassword("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={5} sm={8} xs={11}>
            <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="mb-3" style={{ fontSize: "48px", fontWeight: "bold", color: "#667eea" }}>🏥</div>
                  <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>MPMS</h2>
                  <p className="text-muted mb-4">Medical Practice Management System</p>
                </div>

                {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError("") }}
                      onBlur={() => validateEmail(email)}
                      isInvalid={!!emailError}
                      className="form-control-lg"
                      style={{ borderRadius: "8px", padding: "12px 15px", border: emailError ? "1px solid #dc3545" : "1px solid #e2e8f0" }}
                    />
                    {emailError && <Form.Control.Feedback type="invalid" className="d-block mt-2">{emailError}</Form.Control.Feedback>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control-lg"
                      style={{ borderRadius: "8px", padding: "12px 15px", border: "1px solid #e2e8f0" }}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check type="checkbox" label="Remember me" style={{ color: "#718096" }} />
                    <a href="#" style={{ color: "#667eea", textDecoration: "none", fontSize: "14px" }}>Forgot Password?</a>
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-100 fw-bold"
                    style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", borderRadius: "8px", padding: "12px", fontSize: "16px", letterSpacing: "0.5px" }}
                  >
                    {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />Signing in...</> : "Sign In"}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p style={{ color: "#718096", fontSize: "14px" }}>
                    Don't have an account? <a href="/register" style={{ color: "#667eea", textDecoration: "none", fontWeight: "600" }}>Register as Admin</a>
                  </p>
                  <p style={{ color: "#718096", fontSize: "14px", marginTop: 4 }}>
                    Patient? <a href="/book" style={{ color: "#059669", textDecoration: "none", fontWeight: "600" }}>Book an Appointment →</a>
                  </p>
                </div>
              </Card.Body>
            </Card>

            <p className="text-center mt-4" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
              © 2026 Medical Practice Management System. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login
