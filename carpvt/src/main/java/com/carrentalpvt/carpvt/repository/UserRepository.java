package com.carrentalpvt.carpvt.repository;

import com.carrentalpvt.carpvt.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(String role);

    long countByCarOwner(boolean carOwner);
}
