package in.jhansi.foodapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.RestaurantResponse;
import in.jhansi.foodapi.io.ReviewRequest;
import in.jhansi.foodapi.io.ReviewResponse;
import in.jhansi.foodapi.service.RestaurantService;
import in.jhansi.foodapi.service.ReviewService;
import in.jhansi.foodapi.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    @Autowired
    private RestaurantService restaurantService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse addReview(@Valid @RequestBody ReviewRequest request) {
        UserEntity currentUser = userService.getCurrentUser();
        return reviewService.addReview(request, currentUser.getId(), currentUser.getName(), currentUser.getEmail());
    }

    @GetMapping("/food/{foodId}")
    public List<ReviewResponse> getReviewsByFood(@PathVariable String foodId) {
        return reviewService.getReviewsByFood(foodId);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<ReviewResponse> getReviewsByRestaurant(@PathVariable String restaurantId) {
        return reviewService.getReviewsByRestaurant(restaurantId);
    }

    @GetMapping("/all")
    public List<ReviewResponse> getAllReviews() {
        UserEntity currentUser = userService.getCurrentUser();
        if ("ROLE_ADMIN".equals(currentUser.getRole())) {
            return reviewService.getAllReviews();
        } else if ("ROLE_RESTAURANT".equals(currentUser.getRole())) {
            RestaurantResponse myRest = restaurantService.getMyRestaurant(currentUser.getId());
            if (myRest != null) {
                return reviewService.getReviewsByRestaurant(myRest.getId());
            }
            return List.of();
        }
        return List.of();
    }
}
