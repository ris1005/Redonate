const Donation = require("../models/Donation");
const User = require("../models/User");
const { notifyUser } = require("../utils/notifications");
exports.getNearbyDonations = async (req, res) => {
  try {
    const receiver = await User.findById(req.user.id);
    const distance = Math.min(Number(req.query.distance || 10), 50) * 1000;
    const category = req.query.category;

    if (!receiver || !receiver.location) {
      return res.status(400).json({ message: "Receiver location not set" });
    }

    const filter = {
      status: "requested",
      deliveryType: "ngo",
      location: {
    $near: {
      $geometry: receiver.location,
      $maxDistance: distance
    }
  }
    };

    if (category) filter.category = category;

    const donations = await Donation.find(filter)
      .populate("donor", "name location trustScore badge")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.acceptDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation)
      return res.status(404).json({ message: "Not found" });

    donation.receiver = req.user.id;
    donation.status = "accepted";
    donation.statusHistory.push({ status: "accepted", note: "Claimed by receiver" });

    await donation.save();
    await notifyUser(
      donation.donor,
      "Donation claimed",
      "A receiver accepted your donation. An agent can now pick it up.",
      "/donor/my-donations"
    );

    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
