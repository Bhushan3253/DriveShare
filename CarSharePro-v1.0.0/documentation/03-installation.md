# 03 - Quick Installation Guide

Follow these steps to unpack, configure, and launch CarSharePro on your machine.

---

## Step 1: Extract the Product Package

Extract `CarSharePro-v1.0.0.zip` to your chosen working directory:

```bash
unzip CarSharePro-v1.0.0.zip -d CarSharePro
cd CarSharePro
```

---

## Step 2: Configure Environment Variables

1. Create your backend environment configuration:
   ```bash
   cp .env.example backend/.env
   ```
2. Open `backend/.env` and enter your **MongoDB connection string**, **Cloudinary keys**, and **UPI ID**.
3. Create your frontend environment configuration:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

---

## Step 3: Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```
On Windows PowerShell:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
The REST API will start listening at **http://localhost:8081**.

---

## Step 4: Run the Frontend

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```
The web application will launch at **http://localhost:5173**.

---

## Step 5: (Optional) Seed Sample Vehicles

Open a third terminal window to seed demo accounts and vehicles:

```bash
node ../scripts/seed_fleet.mjs
```
