# 10 - Token & Email Verification Lifecycle

## Cryptographic Token Lifecycle

CarSharePro uses an industry-standard secure token verification workflow for account activation:

1. **Token Generation**: On registration, a 32-byte cryptographically secure random token is generated.
2. **SHA-256 Hashing**: The token is hashed with SHA-256 before storage in MongoDB (`email_verification_tokens` collection). Even if the database were compromised, the raw verification token cannot be extracted.
3. **Time-To-Live (TTL)**: Tokens automatically expire after **30 minutes**.
4. **Rate Limiting**: The `/api/auth/resend-verification` endpoint enforces a **60-second cooldown** per email address to protect against spam and mail flood abuse.
5. **Instant Login on Verification**: When the customer opens the verification link (`/verify-email?token=...`), the token is validated, the user's `emailVerified` flag is set to `true`, a fresh JWT token is issued, and the user is automatically logged in.

---

## Direct Activation in Dev Mode

When `APP_INIT_DEMO_USERS=true`, the seeded accounts (`admin@driveshare.com`, `renter@driveshare.com`, `owner@driveshare.com`) are initialized with `emailVerified = true` for instant testing.
