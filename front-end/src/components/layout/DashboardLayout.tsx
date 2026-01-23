"use client";

import { useState, ReactNode } from "react";
import Header from "./hearder";
import Sidebar from "./sidebar";
import RightSidebar from "./right-sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
  contentClassName?: string;
}

export default function DashboardLayout({
  children,
  showRightSidebar = true,
  contentClassName = "max-w-[690px] mx-auto",
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <Header isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />

      <div className="flex w-full max-w-[1500px] mx-auto pt-24">
        {/* Left Sidebar - Collapsible */}
        <div
          className={`hidden md:block shrink-0 sticky top-20 h-[calc(100vh-5rem)] transition-all duration-700 ease-in-out overflow-hidden ${
            isCollapsed ? "w-0" : "w-60"
          }`}
        >
          <Sidebar isCollapsed={isCollapsed} />
        </div>

        {/* Left Vertical Line */}
        <div
          className={`hidden md:block w-px bg-gray-200 mx-4 transition-all duration-700 ease-in-out ${
            isCollapsed ? "opacity-0 w-0 mx-0 overflow-hidden" : "opacity-100"
          }`}
        />

        {/* Main Content */}
        <main className="grow min-w-0 pb-10 transition-all duration-700 ease-in-out">
          <div className={`${contentClassName}`}>{children}</div>
        </main>

        {/* Right Vertical Line */}
        {showRightSidebar && (
          <div className="hidden xl:block w-px bg-gray-200 mx-6 h-[calc(100vh-5rem)] sticky top-20" />
        )}

        {/* Right Sidebar - Optional */}
        {showRightSidebar && (
          <div className="hidden xl:block w-[312px] shrink-0 sticky top-20 h-[calc(100vh-5rem)]">
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
}
