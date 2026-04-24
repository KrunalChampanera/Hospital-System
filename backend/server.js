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
const noticeRoutes = require("./routes/noticeRoutes")
const appointmentRoutes = require("./routes/appointmentRoutes")
const pharmacyRoutes = require("./routes/pharmacyRoutes")
const bedRoutes = require("./routes/bedRoutes")
const { runMigrations } = require("./controllers/adminDoctorController")

app.use("/api/auth", authRoutes)
app.use("/api/hospital", hospitalRoutes)
app.use("/api/department", departmentRoutes)
app.use("/api/designation", designationRoutes)
app.use("/api/registration", registrationRoutes)
app.use("/api/admin-department", adminDepartmentRoutes)
app.use("/api/admin-doctor", adminDoctorRoutes)
app.use("/api/notice", noticeRoutes)
app.use("/api/appointment", appointmentRoutes)
app.use("/api/pharmacy", pharmacyRoutes)
app.use("/api/bed", bedRoutes)

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

runMigrations().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
