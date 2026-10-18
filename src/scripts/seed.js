require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const User = require("../models/User");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");
const Payment = require("../models/Payment");
const Rating = require("../models/Rating");

// محدوده تقریبی مختصات تهران، برای تولید داده‌ی واقع‌گرایانه
const TEHRAN_CENTER = { lng: 51.389, lat: 35.6892 };

function randomNearbyPoint(center, radiusDeg = 0.08) {
  return [
    center.lng + (Math.random() - 0.5) * radiusDeg,
    center.lat + (Math.random() - 0.5) * radiusDeg,
  ];
}

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/taxi_nosql";
  await mongoose.connect(uri);
  console.log("✅ Connected. Clearing old data...");

  await Promise.all([
    User.deleteMany({}),
    Driver.deleteMany({}),
    Trip.deleteMany({}),
    Payment.deleteMany({}),
    Rating.deleteMany({}),
  ]);

  // --- ساخت مسافران ---
  const users = [];
  for (let i = 0; i < 20; i++) {
    users.push({
      name: faker.person.fullName(),
      phone: faker.phone.number("09#########"),
      email: faker.internet.email(),
    });
  }
  const createdUsers = await User.insertMany(users);
  console.log(`✅ ${createdUsers.length} users created`);

  // --- ساخت رانندگان ---
  const drivers = [];
  for (let i = 0; i < 15; i++) {
    drivers.push({
      name: faker.person.fullName(),
      phone: faker.phone.number("09#########"),
      vehicle: {
        plateNumber: faker.vehicle.vrm(),
        model: faker.vehicle.model(),
        color: faker.vehicle.color(),
      },
      status: faker.helpers.arrayElement(["online", "offline"]),
      currentLocation: {
        type: "Point",
        coordinates: randomNearbyPoint(TEHRAN_CENTER),
      },
    });
  }
  const createdDrivers = await Driver.insertMany(drivers);
  console.log(`✅ ${createdDrivers.length} drivers created`);

  // --- ساخت سفرهای تکمیل‌شده با پرداخت و امتیاز ---
  const trips = [];
  for (let i = 0; i < 30; i++) {
    const rider = faker.helpers.arrayElement(createdUsers);
    const driver = faker.helpers.arrayElement(createdDrivers);
    const fare = faker.number.int({ min: 30000, max: 250000 });

    const trip = await Trip.create({
      riderId: rider._id,
      driverId: driver._id,
      status: "completed",
      origin: {
        type: "Point",
        coordinates: randomNearbyPoint(TEHRAN_CENTER),
        address: faker.location.streetAddress(),
      },
      destination: {
        type: "Point",
        coordinates: randomNearbyPoint(TEHRAN_CENTER),
        address: faker.location.streetAddress(),
      },
      fare,
      requestedAt: faker.date.recent({ days: 30 }),
      acceptedAt: faker.date.recent({ days: 30 }),
      startedAt: faker.date.recent({ days: 30 }),
      completedAt: faker.date.recent({ days: 30 }),
    });

    await Payment.create({
      tripId: trip._id,
      amount: fare,
      method: faker.helpers.arrayElement(["cash", "card"]),
      status: "paid",
      paidAt: trip.completedAt,
    });

    const score = faker.number.int({ min: 3, max: 5 });
    await Rating.create({
      tripId: trip._id,
      fromUserId: rider._id,
      toDriverId: driver._id,
      score,
      comment: faker.lorem.sentence(),
    });

    // آپدیت میانگین امتیاز راننده
    const d = await Driver.findById(driver._id);
    const newCount = d.rating.count + 1;
    d.rating.avg = (d.rating.avg * d.rating.count + score) / newCount;
    d.rating.count = newCount;
    await d.save();

    trips.push(trip);
  }
  console.log(`✅ ${trips.length} completed trips with payments & ratings created`);

  console.log("🎉 Seeding finished successfully");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
