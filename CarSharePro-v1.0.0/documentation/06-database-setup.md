# 06 - Database Setup & MongoDB Atlas Configuration

## Option A: MongoDB Atlas Cloud Deployment (Recommended)

1. **Create Account**: Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Build Database**: Select the **M0 Shared (Free)** tier for testing, or **M10+ Dedicated** for high volume production.
3. **Add Database User**:
   - Go to **Database Access** -> **Add New Database User**.
   - Set Username (e.g. `driveshare_user`) and Password.
   - Choose `readWriteAnyDatabase` or `readWrite` on `car_rental`.
4. **Configure IP Access**:
   - Go to **Network Access** -> **Add IP Address**.
   - For web cloud deployments, enter `0.0.0.0/0` (Allow access from anywhere).
5. **Get Connection String**:
   - Go to **Clusters** -> **Connect** -> **Drivers**.
   - Copy connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/car_rental?retryWrites=true&w=majority`
6. **Set Environment Variable**:
   ```bash
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/car_rental?retryWrites=true&w=majority
   MONGODB_DATABASE=car_rental
   ```

---

## Option B: Local MongoDB Instance

Using Docker:
```bash
docker run -d --name mongo -p 27017:27017 -v mongo_data:/data/db mongo:7.0
```
Set in `.env`:
```bash
MONGODB_URI=mongodb://localhost:27017/car_rental
```

---

## Automated Indexes

Upon startup, Spring Boot automatically creates performance and geospatial indexes:
- `db.cars.createIndex({ coordinates: "2dsphere" })` for spatial proximity queries.
- `db.users.createIndex({ email: 1 }, { unique: true })`.
- Compound indexes on car availability windows and booking dates.
