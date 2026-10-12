import API from "./api";

export const getPlans = async () => {
    const res = await API.get("/subscriptions/plans");
    return res.data;
};

export const createSubscription = async (restaurantId, planId) => {
    const res = await API.post("/subscriptions/create", { restaurantId, planId });
    return res.data;
};

export const verifySubscription = async (verifyData) => {
    const res = await API.post("/subscriptions/verify", verifyData);
    return res.data;
};

export const getMySubscription = async (restaurantId) => {
    const res = await API.get(`/subscriptions/restaurant/${restaurantId}`);
    return res.data;
};

export const getAllSubscriptions = async () => {
    const res = await API.get("/subscriptions/all");
    return res.data;
};
