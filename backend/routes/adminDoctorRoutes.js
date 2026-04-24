const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const authMiddleware = require("../middleware/auth")
const {
  getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, toggleDoctorStatus, sendDoctorCredentials
} = require("../controllers/adminDoctorController")

const uploadDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, "doctor_" + Date.now() + path.extname(file.originalname))
})
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase())) cb(null, true)
    else cb(new Error("Only JPG and PNG allowed"))
  }
})

router.get("/hospital/:hospital_id", authMiddleware, getDoctors)
router.get("/:id", authMiddleware, getDoctorById)
router.post("/", authMiddleware, upload.single("photo"), createDoctor)
router.put("/:id", authMiddleware, upload.single("photo"), updateDoctor)
router.delete("/:id", authMiddleware, deleteDoctor)
router.patch("/:id/status", authMiddleware, toggleDoctorStatus)
router.post("/:id/send-credentials", authMiddleware, sendDoctorCredentials)

module.exports = router
