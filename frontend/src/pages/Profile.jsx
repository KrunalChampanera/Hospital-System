import { useEffect, useState } from "react"
import { Container, Card, Row, Col, Spinner, Alert } from "react-bootstrap"
import MainLayout from "../layouts/MainLayout"
import api from "../services/api"

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const role = localStorage.getItem("role")

  useEffect(() => {
    if (role === "super_admin") {
      setProfile(user)
      setLoading(false)
      return
    }

    api.get(`/auth/profile/${user.id}`)
      .then((res) => {
        if (res.data.success) setProfile(res.data.admin)
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <MainLayout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={6}>
            <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4" style={{ fontSize: "64px" }}>👤</div>
                <h2 className="fw-bold text-center mb-4">My Profile</h2>

                {error && <Alert variant="danger">{error}</Alert>}

                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : profile ? (
                  <div>
                    {[
                      ["Name", profile.name],
                      ["Email", profile.email],
                      ["Role", role === "super_admin" ? "Super Admin" : "Hospital Admin"],
                      ["Status", profile.status || "Active"],
                      ...(role !== "super_admin" ? [
                        ["Total Logins", profile.login_count || 0],
                        ["Last Login", profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never"]
                      ] : [])
                    ].map(([label, value]) => (
                      <Row key={label} className="mb-3">
                        <Col xs={4} className="text-muted">{label}</Col>
                        <Col xs={8} className="fw-semibold">
                          {label === "Status"
                            ? <span className={`badge bg-${value === "Active" ? "success" : "secondary"}`}>{value}</span>
                            : value}
                        </Col>
                      </Row>
                    ))}
                  </div>
                ) : null}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MainLayout>
  )
}

export default Profile
