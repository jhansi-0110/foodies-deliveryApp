package in.jhansi.foodapi.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.jhansi.foodapi.entity.CartEntity;
import in.jhansi.foodapi.io.CartResponse;
import in.jhansi.foodapi.repository.CartRepository;

@Service
public class CartServiceImp implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Override
    public CartResponse addToCart(String userId, String foodId) {
        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> CartEntity.builder()
                        .userId(userId)
                        .items(new HashMap<>())
                        .build());

        Map<String, Integer> items = cart.getItems();
        if (items == null) {
            items = new HashMap<>();
        }

        items.put(foodId, items.getOrDefault(foodId, 0) + 1);
        cart.setItems(items);

        cart = cartRepository.save(cart);
        return convertToResponse(cart);
    }

    @Override
    public CartResponse removeFromCart(String userId, String foodId) {
        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> CartEntity.builder()
                        .userId(userId)
                        .items(new HashMap<>())
                        .build());

        Map<String, Integer> items = cart.getItems();
        if (items != null && items.containsKey(foodId)) {
            int currentQty = items.get(foodId);
            if (currentQty <= 1) {
                items.remove(foodId);
            } else {
                items.put(foodId, currentQty - 1);
            }
            cart.setItems(items);
            cart = cartRepository.save(cart);
        }

        return convertToResponse(cart);
    }

    @Override
    public CartResponse getCart(String userId) {
        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> CartEntity.builder()
                        .userId(userId)
                        .items(new HashMap<>())
                        .build());

        return convertToResponse(cart);
    }

    @Override
    public void clearCart(String userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.setItems(new HashMap<>());
            cartRepository.save(cart);
        });
    }

    private CartResponse convertToResponse(CartEntity entity) {
        return CartResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .items(entity.getItems() != null ? entity.getItems() : new HashMap<>())
                .build();
    }
}
