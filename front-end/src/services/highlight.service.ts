import axiosInstance from "./api/axiosInstance";
import { API_PATH } from "./api/Apipath";

export interface Highlight {
  id: string;
  userId: string;
  postId: string;
  content: string;
  quote?: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
    user: {
      id: string;
      name: string;
      username: string;
      avatar?: string;
    };
  };
}

class HighlightService {
  async getAll(): Promise<Highlight[]> {
    const response = await axiosInstance.get(API_PATH.HIGHLIGHTS.GET_ALL);
    return response.data;
  }

  async create(data: {
    postId: string;
    content: string;
    quote?: string;
  }): Promise<Highlight> {
    console.log("data", data);
    const response = await axiosInstance.post(API_PATH.HIGHLIGHTS.CREATE, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await axiosInstance.delete(
      `${API_PATH.HIGHLIGHTS.DELETE}/${id}`,
    );
    return response.data;
  }
}

export default new HighlightService();
