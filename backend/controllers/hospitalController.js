const db = require("../config/db")
const nodemailer = require("nodemailer")

require("dotenv").config()

const alterQueries = [
  "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS facilities TEXT",
  "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS activities TEXT",
  "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS opening_time VARCHAR(10)",
  "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS closing_time VARCHAR(10)",
  "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS weekend_open TINYINT(1) DEFAULT 0",
  "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS weekend_opening_time VARCHAR(10)",
  "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS weekend_closing_time VARCHAR(10)",
  "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS logo VARCHAR(255)"
]
alterQueries.forEach(q => db.query(q, (err) => { if (err) console.error("Alter error:", err.message) }))

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

exports.createHospital = (req, res) => {
  const { clinic_name, address, city, state, country, pincode, admin_name, admin_email } = req.body
  if (!clinic_name || !admin_email) return res.status(400).json({ success: false, message: "Hospital name and admin email are required" })

  const randomPassword = Math.floor(100000 + Math.random() * 900000).toString()

  db.query(
    "CALL create_hospital_admin(?,?,?,?,?,?,?,?,?)",
    [clinic_name, address, city, state, country, pincode, admin_name, admin_email, randomPassword],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to create hospital" })

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: admin_email,
        subject: "Hospital Admin Login Credentials",
        html: `
          <h2>Welcome to Hospital Management System</h2>
          <p>Your hospital admin account has been created.</p>
          <p><strong>Login Email:</strong> ${admin_email}</p>
          <p><strong>Temporary Password:</strong>
            <span style="font-size:20px;font-weight:bold;color:#0066cc;letter-spacing:2px;">${randomPassword}</span>
          </p>
          <hr/>
          <p>Please login and change your password from your profile settings.</p>
        `
      }, (mailErr) => {
        if (mailErr) console.error("Email sending error:", mailErr)
      })

      res.json({ success: true, message: "Hospital & Admin created", password: randomPassword })
    }
  )
}

exports.getHospitals = (req, res) => {
  db.query(
    `SELECT h.id, h.clinic_name, h.address, h.city, h.state, h.country,
      h.pincode, h.status, h.created_at,
      ha.name AS admin_name, ha.email AS admin_email, ha.status AS admin_status
    FROM hospitals h
    LEFT JOIN hospital_admins ha ON h.id = ha.hospital_id
    ORDER BY h.id DESC`,
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch hospitals" })
      res.json({ success: true, data: result })
    }
  )
}

exports.getHospitalById = (req, res) => {
  const { id } = req.params
  db.query(
    `SELECT h.id, h.clinic_name, h.address, h.city, h.state, h.country,
      h.pincode, h.status,
      ha.name AS admin_name, ha.email AS admin_email, ha.status AS admin_status
    FROM hospitals h
    LEFT JOIN hospital_admins ha ON h.id = ha.hospital_id
    WHERE h.id = ? LIMIT 1`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch hospital" })
      if (!result.length) return res.status(404).json({ success: false, message: "Hospital not found" })
      res.json({ success: true, data: result[0] })
    }
  )
}

exports.updateHospital = (req, res) => {
  const { id } = req.params
  const { clinic_name, address, city, state, country, pincode, admin_name, admin_email } = req.body

  db.query(
    "UPDATE hospitals SET clinic_name=?, address=?, city=?, state=?, country=?, pincode=? WHERE id=?",
    [clinic_name, address, city, state, country, pincode, id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Unable to update hospital" })

      db.query(
        "UPDATE hospital_admins SET name=?, email=? WHERE hospital_id=?",
        [admin_name, admin_email, id],
        (adminErr, adminResult) => {
          if (adminErr) return res.status(500).json({ success: false, message: "Unable to update hospital admin" })

          if (adminResult.affectedRows === 0) {
            db.query(
              "INSERT INTO hospital_admins (hospital_id, name, email, status) VALUES (?, ?, ?, 'Active')",
              [id, admin_name, admin_email],
              (insertErr) => {
                if (insertErr) return res.status(500).json({ success: false, message: "Unable to insert admin" })
                res.json({ success: true, message: "Hospital updated successfully" })
              }
            )
          } else {
            res.json({ success: true, message: "Hospital updated successfully" })
          }
        }
      )
    }
  )
}

