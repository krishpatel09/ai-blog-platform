"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";
import Tokenservice from "@/services/api/Tokenservice";
import { useRouter } from "next/navigation";

export function BloganeNavbar() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.post(API_PATH.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      Tokenservice.removeUser();
      router.push("/sign-in");
    }
  };

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
          <Link
            href="/"
            className="text-sm font-medium hover:text-(--color-blogane-yellow) transition-colors"
          >
            Home
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Our Story
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Membership
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Write
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Blog
          </Link>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <div className="w-9 h-9 rounded-full bg-pink-700 text-white flex items-center justify-center text-sm font-medium cursor-pointer hover:shadow-lg border-2 border-white/20 hover:border-white/40 transition-all">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (user.name?.[0] || user.username?.[0] || "U").toUpperCase()
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 bg-white p-0 shadow-xl mt-2"
              >
                {/* Profile Header */}
                <div className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-700 text-white flex items-center justify-center text-lg font-medium shrink-0">
                    {(user.name?.[0] || "U").toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm truncate max-w-[160px]">
                      {user.name || user.username}
                    </span>
                    <Link
                      href="/profile"
                      className="text-sm text-gray-500 hover:text-gray-900"
                    >
                      View profile
                    </Link>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-gray-100" />

                <div className="py-2">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="px-6 py-2 cursor-pointer flex items-center gap-3 text-gray-600 hover:text-black"
                    >
                      <span className="text-sm">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="px-6 py-2 cursor-pointer flex items-center gap-3 text-gray-600 hover:text-black"
                    >
                      <Settings size={16} />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-gray-100" />

                <div className="py-3 px-6">
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:text-black block mb-1 w-full text-left cursor-pointer"
                  >
                    Sign out
                  </button>
                  <span className="text-xs text-gray-500 truncate block">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium hover:text-(--color-blogane-yellow) transition-colors"
              >
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6 transition-all border border-white/10">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
