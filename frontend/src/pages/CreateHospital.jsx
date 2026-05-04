import { useEffect, useState } from "react"
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from "react-bootstrap"
import { useLocation, useNavigate } from "react-router-dom"
import api from "../services/api"
import MainLayout from "../layouts/MainLayout"
import usePincode from "../hooks/usePincode"

const CreateHospital = () => {
  const [formData, setFormData] = useState({
    clinic_name: "",
    admin_name: "",
    address: "",
    admin_email: "",
    city: "",
    state: "",
    country: "",
    pincode: ""
  })

  const [errors, setErrors] = useState({})
  const { pincodeLoading, pincodeError, handlePincodeChange } = usePincode(setFormData, setErrors)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [hospitalId, setHospitalId] = useState(null)
  const [loadingHospital, setLoadingHospital] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.clinic_name.trim()) newErrors.clinic_name = "Hospital name is required"
    if (!formData.admin_name.trim()) newErrors.admin_name = "Admin name is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.admin_email.trim()) newErrors.admin_email = "Admin email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) newErrors.admin_email = "Invalid email format"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.country.trim()) newErrors.country = "Country is required"
    if (!formData.pincode.trim()) newErrors.pincode = "Pin code is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const loadHospital = async (id) => {
    setLoadingHospital(true)
    try {
      const res = await api.get(`/hospital/${id}`)
      if (res.data.success) {
        const data = res.data.data
        setFormData({
          clinic_name: data.clinic_name || "",
          admin_name: data.admin_name || "",
          address: data.address || "",
          admin_email: data.admin_email || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          pincode: data.pincode || ""
        })
        setEditing(true)
        setHospitalId(id)
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Unable to load hospital details" })
    } finally {
      setLoadingHospital(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const editId = params.get("edit")
    if (editId) {
      loadHospital(editId)
    }
  }, [location.search])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const res = editing
        ? await api.put(`/hospital/${hospitalId}`, formData)
        : await api.post("/hospital/create", formData)

      if (res.data.success || res.status === 200) {
        // Capture generated password from response
        if (!editing && res.data.password) {
          setGeneratedPassword(res.data.password)
        }

        setSuccess(true)
        setFormData({
          clinic_name: "",
          admin_name: "",
          address: "",
          admin_email: "",
          city: "",
          state: "",
          country: "",
          pincode: ""
        })

        // For new hospital, show password for 5 seconds before redirecting
        if (!editing) {
          setTimeout(() => {
            navigate("/hospitals")
          }, 5000)
        } else {
          setTimeout(() => {
            navigate("/hospitals")
          }, 1500)
        }
      }
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || (editing ? "Failed to update hospital" : "Failed to create hospital")
      })
      setGeneratedPassword(null)
    } finally {
      setLoading(false)
    }
  }

  if (loadingHospital) {
    return (
      <MainLayout>
        <Container className="py-5 text-center">
          <Spinner animation="border" />
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
              <Card.Body className="p-5">
                {/* Header */}
                <div className="mb-4">
                  <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                    {editing ? "Edit Hospital" : "Register Hospital"}
                  </h2>
                  <p className="text-muted">
                    {editing ? "Update hospital details and admin info." : "Fill in the details to create a new hospital record."}
                  </p>
                </div>

                {/* Success Alert */}
                {success && (
                  <div>
                    <Alert variant="success" className="mb-4">
                      ✅ {editing ? "Hospital updated successfully!" : "Hospital created successfully!"} Redirecting...
                    </Alert>
                    {generatedPassword && !editing && (
                      <Alert variant="info" className="mb-4" style={{ borderLeft: "5px solid #0d6efd" }}>
                        <strong>📧 Admin Credentials Generated</strong>
                        <div className="mt-3">
                          <p className="mb-2"><strong>Email:</strong> {formData.admin_email}</p>
                          <p className="mb-2"><strong>Temporary Password:</strong> <span style={{ fontSize: "18px", fontWeight: "bold", color: "#0d6efd", letterSpacing: "2px" }}>{generatedPassword}</span></p>
                          <hr />
                          <p className="small text-muted mb-0">
                            These credentials have been sent to the admin's email address. The admin can use them to login and change their password in the admin dashboard.
                          </p>
                        </div>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Error Alert */}
                {errors.submit && (
                  <Alert variant="danger" dismissible onClose={() => setErrors(prev => ({ ...prev, submit: "" }))}>
                    {errors.submit}
                  </Alert>
                )}

                {/* Form */}
                <Form onSubmit={handleSubmit}>
                  {/* Hospital Name */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>
                      Hospital Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="clinic_name"
                      placeholder="Enter hospital name"
                      value={formData.clinic_name}
                      onChange={handleChange}
                      isInvalid={!!errors.clinic_name}
                      className="form-control-lg"
                      style={{ borderRadius: "8px", padding: "12px 15px" }}
                    />
                    {errors.clinic_name && (
                      <Form.Control.Feedback type="invalid" className="d-block mt-2">
                        {errors.clinic_name}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  {/* Admin Name */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>
                      Admin Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="admin_name"
                      placeholder="Enter admin name"
                      value={formData.admin_name}
                      onChange={handleChange}
                      isInvalid={!!errors.admin_name}
                      className="form-control-lg"
                      style={{ borderRadius: "8px", padding: "12px 15px" }}
                    />
                    {errors.admin_name && (
                      <Form.Control.Feedback type="invalid" className="d-block mt-2">
                        {errors.admin_name}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  {/* Address */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>
                      Address *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      placeholder="Enter full address"
                      value={formData.address}
                      onChange={handleChange}
                      isInvalid={!!errors.address}
                      className="form-control-lg"
                      style={{ borderRadius: "8px", padding: "12px 15px" }}
                    />
                    {errors.address && (
                      <Form.Control.Feedback type="invalid" className="d-block mt-2">
                        {errors.address}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  {/* City, State, Country, Pin Code Row */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>City *</Form.Label>
                        <Form.Control
                          type="text" name="city" placeholder="City"
                          value={formData.city} onChange={handleChange} isInvalid={!!errors.city}
                          className="form-control-lg"
                          style={{ borderRadius: "8px", padding: "12px 15px", background: formData.city ? "#f0fff4" : "" }}
                        />
                        {errors.city && <Form.Control.Feedback type="invalid" className="d-block mt-2">{errors.city}</Form.Control.Feedback>}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>State *</Form.Label>
                        <Form.Control
                          type="text" name="state" placeholder="State"
                          value={formData.state} onChange={handleChange} isInvalid={!!errors.state}
                          className="form-control-lg"
                          style={{ borderRadius: "8px", padding: "12px 15px", background: formData.state ? "#f0fff4" : "" }}
                        />
                        {errors.state && <Form.Control.Feedback type="invalid" className="d-block mt-2">{errors.state}</Form.Control.Feedback>}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Country and Pin Code Row */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>Country *</Form.Label>
                        <Form.Control
                          type="text" name="country" placeholder="Country"
                          value={formData.country} onChange={handleChange} isInvalid={!!errors.country}
                          className="form-control-lg"
                          style={{ borderRadius: "8px", padding: "12px 15px", background: formData.country ? "#f0fff4" : "" }}
                        />
                        {errors.country && <Form.Control.Feedback type="invalid" className="d-block mt-2">{errors.country}</Form.Control.Feedback>}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>
                          Pin Code *
                        </Form.Label>
                        <div style={{ position: "relative" }}>
                          <Form.Control
                            type="text"
                            name="pincode"
                            placeholder="Enter pin code"
                            value={formData.pincode}
                            onChange={handlePincodeChange}
                            isInvalid={!!errors.pincode}
                            className="form-control-lg"
                            style={{ borderRadius: "8px", padding: "12px 15px" }}
                            maxLength={10}
                          />
                          {pincodeLoading && <Spinner animation="border" size="sm" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#667eea" }} />}
                        </div>
                        {pincodeError && <div style={{ color: "#e53e3e", fontSize: "0.8rem", marginTop: 4 }}>{pincodeError}</div>}
                        {errors.pincode && (
                          <Form.Control.Feedback type="invalid" className="d-block mt-2">
                            {errors.pincode}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Admin Email */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-600 mb-2" style={{ color: "#2d3748" }}>
                      Admin Email *
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="admin_email"
                      placeholder="Enter admin email"
                      value={formData.admin_email}
                      onChange={handleChange}
                      isInvalid={!!errors.admin_email}
                      className="form-control-lg"
                      style={{ borderRadius: "8px", padding: "12px 15px" }}
                    />
                    {errors.admin_email && (
                      <Form.Control.Feedback type="invalid" className="d-block mt-2">
                        {errors.admin_email}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  {/* Buttons */}
                  <Row className="mt-5">
                    <Col md={6}>
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-100 fw-bold"
                        onClick={() => navigate("/hospitals")}
                        style={{ borderRadius: "8px", padding: "12px" }}
                      >
                        Cancel
                      </Button>
                    </Col>
                    <Col md={6}>
                      <Button
                        variant="primary"
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
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            {editing ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          editing ? "Update Hospital" : "Create Hospital"
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MainLayout>
  )
}

export default CreateHospital
