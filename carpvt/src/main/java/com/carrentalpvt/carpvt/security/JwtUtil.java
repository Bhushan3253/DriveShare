package com.carrentalpvt.carpvt.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret:carRentalSecretKeyForJwtAuthentication2026_Secure256BitKeyRequired}")
    private String secret;

    private SecretKey key;

    private static final long EXPIRATION = 1000L * 60 * 60 * 24; // 24 hours

    @PostConstruct
    public void init() {
        getKey();
    }

    private SecretKey getKey() {
        if (key == null) {
            String sec = (secret != null && !secret.trim().isEmpty())
                    ? secret.trim()
                    : "carRentalSecretKeyForJwtAuthentication2026_Secure256BitKeyRequired";
            this.key = Keys.hmacShaKeyFor(sec.getBytes(StandardCharsets.UTF_8));
        }
        return key;
    }

    public String generateToken(String userId, String email, String role) {
        String safeUserId = userId != null ? userId : "";
        String safeEmail = email != null ? email : "";
        String safeRole = role != null ? role : "USER";

        return Jwts.builder()
                .subject(safeUserId)
                .claim("email", safeEmail)
                .claim("role", safeRole)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey())
                .compact();
    }

    public String extractUserId(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String extractRole(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
    }
}