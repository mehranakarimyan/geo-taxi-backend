const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");
const Driver = require("../models/Driver");

// ثبت امتیاز مسافر به راننده — الگوی کوئری #6 و #19
router.post("/", async (req, res) => {
  try {
    const { tripId, fromUserId, toDriverId, score, comment } = req.body;

    const rating = await Rating.create({
      tripId,
      fromUserId,
      toDriverId,
      score,
      comment,
    });

    // به‌روزرسانی میانگین امتیاز راننده (denormalization کنترل‌شده
    // که در طراحی مرحله ۲ توضیح داده شد؛ برای خوندن سریع بدون aggregate)
    const driver = await Driver.findById(toDriverId);
    const newCount = driver.rating.count + 1;
    const newAvg =
      (driver.rating.avg * driver.rating.count + score) / newCount;

    driver.rating = { avg: newAvg, count: newCount };
    await driver.save();

    res.status(201).json(rating);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// مشاهده همه نظرات یک راننده — الگوی کوئری #20
router.get("/driver/:driverId", async (req, res) => {
  try {
    const ratings = await Rating.find({ toDriverId: req.params.driverId })
      .sort({ createdAt: -1 })
      .populate("fromUserId", "name");
    res.json(ratings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
