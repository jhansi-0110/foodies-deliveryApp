package in.jhansi.foodapi.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import in.jhansi.foodapi.entity.NotificationEntity;
import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.service.NotificationService;
import in.jhansi.foodapi.service.UserService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<NotificationEntity> getMyNotifications() {
        UserEntity currentUser = userService.getCurrentUser();
        return notificationService.getNotificationsForUser(currentUser.getId(), currentUser.getRole());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        UserEntity currentUser = userService.getCurrentUser();
        long count = notificationService.getUnreadCount(currentUser.getId(), currentUser.getRole());
        return Map.of("unreadCount", count);
    }

    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllAsRead() {
        UserEntity currentUser = userService.getCurrentUser();
        notificationService.markAllAsRead(currentUser.getId(), currentUser.getRole());
    }
}
