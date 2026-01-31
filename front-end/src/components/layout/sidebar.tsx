"use client";

// Re-triggering HMR
// Re-triggering HMR
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, FileText, BarChart2, User, Plus } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import UserService from "@/services/api/UserService";

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [followingList, setFollowingList] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.id) {
      UserService.getFollowing(user.id)
        .then((data) => {
          setFollowingList(data);
        })
        .catch(console.error);
    }
  }, [user]);

  const menu = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Library", icon: Bookmark, href: "/me/library" },
    { name: "Profile", icon: User, href: `/@${user?.username}` },
    { name: "Stories", icon: FileText, href: "/me/stories" },
    { name: "Stats", icon: BarChart2, href: "/me/stats" },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col gap-1 w-55">
        {menu.map((item) => {
          const isActive = pathname === item.href;

          const linkContent = (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200  hover:bg-gray-100 ${
                isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {/* Left border indicator for active item */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-red-900 rounded-r-full"></span>
              )}
              <div className="flex items-center gap-3 ml-2">
                <item.icon size={20} className="shrink-0" />
                <span className="font-normal text-[15px] whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            </Link>
          );

          return linkContent;
        })}

        {/* Separator */}
        <div className="h-px bg-gray-100 my-4 mx-3" />

        {/* Following Section */}
        {user && (
          <div className="px-3">
            <h3 className="text-gray-500 font-normal text-sm mb-4 ml-2">
              Following
            </h3>
            <div className="flex flex-col gap-4">
              {followingList.map((item, idx) => (
                <Link
                  href={`/@${item.following.username}`}
                  key={idx}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3 ml-2">
                    <div className="shrink-0 w-5 h-5 rounded-full overflow-hidden bg-gray-200">
                      {item.following.avatar ? (
                        <img
                          src={item.following.avatar}
                          alt={item.following.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {item.following.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-normal truncate max-w-[120px] group-hover:text-black">
                      {item.following.name}
                    </span>
                  </div>
                </Link>
              ))}

              {/* Find Writers Link */}
              <div className="flex flex-col mt-4 ml-2 gap-3">
                <div className="flex items-start gap-3 cursor-pointer group">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 text-gray-500 group-hover:text-gray-900">
                    <Plus size={20} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
}
