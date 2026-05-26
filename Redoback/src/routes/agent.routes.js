const express = require("express");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const {
  acceptTask,
  confirmPickup,
  getTasks,
  confirmDrop,
} = require("../controllers/agent.controller");

const router = express.Router();

router.patch(
  "/accept/:id",
  auth,
  role("agent"),
  acceptTask
);

router.patch(
  "/pickup/:id",
  auth,
  role("agent"),
  confirmPickup
);
router.get(
  "/tasks",
  auth,
  role("agent"),
  getTasks
);
router.patch(
  "/drop/:id",
  auth,
  role("agent"),
  confirmDrop
);
module.exports = router;
