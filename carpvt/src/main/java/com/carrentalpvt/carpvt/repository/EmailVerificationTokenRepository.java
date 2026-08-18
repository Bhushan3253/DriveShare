package com.carrentalpvt.carpvt.repository;

import com.carrentalpvt.carpvt.model.EmailVerificationToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends MongoRepository<EmailVerificationToken, String> {

    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    List<EmailVerificationToken> findByUserIdAndUsedFalse(String userId);

    Optional<EmailVerificationToken> findTopByUserIdOrderByCreatedAtDesc(String userId);

    void deleteByUserId(String userId);
}
