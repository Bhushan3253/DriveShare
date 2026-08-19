package com.carrentalpvt.carpvt.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "email_verification_tokens")
public class EmailVerificationToken {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed(unique = true)
    private String tokenHash;

    @Indexed
    private LocalDateTime expiresAt;

    @Builder.Default
    private boolean used = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
