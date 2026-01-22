import Link from "next/link";
import Image from "next/image";
import { BlogCardProps } from "@/types/blog.types";
import { Calendar, Clock } from "lucide-react";

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link
      href={`/@${blog.author.username}/${blog.slug}`}
      className="group flex flex-col md:flex-row gap-6  rounded-3xl border border-transparent transition-all duration-300 cursor-pointer"
    >
      {/* Content Section - Left */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
            {/* {blog.author.avatar ? (
              <Image
                src={blog.author.avatar}
                alt={blog.author.name}
                fill
                className="object-cover"
              />
            ) : (
              blog.author.name.charAt(0).toUpperCase()
            )} */}
            krish
          </div>
          <span className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
            {blog.author.name}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-black line-clamp-2 mb-2 leading-tight">
          {blog.title}
        </h2>

        {/* Excerpt */}
        <p className="text-gray-600 line-clamp-3 mb-4 text-sm md:text-base leading-relaxed">
          {blog.excerpt}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={14} />
            <span>
              {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={14} />
            <span>{blog.readTime} min read</span>
          </div>
          {blog.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-700 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Image Section - Right */}
      {blog.coverImage && (
        <div className="w-full md:w-40 lg:w-48 h-40 md:h-40 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            width={200}
            height={160}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </Link>
  );
}
