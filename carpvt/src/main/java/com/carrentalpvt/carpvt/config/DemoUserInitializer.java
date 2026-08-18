package com.carrentalpvt.carpvt.config;

import com.carrentalpvt.carpvt.model.User;
import com.carrentalpvt.carpvt.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoUserInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        ensureUserExists("admin@driveshare.com", "System Admin", "admin123", "ADMIN", true, true);
        ensureUserExists("renter@driveshare.com", "Demo Renter", "password123", "USER", false, true);
        ensureUserExists("owner@driveshare.com", "Demo Host", "password123", "OWNER", true, true);
        log.info("✓ Verified demo accounts initialized: admin@driveshare.com, renter@driveshare.com, owner@driveshare.com");
    }

    private void ensureUserExists(String email, String name, String rawPassword, String role, boolean isOwner, boolean isVerified) {
        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            user.setEmailVerified(true);
            user.setEnabled(true);
            user.setRole(role);
            user.setCarOwner(isOwner);
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
        }, () -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setPassword(passwordEncoder.encode(rawPassword));
            newUser.setRole(role);
            newUser.setCarOwner(isOwner);
            newUser.setEnabled(true);
            newUser.setEmailVerified(true);
            newUser.setPhone("9876543210");
            userRepository.save(newUser);
        });
    }
}
