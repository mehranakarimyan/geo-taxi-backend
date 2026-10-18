require("dotenv").config();
const path = require("path");
const express = require("express");
const connectDB = require("./config/db");

const userRoutes = require("./routes/users");
const driverRoutes = require("./routes/drivers");
const tripRoutes = require("./routes/trips");
const paymentRoutes = require("./routes/payments");
const ratingRoutes = require("./routes/ratings");

const app = express();
app.use(express.json());

// اتصال به دیتابیس
connectDB();

// سرو کردن داشبورد بصری (فایل‌های استاتیک داخل پوشه‌ی public)
// در دسترس روی: http://localhost:3000/dashboard/
app.use("/dashboard", express.static(path.join(__dirname, "..", "public")));

// مسیر سلامت سرور
app.get("/", (req, res) => {
  res.json({ message: "🚕 Taxi NoSQL API is running", dashboard: "/dashboard" });
});

// وصل کردن روت‌ها
app.use("/users", userRoutes);
app.use("/drivers", driverRoutes);
app.use("/trips", tripRoutes);
app.use("/payments", paymentRoutes);
app.use("/ratings", ratingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard/`);
});
