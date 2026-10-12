package in.jhansi.foodapi.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import in.jhansi.foodapi.io.FoodRequest;
import in.jhansi.foodapi.io.FoodResponse;

public interface FoodService {
    String uploadFile(MultipartFile file);
    FoodResponse addFood(FoodRequest request, MultipartFile file);
    List<FoodResponse> readFoods();
    List<FoodResponse> readFoodsByRestaurant(String restaurantId);
    FoodResponse readFood(String id);
    FoodResponse updateFood(String id, FoodRequest request, MultipartFile file);
    FoodResponse toggleAvailability(String id, boolean available);
    boolean deleteFile(String filename);
    void deleteFood(String id);
}
