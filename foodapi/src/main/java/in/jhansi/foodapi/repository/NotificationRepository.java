package in.jhansi.foodapi.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import in.jhansi.foodapi.entity.NotificationEntity;

@Repository
public interface NotificationRepository extends MongoRepository<NotificationEntity, String> {
    List<NotificationEntity> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);
    List<NotificationEntity> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);
    List<NotificationEntity> findByRecipientUserIdOrRecipientRoleOrderByCreatedAtDesc(String recipientUserId, String recipientRole);
    long countByRecipientUserIdAndReadFalse(String recipientUserId);
    long countByRecipientRoleAndReadFalse(String recipientRole);
}
