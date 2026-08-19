# 08 - Cloudinary Media Storage Setup

## Overview

CarSharePro uses **Cloudinary** for secure, CDN-accelerated media storage. Cloudinary manages:
- Vehicle listing photos & cover pictures
- Host compliance documents (RC Book, Insurance, PUC)
- Renter KYC Driving License identification
- Pre-trip check-in & post-trip return inspection condition photos

---

## Step-by-Step Setup

1. **Register**: Create a free account at [cloudinary.com](https://cloudinary.com).
2. **Dashboard**: Navigate to the [Cloudinary Console Dashboard](https://console.cloudinary.com/).
3. **Copy Credentials**:
   - Cloud Name
   - API Key
   - API Secret
4. **Configure in `.env`**:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## Client-Side Image Compression

Before sending files over HTTP, the frontend automatically compresses and optimizes image dimensions using HTML5 Canvas (`src/utils/imageCompressor.js`):
- Max width: 1600px
- Max height: 1200px
- JPEG Quality: 0.82
- Reduces 10MB mobile camera photos to ~300KB before uploading to Cloudinary, ensuring lightning-fast uploads even on mobile connections.
