const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const {
  createDesignation,
  getDesignations,
  updateDesignation,
  deleteDesignation,
  toggleStatus
} = require("../controllers/designationController")

router.post("/", authMiddleware, createDesignation)
router.get("/", authMiddleware, getDesignations)
router.put("/:id", authMiddleware, updateDesignation)
router.delete("/:id", authMiddleware, deleteDesignation)
router.patch("/:id/status", authMiddleware, toggleStatus)

module.exports = router
