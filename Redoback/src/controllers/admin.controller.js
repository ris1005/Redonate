const Donation = require("../models/Donation");
const Request = require("../models/Request");
const User = require("../models/User");

exports.getImpactStats = async (req, res) => {
  try {
    const [totalItems, deliveredItems, fulfilledRequests, activeDonors, activeAgents, categoryBreakdown] =
      await Promise.all([
        Donation.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }]),
        Donation.aggregate([
          { $match: { status: "delivered" } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]),
        Request.countDocuments({ status: "fulfilled" }),
        User.countDocuments({ role: "donor" }),
        User.countDocuments({ role: "agent" }),
        Donation.aggregate([{ $group: { _id: "$category", total: { $sum: "$quantity" } } }]),
      ]);

    res.json({
      totalItems: totalItems[0]?.total || 0,
      deliveredItems: deliveredItems[0]?.total || 0,
      fulfilledRequests,
      activeDonors,
      activeAgents,
      estimatedKilometersCovered: Math.round((deliveredItems[0]?.total || 0) * 1.8),
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const [users, donations, requests, reportedDonations, openRequests, deliveredDonations, activeDeliveries] =
      await Promise.all([
        User.find().select("name email role trustScore badge isVerified createdAt").sort({ createdAt: -1 }).limit(50),
        Donation.find().populate("donor receiver agent", "name role trustScore badge").sort({ updatedAt: -1 }).limit(50),
        Request.find().populate("receiver", "name").sort({ updatedAt: -1 }).limit(50),
        Donation.find({ "reports.0": { $exists: true } }).populate("donor receiver agent", "name role").sort({ updatedAt: -1 }),
        Request.countDocuments({ status: "open" }),
        Donation.countDocuments({ status: "delivered" }),
        Donation.countDocuments({ status: { $in: ["accepted", "picked"] } }),
      ]);

    res.json({
      users,
      donations,
      requests,
      reportedDonations,
      summary: {
        totalUsers: await User.countDocuments(),
        openRequests,
        deliveredDonations,
        activeDeliveries,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, badge: "Verified Partner" },
      { new: true }
    ).select("name email role trustScore badge isVerified");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.closeRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, { status: "closed" }, { new: true });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
