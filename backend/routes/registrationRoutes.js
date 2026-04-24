const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const {
  submitRegistration,
  getAllRegistrations,
  approveRegistration,
  declineRegistration
} = require("../controllers/registrationController")

router.post("/", submitRegistration)                              // Public - admin submits form
router.get("/", authMiddleware, getAllRegistrations)              // Super admin - view all
router.post("/:id/approve", authMiddleware, approveRegistration) // Super admin - approve
router.post("/:id/decline", authMiddleware, declineRegistration) // Super admin - decline

module.exports = router
