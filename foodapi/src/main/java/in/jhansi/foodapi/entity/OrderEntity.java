package in.jhansi.foodapi.entity;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "orders")
public class OrderEntity {

    @Id
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

    @Builder.Default
    private String status = "PENDING";

    @Builder.Default
    private String paymentStatus = "PENDING";

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    @Builder.Default
    private Date createdAt = new Date();

    @Builder.Default
    private Date updatedAt = new Date();
}
