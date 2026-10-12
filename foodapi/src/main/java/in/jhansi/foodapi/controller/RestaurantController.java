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

import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.RestaurantRequest;
import in.jhansi.foodapi.io.RestaurantResponse;
import in.jhansi.foodapi.service.RestaurantService;
import in.jhansi.foodapi.service.UserService;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<RestaurantResponse> getAllActiveRestaurants() {
        return restaurantService.getAllActiveRestaurants();
    }

    @GetMapping("/all")
    public List<RestaurantResponse> getAllRestaurantsAdmin() {
        UserEntity currentUser = userService.getCurrentUser();
        if ("ROLE_ADMIN".equals(currentUser.getRole())) {
            return restaurantService.getAllRestaurantsAdmin();
        } else if ("ROLE_RESTAURANT".equals(currentUser.getRole())) {
            RestaurantResponse myRest = restaurantService.getMyRestaurant(currentUser.getId());
            return myRest != null ? List.of(myRest) : List.of();
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
    }

    @GetMapping("/{id}")
    public RestaurantResponse getRestaurantById(@PathVariable String id) {
        return restaurantService.getRestaurantById(id);
    }

    @GetMapping({"/my-restaurant", "/me"})
    public RestaurantResponse getMyRestaurant() {
        UserEntity currentUser = userService.getCurrentUser();
        return restaurantService.getMyRestaurant(currentUser.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RestaurantResponse createRestaurant(
            @RequestPart("restaurant") String restaurantJson,
            @RequestPart(value = "file", required = false) MultipartFile file) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        RestaurantRequest request = objectMapper.readValue(restaurantJson, RestaurantRequest.class);

        UserEntity currentUser = userService.getCurrentUser();
        return restaurantService.createRestaurant(
                request,
                file,
                currentUser.getId(),
                currentUser.getName(),
                currentUser.getEmail()
        );
    }

    @PutMapping("/{id}")
    public RestaurantResponse updateRestaurant(
            @PathVariable String id,
            @RequestPart("restaurant") String restaurantJson,
            @RequestPart(value = "file", required = false) MultipartFile file) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        RestaurantRequest request = objectMapper.readValue(restaurantJson, RestaurantRequest.class);

        UserEntity currentUser = userService.getCurrentUser();
        return restaurantService.updateRestaurant(id, request, file, currentUser.getId(), currentUser.getRole());
    }

    @PatchMapping("/{id}/toggle-open")
    public RestaurantResponse toggleOpenStatus(
            @PathVariable String id,
            @RequestParam boolean open) {

        UserEntity currentUser = userService.getCurrentUser();
        return restaurantService.toggleOpenStatus(id, open, currentUser.getId(), currentUser.getRole());
    }

    @PatchMapping("/{id}/approve")
    public RestaurantResponse updateApprovalStatus(
            @PathVariable String id,
            @RequestParam boolean approved) {

        UserEntity currentUser = userService.getCurrentUser();
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can approve restaurants.");
        }
        return restaurantService.updateApprovalStatus(id, approved);
    }

    @PatchMapping("/{id}/active")
    public RestaurantResponse updateActiveStatus(
            @PathVariable String id,
            @RequestParam boolean active) {

        UserEntity currentUser = userService.getCurrentUser();
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            RestaurantResponse rest = restaurantService.getRestaurantById(id);
            if (rest == null || !currentUser.getId().equals(rest.getOwnerId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: cannot modify other restaurants.");
            }
        }
        return restaurantService.updateActiveStatus(id, active);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRestaurant(@PathVariable String id) {
        UserEntity currentUser = userService.getCurrentUser();
        if (!"ROLE_ADMIN".equals(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can delete restaurants.");
        }
        restaurantService.deleteRestaurant(id);
    }
}
