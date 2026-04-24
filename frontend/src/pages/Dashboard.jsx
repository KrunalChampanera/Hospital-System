import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap"
import MainLayout from "../layouts/MainLayout"
import api from "../services/api"

const Dashboard = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get("/hospital")
        if (res.data.success) {
          setHospitals(res.data.data || [])
        } else {
          setError(res.data.message || "Unable to load hospitals")
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load hospitals")
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  return (
    <MainLayout>
      <Container fluid>
        <Row className="mb-4 align-items-center">
          <Col>
            <h3 className="mb-2">Dashboard</h3>
            <p className="text-muted">Welcome Super Admin 👋</p>
          </Col>
          <Col className="text-end">
            <Card className="shadow-sm border-0" style={{ minWidth: "220px" }}>
              <Card.Body>
                <Card.Title className="mb-0">Total Hospitals</Card.Title>
                <h2 className="mt-2 mb-0">{loading ? <Spinner animation="border" size="sm" /> : hospitals.length}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger">{error}</Alert>
        )}

        <Card className="shadow-sm border-0">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1">All Hospitals</h5>
                <p className="text-muted mb-0">Review the current hospital records in the system.</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-4 text-muted">No hospitals found.</div>
            ) : (
              <Table responsive hover borderless className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Admin</th>
                    <th>Admin Status</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Pin Code</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((hospital) => (
                    <tr key={hospital.id || hospital._id}>
                      <td>{hospital.clinic_name || "-"}</td>
                      <td>{hospital.admin_name || "-"}</td>
                      <td>
                        <span className={`badge bg-${hospital.admin_status === "Active" ? "success" : "secondary"}`}>
                          {hospital.admin_status === "Active" ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td>{hospital.city || "-"}</td>
                      <td>{hospital.state || "-"}</td>
                      <td>{hospital.country || "-"}</td>
                      <td>{hospital.pincode || "-"}</td>
                      <td>{hospital.status || "Active"}</td>
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