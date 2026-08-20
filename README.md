# DriveShare (CarSharePro) - Commercial Peer-to-Peer Car Rental Platform

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)

DriveShare (CarSharePro) is a peer-to-peer car sharing and private vehicle rental marketplace. It connects vehicle owners (hosts) looking to monetize their cars with verified drivers (renters) seeking short or long-term vehicle rentals.

---

## 🌟 Key Features

### 🚗 Renter Experience
- **Interactive Geospatial Map Search**: Real-time Leaflet map with 2dsphere spatial indexing, dynamic pin clustering, GPS "Near Me" radius filtering, and city search.
- **Detailed Vehicle Profiles**: Multiple high-resolution images, technical specs, fuel type, transmission, seating capacity, host ratings, and verified reviews.
- **Transparent Instant Pricing**: Automated calculation of daily rates, duration multipliers, platform commission fees, and total cost breakdown.
- **15-Minute Reservation Holds**: Temporary reservation locks preventing race conditions and double-booking while awaiting payment.
- **Direct Android APK & QR Download**: Instant mobile APK download directly from landing page hero, navbar, and footer with desktop camera QR code scanning.
- **UPI QR Payment & UTR Submission**: Seamless payment flow with generated UPI QR codes, deep-link intent launching for Google Pay/PhonePe/Paytm/BHIM, and 12-digit UTR tracking.
- **Digital Vehicle Inspection**: Pre-trip check-in and post-trip return inspection workflows with camera photo uploads and odometer recording.
- **KYC Verification**: Secure driving license upload with admin verification.
- **5-Star Rating & Reviews**: Post-trip feedback system for vehicles and hosts.

### 💼 Host / Owner Experience
- **Vehicle Listing Wizard**: Intuitive multi-step listing with location picking, photo gallery upload, and document compliance submissions (RC, Insurance, PUC).
- **Calendar & Availability Management**: Set custom availability date windows and block maintenance days.
- **Booking Management**: Real-time overview of incoming booking requests, active trips, and completed rentals.
- **Earnings & Payout Ledger**: Transparent financial dashboard detailing gross booking totals, platform commission deductions (15%), and net host payouts (85%).

### 🛡️ Admin Super-Dashboard
- **Vehicle Moderation**: Review pending car submissions, inspect uploaded compliance documents, and approve, reject, or block listings with mandatory reason tracking.
- **Payment Verification & Ledger**: Review submitted UTR transaction IDs with 1-click verification, instant booking status transition (`CONFIRMED`), and automated ledger booking.
- **KYC & User Moderation**: Review user profiles, inspect uploaded Driving License cards, and verify or suspend accounts.
- **Payout Management**: Track host payout balances, record bank/UPI transfer references, and export financial records to CSV.
- **Platform Analytics**: High-level metrics for revenue, active fleet, booking volume, and user growth.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Spring Boot 3.4.3, Java 17+, Spring Data MongoDB, Spring Security 6 |
| **Authentication** | Stateless JWT (JSON Web Token), BCrypt Password Hashing |
| **Frontend** | React 19, Vite 8, React Router v7, Context API, Vanilla CSS (Design Tokens) |
| **Database** | MongoDB 7.0 / MongoDB Atlas (2dsphere geospatial indexes) |
| **Mobile App** | Capacitor 8 (Cross-platform Android / iOS ready) |
| **Media Storage** | Cloudinary Cloud Storage |
| **Maps & Geo** | Leaflet, React-Leaflet, OpenStreetMap, Nominatim Geocoding |
| **Email Services** | Brevo HTTP API, Resend HTTP API, and Standard JavaMailSender SMTP |
| **Payments** | Dynamic UPI QR Code Generation (ZXing) + UTR Manual Verification |

---

## 📁 Source Code Organization

