import API from "./api";

export const login = async (email, password) => {
    try {
        const response = await API.post("/login", { email, password });
        if (response.data && response.data.token) {
            localStorage.setItem("admin_token", response.data.token);
            localStorage.setItem("admin_user", JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Login failed";
        throw new Error(msg);
    }
};

export const registerPartner = async (name, email, password, phone) => {
    try {
        const response = await API.post("/register", {
            name,
            email,
            password,
            phone,
            role: "ROLE_RESTAURANT"
        });
        if (response.data && response.data.token) {
            localStorage.setItem("admin_token", response.data.token);
            localStorage.setItem("admin_user", JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Partner registration failed";
        throw new Error(msg);
    }
};

export const forgotPasswordApi = async (email) => {
    try {
        const response = await API.post("/forgot-password", { email });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Failed to send reset code";
        throw new Error(msg);
    }
};

export const verifyResetTokenApi = async (email, tokenOrOtp) => {
    try {
        const response = await API.post("/verify-reset-token", { email, tokenOrOtp });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Invalid or expired verification code";
        throw new Error(msg);
    }
};

export const resetPasswordApi = async (email, tokenOrOtp, newPassword) => {
    try {
        const response = await API.post("/reset-password", { email, tokenOrOtp, newPassword });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Failed to reset password";
        throw new Error(msg);
    }
};

export const getCurrentUser = () => {
    const user = localStorage.getItem("admin_user");
    return user ? JSON.parse(user) : null;
};

export const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
};
