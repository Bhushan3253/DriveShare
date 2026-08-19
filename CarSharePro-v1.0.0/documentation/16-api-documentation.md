# 16 - REST API Reference

All API requests accept and return `application/json`. Authenticated routes require an `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register customer or host account | No |
| `POST` | `/api/auth/login` | Authenticate and retrieve JWT token | No |
| `GET` | `/api/auth/verify-email?token={t}` | Verify email token and return JWT | No |
| `POST` | `/api/auth/resend-verification` | Resend verification email (60s cooldown) | No |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Set new password with reset token | No |

---

## 2. Vehicles Endpoints (`/api/cars`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/cars` | Get all approved and active vehicles | No |
| `GET` | `/api/cars/available` | Filter available cars by date/type/price | No |
| `GET` | `/api/cars/{id}` | Get car details by ID | No |
| `GET` | `/api/cars/nearby` | Discover cars within GPS radius | No |
| `POST` | `/api/cars` | Create new vehicle listing | Yes (Host) |
| `PUT` | `/api/cars/{id}` | Update vehicle specifications | Yes (Host) |
| `DELETE`| `/api/cars/{id}` | Delete unbooked vehicle | Yes (Host) |
| `POST` | `/api/cars/{id}/images` | Upload vehicle photo (Cloudinary) | Yes (Host) |
| `POST` | `/api/cars/{id}/documents/{type}`| Upload compliance doc (RC/Insurance/PUC)| Yes (Host) |

---

## 3. Availability Endpoints (`/api/availability`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/availability/{carId}` | Get active calendar windows | No |
| `POST` | `/api/availability/{carId}` | Add availability date range | Yes (Host) |
| `DELETE`| `/api/availability/{availId}` | Delete availability window | Yes (Host) |

---

## 4. Bookings Endpoints (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/bookings/calculate-price` | Calculate duration & platform fee | No |
| `POST` | `/api/bookings` | Create 15-minute reservation hold | Yes (Renter) |
| `GET` | `/api/bookings/my-bookings` | List logged-in renter bookings | Yes (Renter) |
| `GET` | `/api/bookings/owner-bookings` | List bookings on host vehicles | Yes (Host) |
| `PUT` | `/api/bookings/{id}/check-in` | Record pre-trip inspection | Yes (Renter) |
| `PUT` | `/api/bookings/{id}/start` | Start vehicle trip | Yes (Renter) |
| `PUT` | `/api/bookings/{id}/return` | Record return inspection | Yes (Renter) |
| `PUT` | `/api/bookings/{id}/complete` | Mark trip as completed | Yes (Host) |
| `PUT` | `/api/bookings/{id}/cancel` | Cancel reservation hold | Yes |

---

## 5. UPI Payment Endpoints (`/api/upi`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/upi/create?bookingId={id}` | Generate UPI QR code session | Yes (Renter) |
| `POST` | `/api/upi/{paymentId}/utr` | Submit 12-digit payment UTR | Yes (Renter) |
| `GET` | `/api/upi/admin/pending` | List pending UTR submissions | Yes (Admin) |
| `PUT` | `/api/upi/admin/{paymentId}/verify`| Approve payment & confirm booking | Yes (Admin) |
| `PUT` | `/api/upi/admin/{paymentId}/reject`| Reject payment with reason | Yes (Admin) |

---

## 6. Admin Endpoints (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Platform metrics & revenue summary | Yes (Admin) |
| `GET` | `/api/admin/cars` | Moderation vehicle fleet list | Yes (Admin) |
| `PUT` | `/api/admin/cars/{id}/approve`| Approve listing for public search | Yes (Admin) |
| `PUT` | `/api/admin/cars/{id}/reject` | Reject listing with reason | Yes (Admin) |
| `PUT` | `/api/admin/cars/{id}/block` | Block vehicle listing | Yes (Admin) |
| `GET` | `/api/admin/users` | List registered platform users | Yes (Admin) |
| `PUT` | `/api/admin/users/{id}/kyc/verify`| Approve Driving License KYC | Yes (Admin) |
| `GET` | `/api/admin/payouts` | Host financial payout ledger | Yes (Admin) |
| `PUT` | `/api/admin/payouts/{id}/process`| Mark payout as settled | Yes (Admin) |
