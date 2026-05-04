const express = require("express")
const cors = require("cors")
const path = require("path")

require("./config/db")

const app = express()

app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

const authRoutes = require("./routes/authRoutes")
const hospitalRoutes = require("./routes/hospitalRoutes")
const departmentRoutes = require("./routes/departmentRoutes")
const designationRoutes = require("./routes/designationRoutes")
const registrationRoutes = require("./routes/registrationRoutes")
const adminDepartmentRoutes = require("./routes/adminDepartmentRoutes")
const adminDoctorRoutes = require("./routes/adminDoctorRoutes")
const staffRoutes = require("./routes/staffRoutes")
const { runMigrations } = require("./controllers/adminDoctorController")
const { ensureStaffTable } = require("./controllers/staffController")
const { seedDepartments } = require("./controllers/departmentController")
const { seedDesignations } = require("./controllers/designationController")

app.use("/api/auth", authRoutes)
app.use("/api/hospital", hospitalRoutes)
app.use("/api/department", departmentRoutes)
app.use("/api/designation", designationRoutes)
app.use("/api/registration", registrationRoutes)
app.use("/api/admin-department", adminDepartmentRoutes)
app.use("/api/admin-doctor", adminDoctorRoutes)
app.use("/api/staff", staffRoutes)

// Pincode lookup proxy — avoids any browser CORS issues
const https = require("https")
app.get("/api/pincode/:code", (req, res) => {
  const code = req.params.code.trim()
  let countryCode = "in"
  if (/^\d{5}$/.test(code)) countryCode = "us"
  else if (/^\d{4}$/.test(code)) countryCode = "au"
  else if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(code)) countryCode = "gb"

  const url = `https://api.zippopotam.us/${countryCode}/${encodeURIComponent(code)}`
  https.get(url, (apiRes) => {
    let data = ""
    apiRes.on("data", chunk => data += chunk)
    apiRes.on("end", () => {
      if (apiRes.statusCode !== 200) return res.status(404).json({ success: false, message: "Pincode not found" })
      try {
        const json = JSON.parse(data)
        const place = json.places?.[0]
        if (!place) return res.status(404).json({ success: false, message: "Pincode not found" })
        res.json({
          success: true,
          city: place["place name"],
          state: place["state"],
          country: json.country
        })
      } catch { res.status(500).json({ success: false, message: "Parse error" }) }
    })
  }).on("error", () => res.status(500).json({ success: false, message: "Lookup failed" }))
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ success: false, message: "Internal server error" })
})

const PORT = process.env.PORT || 5000

runMigrations()
  .then(() => ensureStaffTable())
  .then(() => seedDepartments())
  .then(() => seedDesignations())
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
