# CarSharePro – Car Rental & Peer-to-Peer Car Sharing Platform

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)

---

## 1. Overview
**CarSharePro** is a commercial full-stack web and mobile software solution designed for peer-to-peer car sharing and private vehicle rental agencies. The platform empowers vehicle owners (hosts) to list and monetize their vehicles while providing drivers (customers/renters) with seamless on-demand vehicle booking, interactive map discovery, dynamic UPI QR checkout, digital condition inspections, and verified reviews.

---

## 2. Features
- **Full-Stack Architecture**: Modern Spring Boot 3 Java backend coupled with a React 19 + Vite frontend and Capacitor Android application.
- **Geospatial Proximity Search**: Native 2dsphere spatial indexing with Haversine distance computations and GPS "Near Me" filtering.
- **15-Minute Reservation Locks**: Automatic reservation holds that prevent double booking while customers complete payment.
- **Zero-Gateway-Fee UPI Checkout**: Dynamic UPI QR code generation and 12-digit UTR submission with automated ledger entries.
- **Digital Vehicle Condition Audits**: Pre-trip check-in and post-trip return inspection photo capture with odometer readings.
- **Cloudinary CDN Storage**: High-speed image and document storage with client-side HTML5 canvas compression.
- **Comprehensive Admin Dashboard**: Full control over vehicle listings, KYC approvals, payment verifications, and financial payouts.

---

## 3. Customer Features
- Interactive geospatial map view with custom car markers and popups.
- City and address search powered by OpenStreetMap Nominatim.
- Filter catalog by price range, brand, body type (SUV, Sedan, Luxury, Electric), transmission, and fuel type.
- Transparent price estimation displaying daily rates, total duration, and 15% platform commission.
- Deep-link intent button to launch installed UPI apps (GPay, PhonePe, Paytm, BHIM).
- Digital pre-trip and return condition inspection uploads.
- Verified 5-star ratings and feedback reviews.
- Renter KYC verification portal with Driving License upload.

---

## 4. Owner Features
- Multi-step vehicle listing wizard with map pin locator.
- Cloudinary photo gallery and compliance document uploads (RC Book, Insurance, PUC).
- Custom availability calendar windows and maintenance blocking.
- Real-time booking overview with inspection photo review and 1-click completion.
- Transparent earnings ledger calculating gross revenue, platform fee (15%), and net payout (85%).

---

## 5. Admin Features
- System analytics: Gross platform revenue, active bookings, total fleet, registered users.
- Vehicle moderation pipeline: Inspect compliance documents; approve, reject, or block vehicles with mandatory reason tracking.
- Payment moderation: 1-click UTR verification, instant booking confirmation (`CONFIRMED`), and ledger recording.
- KYC moderation: Review customer driving licenses and approve/suspend user accounts.
- Payout ledger: Track host balances, record bank/UPI transfer references, and export data to CSV.

---

## 6. Payment Features
- Dynamic NPCI-standard UPI QR Code generation via ZXing library.
- Deep-link UPI app intent launching (`upi://pay?pa=...&pn=...&am=...`).
- Anti-duplicate UTR validation preventing duplicate transaction claims.
- 15-minute automatic reservation countdown release on unpaid holds.
- Automated 15% platform commission and 85% host payout calculation.

---

## 7. Technology Stack
- **Backend**: Spring Boot 3.4.3, Java 17+, Spring Data MongoDB, Spring Security 6, ZXing, Cloudinary SDK.
- **Frontend**: React 19, Vite 8, React Router v7, Context API, Lucide Icons, Leaflet / React-Leaflet.
- **Mobile**: Capacitor 8 (Cross-platform Android / iOS ready).
- **Database**: MongoDB 7.0 / MongoDB Atlas.
- **Media**: Cloudinary Cloud Storage.
- **Email**: Brevo HTTP REST API, Resend HTTP REST API, and JavaMailSender SMTP.

---

## 8. System Requirements
- **JDK**: OpenJDK 17 or 21 LTS (`java -version`).
- **Node.js**: Node.js v18.0.0+ and npm v9+ (`node -v`).
- **Database**: MongoDB Atlas account or local MongoDB 6.0+.
- **Android** (Optional): Android Studio Hedgehog+ and Android SDK API 34+.

