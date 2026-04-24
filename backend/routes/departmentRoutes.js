const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const authMiddleware = require("../middleware/auth")

const {
  createDepartment,
  getDepartments,
  getActiveDepartments,
  updateDepartment,
  deleteDepartment,
  toggleStatus
} = require("../controllers/departmentController")

const uploadDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, "dept_" + Date.now() + path.extname(file.originalname))
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true)
    } else {
      cb(new Error("Only JPG and PNG allowed"))
    }
  }
})


router.get("/active", authMiddleware, getActiveDepartments)
router.post("/", authMiddleware, upload.single("image"), createDepartment)
router.get("/", authMiddleware, getDepartments) 
router.put("/:id", authMiddleware, upload.single("image"), updateDepartment)
router.delete("/:id", authMiddleware, deleteDepartment)
router.patch("/:id/status", authMiddleware, toggleStatus)

module.exports = router