```text
├── carpvt/                          # Spring Boot Backend Project
│   ├── src/main/java/com/carrentalpvt/carpvt/
│   │   ├── config/                  # Security, Mongo, Cloudinary, Mail & Async configs
│   │   ├── controller/              # REST API Endpoints (Auth, Cars, Bookings, UPI, Admin)
│   │   ├── dto/                     # Request & Response Data Transfer Objects
│   │   ├── exception/               # Global Exception Handler & Custom Exceptions
│   │   ├── model/                   # MongoDB Documents & Entities (User, Car, Booking, Payment)
│   │   ├── repository/              # Spring Data Mongo Repositories
│   │   ├── security/                # JWT Token Filter & UserDetails Implementation
│   │   ├── service/                 # Business Logic & Third-Party Integrations
│   │   └── util/                    # Helper Utilities
│   ├── src/main/resources/
│   │   └── application.properties   # Parameterized Environment Properties
│   ├── pom.xml                      # Maven Build Configuration
│   └── mvnw / mvnw.cmd              # Maven Wrapper
│
├── frontend/                        # React + Vite Frontend Project
│   ├── src/
│   │   ├── assets/                  # SVG Icons & Static Media
│   │   ├── components/              # Reusable UI (Navbar, Footer, Maps, Modals, Cards)
│   │   ├── context/                 # AuthContext, ToastContext, NotificationContext
│   │   ├── pages/                   # Route Pages (Renter, Owner, Admin, Auth)
│   │   ├── services/                # Axios API Services (Auth, Cars, Bookings, Payments)
│   │   └── utils/                   # Formatters, Distance Calcs, Image Compressor
│   ├── android/                     # Capacitor Native Android Studio Project
│   ├── package.json                 # Node Dependencies & Build Scripts
│   └── vite.config.js               # Vite Configuration
│
├── database/                        # Database Architecture & Setup Guides
│   └── README.md                    # Step-by-step MongoDB Atlas setup guide
│
├── docs/                            # Setup Guides & Technical Documentation
│   ├── CLOUDINARY_SETUP.md          # Cloudinary Media Storage Setup
│   ├── EMAIL_SETUP.md               # SMTP, Brevo, and Resend Setup Guide
│   ├── PAYMENT_SETUP.md             # UPI QR Code & UTR Verification Guide
│   └── ANDROID_BUILD_GUIDE.md       # Android Studio & Gradle Build Instructions
│
├── scripts/                         # Automated Seeding & Test Utilities
│   ├── seed_fleet.mjs               # Seed fleet vehicles across Indian cities
│   ├── seed_reviews_and_bookings.mjs# Seed ratings and completed bookings
│   ├── seed_comprehensive_data.mjs  # Complete marketplace data populator
│   ├── test_backend.mjs             # End-to-end integration test runner
│   └── test_email_and_security.mjs  # Security & token audit test runner
│
├── .env.example                     # Master Environment Configuration Template
├── COMMERCIAL_SOURCE_CHECKLIST.md   # Commercial Source Code Release Checklist
└── README.md                        # Product Documentation (This file)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java 17 or 21** installed (`java -version`)
- **Node.js 18+** & **npm** installed (`node -v`)
- **MongoDB Atlas** database URI or local MongoDB running

---

### Step 1: Clone and Configure Environment

1. Copy `.env.example` to create your environment variables:
   ```bash
   cp .env.example carpvt/.env
   cp frontend/.env.example frontend/.env
   ```
2. Populate your MongoDB URI, JWT Secret, Cloudinary keys, and UPI ID in `carpvt/.env`.

---

### Step 2: Start the Backend

```bash
cd carpvt
./mvnw spring-boot:run
```
On Windows PowerShell:
```powershell
cd carpvt
.\mvnw.cmd spring-boot:run
```
Backend API will start at **http://localhost:8081**.

---

### Step 3: Start the Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend web application will start at **http://localhost:5173**.

---

### Step 4: Seed Sample Data (Optional)

In a separate terminal, populate vehicles and demo accounts:

```bash
node scripts/seed_fleet.mjs
```

---

## 📱 Building & Hosting the Android Application

To build the native Android APK and host it on the website for direct visitor downloads:

```bash
# 1. Build and sync web assets into Android project
cd frontend
npm run build
npx cap sync android

# 2. Build Debug APK via Gradle
cd android
./gradlew assembleDebug       # On Windows: .\gradlew.bat assembleDebug

# 3. Host APK for website downloads (/driveshare.apk)
cp app/build/outputs/apk/debug/app-debug.apk ../public/driveshare.apk
```

For detailed instructions, release Keystore signing, and Google Play release bundling, see [docs/ANDROID_BUILD_GUIDE.md](docs/ANDROID_BUILD_GUIDE.md).

---

## ⚙️ Environment Configuration Reference

| Variable | Purpose | Example Format | Required |
|---|---|---|---|
| `MONGODB_URI` | MongoDB Atlas / local connection string | `mongodb+srv://user:pwd@cluster.mongodb.net/car_rental` | **Yes** |
| `JWT_SECRET` | 256-bit cryptographic key for JWT tokens | `min_32_character_random_secret_string` | **Yes** |
| `FRONTEND_URL` | Public frontend URL for CORS & email links | `http://localhost:5173` or `https://app.com` | **Yes** |
| `PAYMENT_UPI_ID` | Virtual Payment Address receiving payments | `businessname@upi` | **Yes** |
| `PAYMENT_UPI_NAME`| Registered business name for UPI apps | `DriveShare Car Rental` | No |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud identifier | `your_cloud_name` | For uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` | For uploads |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` | For uploads |
| `MAIL_USERNAME` | SMTP Email username / Gmail address | `support@yourdomain.com` | For SMTP |
| `MAIL_PASSWORD` | SMTP Email password / Gmail App password | `16_char_app_password` | For SMTP |
| `BREVO_API_KEY` | Brevo HTTP REST API Key (Cloud safe) | `xkeysib-...` | Optional |
| `APP_INIT_DEMO_USERS` | Seed demo accounts on startup | `true` or `false` | Default: `false` |
| `VITE_API_BASE_URL` | Backend URL accessed from browser | `http://localhost:8081` | Frontend |

---

## 📖 Additional Documentation Guides

- 🗄️ [MongoDB Setup & Indexing Guide](database/README.md)
- ☁️ [Cloudinary Storage Setup Guide](docs/CLOUDINARY_SETUP.md)
- 📧 [Email Services (SMTP / Brevo / Resend) Guide](docs/EMAIL_SETUP.md)
- 💳 [UPI Payment & UTR Verification Guide](docs/PAYMENT_SETUP.md)
- 📱 [Android App Build & Deployment Guide](docs/ANDROID_BUILD_GUIDE.md)
- ✅ [Commercial Source Code Checklist](COMMERCIAL_SOURCE_CHECKLIST.md)

---

## 📄 License & Commercial Terms
Commercial source code license provided via SellMyCode.
