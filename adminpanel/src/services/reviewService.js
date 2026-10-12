import API from "./api";

export const getAllReviews = async () => {
    try {
        const res = await API.get("/reviews/all");
        return res.data;
    } catch (err) {
        console.error("Failed to fetch all reviews:", err);
        return [];
    }
};

export const getRestaurantReviews = async (restaurantId) => {
    try {
        const res = await API.get(`/reviews/restaurant/${restaurantId}`);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch restaurant reviews:", err);
        return [];
    }
};
