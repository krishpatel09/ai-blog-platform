import axiosInstance from "./api/axiosInstance";
import { API_PATH } from "./api/Apipath";

export interface PublicUser {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  email?: string; // Add email for private profile
  createdAt: string;
  isOwner?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  email?: string;
}

const UserService = {
  getPublicProfile: async (username: string): Promise<PublicUser> => {
    const response = await axiosInstance.get(
      `${API_PATH.USERS.GET_PUBLIC_PROFILE}${username}`,
    );
    return response.data;
  },

  getPrivateProfile: async (): Promise<PublicUser> => {
    const response = await axiosInstance.get(`${API_PATH.USERS.GET_PROFILE}`);
    return response.data;
  },

  updateProfile: async (data: UpdateUserDto): Promise<PublicUser> => {
    const response = await axiosInstance.patch(
      `${API_PATH.USERS.UPDATE_PROFILE}`,
      data,
    );
    return response.data;
  },

  getFollowStats: async (username: string) => {
    const response = await axiosInstance.get(
      `${API_PATH.FOLLOW.GET_STATS}${username}/stats`,
    );
    return response.data;
  },

  getFollowing: async (userId: string) => {
    const response = await axiosInstance.get(
      `${API_PATH.FOLLOW.GET_FOLLOWING}${userId}`,
    );
    return response.data;
  },
};

export default UserService;
