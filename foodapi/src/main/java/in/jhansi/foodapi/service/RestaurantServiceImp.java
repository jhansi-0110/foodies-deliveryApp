package in.jhansi.foodapi.service;

import java.io.IOException;
import java.util.Date;
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
import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.FoodResponse;
import in.jhansi.foodapi.io.RestaurantRequest;
import in.jhansi.foodapi.io.RestaurantResponse;
import in.jhansi.foodapi.repository.FoodRepository;
import in.jhansi.foodapi.repository.RestaurantRepository;
import in.jhansi.foodapi.repository.UserRepository;

@Service
public class RestaurantServiceImp implements RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Override
    public List<RestaurantResponse> getAllActiveRestaurants() {
        return restaurantRepository.findByActiveTrueAndApprovedTrue()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RestaurantResponse> getAllRestaurantsAdmin() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RestaurantResponse getRestaurantById(String id) {
        RestaurantEntity entity = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found with id: " + id));

        RestaurantResponse response = convertToResponse(entity);
        List<FoodEntity> foods = foodRepository.findByRestaurantIdAndAvailableTrue(id);
        response.setMenu(foods.stream().map(this::convertFoodToResponse).collect(Collectors.toList()));
        return response;
    }

    @Override
    public RestaurantResponse createRestaurant(RestaurantRequest request, MultipartFile file, String ownerId, String ownerName, String ownerEmail) {
        String imageUrl = null;
        String publicId = null;

        if (file != null && !file.isEmpty()) {
            Map<?, ?> uploadResult = uploadToCloudinary(file);
            imageUrl = uploadResult.get("secure_url").toString();
            publicId = uploadResult.get("public_id").toString();
        }

        // Determine initial approval: automatic only if created by platform admin
        boolean isAdminOwner = false;
        if (StringUtils.hasText(ownerId)) {
            UserEntity owner = userRepository.findById(ownerId).orElse(null);
            if (owner != null && "ROLE_ADMIN".equals(owner.getRole())) {
                isAdminOwner = true;
            }
        }
        boolean initialApproval = isAdminOwner;

        RestaurantEntity restaurant = RestaurantEntity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .cuisine(request.getCuisine())
                .address(request.getAddress())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .phone(request.getPhone())
                .email(request.getEmail())
                .imageUrl(imageUrl)
                .imagePublicId(publicId)
                .deliveryTimeMinutes(request.getDeliveryTimeMinutes() > 0 ? request.getDeliveryTimeMinutes() : 30)
                .deliveryFee(request.getDeliveryFee() >= 0 ? request.getDeliveryFee() : 25.0)
                .minimumOrder(request.getMinimumOrder() >= 0 ? request.getMinimumOrder() : 99.0)
                .open(request.isOpen())
                .active(initialApproval)
                .approved(initialApproval)
                .ownerId(ownerId)
                .ownerName(ownerName)
                .ownerEmail(ownerEmail)
                .subscriptionStatus("ACTIVE")
                .subscriptionPlan("STANDARD")
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        final RestaurantEntity savedRestaurant = restaurantRepository.save(restaurant);

        // Notify admin if newly registered by partner
        if (!initialApproval) {
            notificationService.createNotification(
                    null,
                    "ROLE_ADMIN",
                    "RESTAURANT_REGISTRATION",
                    "New Restaurant Application: " + savedRestaurant.getName(),
                    "Restaurant '" + savedRestaurant.getName() + "' by " + ownerName + " (" + ownerEmail + ") is pending your review and approval.",
                    savedRestaurant.getId()
            );
        }

        // Update owner's restaurantId if ownerId exists
        if (StringUtils.hasText(ownerId)) {
            userRepository.findById(ownerId).ifPresent(user -> {
                user.setRestaurantId(savedRestaurant.getId());
                if (!"ROLE_ADMIN".equals(user.getRole())) {
                    user.setRole("ROLE_RESTAURANT");
                }
                userRepository.save(user);
            });
        }

        return convertToResponse(savedRestaurant);
    }

    @Override
    public RestaurantResponse updateRestaurant(String id, RestaurantRequest request, MultipartFile file, String currentUserId, String currentUserRole) {
        RestaurantEntity restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found with id: " + id));

        // Ownership check
        if (!"ROLE_ADMIN".equals(currentUserRole) && (restaurant.getOwnerId() == null || !restaurant.getOwnerId().equals(currentUserId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this restaurant.");
        }

        if (file != null && !file.isEmpty()) {
            if (restaurant.getImagePublicId() != null) {
                deleteFromCloudinary(restaurant.getImagePublicId());
            }
            Map<?, ?> uploadResult = uploadToCloudinary(file);
            restaurant.setImageUrl(uploadResult.get("secure_url").toString());
            restaurant.setImagePublicId(uploadResult.get("public_id").toString());
        }

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setCuisine(request.getCuisine());
        restaurant.setAddress(request.getAddress());
        restaurant.setCity(request.getCity());
        restaurant.setPostalCode(request.getPostalCode());
        restaurant.setPhone(request.getPhone());
        restaurant.setEmail(request.getEmail());
        restaurant.setDeliveryTimeMinutes(request.getDeliveryTimeMinutes());
        restaurant.setDeliveryFee(request.getDeliveryFee());
        restaurant.setMinimumOrder(request.getMinimumOrder());
        restaurant.setOpen(request.isOpen());
        restaurant.setUpdatedAt(new Date());

        restaurant = restaurantRepository.save(restaurant);
        return convertToResponse(restaurant);
    }

    @Override
    public RestaurantResponse toggleOpenStatus(String id, boolean open, String currentUserId, String currentUserRole) {
        RestaurantEntity restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found with id: " + id));

        if (!"ROLE_ADMIN".equals(currentUserRole) && (restaurant.getOwnerId() == null || !restaurant.getOwnerId().equals(currentUserId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized.");
        }

        restaurant.setOpen(open);
        restaurant.setUpdatedAt(new Date());
        return convertToResponse(restaurantRepository.save(restaurant));
    }

    @Override
    public RestaurantResponse updateApprovalStatus(String id, boolean approved) {
        RestaurantEntity restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found with id: " + id));

        restaurant.setApproved(approved);
        restaurant.setActive(approved);
        restaurant.setUpdatedAt(new Date());
        RestaurantEntity saved = restaurantRepository.save(restaurant);

        if (approved) {
            // 1. In-app notification to restaurant owner
            if (StringUtils.hasText(saved.getOwnerId())) {
                notificationService.createNotification(
                        saved.getOwnerId(),
                        "ROLE_RESTAURANT",
                        "RESTAURANT_APPROVED",
                        "Restaurant Approved! 🎉",
                        "Congratulations! Your restaurant '" + saved.getName() + "' has been approved by the platform administrator. You can now add dishes to your menu and receive orders.",
                        saved.getId()
                );
            }
            // 2. Dispatch simulated / real email confirmation
            String targetEmail = StringUtils.hasText(saved.getOwnerEmail()) ? saved.getOwnerEmail() : saved.getEmail();
            if (StringUtils.hasText(targetEmail)) {
                emailService.sendRestaurantApprovalEmail(targetEmail, saved.getOwnerName(), saved.getName());
            }
        }

        return convertToResponse(saved);
    }

    @Override
    public RestaurantResponse updateActiveStatus(String id, boolean active) {
        RestaurantEntity restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found with id: " + id));

        restaurant.setActive(active);
        restaurant.setUpdatedAt(new Date());
        return convertToResponse(restaurantRepository.save(restaurant));
    }

    @Override
    public RestaurantResponse getMyRestaurant(String ownerId) {
        List<RestaurantEntity> list = restaurantRepository.findByOwnerId(ownerId);
        if (list.isEmpty()) {
            return null;
        }
        return convertToResponse(list.get(0));
    }

    @Override
    public void deleteRestaurant(String id) {
        RestaurantEntity restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found with id: " + id));

        if (restaurant.getImagePublicId() != null) {
            deleteFromCloudinary(restaurant.getImagePublicId());
        }

        // Clean up foods
        List<FoodEntity> foods = foodRepository.findByRestaurantId(id);
        for (FoodEntity food : foods) {
            if (food.getImagePublicId() != null) {
                deleteFromCloudinary(food.getImagePublicId());
            }
            foodRepository.deleteById(food.getId());
        }

        restaurantRepository.deleteById(id);
    }

    private Map<?, ?> uploadToCloudinary(MultipartFile file) {
        try {
            return cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "restaurant-banners", "resource_type", "image")
            );
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary upload failed: " + ex.getMessage());
        }
    }

    private void deleteFromCloudinary(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception ignored) {
        }
    }

    private RestaurantResponse convertToResponse(RestaurantEntity entity) {
        return RestaurantResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .cuisine(entity.getCuisine())
                .address(entity.getAddress())
                .city(entity.getCity())
                .postalCode(entity.getPostalCode())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .imageUrl(entity.getImageUrl())
                .rating(entity.getRating())
                .deliveryTimeMinutes(entity.getDeliveryTimeMinutes())
                .deliveryFee(entity.getDeliveryFee())
                .minimumOrder(entity.getMinimumOrder())
                .open(entity.isOpen())
                .active(entity.isActive())
                .approved(entity.isApproved())
                .ownerId(entity.getOwnerId())
                .ownerName(entity.getOwnerName())
                .ownerEmail(entity.getOwnerEmail())
                .subscriptionStatus(entity.getSubscriptionStatus())
                .subscriptionPlan(entity.getSubscriptionPlan())
                .subscriptionExpiresAt(entity.getSubscriptionExpiresAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private FoodResponse convertFoodToResponse(FoodEntity entity) {
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
                .build();
    }
}
