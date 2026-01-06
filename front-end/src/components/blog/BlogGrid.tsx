import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";

export function BlogGrid() {
    const posts = [
        {
            category: "Engineering",
            title: "Optimizing Transformer Inference at Scale",
            excerpt: "Techniques for reducing latency in production-grade LLM applications without sacrificing accuracy.",
            author: "Sarah Chen",
            readTime: "12 min",
            date: "Jan 05"
        },
        {
            category: "Ethics",
            title: "The Alignment Problem in Autonomous Systems",
            excerpt: "Exploring the safeguards needed when AI agents begin executing real-world actions.",
            author: "Marcus Ross",
            readTime: "6 min",
            date: "Jan 04"
        },
        {
            category: "Design",
            title: "Generative UI: Interfaces that Adapt",
            excerpt: "How AI is moving us away from static layouts to fluid, context-aware user experiences.",
            author: "Elena Vo",
            readTime: "5 min",
            date: "Jan 03"
        },
        {
            category: "Research",
            title: "Multimodal Reasoning Benchmarks",
            excerpt: "A deep dive into the latest performance metrics for vision-language models.",
            author: "David Kim",
            readTime: "15 min",
            date: "Jan 01"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post, i) => (
                <div key={i} className="group flex flex-col h-full bg-[var(--color-ai-card)] border border-[var(--color-ai-card-hover)] rounded-2xl overflow-hidden hover:border-[var(--color-ai-accent)]/50 transition-all cursor-pointer">
                    <div className="h-48 bg-[var(--color-ai-card-hover)] relative overflow-hidden">
                        {/* Placeholder gradient for image */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 === 0 ? 'from-purple-900/20 to-blue-900/20' : 'from-emerald-900/20 to-teal-900/20'} group-hover:scale-105 transition-transform duration-500`}></div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-mono text-[var(--color-ai-accent)] uppercase tracking-wider">{post.category}</span>
                            <ArrowUpRight className="w-5 h-5 text-[var(--color-ai-text-dim)] group-hover:text-[var(--color-ai-accent)] transition-colors" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold mb-3 group-hover:text-[var(--color-ai-accent)] transition-colors">
                            {post.title}
                        </h3>
                        <p className="text-[var(--color-ai-text-dim)] text-sm leading-relaxed mb-6 flex-1">
                            {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-ai-text-dim)] pt-6 border-t border-[var(--color-ai-card-hover)]">
                            <span className="text-white">{post.author}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                            <span>{post.date}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
