"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronRight, X } from "lucide-react";

interface SettingRowProps {
  label: string;
  description?: string;
  value: string | React.ReactNode;
  editTitle?: string;
  editDescription?: string;
  inputValue?: string;
  onSave?: (value: string) => void;
  showInput?: boolean;
}

function SettingRow({
  label,
  description,
  value,
  editTitle,
  editDescription,
  inputValue,
  onSave,
  showInput = true,
}: SettingRowProps) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(inputValue || "");

  const handleSave = () => {
    if (onSave) {
      onSave(tempValue);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setTempValue(inputValue || "");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between py-6 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{label}</h3>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-gray-700 hover:text-gray-900 transition-colors">
              {value}
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {editTitle || label}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
            >
              <X size={20} />
            </Button>
          </div>
          {editDescription && (
            <DialogDescription className="text-gray-600 pt-2">
              {editDescription}
            </DialogDescription>
          )}
        </DialogHeader>
        {showInput && (
          <div className="py-4">
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-full px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SettingsPage() {
  const [email, setEmail] = useState("krishpatel98818@gmail.com");
  const [username, setUsername] = useState("@krishpatel98818");
  const [customDomain, setCustomDomain] = useState("None");

  return (
    <div className="max-w-[1080px] mx-auto px-4 lg:px-8">
      <div className="flex flex-col lg:flex-row">
        {/* Left Column - Main Settings */}
        <div className="flex-1 min-w-0 pr-16">
          {/* Page Header */}
          <div className="mb-4 pt-4">
            {" "}
            {/* Adjusted spacing */}
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Settings
            </h1>
          </div>

          {/* Horizontal Tabs */}
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start p-0 h-auto mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {" "}
              {/* Added overflow for mobile */}
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
              {" "}
              {/* Removed unwanted margin/space */}
              <SettingRow
                label="Email address"
                editTitle="Email address"
                editDescription="You can sign into Medium with this email address."
                value={email}
                inputValue={email}
                onSave={(value) => setEmail(value)}
              />
              <SettingRow
                label="Username and subdomain"
                editTitle="Username and subdomain"
                editDescription="Your username appears on your profile and in your URLs."
                value={username}
                inputValue={username}
                onSave={(value) => setUsername(value)}
              />
              <SettingRow
                label="Profile information"
                description="Edit your photo, name, pronouns, short bio, etc."
                value={
                  <div className="flex items-center gap-2">
                    <span>krish sangani</span>
                    <div className="w-8 h-8 rounded-full bg-pink-700 text-white flex items-center justify-center text-sm font-medium">
                      K
                    </div>
                  </div>
                }
                editTitle="Profile information"
                editDescription="Edit your photo, name, pronouns, short bio, etc."
                inputValue="krish sangani"
                onSave={(value) => console.log("Profile updated:", value)}
              />
              <SettingRow
                label="Profile design"
                description="Customize the appearance of your profile."
                value={<ChevronRight size={20} className="text-gray-400" />}
                editTitle="Profile design"
                editDescription="Customize the appearance of your profile."
                inputValue=""
                onSave={(value) => console.log("Design updated:", value)}
              />
              <SettingRow
                label="Custom domain"
                editTitle="Custom domain"
                editDescription="Upgrade to a Medium Membership to redirect your profile URL to a domain like yourdomain.com."
                value={customDomain}
                inputValue={customDomain}
                onSave={(value) => setCustomDomain(value)}
              />
            </TabsContent>

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
    </div>
  );
}
