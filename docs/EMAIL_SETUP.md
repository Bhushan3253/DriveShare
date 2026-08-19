# Email Service Setup Guide

The DriveShare backend includes a resilient multi-tier email delivery architecture with automatic failover across 3 providers:
1. **Brevo (Sendinblue) HTTP API** (Port 443 HTTPS - Cloud Safe)
2. **Resend HTTP API** (Port 443 HTTPS - Cloud Safe)
3. **Standard SMTP / JavaMailSender** (e.g. Gmail App Passwords, SendGrid, Amazon SES)
4. **Console Diagnostic Logger** (Fallback in dev mode if no credentials configured)

---

## Option 1: Gmail SMTP Setup (Free & Easy)

To send verification emails using a Gmail address:

### Step 1: Enable 2-Step Verification
1. Open your [Google Account Security Settings](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned ON.

### Step 2: Generate an App Password
1. In the search bar at the top of your Google Account, search for **App passwords**.
2. Enter an app name (e.g. `DriveShare Backend`).
3. Click **Create**.
4. Copy the generated 16-character password (e.g. `abcd efgh ijkl mnop`).

### Step 3: Configure `.env`
```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=abcdefghijklmnop
MAIL_FROM=no-reply@yourdomain.com
```

---

## Option 2: Brevo HTTP REST API (Recommended for Cloud Hosting)

Some cloud hosting platforms (such as Render, DigitalOcean, or AWS EC2) restrict or block outgoing SMTP ports 25, 465, and 587. Brevo HTTP API operates over port 443 (HTTPS) and delivers reliably anywhere.

### Step 1: Create a Free Brevo Account
1. Visit [Brevo (Sendinblue)](https://www.brevo.com/) and register.
2. Verify your sender email address.

### Step 2: Get API Key
1. Go to **SMTP & API** -> **API Keys**.
2. Generate a new API Key (v3).

### Step 3: Configure `.env`
```bash
BREVO_API_KEY=xkeysib-your_brevo_api_key_here
BREVO_SENDER_EMAIL=your-verified-email@yourdomain.com
BREVO_SENDER_NAME=DriveShare Car Rental
```

---

## Option 3: Resend HTTP REST API

1. Visit [Resend](https://resend.com/) and create an API Key.
2. Configure `.env`:
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM=DriveShare <onboarding@resend.dev>
   ```

---

## Email Verification Token Lifecycle

- On registration, a cryptographically secure 32-byte hexadecimal token is generated.
- The SHA-256 hash of the token is persisted in MongoDB with a **30-minute expiry TTL**.
- Verification link format: `${FRONTEND_URL}/verify-email?token=${rawToken}`
- Rate limiting prevents resending verification emails more frequently than once every 60 seconds.
- In local development mode, if SMTP is not configured, the direct verification URL is automatically printed to the Spring Boot console logs for rapid zero-setup testing.
