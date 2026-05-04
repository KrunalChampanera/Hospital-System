const db = require("../config/db")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

const DESIGNATION_ROLES = {
  "nurse": "Nurse",
  "receptionist": "Receptionist",
  "pharmacist": "Pharmacist",
  "lab incharge": "Lab Incharge"
}

const getRoleFromDesignation = (designationName) => {
  if (!designationName) return null
  return DESIGNATION_ROLES[designationName.toLowerCase()] || designationName
}

const getEmploymentType = (shiftStart, shiftEnd) => {
  if (!shiftStart || !shiftEnd) return null
  const [sh, sm] = shiftStart.split(":").map(Number)
  const [eh, em] = shiftEnd.split(":").map(Number)
  const hours = (eh * 60 + em - (sh * 60 + sm)) / 60
  return hours >= 6 ? "Full Time" : "Part Time"
}

exports.ensureStaffTable = () => new Promise((resolve) => {
  db.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hospital_id INT NOT NULL,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(20),
      department_id INT,
      designation_id INT,
      role VARCHAR(100),
      status ENUM('Active','Inactive') DEFAULT 'Active',
      password VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error("staff table error:", err.message)

    const alterations = [
      "ALTER TABLE staff ADD COLUMN dob DATE",
      "ALTER TABLE staff ADD COLUMN gender ENUM('Male','Female','Other')",
      "ALTER TABLE staff ADD COLUMN blood_group VARCHAR(5)",
      "ALTER TABLE staff ADD COLUMN address TEXT",
      "ALTER TABLE staff ADD COLUMN city VARCHAR(100)",
      "ALTER TABLE staff ADD COLUMN state VARCHAR(100)",
      "ALTER TABLE staff ADD COLUMN country VARCHAR(100)",
      "ALTER TABLE staff ADD COLUMN pincode VARCHAR(10)",
      "ALTER TABLE staff ADD COLUMN profile_image VARCHAR(255)",
      "ALTER TABLE staff ADD COLUMN shift_start TIME",
      "ALTER TABLE staff ADD COLUMN shift_end TIME",
      "ALTER TABLE staff ADD COLUMN employment_type ENUM('Full Time','Part Time')",
      "ALTER TABLE staff ADD COLUMN reset_token VARCHAR(255)",
      "ALTER TABLE staff ADD COLUMN reset_token_expiry BIGINT"
    ]

    let pending = alterations.length
    const done = () => { if (--pending === 0) resolve() }
    // ignore duplicate column errors (1060) — means column already exists
    alterations.forEach(sql => db.query(sql, (e) => {
      if (e && e.errno !== 1060) console.error("Migration error:", e.message)
      done()
    }))
  })
})

exports.getStaff = (req, res) => {
  const { hospital_id } = req.params
  db.query(
    `SELECT s.*, dep.name AS department_name, des.name AS designation_name
     FROM staff s
     LEFT JOIN departments dep ON dep.id = s.department_id
     LEFT JOIN designations des ON des.id = s.designation_id
     WHERE s.hospital_id = ? ORDER BY s.id DESC`,
    [hospital_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch staff" })
      res.json({ success: true, data: result })
    }
  )
}

exports.getStaffById = (req, res) => {
  const { id } = req.params
  db.query(
    `SELECT s.*, dep.name AS department_name, des.name AS designation_name
     FROM staff s
     LEFT JOIN departments dep ON dep.id = s.department_id
     LEFT JOIN designations des ON des.id = s.designation_id
     WHERE s.id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch staff" })
      if (!result.length) return res.status(404).json({ success: false, message: "Staff not found" })
      res.json({ success: true, data: result[0] })
    }
  )
}

exports.createStaff = (req, res) => {
  const {
    hospital_id, name, email, phone, department_id, designation_id, status,
    dob, gender, blood_group, address, city, state, country, pincode,
    shift_start, shift_end
  } = req.body

  if (!hospital_id || !name) return res.status(400).json({ success: false, message: "hospital_id and name are required" })

  const employment_type = getEmploymentType(shift_start, shift_end)
  const randomPassword = Math.floor(100000 + Math.random() * 900000).toString()
  const hashed = bcrypt.hashSync(randomPassword, 10)

  // get designation name to auto-set role
  const resolveRole = (cb) => {
    if (!designation_id) return cb(null)
    db.query("SELECT name FROM designations WHERE id=?", [designation_id], (err, rows) => {
      cb(rows && rows.length ? getRoleFromDesignation(rows[0].name) : null)
    })
  }

  resolveRole((role) => {
    db.query(
      `INSERT INTO staff (hospital_id, name, email, phone, department_id, designation_id, role, status, password,
        dob, gender, blood_group, address, city, state, country, pincode, shift_start, shift_end, employment_type)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        hospital_id, name, email || null, phone || null,
        department_id || null, designation_id || null, role, status || "Active", hashed,
        dob || null, gender || null, blood_group || null, address || null,
        city || null, state || null, country || null, pincode || null,
        shift_start || null, shift_end || null, employment_type
      ],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to create staff" })

        if (email) {
          transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Staff Account Credentials - Hospital Management System",
            html: `
              <h2>👋 Welcome, ${name}!</h2>
              <p>Your staff account has been created.</p>
              <hr/>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> <span style="font-size:20px;font-weight:bold;color:#0066cc;letter-spacing:2px;">${randomPassword}</span></p>
              <hr/>
              <p>Please login and update your profile.</p>
            `
          }, (mailErr) => { if (mailErr) console.error("Email error:", mailErr) })
        }

        res.json({ success: true, message: "Staff created", id: result.insertId, password: randomPassword })
      }
    )
  })
}

