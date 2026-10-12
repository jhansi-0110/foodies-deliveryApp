package in.jhansi.foodapi.service;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

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

import in.jhansi.foodapi.entity.RestaurantEntity;
import in.jhansi.foodapi.entity.SubscriptionEntity;
import in.jhansi.foodapi.io.SubscriptionPlanDto;
import in.jhansi.foodapi.io.VerifyPaymentRequest;
import in.jhansi.foodapi.repository.RestaurantRepository;
import in.jhansi.foodapi.repository.SubscriptionRepository;

@Service
public class SubscriptionServiceImp implements SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Override
    public List<SubscriptionPlanDto> getAvailablePlans() {
        return Arrays.asList(
                SubscriptionPlanDto.builder()
                        .planId("BASIC")
                        .name("Basic Plan")
                        .price(999.0)
                        .billingPeriodDays(30)
                        .maxMenuItems(15)
                        .features(Arrays.asList("Up to 15 Menu Items", "Standard Order Processing", "Basic Email Support"))
                        .description("Essential setup for small eateries and food stalls.")
                        .build(),

                SubscriptionPlanDto.builder()
                        .planId("STANDARD")
                        .name("Standard Plan")
                        .price(1999.0)
                        .billingPeriodDays(30)
                        .maxMenuItems(50)
                        .features(Arrays.asList("Up to 50 Menu Items", "Live Order Tracking", "Sales Reports & Analytics", "Priority Support"))
                        .description("Perfect for growing restaurants with a diverse menu.")
                        .build(),

                SubscriptionPlanDto.builder()
                        .planId("PREMIUM")
                        .name("Premium Plan")
                        .price(3499.0)
                        .billingPeriodDays(30)
                        .maxMenuItems(1000)
                        .features(Arrays.asList("Unlimited Menu Items", "Top Discovery Placement", "Advanced Customer Analytics", "24/7 Dedicated Account Manager"))
                        .description("Comprehensive solution for high-volume restaurants and multi-chain brands.")
                        .build()
        );
    }

    @Override
    public SubscriptionEntity createSubscriptionOrder(String restaurantId, String planId, String ownerId, String ownerEmail) {
        RestaurantEntity restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found with id: " + restaurantId));

        SubscriptionPlanDto selectedPlan = getAvailablePlans().stream()
                .filter(p -> p.getPlanId().equalsIgnoreCase(planId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid subscription plan: " + planId));

        int amountInPaise = (int) Math.round(selectedPlan.getPrice() * 100);
        String razorpayOrderId = null;

        if (StringUtils.hasText(razorpayKeyId) && StringUtils.hasText(razorpayKeySecret)) {
            try {
                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderReq = new JSONObject();
                orderReq.put("amount", amountInPaise);
                orderReq.put("currency", "INR");
                orderReq.put("receipt", "sub_" + System.currentTimeMillis());

                Order order = razorpay.orders.create(orderReq);
                razorpayOrderId = order.get("id");
            } catch (RazorpayException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error initiating Razorpay subscription: " + e.getMessage());
            }
        } else {
            razorpayOrderId = "sub_mock_" + UUID.randomUUID().toString().substring(0, 14);
        }

        SubscriptionEntity sub = SubscriptionEntity.builder()
                .restaurantId(restaurant.getId())
                .restaurantName(restaurant.getName())
                .ownerId(ownerId)
                .ownerEmail(ownerEmail)
                .planName(selectedPlan.getPlanId())
                .amount(selectedPlan.getPrice())
                .billingPeriodDays(selectedPlan.getBillingPeriodDays())
                .maxMenuItems(selectedPlan.getMaxMenuItems())
                .status("PENDING")
                .razorpayOrderId(razorpayOrderId)
                .createdAt(new Date())
                .build();

        return subscriptionRepository.save(sub);
    }

    @Override
    public SubscriptionEntity verifySubscriptionPayment(VerifyPaymentRequest request) {
        SubscriptionEntity sub = null;
        if (StringUtils.hasText(request.getOrderId())) {
            sub = subscriptionRepository.findById(request.getOrderId()).orElse(null);
        }
        if (sub == null && StringUtils.hasText(request.getRazorpayOrderId())) {
            sub = subscriptionRepository.findByRazorpayOrderId(request.getRazorpayOrderId()).orElse(null);
        }

        if (sub == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription record not found.");
        }

        // Idempotent return if already activated
        if ("ACTIVE".equalsIgnoreCase(sub.getStatus())) {
            return sub;
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
            sub.setStatus("FAILED");
            subscriptionRepository.save(sub);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment signature.");
        }

        Date now = new Date();
        Date expiry = new Date(now.getTime() + (long) sub.getBillingPeriodDays() * 24 * 60 * 60 * 1000);

        sub.setStatus("ACTIVE");
        sub.setRazorpayPaymentId(request.getRazorpayPaymentId());
        sub.setRazorpaySignature(request.getRazorpaySignature());
        sub.setStartDate(now);
        sub.setEndDate(expiry);
        final SubscriptionEntity savedSub = subscriptionRepository.save(sub);

        // Activate restaurant
        restaurantRepository.findById(savedSub.getRestaurantId()).ifPresent(rest -> {
            rest.setSubscriptionStatus("ACTIVE");
            rest.setSubscriptionPlan(savedSub.getPlanName());
            rest.setSubscriptionExpiresAt(expiry);
            restaurantRepository.save(rest);
        });

        return savedSub;
    }

    @Override
    public SubscriptionEntity getActiveSubscription(String restaurantId) {
        List<SubscriptionEntity> list = subscriptionRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        if (list.isEmpty()) {
            return null;
        }
        return list.get(0);
    }

    @Override
    public List<SubscriptionEntity> getAllSubscriptions() {
        return subscriptionRepository.findAllByOrderByCreatedAtDesc();
    }
}
