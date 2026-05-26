const express = require("express");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const {
  createDonation,
  getMyDonations,
  rateDonationUser,
  reportDonation,
} = require("../controllers/donor.controller");
const {
  getOpenRequests,
} = require("../controllers/request.controller");
const router = express.Router();

router.post(
  "/donate",
  auth,
  role("donor"),
  createDonation
);

router.get(
  "/my-donations",
  auth,
  role("donor", "receiver", "agent"),
  getMyDonations
);
router.patch(
  "/donations/:id/rate",
  auth,
  role("donor", "receiver", "agent"),
  rateDonationUser
);
router.patch(
  "/donations/:id/report",
  auth,
  role("donor", "receiver", "agent"),
  reportDonation
);
router.get(
  "/requests",
  auth,
  role("donor"),
  getOpenRequests
);

module.exports = router;
