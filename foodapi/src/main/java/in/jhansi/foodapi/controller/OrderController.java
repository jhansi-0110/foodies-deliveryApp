package in.jhansi.foodapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import in.jhansi.foodapi.entity.RestaurantEntity;
import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.OrderRequest;
import in.jhansi.foodapi.io.OrderResponse;
import in.jhansi.foodapi.io.OrderStatusRequest;
import in.jhansi.foodapi.io.VerifyPaymentRequest;
import in.jhansi.foodapi.repository.RestaurantRepository;
import in.jhansi.foodapi.service.OrderService;
import in.jhansi.foodapi.service.UserService;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @PostMapping("/create")
    public OrderResponse createOrder(@Valid @RequestBody OrderRequest request) {
        UserEntity currentUser = userService.getCurrentUser();
        return orderService.createOrder(
                request,
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getName(),
                currentUser.getPhone()
        );
    }

    @PostMapping("/verify")
    public OrderResponse verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        return orderService.verifyPayment(request);
    }

    @PostMapping("/webhook")
    @ResponseStatus(HttpStatus.OK)
    public void handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        orderService.processWebhook(payload, signature);
    }

    @GetMapping
    public List<OrderResponse> getUserOrders() {
        UserEntity currentUser = userService.getCurrentUser();
        return orderService.getUserOrders(currentUser.getId());
    }

    @GetMapping("/all")
    public List<OrderResponse> getAllOrders() {
        UserEntity currentUser = userService.getCurrentUser();
        if ("ROLE_ADMIN".equals(currentUser.getRole())) {
            return orderService.getAllOrders();
        } else if ("ROLE_RESTAURANT".equals(currentUser.getRole())) {
            List<RestaurantEntity> myRests = restaurantRepository.findByOwnerId(currentUser.getId());
            if (myRests.isEmpty()) {
                return List.of();
            }
            return orderService.getRestaurantOrders(myRests.get(0).getId());
        }
        return orderService.getUserOrders(currentUser.getId());
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<OrderResponse> getRestaurantOrders(@PathVariable String restaurantId) {
        UserEntity currentUser = userService.getCurrentUser();
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            RestaurantEntity rest = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found with id: " + restaurantId));
            if (!currentUser.getId().equals(rest.getOwnerId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: you cannot view orders for other restaurants.");
            }
        }
        return orderService.getRestaurantOrders(restaurantId);
    }

    @GetMapping("/{orderId}")
    public OrderResponse getOrderById(@PathVariable String orderId) {
        return orderService.getOrderById(orderId);
    }

    @PatchMapping("/status/{orderId}")
    public OrderResponse updateOrderStatus(
            @PathVariable String orderId,
            @Valid @RequestBody OrderStatusRequest request) {
        UserEntity currentUser = userService.getCurrentUser();
        return orderService.updateOrderStatus(orderId, request.getStatus(), currentUser.getId(), currentUser.getRole());
    }

    @DeleteMapping("/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable String orderId) {
        UserEntity currentUser = userService.getCurrentUser();
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can delete orders.");
        }
        orderService.deleteOrder(orderId);
    }
}
