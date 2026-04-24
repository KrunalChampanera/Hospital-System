const db = require("../config/db")


db.query(`
  CREATE TABLE IF NOT EXISTS hospital_departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    department_id INT NOT NULL,
    description TEXT,
    no_of_doctors INT DEFAULT 0,
    no_of_beds INT DEFAULT 0,
    no_of_wards INT DEFAULT 0,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => { if (err) console.error("hospital_departments table error:", err.message) })

exports.getAdminDepartments = (req, res) => {
  const { hospital_id } = req.params
  db.query(
    `SELECT hd.*, d.name AS department_name
     FROM hospital_departments hd
     JOIN departments d ON d.id = hd.department_id
     WHERE hd.hospital_id = ?
     ORDER BY hd.id DESC`,
    [hospital_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch" })
      res.json({ success: true, data: result })
    }
  )
}

exports.createAdminDepartment = (req, res) => {
  const { hospital_id, department_id, description, no_of_doctors, no_of_beds, no_of_wards, status } = req.body
  if (!hospital_id || !department_id)
    return res.status(400).json({ success: false, message: "hospital_id and department_id are required" })

  db.query(
    "SELECT id FROM hospital_departments WHERE hospital_id=? AND department_id=?",
    [hospital_id, department_id],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" })
      if (rows.length) return res.status(400).json({ success: false, message: "Department already added" })

      db.query(
        "INSERT INTO hospital_departments (hospital_id, department_id, description, no_of_doctors, no_of_beds, no_of_wards, status) VALUES (?,?,?,?,?,?,?)",
        [hospital_id, department_id, description || null, no_of_doctors || 0, no_of_beds || 0, no_of_wards || 0, status || "Active"],
        (err, result) => {
          if (err) return res.status(500).json({ success: false, message: "Failed to create" })
          res.json({ success: true, message: "Department added", id: result.insertId })
        }
      )
    }
  )
}

exports.updateAdminDepartment = (req, res) => {
  const { id } = req.params
  const { description, no_of_doctors, no_of_beds, no_of_wards, status } = req.body
  db.query(
    "UPDATE hospital_departments SET description=?, no_of_doctors=?, no_of_beds=?, no_of_wards=?, status=? WHERE id=?",
    [description || null, no_of_doctors || 0, no_of_beds || 0, no_of_wards || 0, status || "Active", id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to update" })
      res.json({ success: true, message: "Department updated" })
    }
  )
}

exports.deleteAdminDepartment = (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM hospital_departments WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete" })
    res.json({ success: true, message: "Department deleted" })
  })
}

exports.toggleAdminDeptStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body
  db.query("UPDATE hospital_departments SET status=? WHERE id=?", [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update status" })
    res.json({ success: true, message: "Status updated" })
  })
}
