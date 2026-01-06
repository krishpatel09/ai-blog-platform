import { BloganeNavbar } from "@/components/blogane/BloganeNavbar";
import { BloganeHero } from "@/components/blogane/BloganeHero";
import { BloganeContent } from "@/components/blogane/BloganeContent";
import { BloganeApp } from "@/components/blogane/BloganeApp";
import { BloganeFooter } from "@/components/blogane/BloganeFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-blogane-light)] font-sans">
      <BloganeNavbar />
      <BloganeHero />
      <BloganeContent />
      <BloganeApp />
      <BloganeFooter />


    </main>
  );
}
