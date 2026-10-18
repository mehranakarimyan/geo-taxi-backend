const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

// ثبت تراکنش پرداخت بعد از پایان سفر — الگوی کوئری #17
router.post("/", async (req, res) => {
  try {
    const { tripId, amount, method } = req.body;
    const payment = await Payment.create({
      tripId,
      amount,
      method,
      status: "paid",
      paidAt: new Date(),
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// مشاهده تاریخچه پرداخت‌های یک سفر — الگوی کوئری #18
router.get("/trip/:tripId", async (req, res) => {
  try {
    const payments = await Payment.find({ tripId: req.params.tripId });
    res.json(payments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