exports.deleteHospital = (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM hospitals WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Unable to delete hospital" })
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Hospital not found" })
    res.json({ success: true, message: "Hospital deleted successfully" })
  })
}

exports.getHospitalByAdminId = (req, res) => {
  const { adminId } = req.params
  db.query(
    `SELECT h.* FROM hospitals h
     INNER JOIN hospital_admins ha ON h.id = ha.hospital_id
     WHERE ha.id = ? LIMIT 1`,
    [adminId],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" })
      if (!result.length) return res.status(404).json({ success: false, message: "Hospital not found" })
      res.json({ success: true, data: result[0] })
    }
  )
}

exports.updateHospitalDetails = (req, res) => {
  const { id } = req.params
  const { facilities, activities, opening_time, closing_time, weekend_open, weekend_opening_time, weekend_closing_time } = req.body
  const logo = req.file ? "/uploads/" + req.file.filename : null

  let query = `UPDATE hospitals SET facilities=?, activities=?, opening_time=?, closing_time=?, weekend_open=?, weekend_opening_time=?, weekend_closing_time=?`
  const params = [facilities || null, activities || null, opening_time || null, closing_time || null, weekend_open ? 1 : 0, weekend_opening_time || null, weekend_closing_time || null]

  if (logo) { query += `, logo=?`; params.push(logo) }
  query += ` WHERE id=?`
  params.push(id)

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update" })
    res.json({ success: true, message: "Hospital details updated successfully" })
  })
}

exports.updateFacilities = (req, res) => {
  const { id } = req.params
  const facilitiesValue = req.body.facilities !== undefined ? req.body.facilities : ""
  db.query("CALL update_hospital_facilities(?, ?)", [id, facilitiesValue], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update facilities" })
    res.json({ success: true, message: "Facilities updated successfully" })
  })
}

exports.updateActivities = (req, res) => {
  const { id } = req.params
  const activitiesValue = req.body.activities !== undefined ? req.body.activities : ""
  db.query("CALL update_hospital_activities(?, ?)", [id, activitiesValue], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update activities" })
    res.json({ success: true, message: "Activities updated successfully" })
  })
}

exports.getPublicHospitals = (req, res) => {
  db.query(
    `SELECT id, clinic_name, address, city, state, logo, opening_time, closing_time, weekend_open, weekend_opening_time, weekend_closing_time
     FROM hospitals WHERE status = 'Active' ORDER BY clinic_name ASC`,
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch hospitals" })
      res.json({ success: true, data: result })
    }
  )
}

exports.getPublicDoctors = (req, res) => {
  const { id } = req.params
  db.query(
    `SELECT d.id, d.name, d.photo, d.years_of_experience, d.online_consultation, d.online_fee,
       d.offline_consultation, d.offline_fee, d.bio,
       dep.name AS department_name, des.name AS designation_name
     FROM doctors d
     LEFT JOIN hospital_departments hd ON hd.id = d.department_id
     LEFT JOIN departments dep ON dep.id = hd.department_id
     LEFT JOIN designations des ON des.id = d.designation_id
     WHERE d.hospital_id = ? AND d.status = 'Active' AND d.available = 1
     ORDER BY d.name ASC`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch doctors" })
      res.json({ success: true, data: result })
    }
  )
}

exports.updateHours = (req, res) => {
  const { id } = req.params
  const { opening_time, closing_time, weekend_open, weekend_opening_time, weekend_closing_time } = req.body
  db.query(
    "CALL update_hospital_hours(?, ?, ?, ?, ?, ?)",
    [id, opening_time || "", closing_time || "", weekend_open ? 1 : 0, weekend_opening_time || "", weekend_closing_time || ""],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to update hours" })
      res.json({ success: true, message: "Hours updated successfully" })
    }
  )
}
