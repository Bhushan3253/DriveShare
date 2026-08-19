# 19 - Frequently Asked Questions (FAQ)

### Q: Can I customize the platform commission percentage?
**A**: Yes. Platform commission is centrally calculated in `BookingService.java` (`PLATFORM_COMMISSION_PERCENT = 0.15` / 15%). You can adjust this value to your desired business model percentage.

### Q: Does the map integration require a paid Google Maps API key?
**A**: No. CarSharePro uses **Leaflet** with **OpenStreetMap** tiles and **Nominatim Geocoding**, which are completely free with zero monthly API billing fees.

### Q: How does the payment workflow operate without a payment gateway account?
**A**: The platform uses dynamic NPCI-standard UPI QR codes. Payments go directly to your merchant bank VPA without third-party aggregator transaction fees (0% gateway fee). The customer submits the banking UTR transaction reference, which the admin verifies in the dashboard with 1 click.

### Q: Can I run this on Docker / Kubernetes?
**A**: Yes. Production-ready `Dockerfile` and `nginx.conf` configurations are included in both `backend/` and `frontend/` directories.

### Q: Is the Android application natively integrated?
**A**: Yes. The mobile app uses **Capacitor 8** native runtime with full access to device GPS hardware, camera for KYC & pre-trip inspections, and native Android UPI deep-linking intents.
