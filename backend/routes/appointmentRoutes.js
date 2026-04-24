const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const { getByHospital, getByDoctor, create, update, updateStatus, remove } = require("../controllers/appointmentController")

router.get("/hospital/:hospital_id", authMiddleware, getByHospital)
router.get("/doctor/:doctor_id", authMiddleware, getByDoctor)
router.post("/public", create)  // public booking - no auth
router.post("/", authMiddleware, create)
router.put("/:id", authMiddleware, update)
router.patch("/:id/status", authMiddleware, updateStatus)
router.delete("/:id", authMiddleware, remove)

module.exports = router
