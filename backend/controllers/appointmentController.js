const db = require("../config/db")

db.query(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    doctor_id INT NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(20),
    patient_age INT,
    patient_gender ENUM('Male','Female','Other'),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type ENUM('Online','Offline') DEFAULT 'Offline',
    status ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => { if (err) console.error("appointments table error:", err.message) })

exports.getByHospital = (req, res) => {
  const { hospital_id } = req.params
  db.query(
    `SELECT a.*, d.name AS doctor_name, d.photo AS doctor_photo
     FROM appointments a
     LEFT JOIN doctors d ON d.id = a.doctor_id
     WHERE a.hospital_id = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    [hospital_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch appointments" })
      res.json({ success: true, data: result })
    }
  )
}

exports.getByDoctor = (req, res) => {
  const { doctor_id } = req.params
  db.query(
    `SELECT * FROM appointments WHERE doctor_id = ? ORDER BY appointment_date DESC, appointment_time DESC`,
    [doctor_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch appointments" })
      res.json({ success: true, data: result })
    }
  )
}

exports.create = (req, res) => {
  const { hospital_id, doctor_id, patient_name, patient_phone, patient_age, patient_gender, appointment_date, appointment_time, type, notes } = req.body
  if (!hospital_id || !doctor_id || !patient_name || !appointment_date || !appointment_time)
    return res.status(400).json({ success: false, message: "hospital_id, doctor_id, patient_name, date and time are required" })
  db.query(
    `INSERT INTO appointments (hospital_id, doctor_id, patient_name, patient_phone, patient_age, patient_gender, appointment_date, appointment_time, type, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [hospital_id, doctor_id, patient_name, patient_phone || null, patient_age || null, patient_gender || null, appointment_date, appointment_time, type || "Offline", notes || null],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to create appointment" })
      res.json({ success: true, message: "Appointment created", id: result.insertId })
    }
  )
}

exports.update = (req, res) => {
  const { id } = req.params
  const { patient_name, patient_phone, patient_age, patient_gender, appointment_date, appointment_time, type, status, notes } = req.body
  db.query(
    `UPDATE appointments SET patient_name=?, patient_phone=?, patient_age=?, patient_gender=?, appointment_date=?, appointment_time=?, type=?, status=?, notes=? WHERE id=?`,
    [patient_name, patient_phone || null, patient_age || null, patient_gender || null, appointment_date, appointment_time, type || "Offline", status || "Pending", notes || null, id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to update appointment" })
      res.json({ success: true, message: "Appointment updated" })
    }
  )
}

exports.updateStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body
  db.query("UPDATE appointments SET status=? WHERE id=?", [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update status" })
    res.json({ success: true, message: "Status updated" })
  })
}

exports.remove = (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM appointments WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete appointment" })
    res.json({ success: true, message: "Appointment deleted" })
  })
}
