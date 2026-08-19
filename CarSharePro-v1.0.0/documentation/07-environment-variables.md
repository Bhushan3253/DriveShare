# 07 - Environment Variables Reference

This document provides a comprehensive reference for all configuration variables used across the backend and frontend.

---

## Backend Environment Variables (`backend/.env` or Server Environment)

| Variable | Description | Example / Format | Required | Default (if unset) |
|---|---|---|---|---|
| `PORT` | Spring Boot HTTP listening port | `8081` | No | `8081` |
| `FRONTEND_URL` | Public frontend URL for CORS & email verification links | `http://localhost:5173` or `https://app.com` | **Yes** | `http://localhost:5173` |
| `APP_INIT_DEMO_USERS` | Seed initial demo accounts (admin, renter, owner) on boot | `true` or `false` | No | `false` |
| `MONGODB_URI` | MongoDB Atlas or local MongoDB connection URI | `mongodb+srv://user:pwd@cluster.mongodb.net/car_rental` | **Yes** | `mongodb://localhost:27017/car_rental` |
| `MONGODB_DATABASE` | Database collection root name | `car_rental` | No | `car_rental` |
| `JWT_SECRET` | 256-bit secret key for HMAC-SHA256 JWT tokens | `minimum_32_characters_random_string` | **Yes** | Placeholder |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `your_cloud_name` | **Yes** (for uploads) | Empty |
| `CLOUDINARY_API_KEY` | Cloudinary account API key | `123456789012345` | **Yes** (for uploads) | Empty |
| `CLOUDINARY_API_SECRET` | Cloudinary account API secret | `your_api_secret` | **Yes** (for uploads) | Empty |
| `PAYMENT_UPI_ID` | Virtual Payment Address (VPA) receiving customer UPI payments | `businessname@upi` | **Yes** (for UPI) | `your-business-vpa@upi` |
| `PAYMENT_UPI_NAME` | Payee display name in customer UPI apps | `Car Rental Services` | No | `Car Rental Services` |
| `MAIL_HOST` | SMTP server hostname | `smtp.gmail.com` | No | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP server port | `587` | No | `587` |
| `MAIL_USERNAME` | SMTP account username / email address | `support@yourdomain.com` | No | Empty |
| `MAIL_PASSWORD` | SMTP password / Gmail 16-character App Password | `abcdefghijklmnop` | No | Empty |
| `MAIL_FROM` | Outgoing email sender header | `no-reply@yourdomain.com` | No | `no-reply@driveshare.com` |
| `BREVO_API_KEY` | Brevo (Sendinblue) HTTP API Key (Cloud safe) | `xkeysib-...` | No | Empty |
| `RESEND_API_KEY` | Resend HTTP API Key (Cloud safe) | `re_...` | No | Empty |

---

## Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Example / Format | Required | Default |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend REST API accessible from the user's browser | `http://localhost:8081` or `https://api.yourdomain.com` | **Yes** | `http://localhost:8081` |
