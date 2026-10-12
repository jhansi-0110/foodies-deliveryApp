import API from "./api";

export const getAllOrders = async () => {
    try {
        const response = await API.get("/orders/all");
        return response.data;
    } catch (error) {
        console.error("Error fetching all orders:", error);
        throw error;
    }
};

export const getRestaurantOrders = async (restaurantId) => {
    try {
        const response = await API.get(`/orders/restaurant/${restaurantId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurant orders:", error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await API.patch(`/orders/status/${orderId}`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};

export const deleteOrder = async (orderId) => {
    const res = await API.delete(`/orders/${orderId}`);
    return res.status === 204 || res.status === 200;
};
