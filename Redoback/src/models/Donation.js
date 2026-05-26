const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    category: {
      type: String,
      enum: ["clothes", "food", "books", "electronics", "essentials"],
      required: true,
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    condition: {
      type: String,
      enum: ["new", "good", "usable"],
      required: true,
    },

    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
    request: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Request",
},

    images: [String],
    expiryDate: Date,
    pickupWindow: String,
    itemNotes: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      },
      address: String
    },

    deliveryType: {
      type: String,
      enum: ["ngo", "beggar"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "picked",
        "delivered",
      ],
      default: "requested",
    },

    pickupOTP: String,
    dropOTP: String,
    statusHistory: [
      {
        status: String,
        note: String,
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ratings: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        score: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
      },
    ],
    reports: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
        details: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);
donationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Donation", donationSchema);
