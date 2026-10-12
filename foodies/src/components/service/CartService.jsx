import axios from "axios";
import { getAuthToken } from "./AuthService";
import { API_BASE_URL } from "../../config";

const API_URL = `${API_BASE_URL}/cart`;

const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const addToCartApi = async (foodId) => {
    try {
        const response = await axios.post(API_URL, { foodId }, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Cart add error:", error);
    }
};

export const removeFromCartApi = async (foodId) => {
    try {
        const response = await axios.post(`${API_URL}/remove`, { foodId }, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Cart remove error:", error);
    }
};

export const getCartApi = async () => {
    try {
        const token = getAuthToken();
        if (!token) return { items: {} };
        const response = await axios.get(API_URL, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Fetch cart error:", error);
        return { items: {} };
    }
};

export const clearCartApi = async () => {
    try {
        await axios.delete(API_URL, {
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error("Clear cart error:", error);
    }
};
