package in.jhansi.foodapi.service;

import java.util.List;

import in.jhansi.foodapi.entity.SubscriptionEntity;
import in.jhansi.foodapi.io.SubscriptionPlanDto;
import in.jhansi.foodapi.io.VerifyPaymentRequest;

public interface SubscriptionService {
    List<SubscriptionPlanDto> getAvailablePlans();
    SubscriptionEntity createSubscriptionOrder(String restaurantId, String planId, String ownerId, String ownerEmail);
    SubscriptionEntity verifySubscriptionPayment(VerifyPaymentRequest request);
    SubscriptionEntity getActiveSubscription(String restaurantId);
    List<SubscriptionEntity> getAllSubscriptions();
}
