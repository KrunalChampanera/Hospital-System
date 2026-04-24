const db = require("../config/db")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

db.query(`
  CREATE TABLE IF NOT EXISTS admin_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('pending', 'approved', 'declined') DEFAULT 'pending',
    declined_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error("Table creation error:", err.message)
})

exports.submitRegistration = (req, res) => {
  const { full_name, email, phone } = req.body
  if (!full_name || !email || !phone)
    return res.status(400).json({ success: false, message: "All fields are required" })

  db.query(
    "SELECT * FROM admin_registrations WHERE email = ? ORDER BY created_at DESC LIMIT 1",
    [email.trim().toLowerCase()],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" })

      if (results.length > 0) {
        const last = results[0]
        if (last.status === "pending")
          return res.status(400).json({ success: false, message: "Your registration is already pending approval." })
        if (last.status === "approved")
          return res.status(400).json({ success: false, message: "This email is already approved." })
        if (last.status === "declined" && last.declined_at) {
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
          if (new Date(last.declined_at) > hourAgo) {
            const retryAt = new Date(new Date(last.declined_at).getTime() + 60 * 60 * 1000)
            return res.status(400).json({
              success: false,
              message: `Registration declined. You can try again after ${retryAt.toLocaleTimeString()}.`
            })
          }
        }
      }

      db.query(
        "INSERT INTO admin_registrations (full_name, email, phone) VALUES (?, ?, ?)",
        [full_name, email, phone],
        (insertErr) => {
          if (insertErr) return res.status(500).json({ success: false, message: "Failed to submit registration" })
          res.json({ success: true, message: "Registration submitted successfully. Please wait for super admin approval." })
        }
      )
    }
  )
}

exports.getAllRegistrations = (req, res) => {
  db.query("SELECT * FROM admin_registrations ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })
    res.json({ success: true, data: results })
  })
}

exports.approveRegistration = (req, res) => {
  const { id } = req.params

  db.query("SELECT * FROM admin_registrations WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })
    if (!results.length) return res.status(404).json({ success: false, message: "Registration not found" })

    const reg = results[0]
    if (reg.status !== "pending")
      return res.status(400).json({ success: false, message: "Registration is not pending" })

    const randomPassword = Math.floor(100000 + Math.random() * 900000).toString()
    const hashed = bcrypt.hashSync(randomPassword, 10)

    db.query(
      "INSERT INTO hospital_admins (name, email, password, status) VALUES (?, ?, ?, 'Active')",
      [reg.full_name, reg.email, hashed],
      (insertErr) => {
        if (insertErr) return res.status(500).json({ success: false, message: "Failed to create admin account" })

        db.query(
          "UPDATE admin_registrations SET status = 'approved' WHERE id = ?",
          [id],
          (updateErr) => {
            if (updateErr) return res.status(500).json({ success: false, message: "Failed to update status" })

            transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: reg.email,
              subject: "Admin Registration Approved - Hospital Management System",
              html: `
                <h2>🎉 Registration Approved!</h2>
                <p>Dear ${reg.full_name},</p>
                <p>Your admin registration has been <strong style="color:green;">approved</strong>.</p>
                <hr/>
                <p><strong>Email:</strong> ${reg.email}</p>
                <p><strong>Password:</strong> <span style="font-size:20px;font-weight:bold;color:#0066cc;letter-spacing:2px;">${randomPassword}</span></p>
                <hr/>
                <p>Please login and change your password from your profile settings.</p>
              `
            }, (mailErr) => {
              if (mailErr) console.error("Email error:", mailErr)
            })

            res.json({ success: true, message: "Registration approved and credentials sent to admin email." })
          }
        )
      }
    )
  })
}

exports.declineRegistration = (req, res) => {
  const { id } = req.params

  db.query("SELECT * FROM admin_registrations WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })
    if (!results.length) return res.status(404).json({ success: false, message: "Registration not found" })

    const reg = results[0]
    if (reg.status !== "pending")
      return res.status(400).json({ success: false, message: "Registration is not pending" })

    db.query(
      "UPDATE admin_registrations SET status = 'declined', declined_at = NOW() WHERE id = ?",
      [id],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, message: "Failed to update status" })

        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: reg.email,
          subject: "Admin Registration Declined - Hospital Management System",
          html: `
            <h2>❌ Registration Declined</h2>
            <p>Dear ${reg.full_name},</p>
            <p>Your admin registration has been <strong style="color:red;">declined</strong>.</p>
            <p>You can try submitting a new request after <strong>1 hour</strong>.</p>
          `
        }, (mailErr) => {
          if (mailErr) console.error("Email error:", mailErr)
        })

        res.json({ success: true, message: "Registration declined and email sent." })
      }
    )
  })
}
