# Changelog

All notable changes to the **CarSharePro** product package are documented in this file.

---

## [1.0.0] - 2026-08-19

### Initial Commercial Release

#### 🚗 Customer & Renter Experience
- **Geospatial Map Discovery**: Integrated Leaflet map with custom marker clustering and GPS "Near Me" radius filtering.
- **Vehicle Catalog & Filtering**: Search and filter by price range, body type (SUV, Sedan, Luxury, Electric), transmission, and fuel type.
- **Instant Booking Locks**: 15-minute temporary reservation lock preventing race conditions and double bookings.
- **UPI QR Payment Workflow**: Dynamic UPI QR code generation (ZXing), deep-link mobile intent launching, and 12-digit UTR submission.
- **Trip Condition Inspections**: Digital pre-trip check-in and post-trip return inspections with photo uploads and odometer recording.
- **Verified Reviews**: 5-star rating and comment system for vehicles and hosts.

#### 💼 Host & Vehicle Owner Portal
- **Vehicle Listing Wizard**: Multi-step car creation with interactive map location picker and photo galleries.
- **Compliance Submissions**: Cloudinary document upload pipeline for Registration Certificate (RC), Insurance, and Pollution (PUC) certificates.
- **Custom Availability Management**: Calendar windows for rental availability and maintenance blocks.
- **Host Earnings & Ledger**: Financial dashboard detailing gross booking totals, platform fee deductions (15%), and net host payouts (85%).

#### 🛡️ Admin Moderation Dashboard
- **Vehicle Moderation Pipeline**: Review pending vehicle listings, inspect uploaded documents, and approve, reject, or block listings with reason tracking.
- **UTR Payment Verification**: 1-click UTR verification automatically confirming bookings and recording ledger entries.
- **KYC User Management**: Driving license verification and account status moderation.
- **Payout Management**: Host payout balance tracking and CSV export.

#### 🛠️ Security, Architecture & Mobile
- **Stateless JWT Authentication**: Secure BCrypt password hashing and role-based endpoint protection (`ROLE_USER`, `ROLE_OWNER`, `ROLE_ADMIN`).
- **Cryptographic Email Verification**: SHA-256 hashed 30-minute verification tokens with 60-second rate limiting.
- **Multi-Tier Email Failover**: Asynchronous dispatching across Brevo HTTP API, Resend HTTP API, and SMTP.
- **Cloudinary Storage Pipeline**: Client-side canvas image compression and automated cloud asset management.
- **Capacitor 8 Android Application**: Cross-platform Android app with native camera, GPS, and UPI intent support.
- **Documentation**: 20 comprehensive markdown technical guides and setup walkthroughs.
