package in.jhansi.foodapi.service;

import java.util.List;

import in.jhansi.foodapi.io.ReviewRequest;
import in.jhansi.foodapi.io.ReviewResponse;

public interface ReviewService {
    ReviewResponse addReview(ReviewRequest request, String userId, String userName, String userEmail);
    List<ReviewResponse> getReviewsByFood(String foodId);
    List<ReviewResponse> getReviewsByRestaurant(String restaurantId);
    List<ReviewResponse> getAllReviews();
}
