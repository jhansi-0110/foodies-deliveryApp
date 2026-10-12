package in.jhansi.foodapi.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import in.jhansi.foodapi.entity.RestaurantEntity;

@Repository
public interface RestaurantRepository extends MongoRepository<RestaurantEntity, String> {
    List<RestaurantEntity> findByActiveTrueAndApprovedTrue();
    List<RestaurantEntity> findByOwnerId(String ownerId);
    List<RestaurantEntity> findByCityIgnoreCase(String city);
    List<RestaurantEntity> findByCuisineContainingIgnoreCase(String cuisine);
    long countByActiveTrue();
}
