const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["donor", "receiver", "agent", "admin"],
      required: true,
    },

    location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point"
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
  },
  address: {
    type: String
  }
},

    trustScore: {
      type: Number,
      default: 5,
    },
    badge: {
      type: String,
      default: "New Helper",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  resetPasswordToken: {
      type: String
    },
    resetPasswordExpire: {
      type: Date
    }
  },
  { timestamps: true }
);
userSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("User", userSchema);
