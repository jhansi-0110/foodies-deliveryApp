import API from "./api";

export const getStats = async () => {
    const res = await API.get("/admin/stats");
    return res.data;
};

export const getUsers = async () => {
    const res = await API.get("/admin/users");
    return res.data;
};

export const toggleUserStatus = async (id, active) => {
    const res = await API.patch(`/admin/users/${id}/status?active=${active}`);
    return res.data;
};

export const deleteUser = async (id) => {
    await API.delete(`/admin/users/${id}`);
};
