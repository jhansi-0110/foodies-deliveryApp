package in.jhansi.foodapi.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import in.jhansi.foodapi.entity.FoodEntity;
import in.jhansi.foodapi.entity.RestaurantEntity;
import in.jhansi.foodapi.entity.ReviewEntity;
import in.jhansi.foodapi.io.ReviewRequest;
import in.jhansi.foodapi.io.ReviewResponse;
import in.jhansi.foodapi.repository.FoodRepository;
import in.jhansi.foodapi.repository.RestaurantRepository;
import in.jhansi.foodapi.repository.ReviewRepository;

@Service
public class ReviewServiceImp implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Override
    public ReviewResponse addReview(ReviewRequest request, String userId, String userName, String userEmail) {
        FoodEntity food = foodRepository.findById(request.getFoodId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food item not found with id: " + request.getFoodId()));

        ReviewEntity review = ReviewEntity.builder()
                .foodId(food.getId())
                .foodName(food.getName())
                .restaurantId(food.getRestaurantId())
                .restaurantName(food.getRestaurantName())
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(new Date())
                .build();

        review = reviewRepository.save(review);

        // 1. Recalculate Food Rating
        List<ReviewEntity> foodReviews = reviewRepository.findByFoodIdOrderByCreatedAtDesc(food.getId());
        double avgFoodRating = foodReviews.stream().mapToInt(ReviewEntity::getRating).average().orElse(request.getRating());
        avgFoodRating = Math.round(avgFoodRating * 10.0) / 10.0;
        food.setRating(avgFoodRating);
        food.setRatingCount(foodReviews.size());
        foodRepository.save(food);

        RestaurantEntity restaurant = null;
        if (StringUtils.hasText(food.getRestaurantId())) {
            restaurant = restaurantRepository.findById(food.getRestaurantId()).orElse(null);
            if (restaurant != null) {
                // 2. Recalculate Restaurant Rating
                List<ReviewEntity> restReviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurant.getId());
                double avgRestRating = restReviews.stream().mapToInt(ReviewEntity::getRating).average().orElse(4.5);
                avgRestRating = Math.round(avgRestRating * 10.0) / 10.0;
                restaurant.setRating(avgRestRating);
                restaurantRepository.save(restaurant);

                // 3. Notify Restaurant Owner
                if (StringUtils.hasText(restaurant.getOwnerId())) {
                    notificationService.createNotification(
                            restaurant.getOwnerId(),
                            "ROLE_RESTAURANT",
                            "NEW_REVIEW",
                            "New " + request.getRating() + "★ Review on " + food.getName(),
                            userName + " reviewed '" + food.getName() + "' with " + request.getRating() + "★: \"" + request.getComment() + "\"",
                            food.getId()
                    );
                }

                // 4. Send Review Email to Restaurant
                String restEmail = StringUtils.hasText(restaurant.getEmail()) ? restaurant.getEmail() : restaurant.getOwnerEmail();
                if (StringUtils.hasText(restEmail)) {
                    emailService.sendNewReviewNotificationEmail(
                            restEmail,
                            restaurant.getName(),
                            food.getName(),
                            request.getRating(),
                            request.getComment(),
                            userName
                    );
                }
            }
        }

        // 5. Notify Platform Administrator
        String restaurantLabel = (restaurant != null) ? restaurant.getName() : (food.getRestaurantName() != null ? food.getRestaurantName() : "General");
        notificationService.createNotification(
                null,
                "ROLE_ADMIN",
                "NEW_REVIEW",
                "New " + request.getRating() + "★ Review on " + food.getName(),
                userName + " reviewed '" + food.getName() + "' (" + restaurantLabel + ") with " + request.getRating() + "★: \"" + request.getComment() + "\"",
                food.getId()
        );

        return convertToResponse(review);
    }

    @Override
    public List<ReviewResponse> getReviewsByFood(String foodId) {
        return reviewRepository.findByFoodIdOrderByCreatedAtDesc(foodId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getReviewsByRestaurant(String restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse convertToResponse(ReviewEntity entity) {
        return ReviewResponse.builder()
                .id(entity.getId())
                .foodId(entity.getFoodId())
                .foodName(entity.getFoodName())
                .restaurantId(entity.getRestaurantId())
                .restaurantName(entity.getRestaurantName())
                .userId(entity.getUserId())
                .userName(entity.getUserName())
                .rating(entity.getRating())
                .comment(entity.getComment())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
