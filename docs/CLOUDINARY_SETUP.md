# Cloudinary Storage Configuration Guide

DriveShare uses **Cloudinary** for scalable, secure cloud media storage including:
- Host car photo galleries
- Vehicle compliance documents (RC, Insurance, PUC)
- Renter KYC Driving License uploads
- Pre-trip check-in and post-trip return inspection condition photos

---

## Step 1: Create a Free Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/users/register_free).
2. Sign up for the free tier (includes 25 GB managed storage and 25 monthly credits).

---

## Step 2: Retrieve API Credentials
1. Log in to the [Cloudinary Console Dashboard](https://console.cloudinary.com/).
2. On your **Dashboard / Product Environment**, copy the following three values:
   - **Cloud Name** (e.g. `driveshare-media`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `abcde12345-uvwxyz_EXAMPLE`)

---

## Step 3: Configure Backend Environment Variables
Add your credentials to your backend `.env` file or cloud platform environment variables:

```bash
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## Architecture & Storage Flow

1. **Client-side Compression**: The frontend utilizes modern HTML5 Canvas image compression (`src/utils/imageCompressor.js`) before sending files over the wire, optimizing bandwidth and upload speeds.
2. **Spring Boot Controller**: Endpoints (`POST /api/cars/{id}/images`, `POST /api/cars/{id}/documents/{docType}`, `POST /api/users/kyc/driving-license`, `POST /api/bookings/{id}/inspection-photo`) receive the multipart upload and invoke `CloudinaryService`.
3. **Cloud Folders Organized by Entity**:
   - `car_rentals/cars/` -> Car exterior/interior photos
   - `car_rentals/documents/` -> RC, Insurance, and PUC certificate PDFs/images
   - `car_rentals/kyc/` -> Renter Driving License identification cards
   - `car_rentals/inspections/` -> Pre-trip and post-trip condition inspection photos
4. **Automated Destruction on Replacement**: When a user or owner deletes or updates a document or photo, `CloudinaryService.deleteImage(publicId)` automatically destroys the old asset on Cloudinary to prevent orphaned storage accumulation.
