const express = require("express");
const auth = require("../middlewares/auth.middleware");
const {
  getMe,
  updateLocation,
  getNotifications,
  markNotificationsRead,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/me", auth, getMe);
router.patch("/location", auth, updateLocation);
router.get("/notifications", auth, getNotifications);
router.patch("/notifications/read", auth, markNotificationsRead);

module.exports = router;
