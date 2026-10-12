package in.jhansi.foodapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FoodResponse {

    private String id;
    private String restaurantId;
    private String restaurantName;
    private String name;
    private String description;
    private String imageUrl;
    private double price;
    private String category;
    private boolean available;
    private boolean veg;
    private double rating;
    private int ratingCount;
}