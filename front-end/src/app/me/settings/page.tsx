"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { ProfileInfoModal } from "@/components/setting/profile-info-modal";
import { SettingRow } from "@/components/setting/setting-row";
import { ChangePasswordModal } from "@/components/setting/change-password-modal";
import { Avatar } from "@/components/ui/avatar";
import UserService from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { updateUser } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [notifyOnFollow, setNotifyOnFollow] = useState(true);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    photoUrl: undefined as string | undefined,
    shortBio: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await UserService.getPrivateProfile();
        setEmail(data.email || "");
        setUsername(data.username);
        setProfileData({
          name: data.name,
          photoUrl: data.avatar || undefined,
          shortBio: data.bio || "",
        });
        setNotifyOnFollow(data.notifyOnFollow ?? true);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (data: typeof profileData) => {
    try {
      // Optimistic update
      setProfileData(data);
      await UserService.updateProfile({
        name: data.name,
        bio: data.shortBio,
        avatar: data.photoUrl,
      });

      updateUser({
        name: data.name,
        avatar: data.photoUrl,
      });
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleUsernameSave = async (newUsername: string) => {
    try {
      await UserService.updateProfile({
        username: newUsername,
      });
      setUsername(newUsername);

      updateUser({ username: newUsername });
    } catch (error) {
      console.error("Failed to update username", error);
      throw error;
    }
  };

  const handlePasswordSave = async (data: any) => {
    await UserService.changePassword(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-4 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Settings
          </h1>
        </div>

        {/* Horizontal Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start p-0 h-auto mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsTrigger
              value="account"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-0 pb-3 mr-6 text-gray-500 hover:text-gray-700 transition-none"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-0 pb-3 mr-6 text-gray-500 hover:text-gray-700 transition-none"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-0 pb-3 text-gray-500 hover:text-gray-700 transition-none"
            >
              Security
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-2 space-y-0 max-w-[720px]">
            <SettingRow
              label="Email address"
              description="Your account email address."
              value={email}
              inputValue={email}
              readOnly={true}
            />
            <SettingRow
              label="Username"
              editTitle="Username"
              editDescription="Your username appears on your profile and in your URLs."
              value={username}
              inputValue={username}
              onSave={handleUsernameSave}
            />

            {/* Profile Information Row */}
            <div
              className="flex items-center justify-between py-6 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-lg"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  Profile information
                </h3>
                <p className="text-sm text-gray-600">
                  Edit your photo, name, short bio, etc.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {profileData.name}
                    </span>
                    <Avatar
                      src={profileData.photoUrl}
                      name={profileData.name}
                      className="w-10 h-10 border border-gray-100"
                    />
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent
            value="notifications"
            className="mt-2 space-y-0 max-w-[720px]"
          >
            <SettingRow
              label="Follower notifications"
              description="Get notified when someone starts following you."
              value={notifyOnFollow ? "Enabled" : "Disabled"}
              editTitle="Follower notifications"
              editDescription="Toggle email and push notifications for new followers."
              showInput={false}
              onSave={async () => {
                const newValue = !notifyOnFollow;
                await UserService.updateProfile({
                  notifyOnFollow: newValue,
                });
                setNotifyOnFollow(newValue);
              }}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent
            value="security"
            className="mt-2 space-y-0 max-w-[720px]"
          >
            <div
              className="flex items-center justify-between py-6 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-lg"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Password</h3>
                <p className="text-sm text-gray-600">
                  Update your password to keep your account secure.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-700">••••••••</div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ProfileInfoModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        initialData={profileData}
        onSave={handleProfileSave}
      />

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        onSave={handlePasswordSave}
      />
    </div>
  );
}