exports.uploadStaffImage = (req, res) => {
  const { id } = req.params
  if (!req.file) return res.status(400).json({ success: false, message: "No image uploaded" })
  db.query("UPDATE staff SET profile_image=? WHERE id=?", [req.file.filename, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update image" })
    res.json({ success: true, filename: req.file.filename })
  })
}

exports.deleteStaff = (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM staff WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete staff" })
    res.json({ success: true, message: "Staff deleted" })
  })
}

exports.toggleStaffStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body
  if (!status) return res.status(400).json({ success: false, message: "Status is required" })
  db.query("UPDATE staff SET status=? WHERE id=?", [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update status" })
    res.json({ success: true, message: "Status updated" })
  })
}

exports.updateStaffProfile = (req, res) => {
  const { id } = req.params
  const { phone, dob, gender, blood_group, address, city, state, country, pincode, shift_start, shift_end } = req.body
  const employment_type = getEmploymentType(shift_start, shift_end)
  db.query(
    `UPDATE staff SET phone=?, dob=?, gender=?, blood_group=?, address=?, city=?, state=?, country=?, pincode=?,
     shift_start=?, shift_end=?, employment_type=? WHERE id=?`,
    [phone || null, dob || null, gender || null, blood_group || null, address || null,
     city || null, state || null, country || null, pincode || null,
     shift_start || null, shift_end || null, employment_type, id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to update profile" })
      res.json({ success: true, message: "Profile updated" })
    }
  )
}

exports.changeStaffPassword = (req, res) => {
  const { staffId, currentPassword, newPassword } = req.body
  if (!staffId || !currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: "Missing required fields" })
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" })

  db.query("SELECT password FROM staff WHERE id=?", [staffId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })
    if (!rows.length) return res.status(404).json({ success: false, message: "Staff not found" })
    const isMatch = bcrypt.compareSync(currentPassword, rows[0].password)
    if (!isMatch) return res.status(401).json({ success: false, message: "Current password is incorrect" })
    const hashed = bcrypt.hashSync(newPassword, 10)
    db.query("UPDATE staff SET password=? WHERE id=?", [hashed, staffId], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: "Failed to update password" })
      res.json({ success: true, message: "Password changed successfully" })
    })
  })
}

exports.forgotPassword = (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ success: false, message: "Email is required" })

  db.query("SELECT id, name FROM staff WHERE email=? AND status='Active'", [email.trim().toLowerCase()], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })
    if (!rows.length) return res.status(404).json({ success: false, message: "No active staff account found with this email" })

    const token = crypto.randomBytes(32).toString("hex")
    const expiry = Date.now() + 3600000 // 1 hour

    db.query("UPDATE staff SET reset_token=?, reset_token_expiry=? WHERE id=?", [token, expiry, rows[0].id], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: "Database error" })

      const resetLink = `http://localhost:5173/reset-password?token=${token}&role=staff`
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html: `
          <h2>Password Reset</h2>
          <p>Hi ${rows[0].name}, click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="background:#1a56db;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
          <p>If you didn't request this, ignore this email.</p>
        `
      }, (mailErr) => {
        if (mailErr) return res.status(500).json({ success: false, message: "Failed to send email" })
        res.json({ success: true, message: "Password reset link sent to your email" })
      })
    })
  })
}

exports.resetPassword = (req, res) => {
  const { token, newPassword } = req.body
  if (!token || !newPassword) return res.status(400).json({ success: false, message: "Missing required fields" })
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" })

  db.query("SELECT id FROM staff WHERE reset_token=? AND reset_token_expiry > ?", [token, Date.now()], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })
    if (!rows.length) return res.status(400).json({ success: false, message: "Invalid or expired reset link" })

    const hashed = bcrypt.hashSync(newPassword, 10)
    db.query("UPDATE staff SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE id=?", [hashed, rows[0].id], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: "Failed to reset password" })
      res.json({ success: true, message: "Password reset successfully. You can now login." })
    })
  })
}
