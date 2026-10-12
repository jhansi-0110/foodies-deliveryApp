package in.jhansi.foodapi.entity;

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
@Document(collection = "foods")
public class FoodEntity {

    @Id
    private String id;

    private String restaurantId;

    private String restaurantName;

    private String name;

    private String description;

    private double price;

    private String category;

    private String imageUrl;

    private String imagePublicId;

    @Builder.Default
    private boolean available = true;

    @Builder.Default
    private boolean veg = false;

    @Builder.Default
    private double rating = 4.5;

    @Builder.Default
    private int ratingCount = 0;
}
