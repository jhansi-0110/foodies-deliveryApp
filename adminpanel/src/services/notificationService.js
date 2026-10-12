import API from "./api";

export const getNotifications = async () => {
    try {
        const res = await API.get("/notifications");
        return res.data;
    } catch (err) {
        console.error("Failed to fetch notifications:", err);
        return [];
    }
};

export const getUnreadCount = async () => {
    try {
        const res = await API.get("/notifications/unread-count");
        return res.data?.unreadCount || 0;
    } catch (err) {
        return 0;
    }
};

export const markAsRead = async (id) => {
    try {
        await API.patch(`/notifications/${id}/read`);
    } catch (err) {
        console.error("Failed to mark notification read:", err);
    }
};

export const markAllAsRead = async () => {
    try {
        await API.patch("/notifications/read-all");
    } catch (err) {
        console.error("Failed to mark all notifications read:", err);
    }
};
