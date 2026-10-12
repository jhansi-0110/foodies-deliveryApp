package in.jhansi.foodapi.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.jhansi.foodapi.entity.NotificationEntity;
import in.jhansi.foodapi.repository.NotificationRepository;

@Service
public class NotificationServiceImp implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public NotificationEntity createNotification(String recipientUserId, String recipientRole, String type, String title, String message, String referenceId) {
        NotificationEntity notification = NotificationEntity.builder()
                .recipientUserId(recipientUserId)
                .recipientRole(recipientRole)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .read(false)
                .createdAt(new Date())
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    public List<NotificationEntity> getNotificationsForUser(String userId, String role) {
        if ("ROLE_ADMIN".equals(role)) {
            return notificationRepository.findByRecipientRoleOrderByCreatedAtDesc("ROLE_ADMIN");
        }
        if (userId != null) {
            return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
        }
        return List.of();
    }

    @Override
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    public void markAllAsRead(String userId, String role) {
        List<NotificationEntity> notifications = getNotificationsForUser(userId, role);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    public long getUnreadCount(String userId, String role) {
        if ("ROLE_ADMIN".equals(role)) {
            return notificationRepository.countByRecipientRoleAndReadFalse("ROLE_ADMIN");
        }
        if (userId != null) {
            return notificationRepository.countByRecipientUserIdAndReadFalse(userId);
        }
        return 0;
    }
}
