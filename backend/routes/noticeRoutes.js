const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const { getNotices, createNotice, updateNotice, deleteNotice, toggleNoticeStatus } = require("../controllers/noticeController")

router.get("/:hospital_id", authMiddleware, getNotices)
router.post("/", authMiddleware, createNotice)
router.put("/:id", authMiddleware, updateNotice)
router.delete("/:id", authMiddleware, deleteNotice)
router.patch("/:id/status", authMiddleware, toggleNoticeStatus)

module.exports = router
