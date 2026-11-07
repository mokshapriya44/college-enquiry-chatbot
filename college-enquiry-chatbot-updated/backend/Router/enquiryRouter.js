const router = require("express").Router();
const { verifyToken, allowRoles } = require("../Middleware/authMiddleware");
const {
    createEnquiry, getMyEnquiries, getAllEnquiries, updateEnquiryStatus, getDashboardStats
} = require("../Controller/enquiryController");

router.post("/", verifyToken, allowRoles("student"), createEnquiry);
router.get("/mine", verifyToken, allowRoles("student"), getMyEnquiries);
router.get("/", verifyToken, allowRoles("admin"), getAllEnquiries);
router.patch("/:id/status", verifyToken, allowRoles("admin"), updateEnquiryStatus);
router.get("/dashboard/stats", verifyToken, allowRoles("admin"), getDashboardStats);
module.exports = router;
