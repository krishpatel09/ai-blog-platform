"use client";

// Re-triggering HMR
// Re-triggering HMR
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, FileText, BarChart2, User, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  // You can replace this with actual user data from context/auth
  const username = "johndoe";

  const menu = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Library", icon: Bookmark, href: "/library" },
    { name: "Profile", icon: User, href: `/${username}` },
    { name: "Stories", icon: FileText, href: "/story" },
    { name: "Stats", icon: BarChart2, href: "/monitaring" },
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
        <div className="px-3">
          <h3 className="text-gray-500 font-normal text-sm mb-4 ml-2">
            Following
          </h3>
          <div className="flex flex-col gap-4">
            {/* Mock Following Items */}
            {[
              {
                name: "Pen With Paper",
                icon: (
                  <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center text-orange-600">
                    ✍️
                  </div>
                ),
                hasNew: false,
              },
              {
                name: "AI Advances",
                icon: (
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                    🧠
                  </div>
                ),
                hasNew: true,
              },
              {
                name: "Javarevisited",
                icon: (
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-[10px] font-bold">
                    J
                  </div>
                ),
                hasNew: false,
              },
              {
                name: "Muzli - Design In...",
                icon: (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px]">
                    M
                  </div>
                ),
                hasNew: false,
              },
              {
                name: "Towards AWS",
                icon: (
                  <div className="w-5 h-5 bg-yellow-400 rounded flex items-center justify-center text-black text-[8px] font-bold">
                    AWS
                  </div>
                ),
                hasNew: true,
              },
              {
                name: "Serhat Pala",
                icon: (
                  <div className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-green-800 text-[10px]">
                    SP
                  </div>
                ),
                hasNew: false,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3 ml-2">
                  <div className="shrink-0">{item.icon}</div>
                  <span className="text-sm text-gray-700 font-normal truncate max-w-[120px] group-hover:text-black">
                    {item.name}
                  </span>
                </div>
                {item.hasNew && (
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2" />
                )}
              </div>
            ))}

            {/* Find Writers Link */}
            <div className="flex flex-col mt-4 ml-2 gap-3">
              <div className="flex items-start gap-3 cursor-pointer group">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 text-gray-500 group-hover:text-gray-900">
                  <Plus size={20} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700 font-normal group-hover:text-black leading-tight">
                    Find writers and publications to follow.
                  </span>
                  <span className="text-sm text-gray-500 mt-1 hover:underline cursor-pointer">
                    See suggestions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
