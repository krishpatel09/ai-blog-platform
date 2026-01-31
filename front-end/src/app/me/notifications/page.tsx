"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import {
  UserPlus,
  MessageCircle,
  Heart,
  Star,
  Bell,
  Trash2,
} from "lucide-react";
import NotificationService from "@/services/api/NotificationService";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type NotificationType =
  | "FOLLOW"
  | "POST_LIKE"
  | "NEW_POST"
  | "NEW_COMMENT"
  | "COMMENT_REPLY"
  | "SYSTEM";

interface Notification {
  id: string;
  type: NotificationType;
  actor: { id: string; username: string; avatar: string | null } | null;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

function NotificationItem({
  notification,
  onDelete,
  onMarkRead,
}: {
  notification: Notification;
  onDelete: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  const { type, actor, message, title, createdAt, isRead } = notification;

  const getIcon = () => {
    switch (type) {
      case "POST_LIKE":
        return (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
            <Star size={10} className="text-white fill-current" />
          </div>
        );
      case "FOLLOW":
        return (
          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-white">
            <UserPlus size={10} className="text-white fill-current" />
          </div>
        );
      case "NEW_COMMENT":
      case "COMMENT_REPLY":
        return (
          <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-0.5 border-2 border-white">
            <MessageCircle size={10} className="text-white fill-current" />
          </div>
        );
      case "NEW_POST":
        return (
          <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-0.5 border-2 border-white">
            <Bell size={10} className="text-white fill-current" />
          </div>
        );
      default:
        return null;
    }
  };

  const actorName = actor?.username || "Someone";
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div
      className={`relative group flex items-start gap-4 py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-4 -mx-4 rounded-lg ${
        !isRead ? "bg-blue-50/30" : ""
      }`}
      onClick={() => !isRead && onMarkRead(notification.id)}
    >
      <div className="relative shrink-0">
        <Avatar
          src={actor?.avatar || undefined}
          name={actorName}
          className="w-10 h-10 border border-gray-100"
        />
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-900 mb-1">
          <span className="font-semibold text-gray-900">{actorName}</span>{" "}
          <span className="text-gray-600">{message}</span>{" "}
          {title && (
            <span className="font-medium text-gray-900">"{title}"</span>
          )}
        </div>
        <div className="text-xs text-gray-500">{timeAgo}</div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full"
        title="Delete notification"
      >
        <Trash2 size={16} />
      </button>

      {!isRead && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </div>
  );
}

export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      showError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await NotificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showSuccess("Notification removed");
    } catch (error) {
      console.error("Failed to delete notification", error);
      showError("Failed to delete notification");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "responses") {
      return n.type === "NEW_COMMENT" || n.type === "COMMENT_REPLY";
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="border-b border-transparent pb-0 -mb-6">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-10 pt-4">
          Notifications
        </h1>
      </div>

      <div className="flex items-center gap-8 border-b border-gray-200 mb-4 overflow-x-auto">
        {[
          { id: "all", label: "All" },
          { id: "responses", label: "Responses" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm whitespace-nowrap transition-all relative ${
              activeTab === tab.id
                ? 'text-black font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-black after:content-[""]'
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-0">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 py-6">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="flex flex-col">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDelete={handleDelete}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">You're all caught up.</p>
          </div>
        )}
      </div>
    </div>
  );
}
