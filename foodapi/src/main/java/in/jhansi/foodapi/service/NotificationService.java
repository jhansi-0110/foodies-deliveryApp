package in.jhansi.foodapi.service;

import java.util.List;

import in.jhansi.foodapi.entity.NotificationEntity;

public interface NotificationService {
    NotificationEntity createNotification(String recipientUserId, String recipientRole, String type, String title, String message, String referenceId);
    List<NotificationEntity> getNotificationsForUser(String userId, String role);
    void markAsRead(String notificationId);
    void markAllAsRead(String userId, String role);
    long getUnreadCount(String userId, String role);
}
