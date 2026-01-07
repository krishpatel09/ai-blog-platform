import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BloganeNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A] text-white py-4 px-6 md:px-12 border-b border-white/10">
            <div className="max-w-7xl mx-auto flex items-center justify-between relative">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-(--color-blogane-yellow) rounded flex items-center justify-center text-black font-bold font-serif text-xl">
                        Ai
                    </div>
                    <span className="text-xl font-bold tracking-tight">Genwrite</span>
                </Link>

                {/* Center: Links */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-(--color-blogane-yellow) transition-colors">Home</Link>
                    <Link href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Our Story</Link>
                    <Link href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Membership</Link>
                    <Link href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Write</Link>
                    <Link href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Blog</Link>
                </div>

                {/* Right: Auth */}
                <div className="flex items-center gap-4">
                    <Link href="/sign-in" className="text-sm font-medium hover:text-(--color-blogane-yellow) transition-colors">
                        Sign In
                    </Link>
                    <Link href="/sign-up">
                        <Button className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6 transition-all border border-white/10">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
