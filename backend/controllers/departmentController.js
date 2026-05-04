const db = require("../config/db")

const DEFAULT_DEPARTMENTS = [
  "Emergency & Trauma", "Outpatient Department (OPD)", "Inpatient Department (IPD)",
  "Intensive Care Unit (ICU)", "Neonatal ICU (NICU)", "Pediatric ICU (PICU)",
  "Cardiology", "Cardiac Surgery", "Neurology", "Neurosurgery",
  "Orthopedics", "General Surgery", "Plastic & Reconstructive Surgery",
  "Obstetrics & Gynecology", "Pediatrics", "Neonatology",
  "Oncology", "Radiation Oncology", "Hematology",
  "Gastroenterology", "Hepatology", "Nephrology", "Urology",
  "Pulmonology", "Endocrinology", "Rheumatology", "Dermatology",
  "Ophthalmology", "ENT (Ear, Nose & Throat)", "Dentistry",
  "Psychiatry & Mental Health", "Physiotherapy & Rehabilitation",
  "Radiology & Imaging", "Pathology & Laboratory", "Blood Bank",
  "Pharmacy", "Anesthesiology", "Operation Theatre",
  "Dietetics & Nutrition", "Medical Records", "Administration & HR"
]

exports.seedDepartments = () => new Promise((resolve) => {
  db.query("SELECT name FROM departments", (err, rows) => {
    if (err) return resolve()
    const existing = new Set(rows.map(r => r.name.toLowerCase()))
    const toInsert = DEFAULT_DEPARTMENTS.filter(n => !existing.has(n.toLowerCase()))
    const done = () => db.query("UPDATE departments SET status = 'Active'", () => resolve())
    if (!toInsert.length) return done()
    const values = toInsert.map(name => [name, null, null, "Active"])
    db.query("INSERT INTO departments (name, description, image, status) VALUES ?", [values], (e) => {
      if (e) console.error("Department seed error:", e.message)
      else console.log(`Seeded ${toInsert.length} departments`)
      done()
    })
  })
})

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