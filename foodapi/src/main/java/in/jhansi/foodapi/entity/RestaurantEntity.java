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
@Document(collection = "restaurants")
public class RestaurantEntity {

    @Id
    private String id;

    private String name;

    private String description;

    private String cuisine;

    private String address;

    private String city;

    private String postalCode;

    private String phone;

    private String email;

    private String imageUrl;

    private String imagePublicId;

    @Builder.Default
    private double rating = 4.5;

    @Builder.Default
    private int deliveryTimeMinutes = 30;

    @Builder.Default
    private double deliveryFee = 25.0;

    @Builder.Default
    private double minimumOrder = 99.0;

    @Builder.Default
    private boolean open = true;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean approved = true;

    private String ownerId;

    private String ownerName;

    private String ownerEmail;

    @Builder.Default
    private String subscriptionStatus = "ACTIVE";

    @Builder.Default
    private String subscriptionPlan = "STANDARD";

    private Date subscriptionExpiresAt;

    @Builder.Default
    private Date createdAt = new Date();

    @Builder.Default
    private Date updatedAt = new Date();
}
