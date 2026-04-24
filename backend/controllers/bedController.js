const db = require("../config/db")

db.query(`
  CREATE TABLE IF NOT EXISTS beds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    ward VARCHAR(100),
    type ENUM('General','ICU','Private','Semi-Private','Emergency') DEFAULT 'General',
    status ENUM('Available','Occupied','Under Maintenance') DEFAULT 'Available',
    patient_name VARCHAR(150),
    admitted_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => { if (err) console.error("beds table error:", err.message) })

exports.getAll = (req, res) => {
  db.query("SELECT * FROM beds WHERE hospital_id = ? ORDER BY ward ASC, bed_number ASC", [req.params.hospital_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch beds" })
      res.json({ success: true, data: result })
    })
}

exports.create = (req, res) => {
  const { hospital_id, bed_number, ward, type, status, patient_name, admitted_date, notes } = req.body
  if (!hospital_id || !bed_number) return res.status(400).json({ success: false, message: "hospital_id and bed_number are required" })
  db.query(
    "INSERT INTO beds (hospital_id, bed_number, ward, type, status, patient_name, admitted_date, notes) VALUES (?,?,?,?,?,?,?,?)",
    [hospital_id, bed_number, ward || null, type || "General", status || "Available", patient_name || null, admitted_date || null, notes || null],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to add bed" })
      res.json({ success: true, message: "Bed added", id: result.insertId })
    })
}

exports.update = (req, res) => {
  const { bed_number, ward, type, status, patient_name, admitted_date, notes } = req.body
  db.query(
    "UPDATE beds SET bed_number=?, ward=?, type=?, status=?, patient_name=?, admitted_date=?, notes=? WHERE id=?",
    [bed_number, ward || null, type || "General", status || "Available", patient_name || null, admitted_date || null, notes || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to update bed" })
      res.json({ success: true, message: "Bed updated" })
    })
}

exports.remove = (req, res) => {
  db.query("DELETE FROM beds WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete bed" })
    res.json({ success: true, message: "Bed deleted" })
  })
}
