"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { ProfileInfoModal } from "@/components/setting/profile-info-modal";
import { SettingRow } from "@/components/setting/setting-row";
import { Avatar } from "@/components/ui/avatar";
import UserService from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { updateUser } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
      const updatedUser = await UserService.updateProfile({
        username: newUsername,
      });
      setUsername(newUsername);

      updateUser({ username: newUsername });
    } catch (error) {
      console.error("Failed to update username", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-4 lg:px-8">
      <div className="flex flex-col lg:flex-row">
        {/* Left Column - Main Settings */}
        <div className="flex-1 min-w-0 pr-16 space-y-8">
          {/* Page Header */}
          <div className="pt-4">
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
                value="publishing"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-0 pb-3 mr-6 text-gray-500 hover:text-gray-700 transition-none"
              >
                Publishing
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-0 pb-3 mr-6 text-gray-500 hover:text-gray-700 transition-none"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="membership"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-0 pb-3 mr-6 text-gray-500 hover:text-gray-700 transition-none"
              >
                Membership and payment
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-0 pb-3 text-gray-500 hover:text-gray-700 transition-none"
              >
                Security and apps
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="mt-2 space-y-0">
              <SettingRow
                label="Email address"
                editTitle="Email address"
                editDescription="You can sign into Medium with this email address."
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

              {/* Custom Profile Information Row */}
              <div
                className="flex items-center justify-between py-6 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-lg"
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
                      <span>{profileData.name}</span>
                      <Avatar
                        src={profileData.photoUrl}
                        name={profileData.name}
                        className="w-8 h-8 text-sm"
                      />
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            </TabsContent>

            {/* Other tabs content remains same but using SettingRow component */}
            {/* Publishing Tab */}
            <TabsContent value="publishing" className="mt-0">
              <SettingRow
                label="Story display preferences"
                description="Choose how your stories appear to readers."
                value="Default"
                editTitle="Story display preferences"
                inputValue="Default"
                onSave={(value) => console.log("Preferences updated:", value)}
              />
              <SettingRow
                label="Publishing from email"
                description="Publish stories by emailing them to Medium."
                value="Disabled"
                editTitle="Publishing from email"
                inputValue="Disabled"
                onSave={(value) =>
                  console.log("Email publishing updated:", value)
                }
              />
              <SettingRow
                label="Allow search engines to index your profile"
                value="Enabled"
                editTitle="Search engine indexing"
                inputValue="Enabled"
                onSave={(value) => console.log("SEO updated:", value)}
              />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <SettingRow
                label="Email notifications"
                description="Get emails about your Medium activity."
                value="Weekly digest"
                editTitle="Email notifications"
                inputValue="Weekly digest"
                onSave={(value) => console.log("Notifications updated:", value)}
              />
              <SettingRow
                label="Push notifications"
                description="Get push notifications on your devices."
                value="Enabled"
                editTitle="Push notifications"
                inputValue="Enabled"
                onSave={(value) => console.log("Push updated:", value)}
              />
              <SettingRow
                label="Social notifications"
                description="Get notified when people interact with your stories."
                value="All activity"
                editTitle="Social notifications"
                inputValue="All activity"
                onSave={(value) => console.log("Social updated:", value)}
              />
            </TabsContent>

            {/* Membership Tab */}
            <TabsContent value="membership" className="mt-0">
              <SettingRow
                label="Membership status"
                value="Free"
                editTitle="Membership status"
                inputValue="Free"
                onSave={(value) => console.log("Membership updated:", value)}
              />
              <SettingRow
                label="Payment method"
                description="Manage your payment methods."
                value="No payment method"
                editTitle="Payment method"
                inputValue=""
                onSave={(value) => console.log("Payment updated:", value)}
              />
              <SettingRow
                label="Billing history"
                description="View your past invoices and receipts."
                value={<ChevronRight size={20} className="text-gray-400" />}
                editTitle="Billing history"
                inputValue=""
                onSave={(value) => console.log("Billing viewed:", value)}
              />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0">
              <SettingRow
                label="Password"
                description="Change your password."
                value="••••••••"
                editTitle="Change password"
                editDescription="Enter your new password."
                inputValue=""
                onSave={(value) => console.log("Password updated:", value)}
              />
              <SettingRow
                label="Two-factor authentication"
                description="Add an extra layer of security to your account."
                value="Disabled"
                editTitle="Two-factor authentication"
                inputValue="Disabled"
                onSave={(value) => console.log("2FA updated:", value)}
              />
              <SettingRow
                label="Connected apps"
                description="Manage apps connected to your Medium account."
                value="0 apps"
                editTitle="Connected apps"
                inputValue="0"
                onSave={(value) => console.log("Apps updated:", value)}
              />
              <SettingRow
                label="Sessions"
                description="Manage your active sessions."
                value="1 active session"
                editTitle="Active sessions"
                inputValue="1"
                onSave={(value) => console.log("Sessions updated:", value)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ProfileInfoModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        initialData={profileData}
        onSave={handleProfileSave}
      />
    </div>
  );
}
