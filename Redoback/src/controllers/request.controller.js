const Request = require("../models/Request");
const User = require("../models/User");
const { notifyMany } = require("../utils/notifications");

exports.createRequest = async (req, res) => {
  try {
    const quantityNeeded = Number(req.body.quantityNeeded);
    if (!quantityNeeded || quantityNeeded < 1 || quantityNeeded > 10000) {
      return res.status(400).json({ message: "Quantity must be between 1 and 10000" });
    }

    const request = await Request.create({
      receiver: req.user.id,
      ...req.body,
      quantityNeeded,
    });

    const receiver = await User.findById(req.user.id);
    if (receiver?.location?.coordinates?.length) {
      const donors = await User.find({
        role: "donor",
        location: {
          $near: {
            $geometry: receiver.location,
            $maxDistance: 10000,
          },
        },
      }).select("_id");

      await notifyMany(
        donors.map((donor) => donor._id),
        "New nearby request",
        `${receiver.name} needs ${quantityNeeded} ${request.category} item(s).`,
        "/donor/requests"
      );
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      receiver: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOpenRequests = async (req, res) => {
  try {
    const { category, urgency, q } = req.query;
    const distance = Math.min(Number(req.query.distance || 10), 50) * 1000;
    const filter = { status: "open" };

    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;

    const donor = await User.findById(req.user.id);
    if (!donor?.location?.coordinates?.length) {
      return res.status(400).json({ message: "Please update your location to see nearby requests" });
    }

    const nearbyReceivers = await User.find({
      role: "receiver",
      location: {
        $near: {
          $geometry: donor.location,
          $maxDistance: distance,
        },
      },
    }).select("_id");

    filter.receiver = { $in: nearbyReceivers.map((receiver) => receiver._id) };

    const requests = await Request.find(filter)
      .populate("receiver", "name location isVerified trustScore badge")
      .sort({ createdAt: -1 });

    const filtered = q
      ? requests.filter((request) => {
          const search = q.toLowerCase();
          return (
            request.category.toLowerCase().includes(search) ||
            request.description.toLowerCase().includes(search) ||
            request.receiver?.name?.toLowerCase().includes(search)
          );
        })
      : requests;

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
