import axiosInstance from "./axiosInstance";
import { API_PATH } from "./Apipath";

const NotificationService = {
  getAll: async () => {
    const response = await axiosInstance.get(API_PATH.NOTIFICATIONS.GET_ALL);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const url = `${API_PATH.NOTIFICATIONS.MARK_READ.replace("read", "")}${id}/read`;
    const response = await axiosInstance.patch(url);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.patch(
      API_PATH.NOTIFICATIONS.MARK_ALL_READ,
    );
    return response.data;
  },

  delete: async (id: string) => {
    const url = `${API_PATH.NOTIFICATIONS.DELETE}/${id}`;
    const response = await axiosInstance.delete(url);
    return response.data;
  },
};

export default NotificationService;
