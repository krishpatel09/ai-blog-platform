"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/hearder";
import { useAuth } from "@/context/AuthContext";
import BlogService from "@/services/blog.service";
import BookmarkService, { BookmarkList } from "@/services/bookmark.service";
import UserService, { PublicUser } from "@/services/user.service";
import { Blog } from "@/types/blog.types";
import {
  MapPin,
  Calendar,
  MoreHorizontal,
  Bookmark,
  Lock as LockIcon,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FollowUserButton from "@/components/shared/FollowUserButton";
import LibraryListCard from "@/components/my-library/LibraryListCard";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"home" | "lists" | "about">(
    "home",
  );
  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<Blog[]>([]);
  const [lists, setLists] = useState<BookmarkList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New states for sidebar
  const [followStats, setFollowStats] = useState<{
    followersCount: number;
    followingCount: number;
    postsCount: number;
  } | null>(null);
  const [followingList, setFollowingList] = useState<any[]>([]);

  const isOwnProfile =
    authUser?.username === (username ? username.replace(/^(@|%40)/, "") : "");

  // Fetch Profile & Posts (Default Home View)
  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      let isActive = true;
      try {
        setLoading(true);
        setError("");
        const cleanUsername = username.replace(/^(@|%40)/, "");

        const [user, userPosts, stats] = await Promise.all([
          UserService.getPublicProfile(cleanUsername),
          BlogService.getPostsByUsername(cleanUsername),
          UserService.getFollowStats(cleanUsername),
        ]);

        if (!isActive) return;

        setProfileUser(user);
        setPosts(userPosts);
        setFollowStats(stats);

        // Dependent fetch: Following (depends on user ID)
        if (user && user.id) {
          const following = await UserService.getFollowing(user.id);
          if (isActive) {
            setFollowingList(following);
          }
        }
      } catch (err: any) {
        if (isActive) {
          console.error("Failed to fetch profile data", err);
          setError("User not found");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
      return () => {
        isActive = false;
      };
    };

    let cleanup: (() => void) | undefined;
    if (username) {
      fetchProfileAndPosts().then((c) => (cleanup = c));
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [username]);

  // Lazy Load Lists
  const handleTabChange = async (tab: "home" | "lists" | "about") => {
    setActiveTab(tab);

    if (tab === "lists" && lists.length === 0 && profileUser) {
      // Only fetch if not already loaded
      try {
        const cleanUsername = username.replace(/^(@|%40)/, "");
        const userLists = await BookmarkService.getUserLists(cleanUsername);
        setLists(userLists);
      } catch (err) {
        console.error("Failed to fetch lists", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">User not found</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Go Home
        </Link>
      </div>
    );
  }

  // --- Render Sidebar ---
  const Sidebar = () => (
    <div className="flex flex-col gap-6 pl-6 pt-8">
      {/* Avatar */}
      {profileUser.avatar ? (
        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2">
          <Image
            src={profileUser.avatar}
            alt={profileUser.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-full bg-pink-700 flex items-center justify-center text-white text-4xl font-medium mb-2">
          {profileUser.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <h2 className="text-lg font-bold text-gray-900">{profileUser.name}</h2>
      </div>

      {/* Bio */}
      {profileUser.bio && (
        <p className="text-gray-600 text-sm leading-relaxed">
          {profileUser.bio}
        </p>
      )}

      {/* Edit / Follow Button */}
      <div className="mt-2">
        {isOwnProfile ? (
          <Link href="/me/settings" className="text-green-600 hover:underline">
            Edit profile
          </Link>
        ) : authUser ? (
          <FollowUserButton
            authorId={profileUser.id}
            className="text-black  border border-black"
          />
        ) : (
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-full border border-black bg-white  px-6 py-2 text-sm font-medium text-black transition-colors h-8"
          >
            Follow
          </Link>
        )}
      </div>

      {/* Following Section */}
      {followingList.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-gray-900 mb-4">Following</h3>
          <div className="flex flex-col gap-3">
            {followingList.slice(0, 3).map((followItem) => {
              const fUser = followItem.following;
              return (
                <Link
                  href={`/@${fUser.username}`}
                  key={fUser.id}
                  className="flex items-start gap-3 group"
                >
                  {fUser.avatar ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={fUser.avatar}
                        alt={fUser.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:underline">
                      {fUser.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate text-ellipsis overflow-hidden line-clamp-1 w-full">
                      {fUser.bio || "No bio"}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
          {followingList.length > 3 && (
            <button className="mt-4 text-green-600 text-sm hover:text-green-700">
              See all ({followingList.length})
            </button>
          )}
        </div>
      )}
    </div>
  );

  const mainContent = (
    <div className="flex-1 min-w-0 pr-12 flex flex-col pt-8">
      {/* Header Name (Large) */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          {profileUser.name}
        </h1>
        <button className="text-gray-500 hover:text-gray-900">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
        {[
          { id: "home", label: "Home" },
          { id: "lists", label: "Lists" },
          { id: "about", label: "About" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-black after:content-[""]'
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "home" && (
          <div className="space-y-10">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  href={`/@${profileUser.username}/${post.slug}`}
                  key={post.id}
                  className="group cursor-pointer block"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:underline decoration-2 underline-offset-4 decoration-gray-900 leading-tight">
                        {post.title}
                      </h3>
                      <div className="relative">
                        <p className="text-gray-600 mb-4 text-md line-clamp-3 leading-relaxed font-serif">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "Draft"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {post.readTime} min read
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                          <button className="hover:text-gray-900 transition-colors">
                            <Bookmark size={20} />
                          </button>
                          <button className="hover:text-gray-900 transition-colors">
                            <MoreHorizontal size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {post.coverImage && (
                      <div className="w-40 h-28 shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-gray-100 mt-10" />
                </Link>
              ))
            ) : (
              <div className="py-10 text-center text-gray-500">
                No stories yet.
              </div>
            )}
          </div>
        )}
        {activeTab === "lists" && (
          <div className="space-y-6">
            {lists.length > 0 ? (
              lists.map((list) => (
                <LibraryListCard
                  key={list.id}
                  list={list}
                  author={{
                    name: profileUser.name,
                    avatar: profileUser.avatar,
                    username: profileUser.username,
                  }}
                  customLink={isOwnProfile ? `/me/library/${list.id}` : "#"}
                  className={!isOwnProfile ? "cursor-default" : ""}
                />
              ))
            ) : (
              <div className="py-10 text-center text-gray-500">
                No public lists yet.
              </div>
            )}
          </div>
        )}
        {activeTab === "about" && (
          <div className="py-4">
            <p className="text-gray-700 leading-relaxed font-serif text-lg">
              {profileUser.bio || "No bio available."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                Joined{" "}
                {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Layout Structure for Independent Scrolling
  // If authenticated user, ClientShell/DashboardLayout handles the outer shell (sidebar nav, etc.)
  // But we need to control the inner scrolling.

  // Actually, DashboardLayout usually provides a `children` slot which might already be scrollable or fixed.
  // If we want two independent scroll areas *within* the page content area:
  // We should create a container that takes full available height and splits it.

  const PageLayout = () => (
    <div className="flex w-full max-w-[1200px] mx-auto h-[calc(100vh-64px)] overflow-hidden">
      {/* max-w-[1200px] to constrain width, h-screen-header to fit viewport */}

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="max-w-[700px] mx-auto w-full">{mainContent}</div>
      </main>

      {/* Vertical Separator */}
      <div className="hidden lg:block w-px bg-gray-100 shrink-0" />

      {/* Right Sidebar - Scrollable (if needed) or Fixed */}
      <aside className="hidden lg:block w-[360px] shrink-0 overflow-y-auto pb-20 no-scrollbar border-l border-gray-100">
        <Sidebar />
      </aside>
    </div>
  );

  if (authUser) {
    return <PageLayout />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <Header isCollapsed={false} onToggleCollapse={() => {}} />
      <div className="flex-1 flex overflow-hidden pt-16">
        {" "}
        {/* pt-16 for header space if fixed, or just flex col */}
        <PageLayout />
      </div>
    </div>
  );
}
