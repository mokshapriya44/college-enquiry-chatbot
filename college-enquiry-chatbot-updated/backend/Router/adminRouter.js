const router = require("express").Router();
const { loginAdmin } = require("../Controller/adminController");
router.post("/login", loginAdmin);
module.exports = router;
