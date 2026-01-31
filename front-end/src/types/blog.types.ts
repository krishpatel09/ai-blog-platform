// Blog-related TypeScript interfaces

export interface Author {
  id: string;
  name: string;
  avatar?: string;
  username: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: any;
  coverImage?: string;
  author: Author;
  tags: Tag[];
  publishedAt: string;
  readTime: number;
  views?: number;
  likes?: number;
  likeCount?: number;
  commentCount?: number;
  isPublished: boolean;
  isDraft: boolean;
  coverVideo?: string;
}

export interface BlogCardProps {
  blog: Blog;
  variant?: "default" | "compact";
}

export interface StatsData {
  date: string;
  views: number;
  reads: number;
}
