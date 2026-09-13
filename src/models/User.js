const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    rating: {
      avg: { type: Number, default: 5, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true } // createdAt, updatedAt خودکار
);

module.exports = mongoose.model("User", userSchema);
