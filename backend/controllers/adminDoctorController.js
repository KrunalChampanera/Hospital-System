const db = require("../config/db")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

const doctorColumns = [
  { col: "photo", def: "VARCHAR(255)" },
  { col: "phone", def: "VARCHAR(20)" },
  { col: "dob", def: "DATE" },
  { col: "gender", def: "ENUM('Male','Female','Other')" },
  { col: "blood_group", def: "VARCHAR(5)" },
  { col: "years_of_experience", def: "INT DEFAULT 0" },
  { col: "designation_id", def: "INT" },
  { col: "medical_license_number", def: "VARCHAR(100)" },
  { col: "languages_spoken", def: "VARCHAR(255)" },
  { col: "bio", def: "TEXT" },
  { col: "address1", def: "VARCHAR(255)" },
  { col: "address2", def: "VARCHAR(255)" },
  { col: "city", def: "VARCHAR(100)" },
  { col: "pincode", def: "VARCHAR(20)" },
  { col: "country", def: "VARCHAR(100)" },
  { col: "online_consultation", def: "TINYINT(1) DEFAULT 0" },
  { col: "online_fee", def: "DECIMAL(10,2) DEFAULT 0" },
  { col: "offline_consultation", def: "TINYINT(1) DEFAULT 0" },
  { col: "offline_fee", def: "DECIMAL(10,2) DEFAULT 0" },
  { col: "education", def: "JSON" },
  { col: "status", def: "ENUM('Active','Inactive') DEFAULT 'Active'" },
  { col: "available", def: "TINYINT(1) DEFAULT 1" },
  { col: "password", def: "VARCHAR(255)" }
]

const runAlter = ({ col, def }) => new Promise((resolve) => {
  db.query(`SHOW COLUMNS FROM doctors LIKE '${col}'`, (err, rows) => {
    if (err || (rows && rows.length)) return resolve()
    db.query(`ALTER TABLE doctors ADD COLUMN ${col} ${def}`, (alterErr) => {
      if (alterErr) console.error(`doctors alter error (${col}):`, alterErr.message)
      resolve()
    })
  })
})

const ensureDoctorsTable = () => new Promise((resolve) => {
  db.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hospital_id INT NOT NULL,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error("doctors table error:", err.message)
    resolve()
  })
})

exports.runMigrations = () =>
  ensureDoctorsTable().then(() =>
    doctorColumns.reduce((p, col) => p.then(() => runAlter(col)), Promise.resolve())
  )

exports.getDoctors = (req, res) => {
  const { hospital_id } = req.params
  db.query(
    `SELECT d.*,
       dep.name AS department_name,
       des.name AS designation_name
     FROM doctors d
     LEFT JOIN departments dep ON dep.id = d.department_id
     LEFT JOIN designations des ON des.id = d.designation_id
     WHERE d.hospital_id = ?
     ORDER BY d.id DESC`,
    [hospital_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch doctors" })
      res.json({ success: true, data: result })
    }
  )
}

exports.getDoctorById = (req, res) => {
  const { id } = req.params
  db.query(
    `SELECT d.*, dep.name AS department_name, des.name AS designation_name
     FROM doctors d
     LEFT JOIN departments dep ON dep.id = d.department_id
     LEFT JOIN designations des ON des.id = d.designation_id
     WHERE d.id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch doctor" })
      if (!result.length) return res.status(404).json({ success: false, message: "Doctor not found" })
      res.json({ success: true, data: result[0] })
    }
  )
}

exports.createDoctor = (req, res) => {
  const {
    hospital_id, name, email, phone, dob, gender, blood_group,
    years_of_experience, department_id, designation_id, medical_license_number,
    languages_spoken, bio, address1, address2, city, pincode, country,
    online_consultation, online_fee, offline_consultation, offline_fee,
    education, status, available
  } = req.body

  if (!hospital_id || !name) return res.status(400).json({ success: false, message: "hospital_id and name are required" })

  const toBool = (val) => val === true || val === "true" || val === 1 || val === "1" ? 1 : 0
  const photo = req.file ? `/uploads/${req.file.filename}` : null
  const eduData = education ? (typeof education === "string" ? education : JSON.stringify(education)) : null

  db.query(
    `INSERT INTO doctors (hospital_id, photo, name, email, phone, dob, gender, blood_group,
      years_of_experience, department_id, designation_id, medical_license_number,
      languages_spoken, bio, address1, address2, city, pincode, country,
      online_consultation, online_fee, offline_consultation, offline_fee,
      education, status, available)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      hospital_id, photo, name, email || null, phone || null, dob || null,
      gender || null, blood_group || null, years_of_experience || 0,
      department_id || null, designation_id || null, medical_license_number || null,
      languages_spoken || null, bio || null, address1 || null, address2 || null,
      city || null, pincode || null, country || null,
      toBool(online_consultation), online_fee || 0,
      toBool(offline_consultation), offline_fee || 0,
      eduData, status || "Active", available !== undefined ? toBool(available) : 1
    ],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to create doctor" })

      const doctorId = result.insertId

      if (email) {
        const randomPassword = Math.floor(100000 + Math.random() * 900000).toString()
        const hashed = bcrypt.hashSync(randomPassword, 10)
        db.query("UPDATE doctors SET password=? WHERE id=?", [hashed, doctorId], () => {
          transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Doctor Account Credentials - Hospital Management System",
            html: `
              <h2>👨⚕️ Welcome, Dr. ${name}!</h2>
              <p>Your doctor account has been created.</p>
              <hr/>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> <span style="font-size:20px;font-weight:bold;color:#0066cc;letter-spacing:2px;">${randomPassword}</span></p>
              <hr/>
              <p>Please login and change your password from your profile settings.</p>
            `
          }, (mailErr) => {
            if (mailErr) console.error("Email error:", mailErr)
          })
        })
      }

      res.json({ success: true, message: email ? "Doctor created and credentials sent to email" : "Doctor created", id: doctorId })
    }
  )
}

