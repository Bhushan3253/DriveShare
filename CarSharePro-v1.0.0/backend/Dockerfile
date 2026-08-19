# Stage 1: Build JAR using Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build package skipping tests for production image
RUN mvn clean package -DskipTests

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081

# Optimize JVM memory flags for container environments
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
