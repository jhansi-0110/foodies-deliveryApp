package in.jhansi.foodapi.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import in.jhansi.foodapi.entity.FoodEntity;
import in.jhansi.foodapi.entity.RestaurantEntity;
import in.jhansi.foodapi.io.FoodRequest;
import in.jhansi.foodapi.io.FoodResponse;
import in.jhansi.foodapi.repository.FoodRepository;
import in.jhansi.foodapi.repository.RestaurantRepository;

@Service
public class FoodServiceImp implements FoodService {

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    public FoodServiceImp(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public String uploadFile(MultipartFile file) {
        return uploadToCloudinary(file).get("secure_url").toString();
    }

    private Map<?, ?> uploadToCloudinary(MultipartFile file) {
        try {
            return cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "food-images",
                            "resource_type", "image"
                    )
            );
        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An error occurred while uploading the file.",
                    ex
            );
        }
    }

    @Override
    public List<FoodResponse> readFoods() {
        List<FoodEntity> dbentries = foodRepository.findAll();
        return dbentries.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<FoodResponse> readFoodsByRestaurant(String restaurantId) {
        List<FoodEntity> list = foodRepository.findByRestaurantId(restaurantId);
        return list.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public FoodResponse addFood(FoodRequest request, MultipartFile file) {
        // Enforce subscription plan menu item limits if attached to a restaurant
        String restaurantName = request.getRestaurantName();
        if (StringUtils.hasText(request.getRestaurantId())) {
            RestaurantEntity restaurant = restaurantRepository.findById(request.getRestaurantId()).orElse(null);
            if (restaurant != null) {
                if (!restaurant.isApproved()) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Your restaurant '" + restaurant.getName() + "' is currently awaiting Administrator approval. You will receive an email once approved and can then add dishes to your menu.");
                }
                if (!"ACTIVE".equalsIgnoreCase(restaurant.getSubscriptionStatus())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Your restaurant does not have an active subscription. Please subscribe to a growth plan to add menu items.");
                }
                restaurantName = restaurant.getName();
                long currentCount = foodRepository.countByRestaurantId(request.getRestaurantId());
                int maxAllowed = "BASIC".equalsIgnoreCase(restaurant.getSubscriptionPlan()) ? 15 :
                                 "STANDARD".equalsIgnoreCase(restaurant.getSubscriptionPlan()) ? 50 : 1000;
                if (currentCount >= maxAllowed) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Your " + restaurant.getSubscriptionPlan() + " subscription plan limit of " + maxAllowed + " menu items has been reached. Please upgrade your subscription.");
                }
            }
        }

        FoodEntity newFoodEntity = convertToEntity(request);
        newFoodEntity.setRestaurantName(restaurantName);

        if (file != null && !file.isEmpty()) {
            Map<?, ?> uploadResult = uploadToCloudinary(file);
            String imageUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();
            newFoodEntity.setImageUrl(imageUrl);
            newFoodEntity.setImagePublicId(publicId);
        }

        newFoodEntity = foodRepository.save(newFoodEntity);
        return convertToResponse(newFoodEntity);
    }

    @Override
    public FoodResponse updateFood(String id, FoodRequest request, MultipartFile file) {
        FoodEntity food = foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found for the id: " + id));

        if (file != null && !file.isEmpty()) {
            if (food.getImagePublicId() != null) {
                deleteFile(food.getImagePublicId());
            }
            Map<?, ?> uploadResult = uploadToCloudinary(file);
            food.setImageUrl(uploadResult.get("secure_url").toString());
            food.setImagePublicId(uploadResult.get("public_id").toString());
        }

        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setPrice(request.getPrice());
        food.setCategory(request.getCategory());
        food.setAvailable(request.isAvailable());
        food.setVeg(request.isVeg());

        food = foodRepository.save(food);
        return convertToResponse(food);
    }

    @Override
    public FoodResponse toggleAvailability(String id, boolean available) {
        FoodEntity food = foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found for the id: " + id));

        food.setAvailable(available);
        return convertToResponse(foodRepository.save(food));
    }

    @Override
    public FoodResponse readFood(String id) {
        FoodEntity existingFood = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found for the id: " + id));
        return convertToResponse(existingFood);
    }

    @Override
    public boolean deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return true;
        } catch (IOException ex) {
            return false;
        }
    }

    @Override
    public void deleteFood(String id) {
        FoodEntity existingFood = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found for the id: " + id));

        String publicId = existingFood.getImagePublicId();
        if (publicId != null) {
            deleteFile(publicId);
        }

        foodRepository.deleteById(existingFood.getId());
    }

    private FoodEntity convertToEntity(FoodRequest request) {
        return FoodEntity.builder()
                .restaurantId(request.getRestaurantId())
                .restaurantName(request.getRestaurantName())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .available(request.isAvailable())
                .veg(request.isVeg())
                .build();
    }

    private FoodResponse convertToResponse(FoodEntity entity) {
        return FoodResponse.builder()
                .id(entity.getId())
                .restaurantId(entity.getRestaurantId())
                .restaurantName(entity.getRestaurantName())
                .name(entity.getName())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .price(entity.getPrice())
                .category(entity.getCategory())
                .available(entity.isAvailable())
                .veg(entity.isVeg())
                .rating(entity.getRating() > 0 ? entity.getRating() : 4.5)
                .ratingCount(entity.getRatingCount())
                .build();
    }
}