exports.updateDoctor = (req, res) => {
  const { id } = req.params
  const {
    name, email, phone, dob, gender, blood_group,
    years_of_experience, department_id, designation_id, medical_license_number,
    languages_spoken, bio, address1, address2, city, pincode, country,
    online_consultation, online_fee, offline_consultation, offline_fee,
    education, status, available
  } = req.body

  const toBool = (val) => val === true || val === "true" || val === 1 || val === "1" ? 1 : 0
  const eduData = education ? (typeof education === "string" ? education : JSON.stringify(education)) : null

  const commonParams = [
    name, email || null, phone || null, dob || null,
    gender || null, blood_group || null, years_of_experience || 0,
    department_id || null, designation_id || null, medical_license_number || null,
    languages_spoken || null, bio || null, address1 || null, address2 || null,
    city || null, pincode || null, country || null,
    toBool(online_consultation), online_fee || 0,
    toBool(offline_consultation), offline_fee || 0,
    eduData, status || "Active", toBool(available !== undefined ? available : 1), id
  ]

  let query, params
  if (req.file) {
    const photo = `/uploads/${req.file.filename}`
    query = `UPDATE doctors SET photo=?, name=?, email=?, phone=?, dob=?, gender=?, blood_group=?,
      years_of_experience=?, department_id=?, designation_id=?, medical_license_number=?,
      languages_spoken=?, bio=?, address1=?, address2=?, city=?, pincode=?, country=?,
      online_consultation=?, online_fee=?, offline_consultation=?, offline_fee=?,
      education=?, status=?, available=? WHERE id=?`
    params = [photo, ...commonParams]
  } else {
    query = `UPDATE doctors SET name=?, email=?, phone=?, dob=?, gender=?, blood_group=?,
      years_of_experience=?, department_id=?, designation_id=?, medical_license_number=?,
      languages_spoken=?, bio=?, address1=?, address2=?, city=?, pincode=?, country=?,
      online_consultation=?, online_fee=?, offline_consultation=?, offline_fee=?,
      education=?, status=?, available=? WHERE id=?`
    params = commonParams
  }

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update doctor" })
    res.json({ success: true, message: "Doctor updated" })
  })
}

exports.deleteDoctor = (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM doctors WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete doctor" })
    res.json({ success: true, message: "Doctor deleted" })
  })
}

exports.toggleDoctorStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body
  if (!status) return res.status(400).json({ success: false, message: "Status is required" })
  db.query("UPDATE doctors SET status=? WHERE id=?", [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update status" })
    res.json({ success: true, message: "Status updated" })
  })
}

exports.sendDoctorCredentials = (req, res) => {
  const { id } = req.params
  db.query("SELECT * FROM doctors WHERE id=?", [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })
    if (!rows.length) return res.status(404).json({ success: false, message: "Doctor not found" })
    const doctor = rows[0]
    if (!doctor.email) return res.status(400).json({ success: false, message: "Doctor has no email" })

    const randomPassword = Math.floor(100000 + Math.random() * 900000).toString()
    const hashed = bcrypt.hashSync(randomPassword, 10)

    db.query("UPDATE doctors SET password=? WHERE id=?", [hashed, id], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, message: "Failed to set password" })

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: doctor.email,
        subject: "Your Doctor Account Credentials - Hospital Management System",
        html: `
          <h2>👨⚕️ Welcome, Dr. ${doctor.name}!</h2>
          <p>Your login credentials:</p>
          <hr/>
          <p><strong>Email:</strong> ${doctor.email}</p>
          <p><strong>Password:</strong> <span style="font-size:20px;font-weight:bold;color:#0066cc;letter-spacing:2px;">${randomPassword}</span></p>
          <hr/>
          <p>Please login and change your password from your profile settings.</p>
        `
      }, (mailErr) => {
        if (mailErr) console.error("Email error:", mailErr)
      })

      res.json({ success: true, message: "Credentials sent to doctor email" })
    })
  })
}
