import { Search, Bell, Edit, Menu, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";
import Tokenservice from "@/services/api/Tokenservice";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useState, useEffect } from "react";

interface HeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Header({ isCollapsed, onToggleCollapse }: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  const { showSuccess, showError, showLoading, dismiss } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          {user && (
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu size={22} className="text-gray-700" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-(--color-blogane-yellow) rounded flex items-center justify-center text-black font-bold font-serif text-xl">
              Ai
            </div>
            <span className="text-xl font-bold tracking-tight">Genwrite</span>
          </Link>

          <div className="hidden sm:flex items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none ml-2 text-sm w-48"
            />
          </div>
        </div>

        {user ? (
          // LOGGED IN VIEW
          <div className="flex items-center gap-6">
            <Link
              href="/new-blog"
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <Edit size={20} />{" "}
              <span className="text-sm hidden sm:block font-medium">Write</span>
            </Link>
            <Link
              href="/me/notifications"
              className="text-gray-500 hover:text-gray-700 transition-colors relative"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-700 text-white flex items-center justify-center text-sm font-medium cursor-pointer hover:shadow-lg transition-shadow">
                  {user.avatar ? (
                    <Image
                      src={user?.avatar}
                      alt={user?.name || "User"}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span>{user.name?.[0]?.toUpperCase() || "k"}</span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 bg-white p-0 shadow-xl border-gray-100/50"
              >
                {/* Profile Header */}
                <div className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-pink-700 text-white flex items-center justify-center text-lg font-medium shrink-0">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || "User"}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm">
                      {user.name}
                    </span>
                    <Link
                      href={`/@${user.username}`}
                      className="text-sm text-gray-500 hover:text-gray-900"
                    >
                      View profile
                    </Link>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-gray-100" />

                {/* Settings / Help */}
                <div className="py-2">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/me/settings"
                      className="px-6 py-2 cursor-pointer flex items-center gap-3 text-gray-600 hover:text-black focus:text-black hover:bg-transparent focu:bg-transparent"
                    >
                      <Settings size={18} className="text-gray-400" />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/help"
                      className="px-6 py-2 cursor-pointer flex items-center gap-3 text-gray-600 hover:text-black focus:text-black hover:bg-transparent focu:bg-transparent"
                    >
                      <HelpCircle size={18} className="text-gray-400" />
                      <span className="text-sm">Help</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-gray-100" />

                {/* Membership */}
                <div className="py-2">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/membership"
                      className="px-6 py-2 cursor-pointer flex flex-col items-start gap-1 hover:bg-transparent focus:bg-transparent"
                    >
                      <span className="text-sm text-gray-700 hover:text-black flex items-center gap-1">
                        Become a Medium member
                        <span className="text-yellow-500">✨</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/partner-program"
                      className="px-6 py-2 cursor-pointer flex flex-col items-start hover:bg-transparent focus:bg-transparent"
                    >
                      <span className="text-sm text-gray-700 hover:text-black">
                        Apply to the Partner Program
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/gift"
                      className="px-6 py-2 cursor-pointer flex flex-col items-start hover:bg-transparent focus:bg-transparent"
                    >
                      <span className="text-sm text-gray-700 hover:text-black">
                        Gift a membership
                      </span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-gray-100" />

                {/* Sign Out */}
                <div className="py-3 px-6">
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:text-black block mb-1 w-full text-left"
                  >
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </button>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>

                <DropdownMenuSeparator className="bg-gray-100" />

                {/* Footer */}
                <div className="px-6 py-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-gray-500">
                  <Link href="#" className="hover:text-gray-800">
                    About
                  </Link>
                  <Link href="#" className="hover:text-gray-800">
                    Blog
                  </Link>
                  <Link href="#" className="hover:text-gray-800">
                    Careers
                  </Link>
                  <Link href="#" className="hover:text-gray-800">
                    Privacy
                  </Link>
                  <Link href="#" className="hover:text-gray-800">
                    Terms
                  </Link>
                  <Link href="#" className="hover:text-gray-800">
                    Text to speech
                  </Link>
                  <Link href="#" className="hover:text-gray-800">
                    Teams
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // GUEST VIEW
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mr-2"
            >
              <Edit size={20} />{" "}
              <span className="text-sm hidden sm:block font-medium">Write</span>
            </Link>

            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Sign in
            </Link>

            <Link
              href="/sign-up"
              className="px-4 py-2 rounded-full text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
