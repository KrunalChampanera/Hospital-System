import { useEffect, useState } from "react"
import { Container, Table, Button, Badge } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import MainLayout from "../layouts/MainLayout"

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const res = await api.get("/hospital")
      if (res.data.success) {
        setHospitals(res.data.data || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch hospitals")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hospital?")) return
    try {
      await api.delete(`/hospital/${id}`)
      fetchHospitals()
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete hospital")
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <Container className="py-5 text-center">
          <p>Loading hospitals...</p>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Hospitals</h2>
          <Button
            variant="primary"
            onClick={() => navigate("/create-hospital")}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none"
            }}
          >
            + Add Hospital
          </Button>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {hospitals.length === 0 ? (
          <div className="alert alert-info text-center">
            No hospitals found. <a href="/create-hospital">Create one now</a>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th>Name</th>
                <th>Admin</th>
                <th>Email</th>
                <th>Admin Status</th>
                <th>City</th>
                <th>State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital) => (
                <tr key={hospital.id || hospital._id}>
                  <td className="fw-600">{hospital.clinic_name || hospital.name}</td>
                  <td>{hospital.admin_name || "-"}</td>
                  <td>{hospital.admin_email || "-"}</td>
                  <td>
                    <Badge bg={hospital.admin_status === "Active" ? "success" : "secondary"}>
                      {hospital.admin_status === "Active" ? "Online" : "Offline"}
                    </Badge>
                  </td>
                  <td>{hospital.city || "-"}</td>
                  <td>{hospital.state || "-"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => navigate(`/create-hospital?edit=${hospital.id || hospital._id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(hospital.id || hospital._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </MainLayout>
  )
}

export default HospitalList
