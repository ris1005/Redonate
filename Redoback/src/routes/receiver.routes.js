const express = require("express");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const {
  acceptDonation,
  getNearbyDonations,
} = require("../controllers/receiver.controller");
const {
  createRequest,
  getMyRequests,
} = require("../controllers/request.controller");

const router = express.Router();

router.get(
  "/nearby",
  auth,
  role("receiver"),
  getNearbyDonations
);

router.patch(
  "/accept/:id",
  auth,
  role("receiver"),
  acceptDonation
);
router.post(
  "/request",
  auth,
  role("receiver"),
  createRequest
);

router.get(
  "/requests",
  auth,
  role("receiver"),
  getMyRequests
);
module.exports = router;
