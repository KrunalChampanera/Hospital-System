import { useState } from "react"
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

const AdminRegistration = () => {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!form.full_name.trim()) newErrors.full_name = "Full name is required"
    if (!form.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format"
    if (!form.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!/^\d{10,15}$/.test(form.phone.replace(/\s/g, ""))) newErrors.phone = "Enter a valid phone number"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (!validate()) return
    setLoading(true)
    try {
      const res = await api.post("/registration", form)
      if (res.data.success) {
        setSuccess(res.data.message)
        setForm({ full_name: "", email: "", phone: "" })
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} sm={9} xs={11}>
            <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div style={{ fontSize: "48px" }}>🏥</div>
                  <h2 className="fw-bold mb-1" style={{ color: "#2d3748" }}>Admin Registration</h2>
                  <p className="text-muted">Fill in your details to request admin access</p>
                </div>

                {success && (
                  <Alert variant="success" className="mb-4">
                    ✅ {success}
                    <div className="mt-2 small">You will receive an email once the Super Admin reviews your request.</div>
                  </Alert>
                )}
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold" style={{ color: "#2d3748" }}>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      placeholder="Enter your full name"
                      value={form.full_name}
                      onChange={handleChange}
                      isInvalid={!!errors.full_name}
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.full_name}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold" style={{ color: "#2d3748" }}>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold" style={{ color: "#2d3748" }}>Phone Number *</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={handleChange}
                      isInvalid={!!errors.phone}
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-100 fw-bold"
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px"
                    }}
                  >
                    {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Submitting...</> : "Submit Registration"}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p className="text-muted small">Already have an account?{" "}
                    <span
                      style={{ color: "#667eea", cursor: "pointer", fontWeight: "600" }}
                      onClick={() => navigate("/")}
                    >
                      Login here
                    </span>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default AdminRegistration
