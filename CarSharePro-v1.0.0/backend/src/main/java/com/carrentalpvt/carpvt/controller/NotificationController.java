package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.model.Notification;
import com.carrentalpvt.carpvt.service.NotificationService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // 1. GET ALL NOTIFICATIONS FOR LOGGED-IN USER
    @GetMapping
    public List<Notification> getUserNotifications(Authentication authentication) {
        String userId = requireAuthenticatedUserId(authentication);
        return notificationService.getUserNotifications(userId);
    }

    // 2. GET ONLY UNREAD NOTIFICATIONS
    @GetMapping("/unread")
    public List<Notification> getUnreadNotifications(Authentication authentication) {
        String userId = requireAuthenticatedUserId(authentication);
        return notificationService.getUnreadNotifications(userId);
    }

    // 3. GET UNREAD COUNT (FOR BELL BADGE)
    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        String userId = requireAuthenticatedUserId(authentication);
        long count = notificationService.getUnreadCount(userId);
        return Map.of("count", count);
    }

    // 4. MARK SINGLE NOTIFICATION AS READ
    @PutMapping("/{id}/read")
    public Notification markAsRead(
            @PathVariable String id,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        return notificationService.markAsRead(id, userId);
    }

    // 5. MARK ALL NOTIFICATIONS AS READ
    @PutMapping("/read-all")
    public Map<String, String> markAllAsRead(Authentication authentication) {
        String userId = requireAuthenticatedUserId(authentication);
        notificationService.markAllAsRead(userId);
        return Map.of("message", "All notifications marked as read");
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}
