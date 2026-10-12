import { createContext, useState, useEffect } from "react";
import { fetchFoodList } from "../components/service/FoodService";
import { addToCartApi, removeFromCartApi, getCartApi, clearCartApi } from "../components/service/CartService";
import { getAuthToken, getCurrentUser, logoutUser } from "../components/service/AuthService";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
    const [foodList, setFoodList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [cartRestaurant, setCartRestaurant] = useState(null);
    const [token, setToken] = useState(getAuthToken() || "");
    const [user, setUser] = useState(getCurrentUser() || null);

    const increaseQty = async (foodId, itemRestaurantId = null, itemRestaurantName = null) => {
        // Enforce single restaurant rule: if item is from another restaurant, reset cart for new restaurant
        if (itemRestaurantId && cartRestaurant && cartRestaurant.id !== itemRestaurantId) {
            const hasExisting = Object.values(quantities).some(q => q > 0);
            if (hasExisting) {
                // Switching restaurant
                setQuantities({ [foodId]: 1 });
                setCartRestaurant({ id: itemRestaurantId, name: itemRestaurantName });
                if (token) {
                    await clearCartApi();
                    await addToCartApi(foodId);
                }
                return;
            }
        }

        if (itemRestaurantId && !cartRestaurant) {
            setCartRestaurant({ id: itemRestaurantId, name: itemRestaurantName });
        }

        setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
        if (token) {
            await addToCartApi(foodId);
        }
    };

    const decreaseQty = async (foodId) => {
        setQuantities((prev) => {
            const newQty = prev[foodId] > 0 ? prev[foodId] - 1 : 0;
            const updated = { ...prev, [foodId]: newQty };
            const anyLeft = Object.values(updated).some(q => q > 0);
            if (!anyLeft) {
                setCartRestaurant(null);
            }
            return updated;
        });
        if (token) {
            await removeFromCartApi(foodId);
        }
    };

    const removeFromCart = (foodId) => {
        setQuantities((prevQuantities) => {
            const updateQuantities = { ...prevQuantities };
            delete updateQuantities[foodId];
            const anyLeft = Object.values(updateQuantities).some(q => q > 0);
            if (!anyLeft) {
                setCartRestaurant(null);
            }
            return updateQuantities;
        });
    };

    const clearCart = async () => {
        setQuantities({});
        setCartRestaurant(null);
        if (token) {
            await clearCartApi();
        }
    };

    const logout = () => {
        logoutUser();
        setToken("");
        setUser(null);
        setQuantities({});
        setCartRestaurant(null);
    };

    useEffect(() => {
        async function loadData() {
            try {
                const data = await fetchFoodList();
                setFoodList(data || []);
            } catch (err) {
                console.error("Food list fetch error:", err);
            }

            if (token) {
                try {
                    const cartData = await getCartApi();
                    if (cartData && cartData.items) {
                        setQuantities(cartData.items);
                    }
                } catch (err) {
                    console.error("Cart sync error:", err);
                }
            }
        }

        loadData();
    }, [token]);

    const contextValue = {
        foodList,
        increaseQty,
        decreaseQty,
        quantities,
        cartRestaurant,
        setCartRestaurant,
        removeFromCart,
        clearCart,
        token,
        setToken,
        user,
        setUser,
        logout
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};