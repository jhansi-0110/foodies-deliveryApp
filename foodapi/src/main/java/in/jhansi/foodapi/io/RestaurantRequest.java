package in.jhansi.foodapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantRequest {

    private String name;
    private String description;
    private String cuisine;
    private String address;
    private String city;
    private String postalCode;
    private String phone;
    private String email;
    @Builder.Default
    private int deliveryTimeMinutes = 30;
    @Builder.Default
    private double deliveryFee = 25.0;
    @Builder.Default
    private double minimumOrder = 99.0;
    @Builder.Default
    private boolean open = true;
}
