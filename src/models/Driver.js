const mongoose = require("mongoose");

// Sub-document وسیله نقلیه — چون رابطه ۱-به-۱ با راننده هست و همیشه با هم
// خونده میشن، به‌جای Reference جدا، مستقیم Embed شده (تصمیم مرحله ۲).
const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String },
  },
  { _id: false }
);

const driverSchema = new mongoose.Schema(
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
    vehicle: {
      type: vehicleSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "on_trip"],
      default: "offline",
    },
    // فرمت GeoJSON — پیش‌نیاز ایجاد ایندکس 2dsphere برای کوئری‌های مکانی
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
    rating: {
      avg: { type: Number, default: 5, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// ایندکس مکانی — پایه‌ی کوئری "نزدیک‌ترین راننده‌ی آنلاین"
driverSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("Driver", driverSchema);
