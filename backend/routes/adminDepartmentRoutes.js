const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const {
  getAdminDepartments,
  createAdminDepartment,
  updateAdminDepartment,
  deleteAdminDepartment,
  toggleAdminDeptStatus
} = require("../controllers/adminDepartmentController")

router.get("/:hospital_id", authMiddleware, getAdminDepartments)
router.post("/", authMiddleware, createAdminDepartment)
router.put("/:id", authMiddleware, updateAdminDepartment)
router.delete("/:id", authMiddleware, deleteAdminDepartment)
router.patch("/:id/status", authMiddleware, toggleAdminDeptStatus)

module.exports = router
