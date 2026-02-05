import axiosInstance from "./api/axiosInstance";
import { API_PATH } from "./api/Apipath";

export interface StoryStats {
  drafts: number;
  published: number;
  scheduled: number;
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

  importStory: async (url: string) => {
    const response = await axiosInstance.post(API_PATH.STORIES.IMPORT, { url });
    console.log(response.data);
    return response.data;
  },

  deleteStory: async (id: string) => {
    const response = await axiosInstance.delete(
      `${API_PATH.STORIES.DELETE}/${id}`,
    );
    return response.data;
  },

  getStoryById: async (id: string) => {
    const response = await axiosInstance.get(
      `${API_PATH.STORIES.GET_BY_ID}/${id}`,
    );
    return response.data;
  },

  updateStory: async (id: string, data: any) => {
    const response = await axiosInstance.put(
      `${API_PATH.STORIES.UPDATE}/${id}`,
      data,
    );
    return response.data;
  },
};

export default StoriesService;
