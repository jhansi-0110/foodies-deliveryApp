package in.jhansi.foodapi.io;

import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantResponse {

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
    private double rating;
    private int deliveryTimeMinutes;
    private double deliveryFee;
    private double minimumOrder;
    private boolean open;
    private boolean active;
    private boolean approved;
    private String ownerId;
    private String ownerName;
    private String ownerEmail;
    private String subscriptionStatus;
    private String subscriptionPlan;
    private Date subscriptionExpiresAt;
    private List<FoodResponse> menu;
    private Date createdAt;
}
