import axios from "axios";
import { API_BASE_URL } from "../../config";

const API_URL = `${API_BASE_URL}/restaurants`;

export const fetchRestaurants = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        return [];
    }
};

export const fetchRestaurantDetails = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurant details:", error);
        throw error;
    }
};

export const fetchRestaurantFoods = async (restaurantId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/foods/restaurant/${restaurantId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurant foods:", error);
        return [];
    }
};

export const fetchMyRestaurant = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/my-restaurant`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        console.error("Error fetching my restaurant:", error);
        return null;
    }
};

export const createRestaurantApi = async (restaurantData, file, token) => {
    try {
        const formData = new FormData();
        formData.append("restaurant", JSON.stringify(restaurantData));
        if (file) {
            formData.append("file", file);
        }
        const response = await axios.post(API_URL, formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Failed to onboard restaurant";
        throw new Error(msg);
    }
};

export const registerRestaurantApi = createRestaurantApi;

export const fetchSubscriptionPlans = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/subscriptions/plans`);
        return response.data;
    } catch (error) {
        console.error("Error fetching plans:", error);
        return [];
    }
};

export const createSubscriptionApi = async (restaurantId, planId, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/subscriptions/create`, { restaurantId, planId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Subscription creation failed";
        throw new Error(msg);
    }
};

export const verifySubscriptionApi = async (verifyData, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/subscriptions/verify`, verifyData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Subscription payment verification failed";
        throw new Error(msg);
    }
};
