package in.jhansi.foodapi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import in.jhansi.foodapi.entity.OrderEntity;

@Repository
public interface OrderRepository extends MongoRepository<OrderEntity, String> {
    List<OrderEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    List<OrderEntity> findByRestaurantIdOrderByCreatedAtDesc(String restaurantId);
    List<OrderEntity> findAllByOrderByCreatedAtDesc();
    Optional<OrderEntity> findByRazorpayOrderId(String razorpayOrderId);
    long countByStatus(String status);
    long countByPaymentStatus(String paymentStatus);
    long countByRestaurantId(String restaurantId);
}
