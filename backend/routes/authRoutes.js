const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const { login, getProfile, updateProfile, changePassword, changeDoctorPassword } = require("../controllers/authController")

router.post("/login", login)
router.get("/profile/:adminId", authMiddleware, getProfile)
router.put("/profile/:adminId", authMiddleware, updateProfile)
router.post("/change-password", authMiddleware, changePassword)
router.post("/doctor/change-password", authMiddleware, changeDoctorPassword)

module.exports = router
