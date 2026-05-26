const Donation = require("../models/Donation");
const Request = require("../models/Request");
const User = require("../models/User");
const { notifyUser, notifyMany } = require("../utils/notifications");

const updateBadge = (user) => {
  if (user.trustScore >= 9) user.badge = "Impact Champion";
  else if (user.trustScore >= 7) user.badge = "Trusted Helper";
  else if (user.trustScore >= 5) user.badge = "Reliable Helper";
  else user.badge = "Needs Review";
};

exports.createDonation = async (req, res) => {
  try {
    const { requestId, quantity } = req.body;
    const numericQuantity = Number(quantity);

    if (!numericQuantity || numericQuantity < 1 || numericQuantity > 10000) {
      return res.status(400).json({ message: "Quantity must be between 1 and 10000" });
    }

    const donor = await User.findById(req.user.id);
    if (!donor?.location?.coordinates?.length) {
      return res.status(400).json({ message: "Please update your location before donating" });
    }

    if (requestId) {
      const request = await Request.findById(requestId);
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (request.status !== "open") {
        return res.status(400).json({ message: "This request is not open" });
      }

      const remaining = request.quantityNeeded - request.quantityReceived;
      if (numericQuantity > remaining) {
        return res.status(400).json({ message: `Only ${remaining} items are still needed` });
      }
    }

    const donation = await Donation.create({
      donor: req.user.id,
      ...req.body,
      quantity: numericQuantity,
      request: requestId,
      location: donor.location,
      statusHistory: [{ status: "requested", note: "Donation created" }],
    });

    if (requestId) {
      const request = await Request.findById(requestId);
      request.quantityReceived += numericQuantity;

      if (request.quantityReceived >= request.quantityNeeded) {
        request.status = "fulfilled";
      }

      await request.save();
      await notifyUser(
        request.receiver,
        "Request received support",
        `${donor.name} pledged ${numericQuantity} ${request.category} item(s).`,
        "/receiver/requests"
      );
    } else {
      const receivers = await User.find({
        role: "receiver",
        location: {
          $near: {
            $geometry: donor.location,
            $maxDistance: 10000,
          },
        },
      }).select("_id");

      await notifyMany(
        receivers.map((receiver) => receiver._id),
        "New nearby donation",
        `${donor.name} posted ${numericQuantity} ${donation.category} item(s) near you.`,
        "/receiver/nearby"
      );
    }

    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate("receiver agent", "name role trustScore badge location")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rateDonationUser = async (req, res) => {
  try {
    const { score, comment, toUserId } = req.body;
    const numericScore = Number(score);

    if (!numericScore || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "delivered") {
      return res.status(400).json({ message: "You can rate after delivery" });
    }

    const participantIds = [donation.donor, donation.receiver, donation.agent]
      .filter(Boolean)
      .map(String);

    if (!participantIds.includes(String(req.user.id)) || !participantIds.includes(String(toUserId))) {
      return res.status(403).json({ message: "Only donation participants can rate each other" });
    }

    const alreadyRated = donation.ratings.some(
      (rating) => String(rating.from) === String(req.user.id) && String(rating.to) === String(toUserId)
    );

    if (alreadyRated) {
      return res.status(400).json({ message: "You already rated this user" });
    }

    donation.ratings.push({
      from: req.user.id,
      to: toUserId,
      score: numericScore,
      comment,
    });

    const ratedUser = await User.findById(toUserId);
    if (ratedUser) {
      ratedUser.trustScore = Math.max(1, Math.min(10, ratedUser.trustScore + (numericScore - 3) * 0.15));
      updateBadge(ratedUser);
      await ratedUser.save();
      await notifyUser(ratedUser._id, "New trust rating", `You received a ${numericScore}/5 rating.`, "/profile");
    }

    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reportDonation = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    donation.reports.push({ from: req.user.id, reason, details });
    await donation.save();

    const admins = await User.find({ role: "admin" }).select("_id");
    await notifyMany(
      admins.map((admin) => admin._id),
      "Donation reported",
      `A donation was reported for: ${reason || "No reason provided"}.`,
      "/admin"
    );

    res.json({ message: "Report submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
