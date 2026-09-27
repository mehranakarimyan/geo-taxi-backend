const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");

// لیست همه‌ی رانندگان — برای نمایش روی نقشه‌ی داشبورد
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find({});
    res.json(drivers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ثبت‌نام راننده جدید — الگوی کوئری #7
router.post("/", async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// تغییر وضعیت آنلاین/آفلاین — الگوی کوئری #8
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body; // "online" | "offline" | "on_trip"
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!driver) return res.status(404).json({ error: "راننده پیدا نشد" });
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// به‌روزرسانی موقعیت لحظه‌ای راننده — الگوی کوئری #9
router.patch("/:id/location", async (req, res) => {
  try {
    const { lng, lat } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: { type: "Point", coordinates: [lng, lat] },
      },
      { new: true, runValidators: true }
    );
    if (!driver) return res.status(404).json({ error: "راننده پیدا نشد" });
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ⭐ پیدا کردن نزدیک‌ترین رانندگان آنلاین — الگوی کوئری #10 (مهم‌ترین کوئری سیستم)
// مثال درخواست: GET /drivers/nearby?lng=51.4&lat=35.7&maxDistance=3000
router.get("/nearby", async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ error: "lng و lat الزامی هستند" });
    }

    const drivers = await Driver.find({
      status: "online",
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).limit(10);

    res.json(drivers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// مشاهده تاریخچه سفرهای راننده و درآمد — الگوی کوئری #12
router.get("/:id/trips", async (req, res) => {
  try {
    const trips = await Trip.find({ driverId: req.params.id, status: "completed" })
      .sort({ createdAt: -1 });

    const totalEarnings = trips.reduce((sum, t) => sum + (t.fare || 0), 0);

    res.json({ trips, totalEarnings, count: trips.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
