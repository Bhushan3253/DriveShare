# CarSharePro - Product Screenshots & Visual Assets

This directory outlines the key user journeys and UI interfaces of **CarSharePro / DriveShare** for marketing and product demonstration.

---

## Screenshot Inventory & Screen Index

| File Name | Screen Description | Route / Location |
|---|---|---|
| `01-home.png` | Hero landing page, featured vehicles, category pills, trust badges | `/` |
| `02-car-listing.png` | Vehicle catalog with filter sidebar (Price, Brand, Type, Fuel, Transmission) | `/cars` |
| `03-map.png` | Interactive Leaflet geospatial map with car pin markers & popups | `/cars?view=map` |
| `04-car-details.png` | Vehicle profile with photo gallery, specs, host rating, and reviews | `/cars/:id` |
| `05-booking.png` | Reservation summary, date selector, 15-minute countdown timer | `/cars/:id` |
| `06-payment.png` | Dynamic UPI QR code modal, timer, copyable VPA, and UTR input | `/payment/:bookingId` |
| `07-customer-dashboard.png` | Customer trip management, inspection records, review submission | `/my-bookings` |
| `08-owner-dashboard.png` | Host fleet manager, active bookings, availability windows | `/owner/dashboard` |
| `09-add-car.png` | Vehicle listing wizard with map location picker & document uploads | `/owner/cars/add` |
| `10-owner-earnings.png` | Host financial earnings breakdown, 15% platform commission ledger | `/owner/earnings` |
| `11-admin-dashboard.png` | Admin super-dashboard, vehicle moderation, 1-click UTR verification | `/admin` |
| `12-mobile.png` | Responsive mobile web & native Android application views | Mobile / Capacitor |

---

## Capturing Fresh Screenshots

To capture high-resolution screenshots of the running platform:
1. Start Backend: `cd backend && ./mvnw spring-boot:run`
2. Start Frontend: `cd frontend && npm run dev`
3. Seed Demo Data: `node scripts/seed_comprehensive_data.mjs`
4. Use your browser's responsive design mode (1920x1080 for desktop, 390x844 for mobile) or automated screenshot tools to save assets into this directory.
