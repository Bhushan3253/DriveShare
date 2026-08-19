# MongoDB Database Architecture & Setup Guide

This directory contains the database setup instructions and safe sample dataset for **CarSharePro / DriveShare**.

---

## 🗄️ Database Collections

The application uses MongoDB (Atlas Cloud or Local MongoDB 7.0+) with the following collections:

1. **`users`**: Renter, Host/Owner, and Admin accounts. Passwords hashed using BCrypt.
2. **`cars`**: Vehicle listings, specs, hourly/daily pricing, moderation status (`APPROVED`, `PENDING_APPROVAL`, `REJECTED`, `BLOCKED`), and 2dsphere GeoJSON location coordinates.
3. **`car_availabilities`**: Host calendar availability windows (`startDate`, `endDate`).
4. **`bookings`**: Rental reservations, 15-minute lock timestamps (`expiresAt`), lifecycle states (`PENDING_PAYMENT`, `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS`, `RETURNED`, `COMPLETED`, `CANCELLED`).
5. **`payments`**: UPI payment sessions, transaction amounts, generated QR URIs, submitted 12-digit UTR numbers, verification statuses (`PENDING`, `PENDING_VERIFICATION`, `SUCCESS`, `REJECTED`), and verifying admin ID.
6. **`reviews`**: Verified renter reviews with 5-star ratings for vehicles and hosts.
7. **`transactions`**: Financial accounting ledger tracking booking gross, 15% platform commission, and 85% host net payout.
8. **`payouts`**: Host payout records and payment transfer references.
9. **`notifications`**: Real-time user and host alert notifications.
10. **`email_verification_tokens`**: SHA-256 hashed cryptographic tokens with automated 30-minute expiry TTL.

---

## 🚀 Setting Up MongoDB Atlas (Step-by-Step)

### Step 1: Create MongoDB Atlas Cluster
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (`M0 Sandbox`) or dedicated production cluster.
3. Select your cloud provider (AWS / GCP / Azure) and region.

### Step 2: Configure Database User
1. Under **Security** -> **Database Access**, click **Add New Database User**.
2. Select **Password** authentication.
3. Create a username (e.g. `driveshare_admin`) and secure password.
4. Set privileges to `readWriteAnyDatabase` or `readWrite` on `car_rental`.

### Step 3: Network Whitelist
1. Under **Security** -> **Network Access**, click **Add IP Address**.
2. For cloud hosting (Render, Railway, AWS, Heroku, Docker), select **Allow Access from Anywhere** (`0.0.0.0/0`).
3. Click **Confirm**.

### Step 4: Add Connection String to Environment
1. Click **Connect** -> **Drivers** (Java).
2. Set your `MONGODB_URI` environment variable:
   ```bash
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/car_rental?retryWrites=true&w=majority
   MONGODB_DATABASE=car_rental
   ```

---

## 📦 Sample Data

Safe sample data files are provided in `database/sample-data/`:
- `sample-cars.json` — 10 detailed vehicle listings across Indian metro cities with verified Unsplash images and coordinates.
- `sample-users.json` — Demo accounts for testing (Admin, Superhost, Verified Renter).
- `sample-reviews.json` — 5-star ratings and authentic feedback.

To seed your running instance via API:
```bash
node scripts/seed_comprehensive_data.mjs
```
