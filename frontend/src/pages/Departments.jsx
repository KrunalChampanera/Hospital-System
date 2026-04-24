// import { useEffect, useState, useRef } from "react"
// import {
//   Container, Card, Table, Spinner, Alert, Button,
//   Modal, Form, Badge, InputGroup, Dropdown, Row, Col
// } from "react-bootstrap"
// import MainLayout from "../layouts/MainLayout"
// import api from "../services/api"

// const ITEMS_PER_PAGE = 5

// const Departments = ({ hospitalId }) => {
//   const [departments, setDepartments] = useState([])
//   const [filtered, setFiltered] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")
//   const [successMsg, setSuccessMsg] = useState("")
//   const [search, setSearch] = useState("")
//   const [currentPage, setCurrentPage] = useState(1)

//   // Modal state
//   const [showModal, setShowModal] = useState(false)
//   const [editData, setEditData] = useState(null)
//   const [form, setForm] = useState({ name: "", description: "", status: "Inactive" })
//   const [imageFile, setImageFile] = useState(null)
//   const [imagePreview, setImagePreview] = useState(null)
//   const [saving, setSaving] = useState(false)

//   // Delete modal
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [deleteTarget, setDeleteTarget] = useState(null)
//   const [deleting, setDeleting] = useState(false)

//   const fileInputRef = useRef()

//   useEffect(() => { fetchDepartments() }, [])

//   useEffect(() => {
//     const q = search.toLowerCase()
//     setFiltered(
//       departments.filter(d => d.name.toLowerCase().includes(q))
//     )
//     setCurrentPage(1)
//   }, [search, departments])

//   const fetchDepartments = async () => {
//     setLoading(true)
//     try {
//       const res = await api.get(`/department`)
//       if (res.data.success) {
//         setDepartments(res.data.data)
//         setFiltered(res.data.data)
//       }
//     } catch (err) {
//       setError("Failed to load departments")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const openAddModal = () => {
//     setEditData(null)
//     setForm({ name: "", description: "", status: "Inactive" })
//     setImageFile(null)
//     setImagePreview(null)
//     setShowModal(true)
//   }

//   const openEditModal = (dept) => {
//     setEditData(dept)
//     setForm({ name: dept.name, description: dept.description || "", status: dept.status })
//     setImageFile(null)
//     setImagePreview(dept.image ? `http://localhost:5000${dept.image}` : null)
//     setShowModal(true)
//   }

//   const handleImageChange = (e) => {
//     const file = e.target.files[0]
//     if (!file) return
//     if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB"); return }
//     setImageFile(file)
//     setImagePreview(URL.createObjectURL(file))
//   }

//   const handleSave = async () => {
//     if (!form.name.trim()) { setError("Department name is required"); return }
//     setSaving(true); setError(""); setSuccessMsg("")
//     try {
//       const fd = new FormData()
//       fd.append("name", form.name)
//       fd.append("description", form.description)
//       fd.append("status", form.status)
//       if (imageFile) fd.append("image", imageFile)

