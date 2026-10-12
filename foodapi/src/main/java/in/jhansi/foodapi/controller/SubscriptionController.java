package in.jhansi.foodapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import in.jhansi.foodapi.entity.SubscriptionEntity;
import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.RestaurantResponse;
import in.jhansi.foodapi.io.SubscriptionPlanDto;
import in.jhansi.foodapi.io.SubscriptionRequest;
import in.jhansi.foodapi.io.VerifyPaymentRequest;
import in.jhansi.foodapi.service.RestaurantService;
import in.jhansi.foodapi.service.SubscriptionService;
import in.jhansi.foodapi.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private UserService userService;

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping("/plans")
    public List<SubscriptionPlanDto> getPlans() {
        return subscriptionService.getAvailablePlans();
    }

    @PostMapping("/create")
    public SubscriptionEntity createSubscription(@Valid @RequestBody SubscriptionRequest request) {
        UserEntity currentUser = userService.getCurrentUser();
        return subscriptionService.createSubscriptionOrder(
                request.getRestaurantId(),
                request.getPlanId(),
                currentUser.getId(),
                currentUser.getEmail()
        );
    }

    @PostMapping("/verify")
    public SubscriptionEntity verifySubscription(@Valid @RequestBody VerifyPaymentRequest request) {
        return subscriptionService.verifySubscriptionPayment(request);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public SubscriptionEntity getActiveSubscription(@PathVariable String restaurantId) {
        UserEntity currentUser = userService.getCurrentUser();
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            RestaurantResponse myRest = restaurantService.getMyRestaurant(currentUser.getId());
            if (myRest == null || !restaurantId.equals(myRest.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: cannot view subscriptions of other restaurants.");
            }
        }
        return subscriptionService.getActiveSubscription(restaurantId);
    }

    @GetMapping("/all")
    public List<SubscriptionEntity> getAllSubscriptions() {
        UserEntity currentUser = userService.getCurrentUser();
        if ("ROLE_ADMIN".equals(currentUser.getRole())) {
            return subscriptionService.getAllSubscriptions();
        } else if ("ROLE_RESTAURANT".equals(currentUser.getRole())) {
            RestaurantResponse myRest = restaurantService.getMyRestaurant(currentUser.getId());
            if (myRest != null) {
                SubscriptionEntity sub = subscriptionService.getActiveSubscription(myRest.getId());
                return sub != null ? List.of(sub) : List.of();
            }
            return List.of();
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
    }
}
