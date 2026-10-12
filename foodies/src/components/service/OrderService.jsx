import axios from "axios";
import { getAuthToken } from "./AuthService";
import { API_BASE_URL } from "../../config";

const API_URL = `${API_BASE_URL}/orders`;

const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createOrderApi = async (orderData) => {
    try {
        const response = await axios.post(`${API_URL}/create`, orderData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Error creating order";
        throw new Error(msg);
    }
};

export const verifyPaymentApi = async (verifyData) => {
    try {
        const response = await axios.post(`${API_URL}/verify`, verifyData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Payment verification failed";
        throw new Error(msg);
    }
};

export const getUserOrdersApi = async () => {
    try {
        const response = await axios.get(API_URL, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Failed to load orders";
        throw new Error(msg);
    }
};

export const deleteOrderApi = async (orderId) => {
    try {
        await axios.delete(`${API_URL}/${orderId}`, {
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error("Error cancelling order:", error);
    }
};
