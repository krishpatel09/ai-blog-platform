import axiosInstance from "./api/axiosInstance";
import { API_PATH } from "./api/Apipath";

const BlogService = {
  getLiveBlogs: async () => {
    const response = await axiosInstance.get(API_PATH.BLOG.GET_LIVE);
    return response.data.map((post: any) => ({
      ...post,
      id: post.id,
      title: post.title,
      excerpt:
        post.excerpt ||
        (typeof post.content === "string"
          ? post.content.substring(0, 150) + "..."
          : ""),
      coverImage: post.coverImage,
      publishedAt: post.publishedAt,
      author: {
        id: post.userId || "unknown",
        name: post.user?.name || "Unknown Author",
        avatar: post.user?.avatar || "",
        username: post.user?.username || "",
      },
      tags: post.tags || [],
      readTime: post.readTime || 5,
      views: post.views || 0,
      isPublished: post.status === "PUBLISHED",
      isDraft: post.status === "DRAFT",
    }));
  },

  getMyBlogs: async () => {
    const response = await axiosInstance.get(API_PATH.BLOG.GET_MY_POSTS);
    return response.data.map((post: any) => ({
      ...post,
      id: post.id,
      title: post.title,
      // Handle content if string or JSON or null
      excerpt:
        post.excerpt ||
        (typeof post.content === "string"
          ? post.content.substring(0, 150) + "..."
          : ""),
      coverImage: post.coverImage,
      publishedAt: post.publishedAt || post.createdAt,
      author: {
        id: post.userId || "unknown",
        name: post.user?.name || "Unknown Author",
        avatar: post.user?.avatar || "",
        username: post.user?.username || "",
      },
      tags: post.tags || [],
      readTime: post.readTime || 5,
      views: post.views || 0,
      isPublished: post.status === "PUBLISHED",
      isDraft: post.status === "DRAFT",
    }));
  },

  getPostsByUsername: async (username: string) => {
    const response = await axiosInstance.get(
      `${API_PATH.BLOG.GET_USER_POSTS}${username}`,
    );
    return response.data.map((post: any) => ({
      ...post,
      id: post.id,
      title: post.title,
      excerpt:
        post.excerpt ||
        (typeof post.content === "string"
          ? post.content.substring(0, 150) + "..."
          : ""),
      coverImage: post.coverImage,
      publishedAt: post.publishedAt,
      author: {
        id: post.userId || "unknown",
        name: post.user?.name || "Unknown Author",
        avatar: post.user?.avatar || "",
        username: post.user?.username || "",
      },
      tags: post.tags || [],
      readTime: post.readTime || 5,
      views: post.views || 0,
      isPublished: post.status === "PUBLISHED",
      isDraft: post.status === "DRAFT",
    }));
  },
};

export default BlogService;
