// const express = require("express")
// const router = express.Router()
// const multer = require("multer")
// const path = require("path")
// const fs = require("fs")
// const authMiddleware = require("../middleware/auth")

// const {
//   createHospital,
//   getHospitals,
//   getHospitalById,
//   getHospitalByAdminId,
//   updateHospital,
//   updateHospitalDetails,
//   deleteHospital,
//    updateFacilities,  
//   updateActivities,   
//   updateHours      
// } = require("../controllers/hospitalController")

// const uploadDir = path.join(__dirname, "../uploads")
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => cb(null, "logo_" + Date.now() + path.extname(file.originalname))
// })
// const upload = multer({ storage })

// router.post("/create", authMiddleware, createHospital)
// router.get("/", authMiddleware, getHospitals)
// router.get("/by-admin/:adminId", authMiddleware, getHospitalByAdminId)
// router.get("/:id", authMiddleware, getHospitalById)
// router.put("/:id", authMiddleware, updateHospital)
// router.put("/:id/details", authMiddleware, upload.single("logo"), updateHospitalDetails)
// router.delete("/:id", authMiddleware, deleteHospital)
// router.put("/:id/facilities", authMiddleware, updateFacilities)
// router.put("/:id/activities", authMiddleware, updateActivities)
// router.put("/:id/hours", authMiddleware, updateHours)

// module.exports = router

const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const authMiddleware = require("../middleware/auth")

const {
  createHospital,
  getHospitals,
  getHospitalById,
  getHospitalByAdminId,
  updateHospital,
  updateHospitalDetails,
  deleteHospital,
  updateFacilities,
  updateActivities,
  updateHours,
  getPublicHospitals,
  getPublicDoctors
} = require("../controllers/hospitalController")

const uploadDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, "logo_" + Date.now() + path.extname(file.originalname))
})
const upload = multer({ storage })

// Public routes (no auth)
router.get("/public/list", getPublicHospitals)
router.get("/public/:id/doctors", getPublicDoctors)

// 1️⃣ Static routes first
router.post("/create", authMiddleware, createHospital)
router.get("/", authMiddleware, getHospitals)
router.get("/by-admin/:adminId", authMiddleware, getHospitalByAdminId)

// 2️⃣ Sub-resource routes BEFORE /:id
router.put("/:id/details", authMiddleware, upload.single("logo"), updateHospitalDetails)
router.put("/:id/facilities", authMiddleware, updateFacilities)
router.put("/:id/activities", authMiddleware, updateActivities)
router.put("/:id/hours", authMiddleware, updateHours)

// 3️⃣ Generic /:id routes LAST
router.get("/:id", authMiddleware, getHospitalById)
router.put("/:id", authMiddleware, updateHospital)
router.delete("/:id", authMiddleware, deleteHospital)

module.exports = router