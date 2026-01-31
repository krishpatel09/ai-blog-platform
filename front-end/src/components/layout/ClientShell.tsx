"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "./DashboardLayout";
import { usePathname } from "next/navigation";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // If loading, show a global loading state or just children (often better to show generic loading to avoid flicker)
  // However, AuthContext usually handles initial load fast.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // If user is logged in, wrap in DashboardLayout
  // EXCEPT for specific full-screen routes if any (e.g. maybe specific preview pages?)
  // For now, consistent with user desire for persistent header/sidebar.
  // If user is logged in, wrap in DashboardLayout, unless it's a standalone page like /new-blog
  if (user && pathname !== "/new-blog" && pathname !== "/import") {
    // Check if the current page already handles its own layout?
    // Ideally we migrate all to use this shell.
    // DashboardLayout renders Header, Sidebar, RightSidebar.
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Guest users get raw children (which handle their own layout like Landing Page or Guest Blog View)
  return <>{children}</>;
}
