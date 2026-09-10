const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/taxi_nosql";

  try {
    await mongoose.connect(uri);
    console.log(`✅ Connected to MongoDB: ${uri}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
