const mongoose = require("mongoose");

// سند مکان مبدا/مقصد — هم مختصات جغرافیایی و هم آدرس متنی نگه می‌داره
const geoPointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    // Reference به User و Driver — نه Embed، چون trips مرکز سیستمه
    // و باید از دو طرف (تاریخچه مسافر / تاریخچه راننده) قابل کوئری باشه
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null, // تا وقتی سفر پذیرفته نشده، خالیه
    },
    status: {
      type: String,
      enum: ["requested", "accepted", "in_progress", "completed", "cancelled"],
      default: "requested",
    },
    origin: {
      type: geoPointSchema,
      required: true,
    },
    destination: {
      type: geoPointSchema,
      required: true,
    },
    fare: {
      type: Number,
      default: null, // بعد از completed پر میشه
    },
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ایندکس‌های معمولی برای سریع کردن کوئری تاریخچه سفرهای هر کاربر/راننده
tripSchema.index({ riderId: 1, createdAt: -1 });
tripSchema.index({ driverId: 1, createdAt: -1 });
tripSchema.index({ status: 1 });

module.exports = mongoose.model("Trip", tripSchema);
