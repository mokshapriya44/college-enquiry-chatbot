// const router = require("express").Router();
// const { registerStudent, loginStudent, getProfile } = require("../Controller/studentController");
// const { verifyToken, allowRoles } = require("../Middleware/authMiddleware");

// router.post("/register", registerStudent);
// router.post("/login", loginStudent);
// router.get("/profile", verifyToken, allowRoles("student"), getProfile);
// module.exports = router;


const router = require("express").Router();
const {getRegistrationCaptcha,registerStudent,verifyEmailOTP,requestPasswordReset,resetPassword,loginStudent,getProfile} = require("../Controller/studentController");
const { verifyToken,allowRoles} = require("../Middleware/authMiddleware");

router.get("/captcha", getRegistrationCaptcha);
router.post("/register", registerStudent);
router.post("/verify-email", verifyEmailOTP);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/login", loginStudent);
router.get("/profile",verifyToken,allowRoles("student"),getProfile);

module.exports = router;
