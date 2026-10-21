# 🚕 Geo-Taxi Backend

A NoSQL (MongoDB) backend for a ride-hailing system, designed around real query patterns rather than traditional normalization. Built with Node.js, Express, and Mongoose — featuring geospatial driver matching, a live operations dashboard, and a full trip lifecycle API.

> Built as part of a university internship project on NoSQL database design.

---

## ✨ Features

- **Geospatial driver matching** — find the nearest online drivers to any coordinate using MongoDB's `2dsphere` index and `$near` operator
- **Full trip lifecycle** — request → accept → start → complete / cancel, with automatic driver status sync
- **Live dispatch dashboard** — a real-time map view of drivers and recent trips, served directly from the API (no separate frontend build)
- **Schema designed around access patterns** — embedding vs. referencing decisions documented and justified (see [docs](./docs))
- **Seed script** — generates realistic test data (riders, drivers, trips, payments, ratings) with [Faker.js](https://fakerjs.dev/)

## 🖥️ Dashboard Preview

Run the app and visit `http://localhost:3000/dashboard/` to see:
- A dark, map-based console showing all drivers color-coded by status
- Click anywhere on the map to trigger a live `$near` geospatial query
- A live trip log and revenue/activity stats pulled straight from MongoDB

## 🏗️ Architecture

```
Client (Browser / Postman)
        │  HTTP
        ▼
Express Server (src/index.js)
        │
        ▼
Routes (src/routes/*) ──▶ Models (src/models/*) ──▶ MongoDB
```

Full architecture diagram and schema design rationale: [`docs/`](./docs)

## 📦 Tech Stack

| Technology | Role |
|---|---|
| Node.js | Server runtime |
| Express.js | REST API framework |
| MongoDB | Primary NoSQL database |
| Mongoose | Schema definition & query layer (ODM) |
| Leaflet.js | Dashboard map rendering |
| Faker.js | Test data generation |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string

### Setup

```bash
git clone https://github.com/mehranakarimyan/geo-taxi-backend.git
cd geo-taxi-backend
npm install
cp .env.example .env    # adjust MONGO_URI if needed
npm run seed             # populate the database with sample data
npm start
```

Then open:
- API: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard/`

## 📊 Data Model

Five core collections, designed around actual query patterns rather than relational normalization:

| Collection | Purpose |
|---|---|
| `users` | Riders |
| `drivers` | Drivers, including embedded vehicle info and live location |
| `trips` | Central entity of the system — trip lifecycle and status |
| `payments` | Payment transactions |
| `ratings` | Ratings and reviews |

### Embedding vs. Referencing

| Relationship | Choice | Why |
|---|---|---|
| Driver ↔ Vehicle | Embed | 1-to-1, always read together |
| User ↔ Trips | Reference | Unbounded 1-to-many; prevents document growth |
| Driver ↔ Trips | Reference | Needs independent querying from both sides |
| Trip ↔ Payment | Reference | Independent financial record, separate reporting |
| Trip ↔ Rating | Reference | Independent querying of reviews |
| `Driver.rating.avg` | Denormalized | Fast reads without aggregation on every request |

Full reasoning and query pattern analysis: see the [internship report](./docs).

## 🔌 API Reference

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/users` | Register a rider |
| GET | `/users/:id` | Get rider profile |
| GET | `/users/:id/trips` | Rider's trip history |

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/drivers` | List all drivers |
| POST | `/drivers` | Register a driver |
| PATCH | `/drivers/:id/status` | Update online/offline status |
| PATCH | `/drivers/:id/location` | Update live location |
| GET | `/drivers/nearby?lng=&lat=&maxDistance=` | ⭐ Find nearest online drivers (geospatial query) |
| GET | `/drivers/:id/trips` | Driver's trip history and earnings |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| GET | `/trips?limit=` | List recent trips |
| POST | `/trips` | Request a new trip |
| GET | `/trips/:id` | Trip details |
| PATCH | `/trips/:id/accept` | Driver accepts a trip |
| PATCH | `/trips/:id/start` | Start a trip |
| PATCH | `/trips/:id/complete` | Complete a trip and set fare |
| PATCH | `/trips/:id/cancel` | Cancel a trip |

### Payments & Ratings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments` | Record a payment |
| GET | `/payments/trip/:tripId` | Payments for a trip |
| POST | `/ratings` | Rate a driver |
| GET | `/ratings/driver/:driverId` | Reviews for a driver |

## 🔍 Key Query: Nearest Driver

```js
Driver.find({
  status: "online",
  currentLocation: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 5000 // meters
    }
  }
}).limit(10);
```

This relies on a `2dsphere` index on `drivers.currentLocation`, without which MongoDB would need to scan every document for each lookup.

## 📁 Project Structure

```
geo-taxi-backend/
├── src/
│   ├── config/db.js       # MongoDB connection
│   ├── models/              # Mongoose schemas
│   ├── routes/               # API endpoints
│   ├── scripts/seed.js      # Test data generator
│   └── index.js              # App entry point
├── public/index.html         # Live dispatch dashboard
├── docs/                      # Internship report & architecture diagram
├── .env.example
└── package.json
```

## 🎯 Scope

To keep focus on database design fundamentals, the following were intentionally left out: fare estimation, wallet/coupons, and in-app messaging. See the [report](./docs) for the full rationale.

## 📄 License

MIT
