import Link from "next/link";
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

export function BloganeFooter() {
    return (
        <footer className="bg-[#0F172A] text-white pt-20 pb-10 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12 mb-16">

                <div className="max-w-xs">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded bg-(--color-blogane-yellow) flex items-center justify-center text-black font-bold font-serif text-xl">Ai</div>
                        <span className="text-xl font-bold tracking-tight">Genwrite</span>
                    </div>
                    <p className="text-white/60 text-sm mb-6">
                        Quality Blog Platform from talented writers on topics ranging from technology and culture to lifestyle.
                    </p>
                    <div className="flex gap-4">
                        <Instagram className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                        <Facebook className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                        <Twitter className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-20">
                    <div>
                        <h4 className="font-bold text-sm mb-6">Categories</h4>
                        <ul className="space-y-4 text-xs text-white/60">
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">Programming</Link></li>
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">Blockchain</Link></li>
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">Data Science</Link></li>
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">User Experience</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-6">Menu</h4>
                        <ul className="space-y-4 text-xs text-white/60">
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">Home</Link></li>
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">About Us</Link></li>
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-6">Follow Us</h4>
                        <ul className="space-y-4 text-xs text-white/60">
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">Instagram</Link></li>
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">Facebook</Link></li>
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">Medium</Link></li>
                            <li><Link href="#" className="hover:text-(--color-blogane-yellow)">Twitter</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-xs p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="font-bold text-sm mb-2">Get in Touch With Us!</h4>
                    <p className="text-xs text-white/60 mb-4">Get the latest news and information from us exclusively.</p>
                    <div className="flex bg-white rounded-full p-1 pl-4">
                        <input type="email" placeholder="Type Email" className="bg-transparent flex-1 text-black text-xs outline-none" />
                        <button className="bg-[#111827] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-black">Submit</button>
                    </div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-xs text-white/40">
                    Copyright © 2026 Genwrite Creative Agency. All Right Reserved.
                </div>
                <div className="flex gap-6 text-xs text-white/40">
                    <Link href="#" className="hover:text-white">Terms of Service</Link>
                    <Link href="#" className="hover:text-white">Privacy Policy</Link>
                </div>
            </div>
        </footer>
    );
}
