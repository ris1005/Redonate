const Donation = require("../models/Donation");
const User = require("../models/User");
const generateOTP = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const { notifyUser } = require("../utils/notifications");

const updateBadge = (user) => {
  if (user.trustScore >= 9) user.badge = "Impact Champion";
  else if (user.trustScore >= 7) user.badge = "Trusted Helper";
  else if (user.trustScore >= 5) user.badge = "Reliable Helper";
  else user.badge = "Needs Review";
};

exports.acceptTask = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate("donor");

    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.agent) return res.status(400).json({ message: "Task already assigned" });
    if (!donation.donor || !donation.donor.email) {
      return res.status(400).json({ message: "Donor email not found" });
    }

    donation.agent = req.user.id;
    donation.pickupOTP = generateOTP();
    donation.dropOTP = generateOTP();
    donation.statusHistory.push({ status: "accepted", note: "Agent assigned" });

    await donation.save();

    await sendEmail(
      donation.donor.email,
      "Pickup OTP - ReDonate",
      `Your pickup OTP is: ${donation.pickupOTP}`
    );

    await notifyUser(donation.donor._id, "Agent assigned", "Pickup OTP has been sent to your email.", "/donor/my-donations");
    if (donation.receiver) {
      await notifyUser(donation.receiver, "Delivery scheduled", "An agent accepted your delivery task.", "/receiver/requests");
    }

    res.json({ message: "Task accepted. Pickup OTP sent to donor email." });
  } catch (err) {
    console.error("acceptTask error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.confirmPickup = async (req, res) => {
  try {
    const { otp } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (String(donation.agent) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only assigned agent can confirm pickup" });
    }
    if (otp !== donation.pickupOTP) return res.status(400).json({ message: "Invalid pickup OTP" });

    donation.status = "picked";
    donation.pickupOTP = null;
    donation.statusHistory.push({ status: "picked", note: "Pickup verified by donor OTP" });

    await donation.save();

    const receiver = await User.findById(donation.receiver);
    if (receiver) {
      await sendEmail(receiver.email, "Delivery OTP - ReDonate", `Your delivery OTP is: ${donation.dropOTP}`);
      await notifyUser(receiver._id, "Donation picked up", "Your delivery OTP has been sent to your email.", "/receiver/requests");
    }
    await notifyUser(donation.donor, "Donation picked up", "Your donation is now in transit.", "/donor/my-donations");

    res.json({ message: "Pickup confirmed. Drop OTP sent to receiver." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const agent = await User.findById(req.user.id);
    const distance = Math.min(Number(req.query.distance || 10), 50) * 1000;

    const tasks = await Donation.find({
      $or: [{ agent: null, status: "accepted" }, { agent: req.user.id }],
      location: {
        $near: {
          $geometry: agent.location,
          $maxDistance: distance,
        },
      },
    })
      .populate("donor", "name location trustScore badge")
      .populate("receiver", "name location trustScore badge")
      .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmDrop = async (req, res) => {
  try {
    const { otp } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (String(donation.agent) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only assigned agent can complete delivery" });
    }
    if (donation.dropOTP !== otp) return res.status(400).json({ message: "Invalid drop OTP" });

    donation.status = "delivered";
    donation.dropOTP = null;
    donation.statusHistory.push({ status: "delivered", note: "Delivery verified by receiver OTP" });

    await donation.save();

    const agent = await User.findById(donation.agent);
    if (agent) {
      agent.trustScore = Math.min(agent.trustScore + 0.1, 10);
      updateBadge(agent);
      await agent.save();
    }

    await notifyUser(donation.donor, "Donation delivered", "Your donation reached the receiver.", "/donor/my-donations");
    await notifyUser(donation.receiver, "Delivery complete", "Your delivery was completed successfully.", "/receiver/requests");

    res.json({ message: "Delivery confirmed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
