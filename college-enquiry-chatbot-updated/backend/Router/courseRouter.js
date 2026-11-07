const router = require("express").Router();
const { getCourses, addCourse, updateCourse, deleteCourse } = require("../Controller/courseController");
const { verifyToken, allowRoles } = require("../Middleware/authMiddleware");

// Course list is readable to both roles; only admins can change courses.
router.get("/", getCourses);
router.post("/", verifyToken, allowRoles("admin"), addCourse);
router.put("/:id", verifyToken, allowRoles("admin"), updateCourse);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteCourse);
module.exports = router;
