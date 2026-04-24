const db = require("../config/db")

db.query(`
  CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('Low','Medium','High') DEFAULT 'Medium',
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => { if (err) console.error("notices table error:", err.message) })

exports.getNotices = (req, res) => {
  const { hospital_id } = req.params
  db.query(
    "SELECT * FROM notices WHERE hospital_id = ? ORDER BY id DESC",
    [hospital_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch notices" })
      res.json({ success: true, data: result })
    }
  )
}

exports.createNotice = (req, res) => {
  const { hospital_id, title, message, priority } = req.body
  if (!hospital_id || !title || !message)
    return res.status(400).json({ success: false, message: "hospital_id, title and message are required" })

  db.query(
    "INSERT INTO notices (hospital_id, title, message, priority) VALUES (?, ?, ?, ?)",
    [hospital_id, title, message, priority || "Medium"],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to create notice" })
      res.json({ success: true, message: "Notice created", id: result.insertId })
    }
  )
}

exports.updateNotice = (req, res) => {
  const { id } = req.params
  const { title, message, priority, status } = req.body
  db.query(
    "UPDATE notices SET title=?, message=?, priority=?, status=? WHERE id=?",
    [title, message, priority || "Medium", status || "Active", id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to update notice" })
      res.json({ success: true, message: "Notice updated" })
    }
  )
}

exports.deleteNotice = (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM notices WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete notice" })
    res.json({ success: true, message: "Notice deleted" })
  })
}

exports.toggleNoticeStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body
  db.query("UPDATE notices SET status=? WHERE id=?", [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update status" })
    res.json({ success: true, message: "Status updated" })
  })
}
