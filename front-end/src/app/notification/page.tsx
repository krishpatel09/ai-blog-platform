"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell } from "lucide-react";

export default function NotificationPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="border-b pb-6">
          <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-0 pb-3 mr-8"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="responses"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-0 pb-3"
            >
              Responses
            </TabsTrigger>
          </TabsList>

          {/* All Notifications Tab */}
          <TabsContent value="all" className="mt-8">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Bell size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">You're all caught up.</p>
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="mt-8">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Bell size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">You're all caught up.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
