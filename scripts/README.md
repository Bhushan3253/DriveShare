# DriveShare / CarSharePro - Seed & Testing Scripts

This directory contains automated Node.js scripts to seed sample data and run end-to-end integration tests against your running backend API.

---

## Prerequisites

Node.js (v18+) is required to execute ES Module (`.mjs`) scripts:

```bash
# Verify Node version
node -v
```

---

## Available Scripts

### 1. Seed Fleet Vehicles (`seed_fleet.mjs`)
Registers sample hosts and populates high-quality vehicle listings across multiple cities (Mumbai, Bengaluru, Delhi NCR, Pune, Goa, Hyderabad) with Unsplash automotive photography, geolocation coordinates, and availability calendars.

```bash
# Default (http://localhost:8081)
node scripts/seed_fleet.mjs

# Custom API URL
API_URL=https://api.yourdomain.com node scripts/seed_fleet.mjs
```

### 2. Seed Reviews & Bookings (`seed_reviews_and_bookings.mjs`)
Generates sample completed bookings and verified renter reviews with 5-star ratings and feedback.

```bash
node scripts/seed_reviews_and_bookings.mjs
```

### 3. Comprehensive Database Seeding (`seed_comprehensive_data.mjs`)
Complete seeding script that sets up owners, cars, bookings, reviews, notifications, and transactions in a single command.

```bash
node scripts/seed_comprehensive_data.mjs
```

### 4. End-to-End Integration Scan (`test_backend.mjs`)
Executes a 7-step automated test verifying:
1. Frontend connectivity
2. Backend API availability
3. Host registration & authentication
4. Vehicle listing creation
5. Availability window assignment
6. Admin approval workflow
7. Renter reservation, UPI QR generation & UTR submission

```bash
node scripts/test_backend.mjs
```

### 5. Email & Security Verification (`test_email_and_security.mjs`)
Tests user registration, cryptographic token generation, verification workflow, rate limiting, and JWT token protection.

```bash
node scripts/test_email_and_security.mjs
```
