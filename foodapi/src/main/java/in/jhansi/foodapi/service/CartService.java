package in.jhansi.foodapi.service;

import in.jhansi.foodapi.io.CartResponse;

public interface CartService {
    CartResponse addToCart(String userId, String foodId);
    CartResponse removeFromCart(String userId, String foodId);
    CartResponse getCart(String userId);
    void clearCart(String userId);
}