---

## 9. Installation
1. Extract the package:
   ```bash
   unzip CarSharePro-v1.0.0.zip
   cd CarSharePro-v1.0.0
   ```
2. Configure backend environment:
   ```bash
   cp .env.example backend/.env
   ```
3. Configure frontend environment:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

---

## 10. Configuration
Review and populate `backend/.env`:
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: 256-bit secret key (min 32 characters).
- `FRONTEND_URL`: URL of the frontend (`http://localhost:5173`).
- `PAYMENT_UPI_ID`: Merchant UPI ID receiving payments.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Media storage credentials.

---

## 11. Database Setup
1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write permissions on `car_rental`.
3. Whitelist network IP (`0.0.0.0/0` for cloud deployment).
4. Set `MONGODB_URI` in `backend/.env`.
5. For complete setup steps, see `documentation/06-database-setup.md`.

---

## 12. Cloudinary Setup
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy Cloud Name, API Key, and API Secret from your dashboard.
3. Add to `backend/.env`.
4. For detailed storage pipeline documentation, see `documentation/08-cloudinary-setup.md`.

---

## 13. Email Setup
Configure one of the supported email options in `backend/.env`:
- **Gmail SMTP**: `MAIL_HOST=smtp.gmail.com`, `MAIL_USERNAME=...`, `MAIL_PASSWORD=16_char_app_password`.
- **Brevo API (Recommended for Cloud)**: `BREVO_API_KEY=xkeysib-...`.
- **Resend API**: `RESEND_API_KEY=re_...`.
- In local development, verification links print directly to the console if no email credentials are set.
- See `documentation/09-email-setup.md` for full guide.

---

## 14. Payment Setup
Configure your business UPI ID in `backend/.env`:
```bash
PAYMENT_UPI_ID=yourbusiness@upi
PAYMENT_UPI_NAME=DriveShare Car Rental
```
For deep-linking and UTR verification workflow details, see `documentation/11-payment-setup.md`.

---

## 15. Map Setup
CarSharePro utilizes **Leaflet** and **OpenStreetMap (OSM)** with **Nominatim Geocoding**. No API key or credit card setup is required. For customization, see `documentation/12-map-setup.md`.

---

## 16. Running Backend
```bash
cd backend
./mvnw spring-boot:run
```
On Windows:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
API runs at **http://localhost:8081**.

---

## 17. Running Frontend
```bash
cd frontend
npm install
npm run dev
```
Web app runs at **http://localhost:5173**.

---

## 18. Android Setup
```bash
cd frontend
npm run build
npx cap sync android
cd ../android
./gradlew assembleDebug
```
For Google Play release bundling and signing, see `documentation/ANDROID_BUILD_GUIDE.md`.

---

## 19. Demo Accounts
To seed initial demo accounts for instant testing, set `APP_INIT_DEMO_USERS=true` in `backend/.env`:
- **Admin**: `admin@driveshare.com` / `admin123`
- **Host**: `owner@driveshare.com` / `password123`
- **Renter**: `renter@driveshare.com` / `password123`

---

## 20. API Documentation
Comprehensive REST API documentation covering Auth, Cars, Bookings, UPI, Reviews, and Admin routes is available in `documentation/16-api-documentation.md`.

---

## 21. Production Deployment
- **Backend**: Deploy on Render, Railway, AWS EC2, or Docker container (`backend/Dockerfile`).
- **Frontend**: Deploy on Vercel, Netlify, or Nginx (`frontend/Dockerfile`).
- For complete production deployment walkthroughs, see `documentation/17-production-deployment.md`.

---

## 22. Troubleshooting
Common error resolutions for MongoDB timeouts, CORS headers, email ports, and Android SDK paths are documented in `documentation/18-troubleshooting.md`.

---

## 23. Support
For technical assistance, bug reports, and customization inquiries, contact support via your **SellMyCode** customer dashboard.

---

## 24. License
Source code is licensed under the **SellMyCode Commercial License** (Regular / Extended). See `LICENSE.txt` for terms and restrictions.

---

## 25. Changelog
See `CHANGELOG.md` for full release notes and version history.
