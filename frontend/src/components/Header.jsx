import { Navbar, Form, FormControl } from "react-bootstrap"

const Header = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const role = localStorage.getItem("role")

  return (
    <Navbar bg="light" className="px-3" style={{ borderBottom: "1px solid #ddd" }}>
      <Form className="d-flex w-50">
        <FormControl placeholder="Search..." />
      </Form>
      <div className="ms-auto">
        <span>🔔</span>
        <span className="ms-3">
          👤 {user.name || "User"} ({role === "super_admin" ? "Super Admin" : "Admin"})
        </span>
      </div>
    </Navbar>
  )
}

export default Header
