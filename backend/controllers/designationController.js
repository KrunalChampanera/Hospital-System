const db = require("../config/db")

const DEFAULT_DESIGNATIONS = [
  "Doctor", "Senior Doctor", "Consultant", "Resident Doctor", "Intern Doctor",
  "Nurse", "Senior Nurse", "Head Nurse", "Nursing Assistant",
  "Receptionist", "Front Desk Executive",
  "Pharmacist", "Senior Pharmacist",
  "Lab Incharge", "Lab Technician", "Lab Assistant",
  "Radiologist", "X-Ray Technician", "MRI Technician",
  "Physiotherapist", "Occupational Therapist",
  "Medical Records Officer", "Data Entry Operator",
  "Hospital Administrator", "HR Manager", "Accounts Officer",
  "Ambulance Driver", "Ward Boy", "Housekeeping Staff", "Security Guard",
  "Dietitian", "Nutritionist", "Counselor", "Social Worker"
]

exports.seedDesignations = () => new Promise((resolve) => {
  db.query("SELECT name FROM designations", (err, rows) => {
    if (err) return resolve()
    const existing = new Set(rows.map(r => r.name.toLowerCase()))
    const toInsert = DEFAULT_DESIGNATIONS.filter(n => !existing.has(n.toLowerCase()))
    if (!toInsert.length) return resolve()
    const values = toInsert.map(name => [name, "Active"])
    db.query("INSERT INTO designations (name, status) VALUES ?", [values], (e) => {
      if (e) console.error("Designation seed error:", e.message)
      else console.log(`Seeded ${toInsert.length} designations`)
      resolve()
    })
  })
})

exports.createDesignation = (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ success: false, message: "Name is required" })

  db.query(
    "INSERT INTO designations (name, status) VALUES (?, 'Inactive')",
    [name],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to create designation" })
      res.json({ success: true, message: "Designation created successfully", id: result.insertId })
    }
  )
}

exports.getDesignations = (req, res) => {
  db.query("SELECT * FROM designations ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch designations" })
    res.json({ success: true, data: result })
  })
}

exports.updateDesignation = (req, res) => {
  const { id } = req.params
  const { name, status } = req.body

  db.query(
    "UPDATE designations SET name=?, status=? WHERE id=?",
    [name, status || "Inactive", id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to update designation" })
      res.json({ success: true, message: "Designation updated successfully" })
    }
  )
}

exports.deleteDesignation = (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM designations WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete designation" })
    res.json({ success: true, message: "Designation deleted successfully" })
  })
}

exports.toggleStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body
  db.query("UPDATE designations SET status=? WHERE id=?", [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update status" })
    res.json({ success: true, message: "Status updated" })
  })
}
