import Link from "next/link";
import { Heart, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BloganeContent() {
    const categories = ["All", "Newest", "Popular", "Work", "Machine Learning", "Artificial Intelligence"];

    const articles = [
        {
            date: "Jan 7, 2026",
            category: "Python",
            title: "Python for Blockchain: A Quick Guide",
            excerpt: "Learn how Python simplifies blockchain development.",
            author: "Brooklyn Simmons",
            likes: "15.8k",
            comments: "15.8k",
            image: "bg-slate-200"
        },
        {
            date: "Nov 7, 2026",
            category: "Artificial Intelligence",
            title: "How AI is Revolutionizing Blockchain Security",
            excerpt: "Discover AI's role in boosting blockchain security.",
            author: "Cody Fisher",
            likes: "15.8k",
            comments: "15.8k",
            image: "bg-teal-100"
        },
        {
            date: "Mar 8, 2026",
            category: "Machine Learning",
            title: "Python & Machine Learning",
            excerpt: "Explore building intelligent systems with Python.",
            author: "Jacob Jones",
            likes: "15.8k",
            comments: "15.8k",
            image: "bg-indigo-100"
        },
        {
            date: "Oct 29, 2026",
            category: "Blockchain",
            title: "Machine Learning Meets Blockchain",
            excerpt: "See how machine learning enhances blockchain tech.",
            author: "Devon Lane",
            likes: "15.8k",
            comments: "15.8k",
            image: "bg-sky-100"
        }
    ];

    return (
        <section className="py-20 px-6 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">

                {/* Left Column: Feed */}
                <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2 text-[var(--color-blogane-text-main)]">Blog Post</h2>
                    <p className="text-[var(--color-blogane-text-muted)] mb-8">Get started today and take your reading experience wherever you go!</p>

                    {/* Filters */}
                    <div className="flex gap-3 overflow-x-auto pb-6 mb-4 no-scrollbar">
                        {categories.map((cat, i) => (
                            <button key={i} className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-[var(--color-blogane-text-main)] text-white' : 'bg-[var(--color-blogane-gray)] text-[var(--color-blogane-text-muted)] hover:bg-[var(--color-blogane-gray)]/80'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Article List */}
                    <div className="space-y-8">
                        {articles.map((article, i) => (
                            <div key={i} className="group flex flex-col md:flex-row gap-6 cursor-pointer">
                                {/* Image Placeholder */}
                                <div className={`w-full md:w-64 h-48 rounded-xl ${article.image} group-hover:scale-[1.02] transition-transform duration-300`}></div>

                                <div className="flex-1 py-2">
                                    <div className="flex items-center gap-3 text-xs font-medium text-[var(--color-blogane-text-muted)] mb-3">
                                        <span>{article.date}</span>
                                        <span className="w-1 h-1 bg-[var(--color-blogane-text-muted)] rounded-full"></span>
                                        <span className="text-[var(--color-blogane-text-main)] font-bold">{article.category}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-[var(--color-blogane-text-main)] group-hover:text-[var(--color-blogane-yellow)] transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-[var(--color-blogane-text-muted)] text-sm mb-6">
                                        {article.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-[var(--color-blogane-gray)] pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                                            <span className="text-xs font-bold text-[var(--color-blogane-text-main)]">{article.author}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[var(--color-blogane-text-muted)] text-xs">
                                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {article.likes}</span>
                                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {article.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-center">
                        <button className="px-8 py-3 rounded-full bg-[var(--color-blogane-text-main)] text-white font-medium hover:bg-black transition-colors">Load More</button>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 space-y-12">

                    {/* Recommended Topics */}
                    <div>
                        <h4 className="font-bold mb-6 text-[var(--color-blogane-text-main)]">Recommended Topics</h4>
                        <div className="space-y-4">
                            {[
                                { name: "Data Privacy & Protection", count: "15k blogs" },
                                { name: "Cloud Computing", count: "7k blogs" },
                                { name: "HealthTech", count: "4k blogs" },
                                { name: "Analytics", count: "800 blogs" }
                            ].map((tag, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-blogane-gray)] flex items-center justify-center text-[var(--color-blogane-text-muted)] group-hover:bg-[var(--color-blogane-yellow)] group-hover:text-black transition-colors">#</div>
                                        <span className="text-sm font-medium text-[var(--color-blogane-text-main)]">{tag.name}</span>
                                    </div>
                                    <span className="text-xs text-[var(--color-blogane-text-muted)]">{tag.count}</span>
                                </div>
                            ))}
                        </div>
                        <button className="text-[var(--color-blogane-yellow)] text-xs font-bold mt-4">See more topics</button>
                    </div>

                    {/* Inspired Writer */}
                    <div>
                        <h4 className="font-bold mb-6 text-[var(--color-blogane-text-main)]">Inspired Writer</h4>
                        <div className="space-y-4">
                            {[
                                { name: "Guy Hawkins", role: "Blog Trainer" },
                                { name: "Cameron Williamson", role: "Medical Assistant" },
                                { name: "Theresa Webb", role: "President of Sales" },
                            ].map((writer, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                                        <div>
                                            <h5 className="text-sm font-bold text-[var(--color-blogane-text-main)]">{writer.name}</h5>
                                            <p className="text-xs text-[var(--color-blogane-text-muted)]">{writer.role}</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-1 rounded-full bg-[var(--color-blogane-text-main)] text-white text-xs font-medium hover:bg-black">Follow</button>
                                </div>
                            ))}
                        </div>
                        <button className="text-[var(--color-blogane-yellow)] text-xs font-bold mt-4">See more suggestion</button>
                    </div>

                    {/* Premium Card */}
                    <div className="p-6 rounded-2xl bg-[#111827] text-white text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-blogane-yellow)]/20 flex items-center justify-center mx-auto mb-4 text-[var(--color-blogane-yellow)]">
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Become a Premium Member</h4>
                            <p className="text-xs text-white/60 mb-6 leading-relaxed">
                                Unlock exclusive content, insightful blogs, and ad-free reading by becoming a Premium Member.
                            </p>
                            <Button className="w-full bg-[var(--color-blogane-yellow)] text-black hover:bg-[var(--color-blogane-yellow)]/90 font-bold rounded-full">
                                See All Plan
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
