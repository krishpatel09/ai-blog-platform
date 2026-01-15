'use client';

import { useAuth } from "@/context/AuthContext";
import { BloganeNavbar } from "@/components/blogane/BloganeNavbar";
import { BloganeHero } from "@/components/blogane/BloganeHero";
import { BloganeContent } from "@/components/blogane/BloganeContent";
import { BloganeApp } from "@/components/blogane/BloganeApp";
import { BloganeFooter } from "@/components/blogane/BloganeFooter";

import HomeFeed from "@/components/dashboard/HomeFeed";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <HomeFeed />;
  }

  return (
    <main className="min-h-screen bg-(--color-blogane-light) font-sans">
      <BloganeNavbar />
      <BloganeHero />
      <BloganeContent />
      <BloganeApp />
      <BloganeFooter />
    </main>
  );
}