package in.jhansi.foodapi.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import in.jhansi.foodapi.entity.OrderEntity;
import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.DashboardStatsDto;
import in.jhansi.foodapi.repository.OrderRepository;
import in.jhansi.foodapi.repository.RestaurantRepository;
import in.jhansi.foodapi.repository.SubscriptionRepository;
import in.jhansi.foodapi.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @GetMapping("/stats")
    public DashboardStatsDto getDashboardStats() {
        long totalCustomers = userRepository.count();
        long totalRestaurants = restaurantRepository.count();
        long activeRestaurants = restaurantRepository.countByActiveTrue();
        long inactiveRestaurants = Math.max(0, totalRestaurants - activeRestaurants);

        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus("PENDING") + orderRepository.countByStatus("PREPARING") + orderRepository.countByStatus("CONFIRMED");
        long completedOrders = orderRepository.countByStatus("DELIVERED");

        long successfulPayments = orderRepository.countByPaymentStatus("PAID");
        long failedPayments = orderRepository.countByPaymentStatus("FAILED");

        // Calculate revenue from paid orders
        List<OrderEntity> allOrders = orderRepository.findAll();
        double totalRevenue = allOrders.stream()
                .filter(o -> "PAID".equalsIgnoreCase(o.getPaymentStatus()))
                .mapToDouble(o -> o.getTotalAmount() > 0 ? o.getTotalAmount() : o.getAmount())
                .sum();
        totalRevenue = Math.round(totalRevenue * 100.0) / 100.0;

        long activeSubscriptions = subscriptionRepository.countByStatus("ACTIVE");
        long expiredSubscriptions = subscriptionRepository.countByStatus("EXPIRED");

        return DashboardStatsDto.builder()
                .totalCustomers(totalCustomers)
                .totalRestaurants(totalRestaurants)
                .activeRestaurants(activeRestaurants)
                .inactiveRestaurants(inactiveRestaurants)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .successfulPayments(successfulPayments)
                .failedPayments(failedPayments)
                .totalRevenue(totalRevenue)
                .activeSubscriptions(activeSubscriptions)
                .expiredSubscriptions(expiredSubscriptions)
                .build();
    }

    @GetMapping("/users")
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll().stream()
                .peek(u -> u.setPassword(null)) // Never expose password hashes
                .collect(Collectors.toList());
    }

    @PatchMapping("/users/{id}/status")
    public UserEntity updateUserStatus(@PathVariable String id, @RequestParam boolean active) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(active);
        user = userRepository.save(user);
        user.setPassword(null);
        return user;
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateUser(@PathVariable String id) {
        // Soft delete to preserve historical order references
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(false);
        userRepository.save(user);
    }
}
