import { API_PATH } from "./api/Apipath";
import axiosInstance from "./api/axiosInstance";

export interface GeneratedBlog {
  title: string;
  content: string;
  tags: string[];
  seoDescription: string;
}

export const AiService = {
  async generateBlogFromImage(imageUrl: string): Promise<GeneratedBlog> {
    const response = await axiosInstance.post(API_PATH.AI.GENERATE_FROM_IMAGE, {
      imageUrl,
    });
    return response.data;
  },
};
