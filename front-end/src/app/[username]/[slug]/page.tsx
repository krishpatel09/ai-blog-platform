import { Metadata } from "next";
import BlogDetailClient from "./BlogDetailClient";
import axios from "axios";

// This page is a Server Component that generates metadata
// and then renders the Client Component for the UI.

interface PageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

async function getBlogData(slug: string) {
  try {
    // We use direct fetch or axios here since this is server-side
    // We need the full URL since we can't use relative paths on server
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    console.log(`Fetching metadata for slug: ${slug} from ${baseUrl}`);

    // Note: ensure your backend endpoint is public or handles server-to-server auth if needed.
    // Assuming public access for blog posts:
    const response = await axios.get(`${baseUrl}/api/blog/${slug}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching blog for metadata (slug: ${slug}):`,
      error.message,
    );
    if (axios.isAxiosError(error)) {
      console.error("Axios status:", error.response?.status);
      console.error("Axios config url:", error.config?.url);
    }
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlogData(resolvedParams.slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const title = blog.title;
  const description = blog.excerpt || blog.title; // Fallback to title if excerpt is missing
  const images = blog.coverImage ? [blog.coverImage] : [];
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/@${resolvedParams.username}/${resolvedParams.slug}`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: "AI Blog Platform",
      images: [
        {
          url: blog.coverImage || "", // Ensure valid URL
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
      authors: [blog.user?.name || ""],
      publishedTime: blog.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: images,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <BlogDetailClient />;
}
