package in.jhansi.foodapi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import in.jhansi.foodapi.entity.SubscriptionEntity;

@Repository
public interface SubscriptionRepository extends MongoRepository<SubscriptionEntity, String> {
    List<SubscriptionEntity> findByRestaurantId(String restaurantId);
    List<SubscriptionEntity> findByRestaurantIdOrderByCreatedAtDesc(String restaurantId);
    List<SubscriptionEntity> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    Optional<SubscriptionEntity> findByRazorpayOrderId(String razorpayOrderId);
    List<SubscriptionEntity> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
