import axios from "axios";
import { API_BASE_URL } from "../../config";

const API_URL = `${API_BASE_URL}/reviews`;

export const addReviewApi = async (reviewData, token) => {
    try {
        const response = await axios.post(API_URL, reviewData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Failed to submit review";
        throw new Error(msg);
    }
};

export const fetchFoodReviews = async (foodId) => {
    try {
        const response = await axios.get(`${API_URL}/food/${foodId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching food reviews:", error);
        return [];
    }
};

export const fetchRestaurantReviews = async (restaurantId) => {
    try {
        const response = await axios.get(`${API_URL}/restaurant/${restaurantId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurant reviews:", error);
        return [];
    }
};
