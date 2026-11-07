const router = require("express").Router();
const { registerStudent, loginStudent, getProfile } = require("../Controller/studentController");
const { verifyToken, allowRoles } = require("../Middleware/authMiddleware");

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/profile", verifyToken, allowRoles("student"), getProfile);
module.exports = router;
