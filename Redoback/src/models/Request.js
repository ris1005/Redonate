const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: ["clothes", "food", "books", "electronics", "essentials"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    quantityNeeded: {
      type: Number,
      min: 1,
      required: true,
    },

    quantityReceived: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["open", "fulfilled", "closed"],
      default: "open",
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    neededBy: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
