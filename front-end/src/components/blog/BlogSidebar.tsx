import { Button } from "@/components/ui/button";
import { TrendingUp, Mail } from "lucide-react";
import Link from "next/link";

export function BlogSidebar() {
    const trending = [
        "Prompt Engineering vs. Fine-Tuning",
        "OpenAI's o1 Preview Analysis",
        "Local LLMs on Consumer Hardware",
        "The Death of the Search Bar",
        "Python 4.0 Rumors"
    ];

    return (
        <div className="space-y-12">
            {/* Newsletter Widget */}
            <div className="p-6 rounded-2xl bg-[var(--color-ai-card)] border border-[var(--color-ai-card-hover)]">
                <div className="flex items-center gap-3 mb-4 text-white">
                    <div className="p-2 rounded-lg bg-[var(--color-ai-accent)]/10 text-[var(--color-ai-accent)]">
                        <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-lg">Weekly Intelligence</h3>
                </div>
                <p className="text-sm text-[var(--color-ai-text-dim)] mb-6">
                    Join 50,000+ developers receiving the latest AI research and tutorials.
                </p>
                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="email@example.com"
                        className="w-full bg-[var(--color-ai-bg)] border border-[var(--color-ai-card-hover)] rounded-lg px-4 py-3 text-sm focus:border-[var(--color-ai-accent)] focus:outline-none transition-colors"
                    />
                    <Button className="w-full bg-[var(--color-ai-accent)] text-black font-bold hover:bg-[var(--color-ai-accent)]/90">
                        Subscribe
                    </Button>
                </div>
            </div>

            {/* Trending Widget */}
            <div>
                <div className="flex items-center gap-2 mb-6 text-[var(--color-ai-text-dim)] uppercase tracking-widest text-xs font-bold font-mono">
                    <TrendingUp className="w-4 h-4" /> Trending Topics
                </div>
                <div className="space-y-4">
                    {trending.map((topic, i) => (
                        <Link key={i} href="#" className="block group">
                            <div className="flex items-baseline gap-4">
                                <span className="font-mono text-[var(--color-ai-card-hover)] group-hover:text-[var(--color-ai-accent)] transition-colors">0{i + 1}</span>
                                <h4 className="font-medium text-[var(--color-ai-text)] group-hover:text-[var(--color-ai-accent)] transition-colors leading-snug">
                                    {topic}
                                </h4>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Categories/Tags */}
            <div>
                <div className="flex items-center gap-2 mb-6 text-[var(--color-ai-text-dim)] uppercase tracking-widest text-xs font-bold font-mono">
                    Explore
                </div>
                <div className="flex flex-wrap gap-2">
                    {["LLMs", "Generative Art", "Robotics", "Startups", "Tutorials", "Opinion"].map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-mono bg-[var(--color-ai-card)] border border-[var(--color-ai-card-hover)] text-[var(--color-ai-text-dim)] hover:border-[var(--color-ai-accent)] hover:text-[var(--color-ai-accent)] cursor-pointer transition-all">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
