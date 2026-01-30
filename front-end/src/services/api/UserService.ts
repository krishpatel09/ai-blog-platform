import axiosInstance from "./axiosInstance";
import { API_PATH } from "./Apipath";

const UserService = {
  getFollowing: async (userId: string) => {
    const url = `${API_PATH.FOLLOW.GET_FOLLOWING}${userId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  isFollowing: async (targetId: string) => {
    const url = `${API_PATH.FOLLOW.IS_FOLLOWING}/${targetId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  followUser: async (targetId: string) => {
    const url = `${API_PATH.FOLLOW.FOLLOW.replace("follow", "")}follow/${targetId}`;
    const response = await axiosInstance.post(url);
    return response.data;
  },
};

export default UserService;
