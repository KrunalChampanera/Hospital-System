const db = require("../config/db")


exports.createDepartment = (req, res) => {
  const { name, description, status } = req.body
  const image = req.file ? "/uploads/" + req.file.filename : null

  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required" })
  }

  db.query(
    "INSERT INTO departments (name, description, image, status) VALUES (?, ?, ?, ?)",
    [name, description || null, image, status || "Inactive"],
    (err, result) => {
      if (err) {
        console.error("createDepartment error:", err)
        return res.status(500).json({ success: false, message: "Failed to create department" })
      }

      res.json({
        success: true,
        message: "Department created successfully",
        id: result.insertId
      })
    }
  )
}


exports.getActiveDepartments = (req, res) => {
  db.query(
    "SELECT id, name FROM departments WHERE status = 'Active' ORDER BY name ASC",
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch departments" })
      res.json({ success: true, data: result })
    }
  )
}


exports.getDepartments = (req, res) => {
  db.query(
    `SELECT d.*, COUNT(doc.id) AS doctor_count
     FROM departments d
     LEFT JOIN doctors doc ON doc.department_id = d.id
     GROUP BY d.id
     ORDER BY d.id DESC`,
    (err, result) => {
      if (err) {
        console.error("getDepartments error:", err)
        return res.status(500).json({ success: false, message: "Failed to fetch departments" })
      }
      res.json({ success: true, data: result })
    }
  )
}


exports.updateDepartment = (req, res) => {
  const { id } = req.params
  const { name, description, status } = req.body
  const image = req.file ? "/uploads/" + req.file.filename : null

  db.query(
    "UPDATE departments SET name=?, description=?, image=COALESCE(?, image), status=? WHERE id=?",
    [name, description || null, image, status || "Inactive", id],
    (err) => {
      if (err) {
        console.error("updateDepartment error:", err)
        return res.status(500).json({ success: false, message: "Failed to update department" })
      }

      res.json({ success: true, message: "Department updated successfully" })
    }
  )
}


exports.deleteDepartment = (req, res) => {
  const { id } = req.params

  db.query(
    "DELETE FROM departments WHERE id=?",
    [id],
    (err) => {
      if (err) {
        console.error("deleteDepartment error:", err)
        return res.status(500).json({ success: false, message: "Failed to delete department" })
      }

      res.json({ success: true, message: "Department deleted successfully" })
    }
  )
}


exports.toggleStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body

  db.query(
    "UPDATE departments SET status=? WHERE id=?",
    [status, id],
    (err) => {
      if (err) {
        console.error("toggleStatus error:", err)
        return res.status(500).json({ success: false, message: "Failed to update status" })
      }

      res.json({ success: true, message: "Status updated" })
    }
  )
}