//       if (editData) {
//         await api.put(`/department/${editData.id}`, fd, {
//           headers: { "Content-Type": "multipart/form-data" }
//         })
//         setSuccessMsg("Department updated!")
//       } else { 
//         await api.post("/department", fd, {
//           headers: { "Content-Type": "multipart/form-data" }
//         })
//         setSuccessMsg("Department created!")
//       }
//       setShowModal(false)
//       fetchDepartments()
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to save department")
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleDelete = async () => {
//     if (!deleteTarget) return
//     setDeleting(true)
//     try {
//       await api.delete(`/department/${deleteTarget.id}`)
//       setSuccessMsg("Department deleted!")
//       setShowDeleteModal(false)
//       fetchDepartments()
//     } catch (err) {
//       setError("Failed to delete department")
//     } finally {
//       setDeleting(false)
//     }
//   }

//   const handleToggleStatus = async (dept) => {
//     const newStatus = dept.status === "Active" ? "Inactive" : "Active"
//     try {
//       await api.patch(`/department/${dept.id}/status`, { status: newStatus })
//       fetchDepartments()
//     } catch (err) {
//       setError("Failed to update status")
//     }
//   }

//   // Pagination
//   const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
//   const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

//   const getInitial = (name) => name?.charAt(0).toUpperCase() || "D"

//   return (
//     <MainLayout>
//       <Container fluid>
//         {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
//         {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}

//         <Card className="shadow-sm border-0">
//           {/* Header */}
//           <div style={{ background: "#EBF3FF", padding: "16px 24px", borderRadius: "8px 8px 0 0" }}>
//             <Row className="align-items-center">
//               <Col>
//                 <h5 className="mb-0 fw-bold">Department</h5>
//               </Col>
//               <Col className="d-flex gap-2 justify-content-end align-items-center">
//                 <InputGroup style={{ width: "260px" }}>
//                   <InputGroup.Text style={{ background: "#fff", border: "1px solid #ddd" }}>🔍</InputGroup.Text>
//                   <Form.Control
//                     placeholder="Search departments..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     style={{ border: "1px solid #ddd", borderLeft: "none" }}
//                   />
//                 </InputGroup>
//                 <Button variant="outline-secondary" style={{ padding: "8px 12px" }}>⚙️</Button>
//                 <Button
//                   variant="primary"
//                   onClick={openAddModal}
//                   style={{ whiteSpace: "nowrap" }}
//                 >
//                   + Add Department
//                 </Button>
//               </Col>
//             </Row>
//           </div>

//           <Card.Body className="p-0">
//             {loading ? (
//               <div className="text-center py-5"><Spinner animation="border" /></div>
//             ) : filtered.length === 0 ? (
//               <div className="text-center py-5 text-muted">No departments found.</div>
//             ) : (
//               <Table responsive hover borderless className="mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th style={{ width: "40px" }}>
//                       <Form.Check type="checkbox" />
//                     </th>
//                     <th>DEPARTMENT</th>
//                     <th>NO OF DOCTOR</th>
//                     <th>CREATED DATE</th>
//                     <th>STATUS</th>
//                     <th>ACTION</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginated.map((dept) => (
//                     <tr key={dept.id}>
//                       <td><Form.Check type="checkbox" /></td>
//                       <td>
//                         <div className="d-flex align-items-center gap-2">
//                           {dept.image ? (
//                             <img
//                               src={`http://localhost:5000${dept.image}`}
//                               alt={dept.name}
//                               style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
//                             />
//                           ) : (
//                             <div style={{
//                               width: "40px", height: "40px", borderRadius: "50%",
//                               background: "#e0e7ff", display: "flex", alignItems: "center",
//                               justifyContent: "center", fontWeight: "bold", color: "#4f6ef7"
//                             }}>
//                               {getInitial(dept.name)}
//                             </div>
//                           )}
//                           <span className="fw-semibold">{dept.name}</span>
//                         </div>
//                       </td>
//                       <td className="text-muted">{dept.doctor_count || 0} Doctors</td>
//                       <td className="text-muted">
//                         {new Date(dept.created_at).toLocaleDateString("en-GB", {
//                           day: "2-digit", month: "short", year: "numeric"
//                         })}
//                       </td>
//                       <td>
//                         <span style={{
//                           border: `1px solid ${dept.status === "Active" ? "#28a745" : "#dc3545"}`,
//                           color: dept.status === "Active" ? "#28a745" : "#dc3545",
//                           padding: "3px 12px",
//                           borderRadius: "20px",
//                           fontSize: "13px",
//                           fontWeight: "500"
//                         }}>
//                           {dept.status}
//                         </span>
//                       </td>
//                       <td>
//                         <Dropdown align="end">
//                           <Dropdown.Toggle variant="link" className="text-dark p-0" style={{ fontSize: "20px" }}>
//                             ⋮
//                           </Dropdown.Toggle>
//                           <Dropdown.Menu>
//                             <Dropdown.Item onClick={() => openEditModal(dept)}>✏️ Edit</Dropdown.Item>
//                             <Dropdown.Item onClick={() => handleToggleStatus(dept)}>
//                               {dept.status === "Active" ? "🔴 Set Inactive" : "🟢 Set Active"}
//                             </Dropdown.Item>
//                             <Dropdown.Divider />
//                             <Dropdown.Item
//                               className="text-danger"
//                               onClick={() => { setDeleteTarget(dept); setShowDeleteModal(true) }}
//                             >
//                               🗑️ Delete
//                             </Dropdown.Item>
//                           </Dropdown.Menu>
//                         </Dropdown>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             )}

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
//                 <span className="text-muted small">Page {currentPage} of {totalPages}</span>
//                 <div className="d-flex gap-1">
//                   <Button
//                     variant="outline-secondary" size="sm"
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage(p => p - 1)}
//                   >&lt;</Button>
//                   {Array.from({ length: totalPages }, (_, i) => (
//                     <Button
//                       key={i + 1}
//                       size="sm"
//                       variant={currentPage === i + 1 ? "primary" : "outline-secondary"}
//                       onClick={() => setCurrentPage(i + 1)}
//                     >
//                       {i + 1}
//                     </Button>
//                   ))}
//                   <Button
//                     variant="outline-secondary" size="sm"
//                     disabled={currentPage === totalPages}
//                     onClick={() => setCurrentPage(p => p + 1)}
//                   >&gt;</Button>
//                 </div>
//               </div>
//             )}
//           </Card.Body>
//         </Card>

