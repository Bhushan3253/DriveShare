# 04 - Backend Setup & Architecture

## Architecture Overview

The backend is built with **Spring Boot 3.4.3** and **Java 17**, following clean layered domain-driven design:

```text
com.carrentalpvt.carpvt
├── config/       # Spring Security, CORS, MongoTemplate, Cloudinary, Mail, TaskExecutor
├── controller/   # REST Controllers (Auth, Car, Booking, Payment, User, Admin, Review)
├── dto/          # Input requests and JSON response transfer objects
├── exception/    # GlobalExceptionHandler and custom runtime exceptions
├── model/        # MongoDB document models (@Document, @Indexed, GeoJsonPoint)
├── repository/   # Spring Data Mongo repositories
├── security/     # JWT authentication filter and UserDetails token provider
├── service/      # Business logic services (Auth, Booking, UPI Payment, Cloudinary, Email)
└── util/         # Geolocation distance and QR code generation utilities
```

---

## Configuration Properties (`application.properties`)

All settings are environment-variable backed with sensible fallback defaults:

- `spring.data.mongodb.uri`: Database connection string (`${MONGODB_URI}`)
- `server.port`: HTTP server port (`${PORT:8081}`)
- `jwt.secret`: Cryptographic key for token signing (`${JWT_SECRET}`)
- `app.frontend.url`: Allowed CORS origins and redirect target (`${FRONTEND_URL}`)
- `payment.upi.id`: Merchant Virtual Payment Address (`${PAYMENT_UPI_ID}`)
- `cloudinary.cloud-name`: Cloudinary storage account (`${CLOUDINARY_CLOUD_NAME}`)
- `spring.mail.host`: SMTP server host (`${MAIL_HOST}`)

---

## Build & Test Commands

### Compile & Run Tests
```bash
./mvnw clean test
```

### Run in Development Mode
```bash
./mvnw spring-boot:run
```

### Build Production Executable JAR
```bash
./mvnw clean package -DskipTests
```
The output JAR is generated at `target/carpvt-0.0.1-SNAPSHOT.jar`.

### Run Production JAR
```bash
java -jar target/carpvt-0.0.1-SNAPSHOT.jar
```
