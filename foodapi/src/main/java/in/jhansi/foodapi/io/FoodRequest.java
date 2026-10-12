package in.jhansi.foodapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FoodRequest {

    private String restaurantId;
    private String restaurantName;
    private String name;
    private String description;
    private double price;
    private String category;
    @Builder.Default
    private boolean available = true;
    @Builder.Default
    private boolean veg = false;
}