//         {/* ── Add / Edit Modal ── */}
//         <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
//           <Modal.Header closeButton style={{ background: "#EBF3FF", border: "none" }}>
//             <Modal.Title className="fw-bold">{editData ? "Edit Department" : "New Department"}</Modal.Title>
//           </Modal.Header>
//           <Modal.Body className="px-4 py-3">
//             <Form.Group className="mb-3">
//               <Form.Label className="fw-semibold">
//                 Department Name <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 placeholder="e.g. Cardiology"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label className="fw-semibold">Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 placeholder="Explain department duties..."
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//               />
//             </Form.Group>

//             {editData && (
//               <Form.Group className="mb-3">
//                 <Form.Label className="fw-semibold">Status</Form.Label>
//                 <Form.Select
//                   value={form.status}
//                   onChange={(e) => setForm({ ...form, status: e.target.value })}
//                 >
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </Form.Select>
//               </Form.Group>
//             )}

//             <Form.Group className="mb-3">
//               <Form.Label className="fw-semibold">Department Image</Form.Label>
//               <div
//                 onClick={() => fileInputRef.current.click()}
//                 style={{
//                   border: "2px dashed #4f9cf9",
//                   borderRadius: "10px",
//                   padding: "24px",
//                   textAlign: "center",
//                   cursor: "pointer",
//                   background: "#f0f7ff"
//                 }}
//               >
//                 {imagePreview ? (
//                   <img
//                     src={imagePreview}
//                     alt="Preview"
//                     style={{ height: "80px", objectFit: "contain", borderRadius: "8px" }}
//                   />
//                 ) : (
//                   <>
//                     <div style={{ fontSize: "32px", marginBottom: "8px" }}>☁️⬆️</div>
//                     <div className="fw-semibold">Upload Department Photo</div>
//                     <div className="text-muted small">Supports: JPG, PNG (Max 2MB)</div>
//                   </>
//                 )}
//               </div>
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="image/jpeg,image/png"
//                 style={{ display: "none" }}
//                 onChange={handleImageChange}
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer style={{ border: "none" }}>
//             <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Cancel</Button>
//             <Button variant="primary" onClick={handleSave} disabled={saving}>
//               {saving ? <Spinner animation="border" size="sm" className="me-1" /> : null} Save
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         {/* ── Delete Confirm Modal ── */}
//         <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
//           <Modal.Header closeButton style={{ border: "none" }}>
//             <Modal.Title className="fw-bold">Delete Department</Modal.Title>
//           </Modal.Header>
//           <Modal.Body className="text-center px-4">
//             <div style={{ fontSize: "40px" }}>🗑️</div>
//             <p className="mt-2">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
//             <p className="text-muted small">This action cannot be undone.</p>
//           </Modal.Body>
//           <Modal.Footer style={{ border: "none", justifyContent: "center" }}>
//             <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
//             <Button variant="danger" onClick={handleDelete} disabled={deleting}>
//               {deleting ? <Spinner animation="border" size="sm" className="me-1" /> : null} Delete
//             </Button>
//           </Modal.Footer>
//         </Modal>

