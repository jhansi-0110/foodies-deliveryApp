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
@Document(collection = "reviews")
public class ReviewEntity {

    @Id
    private String id;

    private String foodId;

    private String foodName;

    private String restaurantId;

    private String restaurantName;

    private String userId;

    private String userName;

    private String userEmail;

    private int rating; // 1 to 5

    private String comment;

    @Builder.Default
    private Date createdAt = new Date();
}
