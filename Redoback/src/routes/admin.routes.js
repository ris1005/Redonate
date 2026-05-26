const express = require("express");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const {
  getAdminDashboard,
  getImpactStats,
  verifyUser,
  closeRequest,
} = require("../controllers/admin.controller");

const router = express.Router();

router.get("/impact", getImpactStats);
router.get("/dashboard", auth, role("admin"), getAdminDashboard);
router.patch("/verify-user/:id", auth, role("admin"), verifyUser);
router.patch("/close-request/:id", auth, role("admin"), closeRequest);

module.exports = router;
