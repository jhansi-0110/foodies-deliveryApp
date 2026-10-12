import API from "./api";

export const addFood = async (data, image) => {
    const formData = new FormData();
    formData.append("food", JSON.stringify(data));
    if (image) {
        formData.append("file", image);
    }

    try {
        const response = await API.post("/foods", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            status: error.response?.status,
            message: error.response?.data?.message || error.message || "Failed to add food"
        };
    }
};

export const getFoodList = async () => {
    const response = await API.get("/foods");
    return response.data;
};

export const getFoodListByRestaurant = async (restaurantId) => {
    const response = await API.get(`/foods/restaurant/${restaurantId}`);
    return response.data;
};

export const updateFood = async (id, data, image) => {
    const formData = new FormData();
    formData.append("food", JSON.stringify(data));
    if (image) {
        formData.append("file", image);
    }
    const response = await API.put(`/foods/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export const toggleFoodAvailability = async (id, available) => {
    const response = await API.patch(`/foods/${id}/availability?available=${available}`);
    return response.data;
};

export const deleteFood = async (foodId) => {
    const response = await API.delete(`/foods/${foodId}`);
    return response.status === 204 || response.status === 200;
};