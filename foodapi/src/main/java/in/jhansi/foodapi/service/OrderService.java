package in.jhansi.foodapi.service;

import java.util.List;

import in.jhansi.foodapi.io.OrderRequest;
import in.jhansi.foodapi.io.OrderResponse;
import in.jhansi.foodapi.io.VerifyPaymentRequest;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request, String userId, String userEmail, String userName, String userPhone);
    OrderResponse verifyPayment(VerifyPaymentRequest request);
    List<OrderResponse> getUserOrders(String userId);
    List<OrderResponse> getRestaurantOrders(String restaurantId);
    List<OrderResponse> getAllOrders();
    OrderResponse getOrderById(String orderId);
    OrderResponse updateOrderStatus(String orderId, String status, String currentUserId, String currentUserRole);
    void deleteOrder(String orderId);
    void processWebhook(String webhookPayload, String signature);
}
