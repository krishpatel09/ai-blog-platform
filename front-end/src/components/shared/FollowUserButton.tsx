"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, BellOff, ChevronDown, UserMinus } from "lucide-react";
import axiosInstance from "@/services/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { API_PATH } from "@/services/api/Apipath";

interface FollowUserButtonProps {
  authorId: string;
  className?: string;
}

export default function FollowUserButton({
  authorId,
  className = "",
}: FollowUserButtonProps) {
  const { user } = useAuth();

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (!user || user.id === authorId) return;

    const fetchFollowStatus = async () => {
      try {
        const res = await axiosInstance.get(
          `${API_PATH.FOLLOW.IS_FOLLOWING}/${authorId}`,
        );
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        console.error("Failed to fetch follow status", err);
        setIsFollowing(false);
      }
    };

    fetchFollowStatus();
  }, [authorId, user]);

  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow users");
      return;
    }

    if (user.id === authorId || isFollowing === null) return;

    const previous = isFollowing;
    const optimistic = !isFollowing;

    setIsFollowing(optimistic);

    try {
      setLoading(true);
      const res = await axiosInstance.post(
        `${API_PATH.FOLLOW.FOLLOW}/${authorId}`,
      );

      setIsFollowing(res.data.isFollowing);

      toast.success(
        res.data.isFollowing
          ? "Followed successfully"
          : "Unfollowed successfully",
      );
    } catch (err) {
      console.error("Follow error", err);
      setIsFollowing(previous);
      toast.error("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === authorId) return null;

  if (isFollowing === null) {
    return (
      <Button size="sm" variant="ghost" disabled>
        Loading...
      </Button>
    );
  }

  if (isFollowing) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full border border-gray-200 bg-transparent hover:bg-gray-50 flex items-center gap-1 h-8 px-3 text-sm ${className}`}
            disabled={loading}
          >
            Following
            <ChevronDown className="h-3 w-3 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={() => setEmailNotifications(true)}>
            <Bell className="mr-2 h-4 w-4" />
            Email notifications on
            {emailNotifications && (
              <span className="ml-auto text-green-600">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setEmailNotifications(false)}>
            <BellOff className="mr-2 h-4 w-4" />
            Email notifications off
            {!emailNotifications && (
              <span className="ml-auto text-green-600">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={handleToggleFollow}
          >
            <UserMinus className="mr-2 h-4 w-4" />
            Unfollow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`rounded-full border border-gray-300 bg-transparent hover:bg-gray-50 h-8 px-4 text-sm ${className}`}
      onClick={handleToggleFollow}
      disabled={loading}
    >
      Follow
    </Button>
  );
}
