import axiosInstance from "./axiosInstance";
import { API_PATH } from "./Apipath";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  postId: string;
  parentId?: string | null;
  user: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
  };
  _count?: {
    replies: number;
    likes: number; // Assuming we might have likes later
  };
  replies?: Comment[]; // For nested structure if returned
}

export interface CreateCommentPayload {
  postId: string;
  content: string;
  parentId?: string;
}

export const CommentService = {
  createComment: async (payload: CreateCommentPayload): Promise<Comment> => {
    const response = await axiosInstance.post(
      API_PATH.COMMENTS.CREATE,
      payload,
    );
    return response.data;
  },

  getPostComments: async (postId: string): Promise<Comment[]> => {
    const response = await axiosInstance.get(
      `${API_PATH.COMMENTS.GET_POST_COMMENTS}${postId}`,
    );
    // Depending on backend, this might return { data: [...] } or just [...]
    return response.data;
  },

  getReplies: async (commentId: string): Promise<Comment[]> => {
    const response = await axiosInstance.get(
      `${API_PATH.COMMENTS.GET_REPLIES}${commentId}`,
    );
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await axiosInstance.delete(`${API_PATH.COMMENTS.DELETE}${commentId}`);
  },
};
