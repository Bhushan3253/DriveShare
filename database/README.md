# MongoDB Database Setup Guide

This guide walks you through setting up a free or dedicated **MongoDB Atlas** cloud database or running a local MongoDB instance for the **DriveShare / CarSharePro** application.

---

## Option 1: MongoDB Atlas Cloud (Recommended for Production)

### Step 1: Create a MongoDB Atlas Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Sign up for a free account or log in.

### Step 2: Create a Cluster
1. Click **Create** or **Build a Database**.
2. Select the **M0 (Free)** shared tier for testing, or **M10+** for production.
3. Choose your preferred cloud provider (AWS, Google Cloud, or Azure) and nearest region.
4. Click **Create Deployment**.

### Step 3: Configure Database User
1. Navigate to **Database Access** under the Security section in the left sidebar.
2. Click **Add New Database User**.
3. Choose **Password** Authentication Method.
4. Enter a Username (e.g. `driveshare_db_user`) and a secure Password.
5. Under Database User Privileges, select **Read and write to any database** (or `readWrite` on `car_rental`).
6. Click **Add User**.

### Step 4: Configure Network Access (IP Whitelist)
1. Navigate to **Network Access** under Security.
2. Click **Add IP Address**.
3. For cloud deployments (Render, Heroku, Railway, AWS):
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
4. For local development only:
   - You can click **Add Current IP Address**.
5. Click **Confirm**.

### Step 5: Copy Connection String
1. Return to the **Database / Clusters** tab.
2. Click **Connect**.
3. Select **Drivers** (Java).
4. Copy the connection string format:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/car_rental?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with the credentials created in Step 3.
6. Ensure the database name in the path is `car_rental` (or your chosen database name).

### Step 6: Configure Environment Variables
Set the connection string in your backend `.env` or cloud environment settings:

```bash
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/car_rental?retryWrites=true&w=majority
MONGODB_DATABASE=car_rental
```

### Step 7: Start Backend & Verify Connection
Start the Spring Boot backend:

```bash
cd carpvt
./mvnw spring-boot:run
```

On successful startup, Spring Data MongoDB will connect and automatically generate compound indexes:
- 2dsphere geospatial indexes on vehicle coordinates (`coordinates: 2dsphere`)
- Unique indexes on user email
- Compound indexes on car availability windows and booking dates

---

## Option 2: Local MongoDB Setup

If running MongoDB locally using Docker or native MongoDB server:

### Run via Docker:
```bash
docker run -d --name mongodb -p 27017:27017 -v mongo_data:/data/db mongo:7.0
```

### Configure `.env`:
```bash
MONGODB_URI=mongodb://localhost:27017/car_rental
MONGODB_DATABASE=car_rental
```

---

## Seeding Sample Demo Data

To populate your freshly created database with sample fleet vehicles, reviews, and test accounts:

```bash
# Seed fleet vehicles across Indian cities
node scripts/seed_fleet.mjs

# Seed completed bookings and 5-star host reviews
node scripts/seed_reviews_and_bookings.mjs

# Or run the complete comprehensive seed script
node scripts/seed_comprehensive_data.mjs
```
