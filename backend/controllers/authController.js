const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("../config/db")

require("dotenv").config()

exports.login = (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required" })

  const normalizedEmail = email.trim().toLowerCase()

  if (
    normalizedEmail === process.env.SUPER_ADMIN_EMAIL.toLowerCase() &&
    password === process.env.SUPER_ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ id: 1, role: "super_admin", email: normalizedEmail }, process.env.JWT_SECRET, { expiresIn: "8h" })
    return res.json({
      success: true, token, role: "super_admin",
      user: { id: 1, email: normalizedEmail, name: "Super Admin", role: "super_admin" }
    })
  }

  db.query("SELECT id, hospital_id, name, email, password, status FROM hospital_admins WHERE email = ?", [normalizedEmail], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })

    if (!results.length) {
      return db.query("SELECT id, hospital_id, name, email, password, status FROM doctors WHERE email = ?", [normalizedEmail], (err2, docResults) => {
        if (err2) return res.status(500).json({ success: false, message: "Database error" })
        if (!docResults.length) return res.status(401).json({ success: false, message: "Invalid credentials" })

        const doctor = docResults[0]
        if (doctor.status !== "Active") return res.status(401).json({ success: false, message: "Account is inactive" })
        if (!doctor.password) return res.status(401).json({ success: false, message: "No password set. Contact your admin." })

        const isMatch = doctor.password.startsWith("$2")
          ? bcrypt.compareSync(password, doctor.password)
          : doctor.password === password
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" })

        const token = jwt.sign({ id: doctor.id, role: "doctor", hospital_id: doctor.hospital_id }, process.env.JWT_SECRET, { expiresIn: "8h" })
        return res.json({
          success: true, token, role: "doctor",
          user: { id: doctor.id, hospital_id: doctor.hospital_id, email: doctor.email, name: doctor.name, role: "doctor" }
        })
      })
    }

    const admin = results[0]
    if (admin.status !== "Active") return res.status(401).json({ success: false, message: "Account is inactive" })

    const isMatch = admin.password.startsWith("$2")
      ? bcrypt.compareSync(password, admin.password)
      : admin.password === password

    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" })

    if (!admin.password.startsWith("$2")) {
      const hashed = bcrypt.hashSync(password, 10)
      db.query("UPDATE hospital_admins SET password = ? WHERE id = ?", [hashed, admin.id])
    }

    db.query("UPDATE hospital_admins SET login_count = IFNULL(login_count, 0) + 1, last_login = NOW() WHERE id = ?", [admin.id])

    const token = jwt.sign({ id: admin.id, role: "admin", hospital_id: admin.hospital_id }, process.env.JWT_SECRET, { expiresIn: "8h" })
    res.json({
      success: true, token, role: "admin",
      user: { id: admin.id, hospital_id: admin.hospital_id, email: admin.email, name: admin.name, role: "admin" }
    })
  })
}

exports.getProfile = (req, res) => {
  db.query(
    "SELECT id, hospital_id, name, email, status, login_count, last_login FROM hospital_admins WHERE id = ?",
    [req.params.adminId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" })
      if (!results.length) return res.status(404).json({ success: false, message: "Admin not found" })
      res.json({ success: true, admin: results[0] })
    }
  )
}

exports.updateProfile = (req, res) => {
  const { adminId } = req.params
  const { name, email } = req.body
  if (!name || !email) return res.status(400).json({ success: false, message: "Name and email are required" })
  db.query("UPDATE hospital_admins SET name=?, email=? WHERE id=?", [name.trim(), email.trim().toLowerCase(), adminId], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update profile" })
    res.json({ success: true, message: "Profile updated successfully" })
  })
}

exports.changePassword = (req, res) => {
  const { adminId, currentPassword, newPassword } = req.body
  if (!adminId || !currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: "Missing required fields" })
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" })

  db.query("SELECT password FROM hospital_admins WHERE id = ?", [adminId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })
    if (!results.length) return res.status(404).json({ success: false, message: "Admin not found" })

    const admin = results[0]
    const isMatch = admin.password.startsWith("$2")
      ? bcrypt.compareSync(currentPassword, admin.password)
      : admin.password === currentPassword

    if (!isMatch) return res.status(401).json({ success: false, message: "Current password is incorrect" })

    const hashed = bcrypt.hashSync(newPassword, 10)
    db.query("UPDATE hospital_admins SET password = ? WHERE id = ?", [hashed, adminId], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, message: "Failed to update password" })
      res.json({ success: true, message: "Password changed successfully" })
    })
  })
}

exports.changeDoctorPassword = (req, res) => {
  const { doctorId, currentPassword, newPassword } = req.body
  if (!doctorId || !currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: "Missing required fields" })
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" })

  db.query("SELECT password FROM doctors WHERE id = ?", [doctorId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" })
    if (!results.length) return res.status(404).json({ success: false, message: "Doctor not found" })

    const doctor = results[0]
    if (!doctor.password) return res.status(400).json({ success: false, message: "No password set" })

    const isMatch = doctor.password.startsWith("$2")
      ? bcrypt.compareSync(currentPassword, doctor.password)
      : doctor.password === currentPassword

    if (!isMatch) return res.status(401).json({ success: false, message: "Current password is incorrect" })

    const hashed = bcrypt.hashSync(newPassword, 10)
    db.query("UPDATE doctors SET password = ? WHERE id = ?", [hashed, doctorId], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, message: "Failed to update password" })
      res.json({ success: true, message: "Password changed successfully" })
    })
  })
}
