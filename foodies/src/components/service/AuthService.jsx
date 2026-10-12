import axios from "axios";
import { API_BASE_URL } from "../../config";

const API_URL = API_BASE_URL;

export const registerUser = async (name, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            name,
            email,
            password
        });
        if (response.data && response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Registration failed";
        throw new Error(msg);
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password
        });
        if (response.data && response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Invalid credentials";
        throw new Error(msg);
    }
};

export const forgotPasswordApi = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/forgot-password`, { email });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Failed to send reset code";
        throw new Error(msg);
    }
};

export const verifyResetTokenApi = async (email, tokenOrOtp) => {
    try {
        const response = await axios.post(`${API_URL}/verify-reset-token`, {
            email,
            tokenOrOtp
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Invalid or expired reset code";
        throw new Error(msg);
    }
};

export const resetPasswordApi = async (email, tokenOrOtp, newPassword) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, {
            email,
            tokenOrOtp,
            newPassword
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Failed to reset password";
        throw new Error(msg);
    }
};

export const getAuthToken = () => {
    return localStorage.getItem("token");
};

export const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
