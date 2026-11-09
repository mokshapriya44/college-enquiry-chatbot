const router = require("express").Router();
const { sendMessage, getChatHistory,deleteChatHistory } = require("../Controller/chatController");
const { verifyToken, allowRoles } = require("../Middleware/authMiddleware");
router.post("/", verifyToken, allowRoles("student"), sendMessage);
router.get("/history", verifyToken, allowRoles("student"), getChatHistory);
router.delete("/history", verifyToken, allowRoles("student"), deleteChatHistory);
module.exports = router;
