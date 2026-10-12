package in.jhansi.foodapi.io;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {

    private String id;

    private String foodId;

    private String foodName;

    private String restaurantId;

    private String restaurantName;

    private String userId;

    private String userName;

    private int rating;

    private String comment;

    private Date createdAt;
}
