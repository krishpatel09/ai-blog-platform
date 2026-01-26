"use client";

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./hearder";
import Sidebar from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  contentClassName?: string;
}

export default function DashboardLayout({
  children,
  contentClassName = "max-w-4xl mx-auto",
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 overflow-hidden">
      {/* Header - Fixed Height */}
      <Header isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />

      {/* Main Container - App Style Fixed Layout */}
      <div className="flex flex-1 w-full max-w-[1500px] mx-auto pt-16 overflow-hidden relative">
        {/* Left Sidebar - Independent Scroll */}
        <div
          className={`hidden md:block shrink-0 h-full transition-all duration-700 ease-in-out overflow-y-auto sidebar-scrollbar ${
            isCollapsed ? "w-0" : "w-60"
          }`}
        >
          <Sidebar isCollapsed={isCollapsed} />
        </div>

        {/* Left Vertical Line */}
        <div
          className={`hidden md:block w-px bg-gray-200 mr-6 ml-1 transition-all duration-700 ease-in-out h-full ${
            isCollapsed ? "opacity-0 w-0 mx-0 overflow-hidden" : "opacity-100"
          }`}
        />

        {/* Center Scroll Container */}
        <main className="grow min-w-0 h-full overflow-y-auto transition-all duration-700 ease-in-out scroll-smooth no-scrollbar flex">
          {/* Center Content */}
          <div className="flex-1 min-w-0">
            <div className={`${contentClassName} py-8 md:py-12`}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
