package in.jhansi.foodapi.io;

import java.util.Date;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {

    private String id;
    private String userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String restaurantId;
    private String restaurantName;
    private List<Map<String, Object>> items;
    private double subtotal;
    private double deliveryFee;
    private double tax;
    private double totalAmount;
    private double amount; // backward compatibility
    private Map<String, Object> address;
    private String status;
    private String paymentStatus;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private Date createdAt;
    private Date updatedAt;
}
