package in.jhansi.foodapi.entity;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "notifications")
public class NotificationEntity {

    @Id
    private String id;

    private String recipientUserId; // Target user (e.g. restaurant owner or customer)

    private String recipientRole;   // Target role (e.g. ROLE_ADMIN, ROLE_RESTAURANT)

    private String type;            // RESTAURANT_APPROVED, RESTAURANT_REGISTRATION, NEW_REVIEW, NEW_ORDER

    private String title;

    private String message;

    private String referenceId;     // Associated ID (e.g. restaurantId, foodId, orderId)

    @Builder.Default
    private boolean read = false;

    @Builder.Default
    private Date createdAt = new Date();
}
