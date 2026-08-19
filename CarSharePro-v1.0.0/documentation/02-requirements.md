# 02 - System Requirements

## Hardware & Operating System Requirements

| Specification | Minimum | Recommended |
|---|---|---|
| **Operating System** | Windows 10/11, macOS 12+, Ubuntu 20.04+ / Linux | Any modern 64-bit OS |
| **RAM** | 4 GB | 8 GB+ (for concurrent backend, frontend, Android Studio) |
| **Disk Space** | 1 GB free | 5 GB+ (with Android SDK dependencies) |
| **Processor** | Dual-core 2.0 GHz | Quad-core 2.5 GHz+ |

---

## Software Dependencies

### 1. Java Development Kit (JDK)
- **Required**: OpenJDK or Oracle JDK 17 (or JDK 21 LTS).
- Check installation:
  ```bash
  java -version
  ```

### 2. Node.js & Package Manager
- **Required**: Node.js v18.0.0+ (v20+ recommended) and npm v9+.
- Check installation:
  ```bash
  node -v
  npm -v
  ```

### 3. Database
- **Required**: MongoDB 6.0+ (Local instance or free MongoDB Atlas Cloud cluster).

### 4. Android Development (Optional for Mobile APK builds)
- **Required**: Android Studio (Hedgehog or newer), Android SDK (API 34/35), Gradle 8+.
