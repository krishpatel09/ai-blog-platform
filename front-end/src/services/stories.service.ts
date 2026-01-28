import axiosInstance from "./api/axiosInstance";
import { API_PATH } from "./api/Apipath";

export interface StoryStats {
  drafts: number;
  published: number;
  scheduled: number;
  unlisted: number;
  submissions: number;
}

const StoriesService = {
  getStats: async (): Promise<StoryStats> => {
    const response = await axiosInstance.get(API_PATH.STORIES.GET_STATS);
    return response.data;
  },

  getStories: async (status: string, page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get(API_PATH.STORIES.GET_LIST, {
      params: { status, page, limit },
    });
    return response.data;
  },
};

export default StoriesService;
