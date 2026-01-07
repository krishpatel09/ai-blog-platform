import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function BloganeHero() {
    return (
        <section className="bg-[#0F172A] pt-40 pb-32 px-6 relative overflow-hidden">
            {/* Background Grid Pattern (Optional subtle texture) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                    <span className="text-(--color-blogane-yellow)">Discover</span> Insights.<br />
                    Fuel Your Curiosity
                </h1>
                <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
                    Dive into a world of insightful articles, expert opinions, and inspiring stories.
                </p>

                <div className="flex justify-center">
                    <Link href="/sign-up">
                        <Button

                            className="h-12 px-8 rounded-full bg-(--color-blogane-yellow) text-black font-semibold text-lg hover:bg-(--color-blogane-yellow)/90 hover:scale-105 transition-all"
                        >
                            Start Reading
                        </Button>
                    </Link>
                </div>
            </div>

            <Avatar
                className="absolute top-32 left-[10%] w-12 h-12 border-2 border-(--color-blogane-yellow) hidden lg:flex animate-bounce [animation-duration:3s]"
                src="https://i.pravatar.cc/150?u=1"
                name="Avatar 1"
            />
            <Avatar
                className="absolute bottom-20 right-[15%] w-14 h-14 border-2 border-white/20 hidden lg:flex animate-pulse"
                src="https://i.pravatar.cc/150?u=2"
                name="Avatar 2"
            />
            <Avatar
                className="absolute top-40 right-[10%] w-10 h-10 border-2 border-(--color-blogane-yellow) hidden lg:flex"
                src="https://i.pravatar.cc/150?u=223"
                name="Avatar 3"
            />
        </section>
    );
}
