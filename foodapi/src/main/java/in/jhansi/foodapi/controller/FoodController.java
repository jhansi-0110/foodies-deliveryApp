package in.jhansi.foodapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import in.jhansi.foodapi.entity.FoodEntity;
import in.jhansi.foodapi.entity.RestaurantEntity;
import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.FoodRequest;
import in.jhansi.foodapi.io.FoodResponse;
import in.jhansi.foodapi.repository.FoodRepository;
import in.jhansi.foodapi.repository.RestaurantRepository;
import in.jhansi.foodapi.service.FoodService;
import in.jhansi.foodapi.service.UserService;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class FoodController {

    @Autowired
    private FoodService foodService;

    @Autowired
    private UserService userService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodRepository foodRepository;

    @PostMapping
    public FoodResponse addFood(
            @RequestPart("food") String foodString,
            @RequestPart(value = "file", required = false) MultipartFile file) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        FoodRequest request = objectMapper.readValue(foodString, FoodRequest.class);

        UserEntity currentUser = userService.getCurrentUser();
        // Enforce tenant isolation for restaurant owners: strictly assign their owned restaurant
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            List<RestaurantEntity> myRests = restaurantRepository.findByOwnerId(currentUser.getId());
            if (myRests.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You must onboard a restaurant before adding dishes.");
            }
            RestaurantEntity myRest = myRests.get(0);
            request.setRestaurantId(myRest.getId());
            request.setRestaurantName(myRest.getName());
        }

        return foodService.addFood(request, file);
    }

    @GetMapping
    public List<FoodResponse> readFood() {
        return foodService.readFoods();
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<FoodResponse> readFoodsByRestaurant(@PathVariable String restaurantId) {
        return foodService.readFoodsByRestaurant(restaurantId);
    }

    @GetMapping("/{id}")
    public FoodResponse readFood(@PathVariable String id) {
        return foodService.readFood(id);
    }

    @PutMapping("/{id}")
    public FoodResponse updateFood(
            @PathVariable String id,
            @RequestPart("food") String foodString,
            @RequestPart(value = "file", required = false) MultipartFile file) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        FoodRequest request = objectMapper.readValue(foodString, FoodRequest.class);

        UserEntity currentUser = userService.getCurrentUser();
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            FoodEntity existingFood = foodRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food item not found with id: " + id));
            List<RestaurantEntity> myRests = restaurantRepository.findByOwnerId(currentUser.getId());
            if (myRests.isEmpty() || !myRests.get(0).getId().equals(existingFood.getRestaurantId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: you cannot modify dishes belonging to other restaurants.");
            }
            request.setRestaurantId(myRests.get(0).getId());
            request.setRestaurantName(myRests.get(0).getName());
        }

        return foodService.updateFood(id, request, file);
    }

    @PatchMapping("/{id}/availability")
    public FoodResponse toggleAvailability(
            @PathVariable String id,
            @RequestParam boolean available) {

        UserEntity currentUser = userService.getCurrentUser();
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            FoodEntity existingFood = foodRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food item not found with id: " + id));
            List<RestaurantEntity> myRests = restaurantRepository.findByOwnerId(currentUser.getId());
            if (myRests.isEmpty() || !myRests.get(0).getId().equals(existingFood.getRestaurantId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: you cannot change availability for other restaurants.");
            }
        }

        return foodService.toggleAvailability(id, available);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFood(@PathVariable String id) {
        UserEntity currentUser = userService.getCurrentUser();
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            FoodEntity existingFood = foodRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food item not found with id: " + id));
            List<RestaurantEntity> myRests = restaurantRepository.findByOwnerId(currentUser.getId());
            if (myRests.isEmpty() || !myRests.get(0).getId().equals(existingFood.getRestaurantId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: you cannot delete dishes belonging to other restaurants.");
            }
        }
        foodService.deleteFood(id);
    }
}
