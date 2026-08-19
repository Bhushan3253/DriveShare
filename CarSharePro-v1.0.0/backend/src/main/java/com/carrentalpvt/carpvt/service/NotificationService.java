package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Notification;
import com.carrentalpvt.carpvt.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // ==========================================
    // 1. SEND NOTIFICATION
    // ==========================================

    public Notification sendNotification(
            String userId,
            String title,
            String message,
            String type,
            String referenceId) {

        if (userId == null || userId.trim().isEmpty()) {
            return null;
        }

        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        log.info("Notification sent to [{}]: {} ({})", userId, title, type);
        return notificationRepository.save(notification);
    }

    // ==========================================
    // 2. GET NOTIFICATIONS FOR USER
    // ==========================================

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    // ==========================================
    // 3. MARK NOTIFICATION(S) AS READ
    // ==========================================

    public Notification markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to modify this notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        if (!unread.isEmpty()) {
            for (Notification n : unread) {
                n.setRead(true);
            }
            notificationRepository.saveAll(unread);
        }
    }
}
