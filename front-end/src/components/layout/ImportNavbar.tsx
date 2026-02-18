import { Search, Bell, Bookmark } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";
import Tokenservice from "@/services/api/Tokenservice";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ImportNavbar() {
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError, showLoading, dismiss } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const toastId = showLoading("Signing out...");

    try {
      await axiosInstance.post(API_PATH.AUTH.LOGOUT);
      Tokenservice.removeUser();
      dismiss(toastId);
      showSuccess("Signed out successfully");
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      dismiss(toastId);
      showError("Failed to sign out completely");
      Tokenservice.removeUser();
      router.replace("/sign-in");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-(--color-blogane-yellow) rounded flex items-center justify-center text-black font-bold font-serif text-xl">
            Ai
          </div>
          <span className="text-xl font-bold tracking-tight">Genwrite</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <button className="text-gray-500 hover:text-gray-900 transition-colors">
            <Search size={22} strokeWidth={1.5} />
          </button>

          <Link
            href="/library"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Bookmark size={22} strokeWidth={1.5} />
          </Link>

          {/* User Profile */}
          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-700 text-white flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-white p-0 shadow-xl border-gray-100 mt-2"
              >
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    @{user.username}
                  </p>
                </div>

                <div className="py-2">
                  <DropdownMenuItem className="px-5 py-2 cursor-pointer text-gray-600 hover:text-black">
                    Write a story
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-5 py-2 cursor-pointer text-gray-600 hover:text-black">
                    Stories
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-5 py-2 cursor-pointer text-gray-600 hover:text-black">
                    Stats
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-gray-100" />

                <div className="py-2">
                  <DropdownMenuItem className="px-5 py-2 cursor-pointer text-gray-600 hover:text-black">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-5 py-2 cursor-pointer text-gray-600 hover:text-black">
                    Refine recommendations
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-5 py-2 cursor-pointer text-gray-600 hover:text-black">
                    Manage publications
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-gray-100" />

                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-900 border border-gray-900 px-4 py-1.5 rounded-full hover:bg-gray-50"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
