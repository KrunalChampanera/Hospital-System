const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const multer = require("multer")
const path = require("path")
const {
  getStaff, getStaffById, createStaff, deleteStaff, toggleStaffStatus,
  updateStaffProfile, changeStaffPassword, forgotPassword, resetPassword, uploadStaffImage
} = require("../controllers/staffController")

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `staff_${Date.now()}${path.extname(file.originalname)}`)
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  cb(null, /image\/(jpeg|jpg|png|webp)/.test(file.mimetype))
}})

router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/change-password", authMiddleware, changeStaffPassword)
router.post("/:id/image", authMiddleware, upload.single("image"), uploadStaffImage)
router.get("/hospital/:hospital_id", authMiddleware, getStaff)
router.get("/:id", authMiddleware, getStaffById)
router.post("/", authMiddleware, createStaff)
router.delete("/:id", authMiddleware, deleteStaff)
router.patch("/:id/status", authMiddleware, toggleStaffStatus)
router.put("/:id/profile", authMiddleware, updateStaffProfile)

module.exports = router
