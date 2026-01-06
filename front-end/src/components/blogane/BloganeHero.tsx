import { Search } from "lucide-react";

export function BloganeHero() {
    return (
        <section className="bg-[#0F172A] pt-40 pb-32 px-6 relative overflow-hidden">
            {/* Background Grid Pattern (Optional subtle texture) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                    <span className="text-[var(--color-blogane-yellow)]">Discover</span> Insights.<br />
                    Fuel Your Curiosity
                </h1>
                <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
                    Dive into a world of insightful articles, expert opinions, and inspiring stories.
                </p>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto relative group">
                    <input
                        type="text"
                        placeholder="Search Blog"
                        className="w-full h-14 pl-6 pr-14 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-blogane-yellow)]/50 focus:bg-white/10 transition-all"
                    />
                    <button className="absolute right-2 top-2 h-10 w-10 bg-[var(--color-blogane-yellow)] rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Floating Avatars (Decorative) */}
            <div className="absolute top-32 left-[10%] w-12 h-12 rounded-full border-2 border-[var(--color-blogane-yellow)] overflow-hidden hidden lg:block animate-bounce [animation-duration:3s]">
                <div className="w-full h-full bg-gray-400"></div> {/* Placeholder for Avatar */}
            </div>
            <div className="absolute bottom-20 right-[15%] w-14 h-14 rounded-full border-2 border-white/20 overflow-hidden hidden lg:block animate-pulse">
                <div className="w-full h-full bg-gray-500"></div> {/* Placeholder for Avatar */}
            </div>
            <div className="absolute top-40 right-[10%] w-10 h-10 rounded-full border-2 border-[var(--color-blogane-yellow)] overflow-hidden hidden lg:block">
                <div className="w-full h-full bg-gray-300"></div>
            </div>
        </section>
    );
}
