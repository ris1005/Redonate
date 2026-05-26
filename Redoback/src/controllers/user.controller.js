const User = require("../models/User");
const Notification = require("../models/Notification");
const geocoder = require("../utils/geocoder");

const formatGpsAddress = (coordinates) => {
  if (!coordinates || coordinates.length !== 2) return "Current location";
  const [longitude, latitude] = coordinates;
  return `GPS: ${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  trustScore: user.trustScore,
  badge: user.badge,
  isVerified: user.isVerified,
  location: user.location,
});

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { address, coordinates } = req.body;
    let locationData;

    if (coordinates && coordinates.length === 2) {
      locationData = {
        type: "Point",
        coordinates,
        address: address || formatGpsAddress(coordinates),
      };
    } else if (address) {
      const cleanAddress = address.split(",").slice(-3).join(",");
      const geoData = await geocoder.geocode(cleanAddress);
      if (!geoData.length) {
        return res.status(400).json({ message: "Invalid address" });
      }

      locationData = {
        type: "Point",
        coordinates: [geoData[0].longitude, geoData[0].latitude],
        address,
      };
    } else {
      return res.status(400).json({ message: "Address or coordinates required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { location: locationData },
      { new: true }
    );

    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
