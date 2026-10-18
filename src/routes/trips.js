const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const Driver = require("../models/Driver");

// لیست سفرهای اخیر — برای نمایش روی داشبورد
// مثال: GET /trips?limit=20
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const trips = await Trip.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("riderId", "name")
      .populate("driverId", "name");
    res.json(trips);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ثبت درخواست سفر جدید — الگوی کوئری #3 و #13
router.post("/", async (req, res) => {
  try {
    const { riderId, origin, destination } = req.body;
    const trip = await Trip.create({
      riderId,
      origin,
      destination,
      status: "requested",
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// مشاهده جزئیات یک سفر — الگوی کوئری #4 و #16
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("riderId", "name phone")
      .populate("driverId", "name phone vehicle");
    if (!trip) return res.status(404).json({ error: "سفر پیدا نشد" });
    res.json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// پذیرفتن سفر توسط راننده — الگوی کوئری #11 و #14
router.patch("/:id/accept", async (req, res) => {
  try {
    const { driverId } = req.body;

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { driverId, status: "accepted", acceptedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!trip) return res.status(404).json({ error: "سفر پیدا نشد" });

    await Driver.findByIdAndUpdate(driverId, { status: "on_trip" });

    res.json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// شروع سفر — الگوی کوئری #14
router.patch("/:id/start", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "in_progress", startedAt: new Date() },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: "سفر پیدا نشد" });
    res.json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// پایان سفر و ثبت هزینه نهایی — الگوی کوئری #14 و #15
router.patch("/:id/complete", async (req, res) => {
  try {
    const { fare } = req.body;

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "completed", completedAt: new Date(), fare },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: "سفر پیدا نشد" });

    if (trip.driverId) {
      await Driver.findByIdAndUpdate(trip.driverId, { status: "online" });
    }

    res.json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// لغو سفر
router.patch("/:id/cancel", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: "سفر پیدا نشد" });

    if (trip.driverId) {
      await Driver.findByIdAndUpdate(trip.driverId, { status: "online" });
    }

    res.json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
