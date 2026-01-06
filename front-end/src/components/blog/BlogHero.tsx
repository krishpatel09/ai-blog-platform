import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export function BlogHero() {
    return (
        <section className="pt-24 pb-12 px-6 md:px-12 bg-[var(--color-ai-bg)]">
            <div className="max-w-7xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden aspect-[21/9] group cursor-pointer border border-[var(--color-ai-card-hover)]">
                    {/* Background Image Placeholder or Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E2E] to-[#0A0A0A] z-0">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ai-bg)] via-transparent to-transparent opacity-90"></div>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 z-10 max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-ai-accent)]/10 text-[var(--color-ai-accent)] border border-[var(--color-ai-accent)]/20 text-xs font-mono mb-6 backdrop-blur-md">
                            Featured Story
                        </div>
                        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white group-hover:text-[var(--color-ai-accent)] transition-colors">
                            The Rise of Agentic AI: Beyond Large Language Models
                        </h1>
                        <p className="text-[var(--color-ai-text-dim)] text-lg md:text-xl mb-8 line-clamp-2 max-w-2xl">
                            Why 2026 marks the shift from passive text generation to autonomous decision-making agents, and what it means for the future of software development.
                        </p>

                        <div className="flex items-center gap-6 text-sm text-[var(--color-ai-text-dim)] font-mono">
                            <span className="text-white font-bold">Krish Patel</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 8 min read</span>
                            <span>Jan 06, 2026</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
