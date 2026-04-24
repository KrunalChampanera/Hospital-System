const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const { getAll, create, update, remove } = require("../controllers/pharmacyController")

router.get("/:hospital_id", authMiddleware, getAll)
router.post("/", authMiddleware, create)
router.put("/:id", authMiddleware, update)
router.delete("/:id", authMiddleware, remove)

module.exports = router
