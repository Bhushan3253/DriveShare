# 13 - Admin Portal & Operations Setup

## Accessing the Admin Portal

1. **URL**: Navigate to `/admin` (e.g. `http://localhost:5173/admin`).
2. **Permissions**: Protected by `ROLE_ADMIN` check on frontend routes and Spring Security endpoint filter (`/api/admin/**`).

---

## Admin Modules

### 1. Admin Analytics Dashboard (`/admin`)
- Total platform revenue, active bookings, listed vehicles, registered users.
- Live recent activity feed.

### 2. Vehicle Moderation (`/admin/cars`)
- Filter vehicles by status (`ALL`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `BLOCKED`).
- Inspect vehicle photos and compliance documents (RC, Insurance, PUC).
- Approve listing or submit rejection reason.

### 3. Payment & UTR Verification (`/admin/utr`)
- Review submitted UTR reference numbers.
- Verify payment with 1 click to confirm bookings and record platform commission.
- Reject invalid or fraudulent UTR submissions with custom rejection reason.

### 4. KYC & User Management (`/admin/users`)
- View registered users and hosts.
- Inspect uploaded driving license cards.
- Approve KYC verification status or suspend accounts.

### 5. Host Payouts Ledger (`/admin/payouts`)
- View net host earnings across completed trips.
- Record UPI or bank transfer reference numbers to mark payouts as settled.
- Export payout records to CSV.
