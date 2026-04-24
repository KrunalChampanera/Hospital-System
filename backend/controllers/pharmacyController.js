const db = require("../config/db")

db.query(`
  CREATE TABLE IF NOT EXISTS pharmacy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    quantity INT DEFAULT 0,
    unit VARCHAR(30) DEFAULT 'Tablets',
    price DECIMAL(10,2) DEFAULT 0,
    expiry_date DATE,
    status ENUM('In Stock','Low Stock','Out of Stock') DEFAULT 'In Stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => { if (err) console.error("pharmacy table error:", err.message) })

exports.getAll = (req, res) => {
  db.query("SELECT * FROM pharmacy WHERE hospital_id = ? ORDER BY id DESC", [req.params.hospital_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch medicines" })
      res.json({ success: true, data: result })
    })
}

exports.create = (req, res) => {
  const { hospital_id, name, category, quantity, unit, price, expiry_date } = req.body
  if (!hospital_id || !name) return res.status(400).json({ success: false, message: "hospital_id and name are required" })
  const status = quantity <= 0 ? "Out of Stock" : quantity <= 10 ? "Low Stock" : "In Stock"
  db.query(
    "INSERT INTO pharmacy (hospital_id, name, category, quantity, unit, price, expiry_date, status) VALUES (?,?,?,?,?,?,?,?)",
    [hospital_id, name, category || null, quantity || 0, unit || "Tablets", price || 0, expiry_date || null, status],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to add medicine" })
      res.json({ success: true, message: "Medicine added", id: result.insertId })
    })
}

exports.update = (req, res) => {
  const { name, category, quantity, unit, price, expiry_date } = req.body
  const status = quantity <= 0 ? "Out of Stock" : quantity <= 10 ? "Low Stock" : "In Stock"
  db.query(
    "UPDATE pharmacy SET name=?, category=?, quantity=?, unit=?, price=?, expiry_date=?, status=? WHERE id=?",
    [name, category || null, quantity || 0, unit || "Tablets", price || 0, expiry_date || null, status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to update medicine" })
      res.json({ success: true, message: "Medicine updated" })
    })
}

exports.remove = (req, res) => {
  db.query("DELETE FROM pharmacy WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete medicine" })
    res.json({ success: true, message: "Medicine deleted" })
  })
}