//       </Container>
//     </MainLayout>
//   )
// }

// export default Departments

import { useEffect, useState, useRef } from "react"
import {
  Container, Card, Table, Spinner, Alert, Button,
  Modal, Form, Badge, InputGroup, Dropdown, Row, Col
} from "react-bootstrap"
import MainLayout from "../layouts/MainLayout"
import api from "../services/api"

const ITEMS_PER_PAGE = 5

const Departments = ({ hospitalId }) => {
  const [departments, setDepartments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({ name: "", description: "", status: "Inactive" })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef()

  useEffect(() => { fetchDepartments() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(departments.filter(d => d.name.toLowerCase().includes(q)))
    setCurrentPage(1)
  }, [search, departments])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/department`)
      if (res.data.success) {
        setDepartments(res.data.data)
        setFiltered(res.data.data)
      }
    } catch (err) {
      setError("Failed to load departments")
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditData(null)
    setForm({ name: "", description: "", status: "Inactive" })
    setImageFile(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const openEditModal = (dept) => {
    setEditData(dept)
    setForm({ name: dept.name, description: dept.description || "", status: dept.status })
    setImageFile(null)
    setImagePreview(dept.image ? `http://localhost:5000${dept.image}` : null)
    setShowModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB"); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Department name is required"); return }
    setSaving(true); setError(""); setSuccessMsg("")
    try {
      const fd = new FormData()
      fd.append("name", form.name)
      fd.append("description", form.description)
      fd.append("status", form.status)
      if (imageFile) fd.append("image", imageFile)
      if (editData) {
        await api.put(`/department/${editData.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } })
        setSuccessMsg("Department updated!")
      } else {
        await api.post("/department", fd, { headers: { "Content-Type": "multipart/form-data" } })
        setSuccessMsg("Department created!")
      }
      setShowModal(false)
      fetchDepartments()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save department")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/department/${deleteTarget.id}`)
      setSuccessMsg("Department deleted!")
      setShowDeleteModal(false)
      fetchDepartments()
    } catch (err) {
      setError("Failed to delete department")
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (dept) => {
    const newStatus = dept.status === "Active" ? "Inactive" : "Active"
    try {
      await api.patch(`/department/${dept.id}/status`, { status: newStatus })
      fetchDepartments()
    } catch (err) {
      setError("Failed to update status")
    }
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getInitial = (name) => name?.charAt(0).toUpperCase() || "D"

  // Avatar color palette
  const avatarColors = [
    { bg: "#EEF2FF", color: "#4F46E5" },
    { bg: "#FDF2F8", color: "#DB2777" },
    { bg: "#ECFDF5", color: "#059669" },
    { bg: "#FFF7ED", color: "#EA580C" },
    { bg: "#EFF6FF", color: "#2563EB" },
    { bg: "#FAF5FF", color: "#7C3AED" },
  ]
  const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]

  const styles = {
    pageWrapper: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    card: {
      border: "none",
      borderRadius: "16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      overflow: "hidden",
    },
    cardHeader: {
      background: "#ffffff",
      borderBottom: "1px solid #F1F5F9",
      padding: "20px 24px",
    },
    pageTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#0F172A",
      margin: 0,
      letterSpacing: "-0.01em",
    },
    pageSubtitle: {
      fontSize: "13px",
      color: "#94A3B8",
      margin: "2px 0 0",
    },
    searchWrapper: {
      position: "relative",
      width: "260px",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#94A3B8",
      fontSize: "14px",
      pointerEvents: "none",
      zIndex: 1,
    },
    searchInput: {
      paddingLeft: "36px",
      paddingRight: "12px",
      height: "38px",
      border: "1px solid #E2E8F0",
      borderRadius: "10px",
      fontSize: "13.5px",
      color: "#1E293B",
      background: "#F8FAFC",
      boxShadow: "none",
      width: "100%",
      outline: "none",
      transition: "border-color 0.15s, box-shadow 0.15s",
    },
    addBtn: {
      background: "#2563EB",
      border: "none",
      borderRadius: "10px",
      padding: "0 18px",
      height: "38px",
      fontSize: "13.5px",
      fontWeight: "500",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      boxShadow: "0 1px 2px rgba(37,99,235,0.2)",
      whiteSpace: "nowrap",
      cursor: "pointer",
      transition: "background 0.15s, box-shadow 0.15s",
    },
    tableHead: {
      background: "#F8FAFC",
      fontSize: "11px",
      fontWeight: "600",
      color: "#64748B",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    tableRow: {
      borderBottom: "1px solid #F1F5F9",
      verticalAlign: "middle",
    },
    avatar: (name) => ({
      width: "38px",
      height: "38px",
      borderRadius: "10px",
      background: getAvatarColor(name).bg,
      color: getAvatarColor(name).color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "600",
      fontSize: "14px",
      flexShrink: 0,
    }),
    deptName: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#1E293B",
      margin: 0,
    },
    deptDesc: {
      fontSize: "12px",
      color: "#94A3B8",
      margin: 0,
      marginTop: "1px",
    },
    metaText: {
      fontSize: "13.5px",
      color: "#64748B",
    },
    statusBadge: (active) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12.5px",
      fontWeight: "500",
      background: active ? "#F0FDF4" : "#FFF7ED",
      color: active ? "#16A34A" : "#EA580C",
      border: `1px solid ${active ? "#BBF7D0" : "#FED7AA"}`,
    }),
    statusDot: (active) => ({
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: active ? "#22C55E" : "#FB923C",
      display: "inline-block",
    }),
    actionBtn: {
      width: "32px",
      height: "32px",
      border: "1px solid #E2E8F0",
      borderRadius: "8px",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#64748B",
      fontSize: "16px",
      padding: 0,
      transition: "background 0.15s, border-color 0.15s",
    },
    emptyState: {
      padding: "60px 24px",
      textAlign: "center",
    },
    emptyIcon: {
      width: "56px",
      height: "56px",
      borderRadius: "14px",
      background: "#F1F5F9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 14px",
      fontSize: "22px",
    },
    paginationWrapper: {
      padding: "14px 20px",
      borderTop: "1px solid #F1F5F9",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    pageBtn: (active) => ({
      width: "32px",
      height: "32px",
      border: active ? "none" : "1px solid #E2E8F0",
      borderRadius: "8px",
      background: active ? "#2563EB" : "#fff",
      color: active ? "#fff" : "#475569",
      fontSize: "13px",
      fontWeight: active ? "600" : "400",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
    }),
    modalOverlay: {
      background: "rgba(15, 23, 42, 0.5)",
    },
  }

  return (
    <MainLayout>
      <style>{`
        .dept-search:focus { border-color: #93C5FD !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important; background: #fff !important; }
        .add-btn:hover { background: #1D4ED8 !important; box-shadow: 0 2px 8px rgba(37,99,235,0.3) !important; }
        .dept-table tbody tr:hover { background: #FAFBFF; }
        .action-btn:hover { background: #F8FAFC !important; border-color: #CBD5E1 !important; }
        .page-btn-nav:hover:not(:disabled) { background: #F1F5F9 !important; }
        .page-btn-nav:disabled { opacity: 0.35; cursor: not-allowed; }
        .upload-zone:hover { border-color: #93C5FD !important; background: #EFF6FF !important; }
        .dept-dropdown .dropdown-item { font-size: 13.5px; border-radius: 6px; margin: 1px 4px; padding: 7px 10px; }
        .dept-dropdown .dropdown-item:hover { background: #F1F5F9; }
        .dept-dropdown .dropdown-menu { border: 1px solid #E2E8F0; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); padding: 6px; min-width: 170px; }
        .modal-content { border-radius: 16px; border: none; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .form-control:focus, .form-select:focus { border-color: #93C5FD; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .form-control, .form-select { border-radius: 9px; border-color: #E2E8F0; font-size: 13.5px; }
        .dept-alert { border-radius: 10px; border: none; font-size: 13.5px; }
      `}</style>

      <Container fluid style={styles.pageWrapper}>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")} className="dept-alert mb-3"
            style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>
            <strong>Error:</strong> {error}
          </Alert>
        )}
        {successMsg && (
          <Alert variant="success" dismissible onClose={() => setSuccessMsg("")} className="dept-alert mb-3"
            style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>
            {successMsg}
          </Alert>
        )}

        <Card style={styles.card}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <Row className="align-items-center g-3">
              <Col>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    🏥
                  </div>
                  <div>
                    <h5 style={styles.pageTitle}>Departments</h5>
                    <p style={styles.pageSubtitle}>{departments.length} total departments</p>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Search */}
                  <div style={styles.searchWrapper}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                      className="dept-search"
                      placeholder="Search departments..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={styles.searchInput}
                    />
                  </div>
                  {/* Add Button */}
                  <button className="add-btn" style={styles.addBtn} onClick={openAddModal}>
                    <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
                    Add Department
                  </button>
                </div>
              </Col>
            </Row>
          </div>

          {/* Table */}
          <Card.Body className="p-0">
            {loading ? (
              <div style={{ padding: "64px 0", textAlign: "center" }}>
                <Spinner animation="border" style={{ color: "#2563EB", width: "28px", height: "28px" }} />
                <p style={{ marginTop: "12px", color: "#94A3B8", fontSize: "13.5px" }}>Loading departments...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🏢</div>
                <p style={{ fontWeight: "500", color: "#1E293B", marginBottom: "4px" }}>
                  {search ? "No results found" : "No departments yet"}
                </p>
                <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>
                  {search ? `No departments match "${search}"` : "Add your first department to get started"}
                </p>
                {!search && (
                  <button className="add-btn" style={{ ...styles.addBtn, margin: "0 auto" }} onClick={openAddModal}>
                    + Add Department
                  </button>
                )}
              </div>
            ) : (
              <Table responsive className="mb-0 dept-table" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "36px" }} />
                  <col style={{ width: "35%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "80px" }} />
                </colgroup>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={{ padding: "12px 8px 12px 20px" }}>
                      <Form.Check type="checkbox" style={{ marginTop: 0 }} />
                    </th>
                    <th style={{ padding: "12px 12px" }}>Department</th>
                    <th style={{ padding: "12px 12px" }}>Doctors</th>
                    <th style={{ padding: "12px 12px" }}>Created</th>
                    <th style={{ padding: "12px 12px" }}>Status</th>
                    <th style={{ padding: "12px 20px 12px 12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((dept) => (
                    <tr key={dept.id} style={styles.tableRow}>
                      <td style={{ padding: "14px 8px 14px 20px" }}>
                        <Form.Check type="checkbox" style={{ marginTop: 0 }} />
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {dept.image ? (
                            <img
                              src={`http://localhost:5000${dept.image}`}
                              alt={dept.name}
                              style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div style={styles.avatar(dept.name)}>
                              {getInitial(dept.name)}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p style={styles.deptName}>{dept.name}</p>
                            {dept.description && (
                              <p style={{ ...styles.deptDesc, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {dept.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ ...styles.metaText, fontWeight: "500", color: "#1E293B" }}>
                            {dept.doctor_count || 0}
                          </span>
                          <span style={styles.metaText}>doctors</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <span style={styles.metaText}>
                          {new Date(dept.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </span>
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <span style={styles.statusBadge(dept.status === "Active")}>
                          <span style={styles.statusDot(dept.status === "Active")} />
                          {dept.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px 14px 12px" }}>
                        <Dropdown align="end" className="dept-dropdown">
                          <Dropdown.Toggle
                            as="button"
                            className="action-btn"
                            style={styles.actionBtn}
                            id={`dropdown-${dept.id}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="3" r="1.2" fill="#64748B" />
                              <circle cx="8" cy="8" r="1.2" fill="#64748B" />
                              <circle cx="8" cy="13" r="1.2" fill="#64748B" />
                            </svg>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => openEditModal(dept)}>
                              <span style={{ marginRight: "8px" }}>✏️</span> Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleToggleStatus(dept)}>
                              {dept.status === "Active"
                                ? <><span style={{ marginRight: "8px" }}>⏸️</span> Set Inactive</>
                                : <><span style={{ marginRight: "8px" }}>▶️</span> Set Active</>
                              }
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              style={{ color: "#EF4444" }}
                              onClick={() => { setDeleteTarget(dept); setShowDeleteModal(true) }}
                            >
                              <span style={{ marginRight: "8px" }}>🗑️</span> Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.paginationWrapper}>
                <span style={{ fontSize: "13px", color: "#94A3B8" }}>
                  Showing <strong style={{ color: "#475569" }}>{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong style={{ color: "#475569" }}>{filtered.length}</strong>
                </span>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <button
                    className="page-btn-nav"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{ ...styles.pageBtn(false), width: "auto", padding: "0 10px", fontSize: "13px" }}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      style={styles.pageBtn(currentPage === i + 1)}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="page-btn-nav"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{ ...styles.pageBtn(false), width: "auto", padding: "0 10px", fontSize: "13px" }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* ── Add / Edit Modal ── */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
          <Modal.Header closeButton style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <Modal.Title style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>
                {editData ? "Edit Department" : "Add New Department"}
              </Modal.Title>
              <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>
                {editData ? "Update department details below" : "Fill in the details for the new department"}
              </p>
            </div>
          </Modal.Header>
          <Modal.Body style={{ padding: "20px 24px" }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                Department Name <span style={{ color: "#EF4444" }}>*</span>
              </Form.Label>
              <Form.Control
                placeholder="e.g. Cardiology, Radiology..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ height: "40px" }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                Description <span style={{ color: "#94A3B8", fontWeight: "400" }}>(optional)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Briefly describe what this department does..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ resize: "none" }}
              />
            </Form.Group>

            {editData && (
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                  Status
                </Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ height: "40px" }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-1">
              <Form.Label style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
                Department Photo
              </Form.Label>
              <div
                className="upload-zone"
                onClick={() => fileInputRef.current.click()}
                style={{
                  border: "1.5px dashed #CBD5E1",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#F8FAFC",
                  transition: "all 0.15s",
                }}
              >
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ height: "72px", objectFit: "contain", borderRadius: "8px", marginBottom: "8px" }}
                    />
                    <p style={{ margin: 0, fontSize: "12px", color: "#3B82F6" }}>Click to change photo</p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>📷</div>
                    <p style={{ margin: 0, fontSize: "13.5px", fontWeight: "500", color: "#475569" }}>Upload department photo</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94A3B8" }}>JPG or PNG · Max 2MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", gap: "8px" }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ height: "38px", padding: "0 18px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "9px", background: "#2563EB", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}
            >
              {saving && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
              {editData ? "Save Changes" : "Create Department"}
            </button>
          </Modal.Footer>
        </Modal>

        {/* ── Delete Confirm Modal ── */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
          <Modal.Body style={{ padding: "32px 24px", textAlign: "center" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px", background: "#FEF2F2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: "22px"
            }}>🗑️</div>
            <h6 style={{ fontWeight: "600", color: "#0F172A", marginBottom: "8px" }}>Delete Department</h6>
            <p style={{ fontSize: "13.5px", color: "#64748B", margin: 0 }}>
              Are you sure you want to delete <strong style={{ color: "#1E293B" }}>{deleteTarget?.name}</strong>? This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer style={{ padding: "0 24px 24px", border: "none", justifyContent: "center", gap: "8px" }}>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{ height: "38px", padding: "0 20px", border: "1px solid #E2E8F0", borderRadius: "9px", background: "#fff", fontSize: "13.5px", fontWeight: "500", color: "#475569", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ height: "38px", padding: "0 20px", border: "none", borderRadius: "9px", background: "#EF4444", fontSize: "13.5px", fontWeight: "500", color: "#fff", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.8 : 1, display: "flex", alignItems: "center", gap: "6px" }}
            >
              {deleting && <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />}
              Delete
            </button>
          </Modal.Footer>
        </Modal>

      </Container>
    </MainLayout>
  )
}

export default Departments