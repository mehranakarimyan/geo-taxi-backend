const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Trip = require("../models/Trip");

// ثبت‌نام مسافر جدید — الگوی کوئری #1
router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// مشاهده پروفایل مسافر — الگوی کوئری #2
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "کاربر پیدا نشد" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// تاریخچه سفرهای یک مسافر — الگوی کوئری #5
router.get("/:id/trips", async (req, res) => {
  try {
    const trips = await Trip.find({ riderId: req.params.id })
      .sort({ createdAt: -1 })
      .populate("driverId", "name vehicle rating");
    res.json(trips);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
