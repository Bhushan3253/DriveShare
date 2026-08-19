package com.carrentalpvt.carpvt.config;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);
    private static final String DEFAULT_URI = "mongodb://localhost:27017/car_rental";

    @Value("${spring.data.mongodb.uri:mongodb://localhost:27017/car_rental}")
    private String rawMongoUri;

    @Value("${spring.data.mongodb.database:car_rental}")
    private String database;

    @Bean
    public MongoClient mongoClient() {
        String cleanUri = getCleanConnectionString(rawMongoUri);
        log.info("🔌 Initializing MongoDB connection (Scheme: {})",
                cleanUri.startsWith("mongodb+srv://") ? "mongodb+srv://*** (MongoDB Atlas Cloud)" : "mongodb://*** (Standard Connection)");
        return MongoClients.create(new ConnectionString(cleanUri));
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        String dbName = (database != null && !database.trim().isEmpty()) ? database.trim() : "car_rental";
        return new MongoTemplate(mongoClient(), dbName);
    }

    private String getCleanConnectionString(String uri) {
        if (uri == null || uri.trim().isEmpty()) {
            log.warn("⚠️ MONGODB_URI is not set or empty. Defaulting to local fallback: {}", DEFAULT_URI);
            return DEFAULT_URI;
        }

        // Clean up accidental quotes or whitespace from cloud dashboards (e.g. Render, Railway)
        String cleaned = uri.trim();
        if ((cleaned.startsWith("\"") && cleaned.endsWith("\"")) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.substring(1, cleaned.length() - 1).trim();
        }

        if (!cleaned.startsWith("mongodb://") && !cleaned.startsWith("mongodb+srv://")) {
            log.warn("⚠️ Provided MONGODB_URI does not start with 'mongodb://' or 'mongodb+srv://'. Defaulting to local fallback: {}", DEFAULT_URI);
            return DEFAULT_URI;
        }

        return cleaned;
    }
}
