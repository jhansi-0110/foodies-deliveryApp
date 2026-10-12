package in.jhansi.foodapi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import in.jhansi.foodapi.entity.FoodEntity;

@Repository
public interface FoodRepository extends MongoRepository<FoodEntity, String> {
    List<FoodEntity> findByRestaurantId(String restaurantId);
    List<FoodEntity> findByRestaurantIdAndAvailableTrue(String restaurantId);
    long countByRestaurantId(String restaurantId);
    List<FoodEntity> findByNameContainingIgnoreCase(String name);
    Optional<FoodEntity> findByNameIgnoreCase(String name);
}