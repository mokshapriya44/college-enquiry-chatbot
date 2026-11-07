const router = require("express").Router();
const { sendMessage, getChatHistory } = require("../Controller/chatController");
const { verifyToken, allowRoles } = require("../Middleware/authMiddleware");
router.post("/", verifyToken, allowRoles("student"), sendMessage);
router.get("/history", verifyToken, allowRoles("student"), getChatHistory);
module.exports = router;
