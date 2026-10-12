package in.jhansi.foodapi.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import in.jhansi.foodapi.entity.ReviewEntity;

@Repository
public interface ReviewRepository extends MongoRepository<ReviewEntity, String> {
    List<ReviewEntity> findByFoodIdOrderByCreatedAtDesc(String foodId);
    List<ReviewEntity> findByRestaurantIdOrderByCreatedAtDesc(String restaurantId);
    List<ReviewEntity> findAllByOrderByCreatedAtDesc();
}
