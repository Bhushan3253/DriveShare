# 18 - Troubleshooting Guide

Common issues, diagnostics, and solutions:

---

## 1. MongoDB Connection Refused / Timeout
- **Symptom**: `com.mongodb.MongoTimeoutException: Timed out after 30000 ms`
- **Cause**: IP address not whitelisted in MongoDB Atlas.
- **Solution**: Go to MongoDB Atlas -> **Network Access** -> **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)**.

---

## 2. CORS Policy Error in Browser
- **Symptom**: `Access to XMLHttpRequest at 'http://localhost:8081' from origin 'http://localhost:5173' has been blocked by CORS policy`
- **Cause**: Backend `FRONTEND_URL` does not match the frontend's active domain.
- **Solution**: Set `FRONTEND_URL=http://localhost:5173` (or your production frontend domain) in `backend/.env`.

---

## 3. Cloudinary Upload Fails
- **Symptom**: `Failed to upload image to Cloudinary: Must supply api_key`
- **Cause**: Missing or incorrect Cloudinary credentials.
- **Solution**: Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `backend/.env`.

---

## 4. Verification Emails Not Received
- **Symptom**: Registration succeeds but email does not arrive.
- **Diagnosis**:
  - Check Spring Boot console output. In dev mode, the link is logged directly: `🔗 VERIFICATION LINK: http://localhost:5173/verify-email?token=...`
  - For Gmail SMTP: Ensure 2-Factor Authentication is ON and you are using a 16-character **App Password**, not your main account password.
  - For Cloud hosts (Render/AWS): Standard SMTP ports (587) may be blocked. Use **Brevo HTTP API** (`BREVO_API_KEY`) over port 443.

---

## 5. Android Gradle SDK Not Found
- **Symptom**: `SDK location not found. Define a valid SDK location...`
- **Solution**: Open `android/` directly in Android Studio, or define the environment variable:
  ```powershell
  $env:ANDROID_HOME="C:\Users\username\AppData\Local\Android\Sdk"
  ```
