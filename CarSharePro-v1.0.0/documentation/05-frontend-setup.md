# 05 - Frontend Setup & Architecture

## Architecture Overview

The frontend is built using **React 19**, **Vite 8**, **React Router v7**, and modern responsive CSS design tokens.

```text
frontend/src/
├── assets/         # Branding icons, SVG illustrations
├── components/     # Reusable UI widgets
│   ├── booking/    # Inspection and review modals
│   ├── map/        # Leaflet map, location search, custom car icons
│   ├── Navbar.jsx  # Responsive top navigation with active badges
│   ├── Footer.jsx  # Platform footer
│   └── Loading.jsx # Custom spinners and skeleton loaders
├── context/        # React Context providers
│   ├── AuthContext.jsx         # User session, role tokens, login/logout
│   ├── ToastContext.jsx        # Non-blocking notification toasts
│   └── NotificationContext.jsx # Real-time alerts polling
├── pages/          # Application views
│   ├── renter/     # CarList, CarDetails, Booking, Payment, Profile, MyBookings
│   ├── owner/      # OwnerDashboard, MyCars, AddCar, EditCar, OwnerBookings, OwnerEarnings
│   ├── admin/      # AdminDashboard, AdminCars, AdminUTR, AdminUsers, AdminPayouts
│   ├── Home.jsx    # Hero landing page
│   ├── Login.jsx   # Authentication with quick demo selector
│   └── Register.jsx# Customer and host registration
├── services/       # Axios API client modules with JWT auto-injection
└── utils/          # Formatting, image compression, distance math
```

---

## Configuration (`.env`)

Create `frontend/.env`:

```bash
# Backend REST API endpoint accessible from the browser
VITE_API_BASE_URL=http://localhost:8081
```

---

## Development & Build Commands

### Install Dependencies
```bash
npm install
```

### Start Vite Dev Server (with HMR)
```bash
npm run dev
```

### Build Production Bundle
```bash
npm run build
```
Optimized static files are generated in `frontend/dist/` ready to be served by Nginx, Vercel, Netlify, or Cloudflare Pages.
