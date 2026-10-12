package in.jhansi.foodapi.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import in.jhansi.foodapi.io.RestaurantRequest;
import in.jhansi.foodapi.io.RestaurantResponse;

public interface RestaurantService {
    List<RestaurantResponse> getAllActiveRestaurants();
    List<RestaurantResponse> getAllRestaurantsAdmin();
    RestaurantResponse getRestaurantById(String id);
    RestaurantResponse createRestaurant(RestaurantRequest request, MultipartFile file, String ownerId, String ownerName, String ownerEmail);
    RestaurantResponse updateRestaurant(String id, RestaurantRequest request, MultipartFile file, String currentUserId, String currentUserRole);
    RestaurantResponse toggleOpenStatus(String id, boolean open, String currentUserId, String currentUserRole);
    RestaurantResponse updateApprovalStatus(String id, boolean approved);
    RestaurantResponse updateActiveStatus(String id, boolean active);
    RestaurantResponse getMyRestaurant(String ownerId);
    void deleteRestaurant(String id);
}
