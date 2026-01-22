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
};

export default BlogService;
