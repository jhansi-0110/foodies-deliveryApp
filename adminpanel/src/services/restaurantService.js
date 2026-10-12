import API from "./api";

export const getAllRestaurants = async () => {
    const res = await API.get("/restaurants/all");
    return res.data;
};

export const getMyRestaurant = async () => {
    const res = await API.get("/restaurants/my-restaurant");
    return res.data;
};

export const createRestaurant = async (data, imageFile) => {
    const formData = new FormData();
    formData.append("restaurant", JSON.stringify(data));
    if (imageFile) {
        formData.append("file", imageFile);
    }
    const res = await API.post("/restaurants", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

export const updateRestaurant = async (id, data, imageFile) => {
    const formData = new FormData();
    formData.append("restaurant", JSON.stringify(data));
    if (imageFile) {
        formData.append("file", imageFile);
    }
    const res = await API.put(`/restaurants/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

export const toggleOpenStatus = async (id, open) => {
    const res = await API.patch(`/restaurants/${id}/toggle-open?open=${open}`);
    return res.data;
};

export const updateApproval = async (id, approved) => {
    const res = await API.patch(`/restaurants/${id}/approve?approved=${approved}`);
    return res.data;
};

export const updateActive = async (id, active) => {
    const res = await API.patch(`/restaurants/${id}/active?active=${active}`);
    return res.data;
};

export const deleteRestaurant = async (id) => {
    await API.delete(`/restaurants/${id}`);
};
