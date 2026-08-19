# 11 - UPI Payment Workflow & Verification

## Dynamic UPI QR Code & UTR Verification Architecture

CarSharePro features a native **UPI QR Code + Unique Transaction Reference (UTR)** verification payment system.

---

## Configuration

In `backend/.env`:
```bash
PAYMENT_UPI_ID=yourbusiness@upi
PAYMENT_UPI_NAME=DriveShare Car Rental
```

---

## End-to-End Workflow

1. **15-Minute Reservation Lock**:
   - When a renter clicks "Book Now", the backend creates a booking in `PENDING_PAYMENT` state with a 15-minute expiration countdown timer.
2. **Dynamic QR Code Generation**:
   - Spring Boot backend dynamically creates an official NPCI UPI Deep Link URI:
     `upi://pay?pa={PAYMENT_UPI_ID}&pn={PAYMENT_UPI_NAME}&am={totalAmount}&cu=INR&tn=Car+Rental+Booking+{id}`
   - The backend uses ZXing library to convert the URI into a high-definition PNG QR Code (Base64) delivered directly in the API response.
3. **Seamless Mobile App Intent Launching**:
   - Mobile users can click the "Open in Installed UPI App" button to deep-link directly into GPay, PhonePe, Paytm, or BHIM with payee, amount, and reference pre-filled.
4. **UTR Submission**:
   - The renter completes the transfer in their banking app and enters the 12-digit UTR (Unique Transaction Reference) number into the form.
   - The backend checks for duplicate UTR submissions across the database to prevent duplicate claims.
5. **Admin Approval & Accounting Ledger**:
   - The submitted payment appears immediately on the Admin UTR Dashboard (`/admin/utr`).
   - On approval, the booking status transitions to `CONFIRMED`, payment becomes `PAID`, platform commission (15%) and host earnings (85%) are booked to the financial ledger, and notifications are sent to renter and host.
