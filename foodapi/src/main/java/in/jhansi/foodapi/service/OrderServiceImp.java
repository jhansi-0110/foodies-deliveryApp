package in.jhansi.foodapi.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

import in.jhansi.foodapi.entity.FoodEntity;
import in.jhansi.foodapi.entity.OrderEntity;
import in.jhansi.foodapi.entity.RestaurantEntity;
import in.jhansi.foodapi.io.OrderRequest;
import in.jhansi.foodapi.io.OrderResponse;
import in.jhansi.foodapi.io.VerifyPaymentRequest;
import in.jhansi.foodapi.repository.FoodRepository;
import in.jhansi.foodapi.repository.OrderRepository;
import in.jhansi.foodapi.repository.RestaurantRepository;

@Service
public class OrderServiceImp implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private NotificationService notificationService;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook.secret:}")
    private String razorpayWebhookSecret;

    @Override
    public OrderResponse createOrder(OrderRequest request, String userId, String userEmail, String userName, String userPhone) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart cannot be empty.");
        }

        // 1. Resolve & validate restaurant
        String restaurantId = request.getRestaurantId();
        RestaurantEntity restaurant = null;
        if (StringUtils.hasText(restaurantId)) {
            restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        }

        // 2. Build verified items snapshot strictly using database prices (Never trust React amounts)
        List<Map<String, Object>> verifiedItems = new ArrayList<>();
        double calculatedSubtotal = 0.0;

        for (Map<String, Object> rawItem : request.getItems()) {
            String foodId = rawItem.get("foodId") != null ? rawItem.get("foodId").toString()
                    : rawItem.get("id") != null ? rawItem.get("id").toString() : null;

            if (foodId == null) {
                continue;
            }

            FoodEntity food = foodRepository.findById(foodId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food item not found with id: " + foodId));

            if (!food.isAvailable()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item '" + food.getName() + "' is currently unavailable.");
            }

            // Auto-detect restaurant from item if not explicitly supplied
            if (restaurant == null && StringUtils.hasText(food.getRestaurantId())) {
                restaurantId = food.getRestaurantId();
                restaurant = restaurantRepository.findById(restaurantId).orElse(null);
            }

            int qty = 1;
            if (rawItem.get("quantity") != null) {
                qty = Integer.parseInt(rawItem.get("quantity").toString());
            } else if (rawItem.get("qty") != null) {
                qty = Integer.parseInt(rawItem.get("qty").toString());
            }
            if (qty <= 0) qty = 1;

            double verifiedPrice = food.getPrice();
            double lineTotal = verifiedPrice * qty;
            calculatedSubtotal += lineTotal;

            Map<String, Object> itemSnapshot = new HashMap<>();
            itemSnapshot.put("foodId", food.getId());
            itemSnapshot.put("name", food.getName());
            itemSnapshot.put("price", verifiedPrice);
            itemSnapshot.put("priceAtOrder", verifiedPrice);
            itemSnapshot.put("quantity", qty);
            itemSnapshot.put("imageUrl", food.getImageUrl());
            itemSnapshot.put("category", food.getCategory());
            itemSnapshot.put("veg", food.isVeg());
            itemSnapshot.put("total", lineTotal);

            verifiedItems.add(itemSnapshot);
        }

        if (verifiedItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No valid food items found in order.");
        }

        double deliveryFee = (restaurant != null) ? restaurant.getDeliveryFee() : 25.0;
        double tax = Math.round(calculatedSubtotal * 0.05 * 100.0) / 100.0; // 5% GST
        double totalAmount = Math.round((calculatedSubtotal + deliveryFee + tax) * 100.0) / 100.0;

        int amountInPaise = (int) Math.round(totalAmount * 100);
        String razorpayOrderId = null;

        // 3. Create order on Razorpay
        if (StringUtils.hasText(razorpayKeyId) && StringUtils.hasText(razorpayKeySecret)) {
            try {
                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderReq = new JSONObject();
                orderReq.put("amount", amountInPaise);
                orderReq.put("currency", "INR");
                orderReq.put("receipt", "rcpt_" + System.currentTimeMillis());

                Order order = razorpay.orders.create(orderReq);
                razorpayOrderId = order.get("id");
            } catch (RazorpayException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error generating Razorpay order: " + e.getMessage());
            }
        } else {
            razorpayOrderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 14);
        }

        // 4. Persist order with immutable price breakdown and link to customer + restaurant
        String restaurantName = (restaurant != null) ? restaurant.getName() : "Foodies Kitchen";

        OrderEntity newOrder = OrderEntity.builder()
                .userId(userId)
                .customerName(userName)
                .customerEmail(userEmail)
                .customerPhone(userPhone)
                .restaurantId(restaurantId)
                .restaurantName(restaurantName)
                .items(verifiedItems)
                .subtotal(calculatedSubtotal)
                .deliveryFee(deliveryFee)
                .tax(tax)
                .totalAmount(totalAmount)
                .amount(totalAmount)
                .address(request.getAddress())
                .status("PENDING")
                .paymentStatus("PENDING")
                .razorpayOrderId(razorpayOrderId)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        newOrder = orderRepository.save(newOrder);
        return convertToResponse(newOrder);
    }

    @Override
    public OrderResponse verifyPayment(VerifyPaymentRequest request) {
        OrderEntity order = null;
        if (StringUtils.hasText(request.getOrderId())) {
            order = orderRepository.findById(request.getOrderId()).orElse(null);
        }
        if (order == null && StringUtils.hasText(request.getRazorpayOrderId())) {
            order = orderRepository.findByRazorpayOrderId(request.getRazorpayOrderId()).orElse(null);
        }

        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found for verification.");
        }

        // Idempotent: If already paid, return existing verified order
        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            return convertToResponse(order);
        }

        boolean isValid = false;
        if (StringUtils.hasText(razorpayKeySecret)) {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_signature", request.getRazorpaySignature());

                isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            } catch (RazorpayException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment signature verification failed: " + e.getMessage());
            }
        } else {
            isValid = true;
        }

        if (!isValid) {
            order.setPaymentStatus("FAILED");
            order.setStatus("CANCELLED");
            order.setUpdatedAt(new Date());
            orderRepository.save(order);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment signature.");
        }

        order.setPaymentStatus("PAID");
        order.setStatus("CONFIRMED"); // Mark as CONFIRMED immediately so it appears active in admin & restaurant panels
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setRazorpaySignature(request.getRazorpaySignature());
        order.setUpdatedAt(new Date());
        order = orderRepository.save(order);

        // Notify restaurant owner of incoming live order
        if (StringUtils.hasText(order.getRestaurantId())) {
            RestaurantEntity rest = restaurantRepository.findById(order.getRestaurantId()).orElse(null);
            if (rest != null && StringUtils.hasText(rest.getOwnerId())) {
                String shortId = order.getId().substring(Math.max(0, order.getId().length() - 6)).toUpperCase();
                notificationService.createNotification(
                        rest.getOwnerId(),
                        "ROLE_RESTAURANT",
                        "NEW_ORDER",
                        "New Live Order #" + shortId + " Received!",
                        "Customer " + (order.getCustomerName() != null ? order.getCustomerName() : "Guest") + " placed an order for ₹" + order.getTotalAmount() + ". Tap to accept and prepare.",
                        order.getId()
                );
            }
        }

        // Clear customer cart
        if (StringUtils.hasText(order.getUserId())) {
            cartService.clearCart(order.getUserId());
        }

        return convertToResponse(order);
    }

    @Override
    public List<OrderResponse> getUserOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getRestaurantOrders(String restaurantId) {
        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found with id: " + orderId));
        return convertToResponse(order);
    }

    @Override
    public OrderResponse updateOrderStatus(String orderId, String status, String currentUserId, String currentUserRole) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found with id: " + orderId));

        // Authorization check: if not admin, ensure order belongs to caller's restaurant
        if (!"ROLE_ADMIN".equals(currentUserRole)) {
            if (order.getRestaurantId() == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized: order has no assigned restaurant.");
            }
            RestaurantEntity restaurant = restaurantRepository.findById(order.getRestaurantId()).orElse(null);
            if (restaurant == null || !currentUserId.equals(restaurant.getOwnerId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to modify orders for this restaurant.");
            }
        }

        order.setStatus(status);
        order.setUpdatedAt(new Date());
        order = orderRepository.save(order);
        return convertToResponse(order);
    }

    @Override
    public void deleteOrder(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found with id: " + orderId));

        orderRepository.deleteById(order.getId());
    }

    @Override
    public void processWebhook(String webhookPayload, String signature) {
        if (StringUtils.hasText(razorpayWebhookSecret) && StringUtils.hasText(signature)) {
            try {
                boolean verified = Utils.verifyWebhookSignature(webhookPayload, signature, razorpayWebhookSecret);
                if (!verified) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid webhook signature.");
                }
            } catch (RazorpayException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Webhook signature error: " + e.getMessage());
            }
        }

        try {
            JSONObject event = new JSONObject(webhookPayload);
            String eventType = event.optString("event");
            JSONObject payload = event.optJSONObject("payload");

            if (payload != null && ("order.paid".equals(eventType) || "payment.captured".equals(eventType))) {
                JSONObject paymentObj = payload.optJSONObject("payment") != null
                        ? payload.getJSONObject("payment").optJSONObject("entity") : null;

                if (paymentObj != null) {
                    String rzpOrderId = paymentObj.optString("order_id");
                    String rzpPaymentId = paymentObj.optString("id");

                    if (StringUtils.hasText(rzpOrderId)) {
                        orderRepository.findByRazorpayOrderId(rzpOrderId).ifPresent(order -> {
                            if (!"PAID".equals(order.getPaymentStatus())) {
                                order.setPaymentStatus("PAID");
                                order.setStatus("CONFIRMED");
                                order.setRazorpayPaymentId(rzpPaymentId);
                                order.setUpdatedAt(new Date());
                                orderRepository.save(order);
                                if (StringUtils.hasText(order.getUserId())) {
                                    cartService.clearCart(order.getUserId());
                                }
                            }
                        });
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Webhook processing error: " + e.getMessage());
        }
    }

    private OrderResponse convertToResponse(OrderEntity entity) {
        return OrderResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .customerName(entity.getCustomerName())
                .customerEmail(entity.getCustomerEmail())
                .customerPhone(entity.getCustomerPhone())
                .restaurantId(entity.getRestaurantId())
                .restaurantName(entity.getRestaurantName())
                .items(entity.getItems())
                .subtotal(entity.getSubtotal())
                .deliveryFee(entity.getDeliveryFee())
                .tax(entity.getTax())
                .totalAmount(entity.getTotalAmount())
                .amount(entity.getTotalAmount() > 0 ? entity.getTotalAmount() : entity.getAmount())
                .address(entity.getAddress())
                .status(entity.getStatus())
                .paymentStatus(entity.getPaymentStatus())
                .razorpayOrderId(entity.getRazorpayOrderId())
                .razorpayPaymentId(entity.getRazorpayPaymentId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
