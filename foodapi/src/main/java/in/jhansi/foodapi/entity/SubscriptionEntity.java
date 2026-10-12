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
@Document(collection = "subscriptions")
public class SubscriptionEntity {

    @Id
    private String id;

    private String restaurantId;

    private String restaurantName;

    private String ownerId;

    private String ownerEmail;

    private String planName; // BASIC, STANDARD, PREMIUM

    private double amount;

    private int billingPeriodDays;

    private int maxMenuItems;

    @Builder.Default
    private String status = "PENDING"; // PENDING, ACTIVE, EXPIRED, CANCELLED, FAILED

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    private Date startDate;

    private Date endDate;

    @Builder.Default
    private Date createdAt = new Date();
}
