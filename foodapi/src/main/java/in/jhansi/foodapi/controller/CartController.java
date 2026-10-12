package in.jhansi.foodapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.io.CartRequest;
import in.jhansi.foodapi.io.CartResponse;
import in.jhansi.foodapi.service.CartService;
import in.jhansi.foodapi.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @PostMapping
    public CartResponse addToCart(@Valid @RequestBody CartRequest request) {
        UserEntity currentUser = userService.getCurrentUser();
        return cartService.addToCart(currentUser.getId(), request.getFoodId());
    }

    @PostMapping("/remove")
    public CartResponse removeFromCart(@Valid @RequestBody CartRequest request) {
        UserEntity currentUser = userService.getCurrentUser();
        return cartService.removeFromCart(currentUser.getId(), request.getFoodId());
    }

    @GetMapping
    public CartResponse getCart() {
        UserEntity currentUser = userService.getCurrentUser();
        return cartService.getCart(currentUser.getId());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCart() {
        UserEntity currentUser = userService.getCurrentUser();
        cartService.clearCart(currentUser.getId());
    }
}
