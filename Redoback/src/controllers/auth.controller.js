const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geocoder = require("../utils/geocoder");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const formatGpsAddress = (coordinates) => {
  if (!coordinates || coordinates.length !== 2) return "Current location";
  const [longitude, latitude] = coordinates;
  return `GPS: ${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, address } = req.body;
   if (!address && !req.body.coordinates) {
  return res.status(400).json({
    message: "Address or current location required"
  });
}

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    let locationData;

if (req.body.coordinates && req.body.coordinates.length === 2) {
  locationData = {
    type: "Point",
    coordinates: req.body.coordinates,
    address: address || formatGpsAddress(req.body.coordinates)
  };
} else {
  const cleanAddress = address.split(",").slice(-3).join(",");
  const geoData = await geocoder.geocode(cleanAddress);

  if (!geoData.length) {
    return res.status(400).json({ message: "Invalid address" });
  }

  locationData = {
    type: "Point",
    coordinates: [geoData[0].longitude, geoData[0].latitude],
    address: address
  };
}
    const user = await User.create({
  name,
  email,
  password: hashed,
  role,
  location: locationData
});

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        badge: user.badge,
        isVerified: user.isVerified,
        location: user.location,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hash token (for security)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // create reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Password Reset",
      `Reset your password: ${resetUrl}`
    );

    res.json({ message: "Reset link sent to email" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
